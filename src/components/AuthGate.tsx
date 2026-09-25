'use client';
import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import Link from 'next/link';
import { browserSupabase } from '@/lib/supabase-browser';
import KowiInterface from './KowiInterface';

export default function AuthGate() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [configured, setConfigured] = useState(true);
  useEffect(() => {
    const client = browserSupabase();
    if (!client) { setConfigured(false); setReady(true); return; }
    let active = true;
    client.auth.getSession().then(({ data }) => {
      if (active) { setSession(data.session); setReady(true); }
    }).catch(() => { if (active) { setNotice('No se pudo recuperar la sesión.'); setReady(true); } });
    const { data } = client.auth.onAuthStateChange((_event, next) => { if (active) setSession(next); });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const client = browserSupabase();
    if (!client || busy) return;
    setBusy(true); setNotice('');
    try {
      if (sent) {
        const { error } = await client.auth.verifyOtp({ email, token, type: 'email' });
        if (error) throw new Error('Código no válido o caducado. Solicita uno nuevo.');
        setToken('');
      } else {
        const { error } = await client.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
        if (error) throw new Error('No se pudo enviar el código. Espera un momento y vuelve a intentarlo.');
        setSent(true); setNotice('Revisa tu correo e introduce el código de acceso.');
      }
    } catch (error) { setNotice(error instanceof Error ? error.message : 'No se pudo iniciar sesión.'); }
    finally { setBusy(false); }
  }
  if (!ready) return <main className="p-12" aria-live="polite">Preparando tu espacio…</main>;
  if (session) return <KowiInterface key={session.user.id} onSignOut={async () => {
    const result = await browserSupabase()?.auth.signOut();
    if (result?.error) throw new Error('No se pudo cerrar la sesión. Inténtalo de nuevo.');
    setSession(null);
  }} />;
  return <main className="min-h-screen grid place-items-center bg-slate-50 px-6 py-16">
    <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <Link href="/" className="font-bold tracking-widest text-teal-800">KOWI ONE</Link>
      <h1 className="mt-8 text-3xl font-semibold">Tu próxima acción empieza aquí.</h1>
      <p className="mt-4 text-slate-600">Entra o crea tu cuenta con un código de acceso por correo. Guarda tu plan y continúa cuando quieras.</p>
      {!configured ? <p role="status" className="mt-6 rounded-xl bg-amber-50 p-4">Estamos preparando el acceso a Kowi. Todavía no se pueden crear cuentas.</p> :
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block">Correo electrónico
          <input type="email" autoComplete="email" required maxLength={254} value={email} disabled={busy || sent}
            onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border p-3" />
        </label>
        {sent && <label className="block">Código de acceso
          <input autoComplete="one-time-code" inputMode="numeric" required maxLength={10} value={token}
            onChange={e => setToken(e.target.value.trim())} className="mt-2 w-full rounded-xl border p-3" />
        </label>}
        <button disabled={busy} className="w-full rounded-xl bg-teal-800 p-3 font-semibold text-white disabled:opacity-50">
          {busy ? 'Un momento…' : sent ? 'Entrar a Kowi' : 'Recibir código'}
        </button>
        {sent && <button type="button" disabled={busy} onClick={() => { setSent(false); setToken(''); setNotice(''); }}
          className="text-sm underline">Cambiar correo o solicitar otro código</button>}
      </form>}
      {notice && <p role="status" className="mt-4 text-sm">{notice}</p>}
      <p className="mt-6 text-xs leading-relaxed text-slate-500">Tus mensajes se procesan con IA para preparar tu plan. No incluyas contraseñas ni información sensible. Consulta <Link href="/privacidad" className="underline">cómo se tratan tus datos</Link>.</p>
    </section>
  </main>;
}
