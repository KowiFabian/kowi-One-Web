'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { browserSupabase } from '@/lib/supabase-browser';
import { api } from '@/lib/api';

const target = 'faviangaray@gmail.com';
export default function TestEmailPage() {
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [sentCode, setSentCode] = useState(false);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [result, setResult] = useState('');

  useEffect(() => {
    const client = browserSupabase();
    if (!client) { setNotice('El acceso a Kowi no está configurado.'); setReady(true); return; }
    let active = true;
    client.auth.getUser().then(({ data }) => { if (active) { setSessionEmail(data.user?.email ?? null); setReady(true); } })
      .catch(() => { if (active) { setNotice('No se pudo comprobar tu sesión.'); setReady(true); } });
    const { data } = client.auth.onAuthStateChange((_event, session) => { if (active) setSessionEmail(session?.user.email ?? null); });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);

  async function requestCode(event: React.FormEvent) {
    event.preventDefault();
    const client = browserSupabase(); if (!client || busy) return;
    setBusy(true); setNotice('');
    try {
      const { error } = await client.auth.signInWithOtp({ email: target, options: { shouldCreateUser: true } });
      if (error) throw error;
      setSentCode(true); setNotice(`Código solicitado para ${target}. Revisa la bandeja y spam.`);
    } catch { setNotice('No se pudo solicitar el código. Comprueba el correo e inténtalo de nuevo.'); }
    finally { setBusy(false); }
  }

  async function verifyCode(event: React.FormEvent) {
    event.preventDefault();
    const client = browserSupabase(); if (!client || busy) return;
    setBusy(true); setNotice('');
    try {
      const { data, error } = await client.auth.verifyOtp({ email: target, token: code.trim(), type: 'email' });
      if (error || !data.user) throw error ?? new Error('No session');
      setSessionEmail(data.user.email ?? null); setCode(''); setNotice('Sesión iniciada. Ahora puedes enviar la prueba.');
    } catch { setNotice('Código inválido o caducado. Solicita uno nuevo.'); }
    finally { setBusy(false); }
  }

  async function send() {
    setBusy(true); setResult(''); setNotice('');
    try {
      const response = await api<{ ok: boolean; id?: string }>('/api/test-email', { method: 'POST' });
      setResult(response.ok ? `Resend aceptó el envío. ID: ${response.id ?? 'no disponible'}. Comprueba Delivered en Resend → Emails y el mensaje en tu correo.` : 'No se pudo enviar.');
    } catch (error) { setResult(error instanceof Error ? error.message : 'No se pudo enviar.'); }
    finally { setBusy(false); }
  }

  return <main className="kowi-cosmos min-h-screen px-6 py-16 text-white"><section className="cosmos-panel mx-auto max-w-xl rounded-3xl p-8">
    <Link href="/" className="text-[#e8b37b]">← KOWI</Link>
    <h1 className="mt-8 text-3xl font-semibold">Prueba de correo KOWI</h1>
    <p className="mt-4 text-[#c5cad4]">La prueba se enviará únicamente a {target}. Abrir esta página no envía nada.</p>
    {!ready ? <p role="status" className="mt-7">Comprobando sesión…</p> : sessionEmail?.toLowerCase() === target ? <div className="mt-7">
      <p className="text-sm text-[#c5cad4]">Sesión iniciada: {sessionEmail}</p>
      <button type="button" onClick={send} disabled={busy} className="kowi-gold-btn mt-5 rounded-full px-6 py-3 font-semibold disabled:opacity-50">{busy ? 'Enviando…' : 'Enviar correo de prueba'}</button>
    </div> : <div className="mt-7">
      {sessionEmail && <p className="mb-4 rounded-xl border border-amber-300/30 p-3 text-sm">Tu sesión actual es {sessionEmail}. Para esta prueba entra con {target}.</p>}
      {!sentCode ? <form onSubmit={requestCode}><p className="text-sm text-[#c5cad4]">1. Solicita un código de acceso para {target}.</p><button disabled={busy} className="kowi-gold-btn mt-4 rounded-full px-6 py-3 font-semibold disabled:opacity-50">{busy ? 'Solicitando…' : 'Recibir código por correo'}</button></form> :
      <form onSubmit={verifyCode}><label htmlFor="email-code" className="block text-sm text-[#c5cad4]">2. Introduce el código recibido</label><input id="email-code" autoComplete="one-time-code" inputMode="numeric" required maxLength={10} value={code} onChange={event => setCode(event.target.value)} className="mt-2 w-full rounded-xl border border-white/20 bg-[#101827] p-3 text-white"/><button disabled={busy} className="kowi-gold-btn mt-4 rounded-full px-6 py-3 font-semibold disabled:opacity-50">{busy ? 'Verificando…' : 'Verificar y continuar'}</button><button type="button" onClick={() => { setSentCode(false); setCode(''); }} className="ml-4 mt-4 text-sm underline">Solicitar otro código</button></form>}
    </div>}
    {notice && <p role="status" className="mt-6 rounded-xl border border-white/20 p-4">{notice}</p>}
    {result && <p role="status" className="mt-6 rounded-xl border border-white/20 p-4">{result}</p>}
    <p className="mt-8 text-sm text-[#a9b3c1]">Ruta temporal. Se eliminará al terminar la comprobación.</p>
  </section></main>;
}
