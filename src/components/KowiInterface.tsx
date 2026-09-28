'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import MessageList from './MessageList';
import GoalPanel from './GoalPanel';
import { Message, ConversationState } from '@/types';
import { api } from '@/lib/api';

type Conversation = { id: string; title: string; created_at: string };
type Turn = { id: string; sequence: number; user_message: string; response: string; goal: ConversationState | null; created_at: string };
const welcome: Message[] = [{ id: 'welcome', type: 'assistant', content: '¿Qué quieres conseguir?', timestamp: new Date(0) }];

export default function KowiInterface({ onSignOut }: { onSignOut: () => Promise<void> }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>(welcome);
  const [goal, setGoal] = useState<ConversationState | null>(null);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const lock = useRef(false);
  const retry = useRef<{ text: string; id: string; conversation: string } | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const refresh = useCallback(async () => {
    setConversations(await api<Conversation[]>('/api/conversations'));
  }, []);
  useEffect(() => { refresh().catch(() => setNotice('No se pudo cargar tu historial. Usa Recargar.')); }, [refresh]);
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function load(id: string) {
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
    setConversationId(null); setMessages(welcome); setGoal(null); setDraft(''); setNotice('');
    setConfirmDelete(false); retry.current = null;
  }
  async function send(event: React.FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || text.length > 2000) return;
    await run(async () => {
      let id = conversationId;
      if (!id) {
        const created = await api<Conversation>('/api/conversations', { method: 'POST' });
        id = created.id; setConversationId(id); setConversations(prev => [created, ...prev]);
      }
      if (retry.current?.text !== text || retry.current.conversation !== id) {
        retry.current = { text, conversation: id, id: crypto.randomUUID() };
      }
      const result = await api<{ response: string; goal: ConversationState | null }>('/api/chat', {
        method: 'POST', body: JSON.stringify({ userMessage: text, conversationId: id, requestId: retry.current.id }),
      });
      setMessages(prev => [...prev,
        { id: retry.current!.id + '-u', type: 'user', content: text, timestamp: new Date() },
        { id: retry.current!.id + '-a', type: 'assistant', content: result.response, timestamp: new Date() },
      ]);
      if (result.goal) setGoal(result.goal);
      setDraft(''); retry.current = null;
      await refresh();
    });
  }
  async function exportConversation() {
    if (!conversationId) return;
    const data = await api<{ turns: Turn[] }>(`/api/conversations/${conversationId}`);
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'kowi-conversacion.json'; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <main className="min-h-screen bg-slate-50">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b bg-white px-6 py-4">
      <Link href="/" className="text-xl font-bold tracking-widest text-teal-800">KOWI ONE</Link>
      <div className="flex items-center gap-4 text-sm"><Link href="/privacidad">Privacidad</Link>
        <button disabled={busy} onClick={() => run(onSignOut)} className="underline">Cerrar sesión</button></div>
    </header>
    <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
      <aside className="border-b p-4 lg:w-60 lg:shrink-0 lg:border-r" aria-label="Conversaciones guardadas">
        <button disabled={busy} onClick={fresh} className="w-full rounded-xl bg-teal-800 p-3 text-white disabled:opacity-50">Nueva conversación</button>
        <h2 className="my-4 text-xs font-bold uppercase tracking-wider text-slate-500">Tus conversaciones</h2>
        <button disabled={busy} onClick={() => run(async () => { await refresh(); if (conversationId) await load(conversationId); })}
          className="mb-3 text-sm underline">Recargar</button>
        <ul className="max-h-52 overflow-y-auto lg:max-h-[65vh]">{conversations.map(c => <li key={c.id}>
          <button disabled={busy} aria-current={conversationId === c.id ? 'true' : undefined}
            onClick={() => run(async () => { await load(c.id); setDraft(''); retry.current = null; setConfirmDelete(false); })}
            className={`mb-1 w-full truncate rounded-lg p-2 text-left text-sm ${conversationId === c.id ? 'bg-teal-100' : 'hover:bg-slate-100'}`}>{c.title}</button>
        </li>)}</ul>
      </aside>
      <section className="min-w-0 flex-1 p-4 md:p-8" aria-label="Chat con Kowi">
        <h1 className="text-2xl font-semibold">Tu intención. Tu camino. Tu acción.</h1>
        <p className="mb-6 mt-2 text-sm text-slate-500">Cuéntame qué quieres lograr. También puedes registrar tus avances aquí.</p>
        <div className="max-h-[55vh] min-h-48 overflow-y-auto pr-2" role="log" aria-label="Mensajes">
          <MessageList messages={messages} loading={busy} /><div ref={end} />
        </div>
        {notice && <p role="alert" className="mt-4 rounded-xl bg-amber-50 p-3 text-sm">{notice}</p>}
        <form onSubmit={send} className="mt-6">
          <label htmlFor="message" className="text-sm font-medium">Tu mensaje</label>
          <textarea id="message" value={draft} onChange={e => setDraft(e.target.value)} disabled={busy}
            maxLength={2000} rows={3} placeholder="Quiero convertir mi idea en un negocio…"
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 focus:ring-2 focus:ring-teal-700" />
          <div className="mt-2 flex items-center justify-between gap-3"><span className="text-xs text-slate-500">{draft.length}/2000 · IA: revisa las propuestas</span>
            <button disabled={busy || !draft.trim()} className="rounded-xl bg-teal-800 px-6 py-3 text-white disabled:opacity-50">{busy ? 'Un momento…' : 'Enviar'}</button></div>
        </form>
        {conversationId && <div className="mt-6 flex flex-wrap gap-4 text-xs">
          <button disabled={busy} onClick={() => run(exportConversation)} className="underline">Exportar conversación</button>
          <button disabled={busy} onClick={() => setConfirmDelete(true)} className="text-red-700 underline">Eliminar conversación</button>
          {confirmDelete && <div role="alert" className="w-full rounded-xl border border-red-200 p-4">
            <p>Se eliminarán esta conversación y su plan. Esta acción no se puede deshacer.</p>
            <button disabled={busy} className="mr-4 mt-3 font-semibold text-red-700" onClick={() => run(async () => {
              await api(`/api/conversations/${conversationId}`, { method: 'DELETE' });
              setConversationId(null); setMessages(welcome); setGoal(null); setConfirmDelete(false);
              setDraft(''); retry.current = null; await refresh();
            })}>Sí, eliminar</button>
            <button disabled={busy} onClick={() => setConfirmDelete(false)}>Cancelar</button>
          </div>}
        </div>}
      </section>
      {goal && <GoalPanel goal={goal} onNewConversation={fresh} />}
    </div>
  </main>;
}
