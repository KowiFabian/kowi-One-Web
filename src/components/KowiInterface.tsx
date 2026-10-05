'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import MessageList from './MessageList';
import GoalPanel from './GoalPanel';
import { Message, ConversationState } from '@/types';
import { api, apiBlob } from '@/lib/api';
import { voiceLocales, voiceProfiles, voiceTones, type VoiceProfile, type VoiceTone } from '@/lib/voice-config';

type SpeechResult = { results: ArrayLike<ArrayLike<{ transcript: string }>> };
type BrowserRecognizer = { lang: string; onresult: ((event: SpeechResult) => void) | null; onerror: (() => void) | null; onend: (() => void) | null; start: () => void; abort: () => void };
type VoiceWindow = Window & { SpeechRecognition?: new () => BrowserRecognizer; webkitSpeechRecognition?: new () => BrowserRecognizer };

type Conversation = { id: string; title: string; created_at: string };
type Turn = { id: string; sequence: number; user_message: string; response: string; goal: ConversationState | null; created_at: string };
const welcome: Message[] = [{ id: 'welcome', type: 'assistant', content: 'Cuéntame qué quieres hacer realidad. Empezamos por una sola intención.', timestamp: new Date(0) }];

export default function KowiInterface({ onSignOut }: { onSignOut: () => Promise<void> }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>(welcome);
  const [goal, setGoal] = useState<ConversationState | null>(null);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceProfile, setVoiceProfile] = useState<VoiceProfile>('legacy');
  const [voiceTone, setVoiceTone] = useState<VoiceTone>('natural');
  const [voiceLocale, setVoiceLocale] = useState('auto');
  const [listening, setListening] = useState(false);
  const recognizer = useRef<BrowserRecognizer|null>(null);
  const audioPlayer = useRef<HTMLAudioElement|null>(null);
  const audioUrl = useRef<string|null>(null);
  const dictationConsent = useRef(false);
  const lock = useRef(false);

  function stopAudio(){
    audioPlayer.current?.pause();
    audioPlayer.current = null;
    if(audioUrl.current){ URL.revokeObjectURL(audioUrl.current); audioUrl.current=null; }
    window.speechSynthesis?.cancel();
  }
  useEffect(() => () => {
    const active=recognizer.current;
    if(active){active.onresult=null;active.onerror=null;active.onend=null;try{active.abort();}catch{}}
    stopAudio();
  }, []);
  function stopListening(){const active=recognizer.current;recognizer.current=null;if(active){active.onresult=null;active.onerror=null;active.onend=null;try{active.abort();}catch{}}setListening(false);}
  const retry = useRef<{ text: string; id: string; conversation: string } | null>(null);
  const end = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => setConversations(await api<Conversation[]>('/api/conversations')), []);
  useEffect(() => { refresh().catch(() => setNotice('No se pudo cargar tu historial.')); }, [refresh]);
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function load(id: string) {
    stopListening(); stopAudio();
    const data = await api<{ turns: Turn[] }>(`/api/conversations/${id}`);
    setConversationId(id);
    setMessages(data.turns.length ? data.turns.flatMap(t => [
      { id: t.id + '-u', type: 'user' as const, content: t.user_message, timestamp: new Date(t.created_at) },
      { id: t.id + '-a', type: 'assistant' as const, content: t.response, timestamp: new Date(t.created_at) },
    ]) : welcome);
    setGoal([...data.turns].reverse().find(t => t.goal)?.goal ?? null);
  }

  async function run(action: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setNotice('');
    try { await action(); }
    catch (error) { setNotice(error instanceof Error ? error.message : 'No se pudo conectar. Inténtalo de nuevo.'); }
    finally { lock.current = false; setBusy(false); }
  }

  function fresh() {
    if (lock.current) return;
    stopListening(); stopAudio();
    setConversationId(null); setMessages(welcome); setGoal(null); setDraft(''); setNotice('');
    setConfirmDelete(false); retry.current = null;
  }

  function listen() {
    const browser = window as VoiceWindow;
    const Recognition = browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
    if (!Recognition) { setNotice('El dictado no está disponible en este navegador. Puedes escribir tu mensaje.'); return; }
    if(!dictationConsent.current){
      if(!window.confirm('El dictado utiliza el reconocimiento de voz de tu navegador, que puede procesar audio con su proveedor. El texto queda en borrador: no autoriza gestiones ni se envía hasta que pulses Enviar. ¿Activar el micrófono?')) return;
      dictationConsent.current=true;
    }
    const recognition = new Recognition(); recognizer.current=recognition;
    recognition.lang = voiceLocale === 'auto' ? (navigator.language || 'es-ES') : voiceLocale;
    setListening(true);
    recognition.onresult = event => setDraft(previous => [previous, event.results[0]?.[0]?.transcript ?? ''].filter(Boolean).join(' ').slice(0, 2000));
    recognition.onerror = () => { setListening(false); setNotice('No se pudo escuchar. Comprueba el permiso del micrófono.'); };
    recognition.onend = () => { if(recognizer.current===recognition)recognizer.current=null;setListening(false); };
    try { recognition.start(); } catch { setListening(false); setNotice('No se pudo iniciar el micrófono.'); }
  }

  function browserFallback(response:string){
    if(!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(response);
    utterance.lang = voiceLocale === 'auto' ? (navigator.language || 'es-ES') : voiceLocale;
    utterance.rate = voiceTone === 'calm' ? 0.92 : voiceTone === 'energetic' ? 1.08 : 1;
    window.speechSynthesis.speak(utterance);
  }

  async function speak(response: string, id:string) {
    if (!voiceEnabled) return;
    stopAudio();
    try {
      const blob = await apiBlob('/api/voice/speech', {
        method:'POST',
        body:JSON.stringify({ conversationId:id, text:response, profile:voiceProfile, tone:voiceTone, locale:voiceLocale, approved:true }),
      });
      if(!voiceEnabled) return;
      const url=URL.createObjectURL(blob); audioUrl.current=url;
      const player=new Audio(url); audioPlayer.current=player;
      const release=()=>{ if(audioPlayer.current===player)audioPlayer.current=null; if(audioUrl.current===url){URL.revokeObjectURL(url);audioUrl.current=null;} };
      player.onended=release; player.onerror=release;
      await player.play();
    } catch(error) {
      const message=error instanceof Error?error.message:'No se pudo generar la voz.';
      setNotice(`${message} Se usará la lectura disponible en este dispositivo.`);
      browserFallback(response);
    }
  }

  function toggleVoice(){
    if(voiceEnabled){ stopAudio(); setVoiceEnabled(false); return; }
    const accepted=window.confirm('Voz ID genera audio con IA. Al activarla autorizas reproducir únicamente las respuestas guardadas de esta conversación con el perfil de voz seleccionado. No autoriza mensajes externos ni nuevas declaraciones en tu nombre. ¿Activar Voz ID?');
    if(accepted) setVoiceEnabled(true);
  }

  async function send(event: React.FormEvent) {
    event.preventDefault();
    stopListening();
    const text = draft.trim();
    if (!text || text.length > 2000) return;
    await run(async () => {
      let id = conversationId;
      if (!id) {
        const created = await api<Conversation>('/api/conversations', { method: 'POST' });
        id = created.id; setConversationId(id); setConversations(prev => [created, ...prev]);
      }
      if (retry.current?.text !== text || retry.current.conversation !== id) retry.current = { text, conversation: id, id: crypto.randomUUID() };
      const result = await api<{ response: string; goal: ConversationState | null }>('/api/chat', {
        method: 'POST', body: JSON.stringify({ userMessage: text, conversationId: id, requestId: retry.current.id }),
      });
      setMessages(prev => [...prev,
        { id: retry.current!.id + '-u', type: 'user', content: text, timestamp: new Date() },
        { id: retry.current!.id + '-a', type: 'assistant', content: result.response, timestamp: new Date() },
      ]);
      if (result.goal) setGoal(result.goal);
      void speak(result.response,id);
      setDraft(''); retry.current = null; await refresh();
    });
  }

  async function exportConversation() {
    if (!conversationId) return;
    const data = await api<{ turns: Turn[] }>(`/api/conversations/${conversationId}`);
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'kowi-conversacion.json'; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <main className="kowi-shell min-h-screen text-[#eef8ef]">
    <div className="kowi-grid pointer-events-none fixed inset-0 opacity-30"/>
    <header className="relative z-20 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-[#071612]/80 px-5 py-4 backdrop-blur-xl md:px-8">
      <Link href="/" className="flex items-center gap-3"><span className="hero-orb h-8 w-8 rounded-full"/><span className="text-sm font-bold tracking-[.24em]">KOWI ONE</span></Link>
      <div className="flex items-center gap-4 text-sm text-[#aec5b7]"><span className="hidden md:inline">Human‑First workspace</span><Link href="/proyectos" className="hover:text-[#e8b37b]">Proyectos</Link><Link href="/business/app">Business</Link><Link href="/voz-id">Voz ID</Link><Link href="/privacidad">Privacidad</Link>
        <button disabled={busy} onClick={() => run(onSignOut)} className="rounded-full border border-white/10 px-4 py-2 hover:bg-white/5">Salir</button></div>
    </header>

    <div className="relative z-10 mx-auto grid max-w-[1500px] lg:grid-cols-[260px_minmax(0,1fr)_340px]">
      <aside className="border-b border-white/10 bg-white/[.015] p-4 lg:min-h-[calc(100vh-73px)] lg:border-b-0 lg:border-r" aria-label="Conversaciones guardadas">
        <button disabled={busy} onClick={fresh} className="w-full rounded-2xl bg-[#e8b37b] p-3.5 font-semibold text-[#17121a] disabled:opacity-50">＋ Nueva intención</button>
        <div className="mt-6 flex items-center justify-between"><h2 className="text-[11px] font-bold uppercase tracking-[.18em] text-[#789887]">Memoria</h2><button disabled={busy} onClick={() => run(async () => { await refresh(); if (conversationId) await load(conversationId); })} className="text-xs text-[#b5cabc]">Actualizar</button></div>
        <ul className="mt-3 max-h-52 space-y-1 overflow-y-auto lg:max-h-[72vh]">{conversations.map(c => <li key={c.id}>
          <button disabled={busy} aria-current={conversationId === c.id ? 'true' : undefined}
            onClick={() => run(async () => { await load(c.id); setDraft(''); retry.current = null; setConfirmDelete(false); })}
            className={`w-full truncate rounded-xl p-3 text-left text-sm transition ${conversationId === c.id ? 'bg-[#e8b37b]/10 text-[#eaffcf]' : 'text-[#a8c0b2] hover:bg-white/5'}`}>{c.title}</button>
        </li>)}</ul>
      </aside>

      <section className="min-w-0 p-4 md:p-8 lg:p-10" aria-label="Chat con Kowi">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e8b37b]/15 bg-[#e8b37b]/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.18em] text-[#e8b37b]"><span className="signal-dot"/>Kowi activo</div>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-.035em] md:text-4xl">De la intención a la acción.</h1>
            <p className="mt-2 text-sm text-[#92ad9d]">Kowi pregunta lo necesario, estructura tu objetivo y propone el siguiente paso. Tú conservas la decisión.</p>
          </div>

          <div className="glass min-h-[360px] rounded-[1.8rem] p-4 md:p-6">
            <div className="max-h-[52vh] min-h-[300px] overflow-y-auto pr-1" role="log" aria-label="Mensajes">
              <MessageList messages={messages} loading={busy}/><div ref={end}/>
            </div>
          </div>

          {notice && <p role="alert" className="mt-4 rounded-2xl border border-amber-200/15 bg-amber-100/5 p-3 text-sm text-amber-50">{notice}</p>}

          <form onSubmit={send} className="glass mt-4 rounded-[1.6rem] p-3">
            <label htmlFor="message" className="sr-only">Tu mensaje</label>
            <textarea id="message" value={draft} onChange={e => setDraft(e.target.value)} disabled={busy} maxLength={2000} rows={3}
              placeholder="¿Qué quieres hacer realidad?"
              className="w-full resize-none bg-transparent p-3 text-base text-white outline-none placeholder:text-[#6f8f7e]" />
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-2 pt-3"><div className="flex flex-wrap items-center gap-3"><span className="text-xs text-[#789887]">{draft.length}/2000 · revisa antes de actuar</span><button type="button" onClick={listening?stopListening:listen} disabled={busy&&!listening} className="rounded-full border border-white/20 px-3 py-2 text-sm disabled:opacity-50" aria-label={listening?'Detener dictado':'Dictar mensaje'}>{listening ? 'Detener micrófono' : '🎙 Dictar'}</button><button type="button" onClick={toggleVoice} aria-pressed={voiceEnabled} className="rounded-full border border-white/20 px-3 py-2 text-sm">{voiceEnabled ? '🔊 Voz ID activa' : '🔇 Activar Voz ID'}</button></div>
              <button disabled={busy || !draft.trim()} className="rounded-full bg-[#e8b37b] px-6 py-3 font-semibold text-[#17121a] disabled:opacity-40">{busy ? 'Pensando…' : 'Enviar ↗'}</button></div>

            {voiceEnabled && <div className="mt-3 grid gap-2 border-t border-white/10 px-2 pt-3 text-xs sm:grid-cols-3">
              <label className="grid gap-1 text-[#9bb3a5]">Perfil
                <select value={voiceProfile} onChange={e=>setVoiceProfile(e.target.value as VoiceProfile)} className="rounded-xl border border-white/15 bg-[#0b1b16] px-3 py-2 text-white">
                  {voiceProfiles.map(item=><option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </label>
              <label className="grid gap-1 text-[#9bb3a5]">Tono
                <select value={voiceTone} onChange={e=>setVoiceTone(e.target.value as VoiceTone)} className="rounded-xl border border-white/15 bg-[#0b1b16] px-3 py-2 text-white">
                  {voiceTones.map(item=><option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </label>
              <label className="grid gap-1 text-[#9bb3a5]">Idioma / acento
                <select value={voiceLocale} onChange={e=>setVoiceLocale(e.target.value)} className="rounded-xl border border-white/15 bg-[#0b1b16] px-3 py-2 text-white">
                  {voiceLocales.map(([value,label])=><option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <p className="sm:col-span-3 text-[#789887]">Voz generada por IA · solo reproduce respuestas guardadas de esta conversación · no autoriza comunicaciones externas.</p>
            </div>}
          </form>

          {conversationId && <div className="mt-5 flex flex-wrap gap-4 text-xs text-[#8da899]">
            <button disabled={busy} onClick={() => run(exportConversation)} className="underline underline-offset-4">Exportar conversación</button>
            <button disabled={busy} onClick={() => setConfirmDelete(true)} className="text-[#d6a7a7] underline underline-offset-4">Eliminar</button>
            {confirmDelete && <div role="alert" className="w-full rounded-2xl border border-red-200/15 bg-red-100/5 p-4 text-sm">
              <p>Se eliminarán esta conversación y su plan.</p>
              <button disabled={busy} className="mr-4 mt-3 font-semibold text-red-200" onClick={() => run(async () => {
                await api(`/api/conversations/${conversationId}`, { method: 'DELETE' });
                setConversationId(null); setMessages(welcome); setGoal(null); setConfirmDelete(false); setDraft(''); retry.current = null; await refresh();
              })}>Sí, eliminar</button><button disabled={busy} onClick={() => setConfirmDelete(false)}>Cancelar</button>
            </div>}
          </div>}
        </div>
      </section>

      <aside className="border-t border-white/10 bg-white/[.015] p-5 lg:min-h-[calc(100vh-73px)] lg:border-l lg:border-t-0">
        <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#789887]">Mapa de progreso</p>
        {goal ? <div className="mt-4"><GoalPanel goal={goal} onNewConversation={fresh}/></div> :
        <div className="glass mt-4 rounded-[1.5rem] p-5">
          <div className="hero-orb mb-5 h-12 w-12 rounded-full"/>
          <h2 className="text-lg font-semibold">Tu objetivo aparecerá aquí.</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#90aa9b]">Cuando Kowi tenga suficiente contexto, convertirá tu intención en un objetivo, un plan de 30 días y una primera acción.</p>
          <div className="mt-5 space-y-2 text-xs text-[#88a493]"><p>01 · intención</p><p>02 · objetivo</p><p>03 · plan</p><p>04 · acción</p></div>
        </div>}
      </aside>
    </div>
  </main>;
}
