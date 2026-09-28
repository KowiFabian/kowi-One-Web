'use client';
import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import Link from 'next/link';
import { browserSupabase } from '@/lib/supabase-browser';
import KowiInterface from './KowiInterface';
import BusinessConsole from './BusinessConsole';

export default function AuthGate({ mode = 'one' }: { mode?: 'one' | 'business' }) {
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
    client.auth.getSession().then(({ data }) => { if (active) { setSession(data.session); setReady(true); } })
      .catch(() => { if (active) { setNotice('No se pudo recuperar la sesión.'); setReady(true); } });
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
        if (error) throw new Error('No se pudo enviar el código. Vuelve a intentarlo.');
        setSent(true); setNotice('Revisa tu correo e introduce el código de acceso.');
      }
    } catch (error) { setNotice(error instanceof Error ? error.message : 'No se pudo iniciar sesión.'); }
    finally { setBusy(false); }
  }

  if (!ready) return <main className="grid min-h-screen place-items-center bg-[#071612] text-[#e8b37b]" aria-live="polite">Preparando Kowi…</main>;
  if (session) return mode === 'business' ? <BusinessConsole key={session.user.id} onSignOut={async () => {
    const result = await browserSupabase()?.auth.signOut();
    if (result?.error) throw new Error('No se pudo cerrar la sesión.');
    setSession(null);
  }} /> : <KowiInterface key={session.user.id} onSignOut={async () => {
    const result = await browserSupabase()?.auth.signOut();
    if (result?.error) throw new Error('No se pudo cerrar la sesión.');
    setSession(null);
  }} />;

  return <main className="kowi-shell grid min-h-screen place-items-center px-6 py-12">
    <div className="kowi-grid pointer-events-none absolute inset-0 opacity-40"/>
    <section className="glass relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[2rem] md:grid-cols-[1.05fr_.95fr]">
      <div className="relative min-h-[420px] border-b border-white/10 p-8 md:border-b-0 md:border-r md:p-10">
        <Link href="/" className="flex items-center gap-3"><span className="hero-orb h-9 w-9 rounded-full"/><span className="text-sm font-bold tracking-[.26em]">KOWI ONE</span></Link>
        <div className="mt-16 max-w-md">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#e8b37b]">Tu espacio Human‑First</p>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-.04em] md:text-5xl">{mode === 'business' ? 'Tu empresa. Tu agente. Tu control.' : 'Una intención. Un camino. Una acción.'}</h1>
          <p className="mt-5 leading-relaxed text-[#abc3b4]">Entra para crear objetivos, conservar tus planes y continuar donde lo dejaste. Kowi te guía sin sustituir tus decisiones.</p>
        </div>
        <div className="absolute bottom-8 left-8 right-8 rounded-2xl border border-[#e8b37b]/15 bg-[#e8b37b]/5 p-4 text-sm text-[#b8cebf]">Tus acciones sensibles siguen bajo tu autorización.</div>
      </div>

      <div className="p-8 md:p-10">
          <h2 className="text-2xl font-semibold">{sent ? 'Introduce tu código' : mode === 'business' ? 'Crear cuenta o entrar' : 'Entrar a Kowi'}</h2>
        <p className="mt-3 text-sm leading-relaxed text-[#9fb9aa]">{sent ? 'Te hemos enviado un código de acceso al correo indicado.' : 'Usa tu correo. No necesitas contraseña.'}</p>
        {!configured ? <p role="status" className="mt-6 rounded-xl border border-amber-300/20 bg-amber-100/5 p-4 text-sm text-amber-100">El acceso todavía no está configurado.</p> :
        <form onSubmit={submit} className="mt-7 space-y-4">
          <label className="block text-sm text-[#c9dbcf]">Correo electrónico
            <input type="email" autoComplete="email" required maxLength={254} value={email} disabled={busy || sent}
              onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3.5 text-white outline-none focus:border-[#e8b37b]/50" />
          </label>
          {sent && <label className="block text-sm text-[#c9dbcf]">Código de acceso
            <input autoComplete="one-time-code" inputMode="numeric" required maxLength={10} value={token}
              onChange={e => setToken(e.target.value.trim())} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3.5 text-white outline-none focus:border-[#e8b37b]/50" />
          </label>}
          <button disabled={busy} className="w-full rounded-xl bg-[#e8b37b] p-3.5 font-semibold text-[#17121a] disabled:opacity-50">
            {busy ? 'Procesando…' : sent ? 'Entrar a Kowi' : 'Recibir código'}
          </button>
          {sent && <button type="button" disabled={busy} onClick={() => { setSent(false); setToken(''); setNotice(''); }} className="text-sm text-[#b9ccbf] underline underline-offset-4">Cambiar correo</button>}
        </form>}
        {notice && <p role="status" className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-[#cde1d4]">{notice}</p>}
        <p className="mt-6 text-xs leading-relaxed text-[#809d8d]">No incluyas contraseñas ni información sensible. Consulta <Link href="/privacidad" className="underline">privacidad y uso de IA</Link>.</p>
      </div>
    </section>
  </main>;
}
