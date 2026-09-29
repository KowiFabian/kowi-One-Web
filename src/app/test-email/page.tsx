'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { browserSupabase } from '@/lib/supabase-browser';
import { api } from '@/lib/api';

export default function TestEmailPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState('');
  useEffect(() => {
    browserSupabase()?.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null)).catch(() => setEmail(null));
  }, []);
  async function send() {
    setBusy(true); setResult('');
    try {
      const response = await api<{ ok: boolean; id?: string }>('/api/test-email', { method: 'POST' });
      setResult(response.ok ? `Resend aceptó el envío. ID: ${response.id ?? 'no disponible'}. Confirma Delivered en Resend → Emails y la recepción en tu correo.` : 'No se pudo enviar.');
    } catch (error) { setResult(error instanceof Error ? error.message : 'No se pudo enviar.'); }
    finally { setBusy(false); }
  }
  return <main className="kowi-cosmos min-h-screen px-6 py-16 text-white"><section className="cosmos-panel mx-auto max-w-xl rounded-3xl p-8"><Link href="/" className="text-[#e8b37b]">← KOWI</Link><h1 className="mt-8 text-3xl font-semibold">Prueba de correo KOWI</h1><p className="mt-4 text-[#c5cad4]">Enviaremos una sola prueba a la cuenta personal confirmada de Fabián. El enlace por sí solo no envía ningún correo.</p><p className="mt-5 text-sm text-[#c5cad4]">Sesión: {email ?? 'no iniciada'}</p>{email ? <button onClick={send} disabled={busy} className="kowi-gold-btn mt-6 rounded-full px-6 py-3 font-semibold disabled:opacity-50">{busy ? 'Enviando…' : 'Enviar correo de prueba'}</button> : <Link href="/kowi" className="kowi-gold-btn mt-6 inline-block rounded-full px-6 py-3 font-semibold">Iniciar sesión ↗</Link>}{result && <p role="status" className="mt-6 rounded-xl border border-white/20 p-4">{result}</p>}<p className="mt-8 text-sm text-[#a9b3c1]">Ruta temporal. Se eliminará al terminar la comprobación.</p></section></main>;
}
