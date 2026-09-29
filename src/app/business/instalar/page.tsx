'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { browserSupabase } from '@/lib/supabase-browser';

type Install = { businessId: string | null; enabled: boolean; allowedOrigins: string[]; available: boolean };
const scriptUrl = 'https://kowi.one/embed/kowi.js';
const demoSnippet = `<script defer src="${scriptUrl}" data-kowi-label="Hablar con Kowi"></script>`;

export default function InstallBusiness() {
  const [install, setInstall] = useState<Install | null>(null);
  const [origins, setOrigins] = useState('');
  const [signedIn, setSignedIn] = useState(false);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    const client = browserSupabase();
    if (!client) { setChecking(false); return; }
    async function load() {
      try {
        const { data } = await client!.auth.getSession();
        if (!active) return;
        setSignedIn(Boolean(data.session));
        if (data.session) {
          const result = await api<Install>('/api/business/embed/install');
          if (active) { setInstall(result); setOrigins(result.allowedOrigins.join('\n')); }
        }
      } catch (error) { if (active) setNotice(error instanceof Error ? error.message : 'No se pudo consultar la instalación.'); }
      finally { if (active) setChecking(false); }
    }
    load();
    return () => { active = false; };
  }, []);

  async function update(enabled: boolean) {
    setBusy(true); setNotice(''); setCopied(false);
    try {
      const allowedOrigins = [...new Set(origins.split(/\s+/).map(value => value.trim()).filter(Boolean))];
      const result = await api<Install>('/api/business/embed/install', { method: 'POST', body: JSON.stringify({ enabled, allowedOrigins }) });
      setInstall(result);
      setOrigins(result.allowedOrigins.join('\n'));
      setNotice(result.enabled ? 'Acceso web activado. Pruébalo en tus dominios autorizados.' : 'Acceso web desactivado.');
    } catch (error) { setNotice(error instanceof Error ? error.message : 'No se pudo cambiar la instalación.'); }
    finally { setBusy(false); }
  }

  const active = Boolean(install?.available && install.enabled && install.businessId);
  const snippet = active
    ? `<script defer src="${scriptUrl}" data-agent="${install!.businessId}" data-kowi-label="Hablar con nosotros"></script>`
    : demoSnippet;
  async function copy() {
    try { await navigator.clipboard.writeText(snippet); setCopied(true); }
    catch { setNotice('No se pudo copiar automáticamente. Selecciona y copia el código.'); }
  }

  return <main className="min-h-screen bg-[#edf2e8] px-6 py-10 text-[#193d32]"><div className="mx-auto max-w-6xl">
    <Link href="/business" className="text-sm underline">← Kowi Business</Link>
    <p className="mt-12 text-xs font-bold uppercase tracking-[.2em] text-[#638459]">Integración web</p>
    <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">Instala Kowi Business en tu web.</h1>
    <p className="mt-5 max-w-3xl text-lg text-[#526b5a]">La demostración pública funciona sin cuenta. Si ya configuraste tu negocio, autoriza tus dominios y activa el agente para obtener tu código personalizado.</p>
    <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_460px]"><div className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-sm"><h2 className="text-2xl font-semibold">1. Configura el acceso</h2>
        {checking ? <p role="status" className="mt-4 text-sm">Comprobando tu sesión…</p> : !signedIn ? <p className="mt-4 text-sm text-[#526b5a]">Para generar un código de tu negocio, <Link href="/business#crear" className="font-semibold underline">entra a Kowi Business</Link>, guarda su ficha y vuelve aquí. Puedes instalar mientras tanto la demo genérica.</p> : <>
          <p className="mt-4 text-sm text-[#526b5a]">Escribe entre uno y cinco orígenes HTTPS, uno por línea, por ejemplo <code>https://miempresa.com</code>. Añade `www` por separado si lo usas.</p>
          <label className="mt-4 block text-sm font-semibold" htmlFor="origins">Dominios autorizados</label>
          <textarea id="origins" rows={3} value={origins} onChange={event => setOrigins(event.target.value)} placeholder={'https://miempresa.com\nhttps://www.miempresa.com'} className="mt-2 w-full rounded-xl border border-[#b9cfb8] p-3 font-mono text-sm" />
          {!install?.available && <p role="status" className="mt-4 rounded-xl bg-amber-50 p-3 text-sm">La activación para clientes está pendiente de configuración y verificación por Kowi. La demo se puede insertar ahora.</p>}
          <div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={busy || !origins.trim() || !install?.available} onClick={() => update(true)} className="rounded-full bg-[#193d32] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy ? 'Guardando…' : active ? 'Guardar dominios' : 'Activar agente web'}</button>{install?.enabled && <button type="button" disabled={busy} onClick={() => update(false)} className="rounded-full border border-[#b9cfb8] px-5 py-3 text-sm">Desactivar acceso</button>}</div>
          <p className="mt-4 text-sm" role="status">Estado: {active ? 'activo para los dominios indicados' : 'pendiente de activación'}</p>
        </>}
        {notice && <p role="alert" className="mt-4 rounded-xl bg-[#edf2e8] p-3 text-sm">{notice}</p>}
      </section>
      <section className="rounded-3xl bg-white p-6 shadow-sm"><h2 className="text-2xl font-semibold">2. Copia el código</h2>
        <p className="mt-4 text-sm text-[#526b5a]">{active ? 'Este código incluye el identificador público de tu negocio. Insértalo solo en uno de los dominios autorizados.' : 'Por ahora este código abre únicamente la demo genérica. Activa el agente arriba para obtener el código de tu empresa.'}</p>
        <pre className="mt-5 overflow-x-auto whitespace-pre-wrap break-all rounded-2xl bg-[#102e27] p-5 text-xs leading-relaxed text-[#dcebb2]"><code>{snippet}</code></pre>
        <button type="button" onClick={copy} className="mt-5 rounded-full bg-[#193d32] px-6 py-3 font-semibold text-white">{copied ? 'Copiado ✓' : 'Copiar código'}</button>
        <p className="mt-5 text-sm leading-relaxed text-[#526b5a]">Insértalo antes de cerrar <code>&lt;/body&gt;</code> o en el bloque global de scripts de tu web. Pruébalo también desde el móvil. No requiere claves de API.</p>
      </section>
      <p className="text-sm leading-relaxed text-[#526b5a]">El chat prepara respuestas según la ficha aprobada. Las reservas, disponibilidad, pagos y mensajes externos necesitan integraciones y confirmación independientes. <a href="mailto:info@kowi.one?subject=Instalar%20Kowi%20Business%20en%20mi%20web" className="font-semibold underline">Solicitar ayuda con el piloto ↗</a></p>
    </div><section><h2 className="mb-4 text-xl font-semibold">Vista previa de la demo</h2><iframe src="/business/embed" title="Vista previa de Kowi Business" loading="lazy" className="h-[620px] w-full rounded-[20px] border-0 shadow-xl" /><p className="mt-3 text-xs text-[#526b5a]">Esta vista usa datos de ejemplo; prueba el código personalizado en un dominio autorizado.</p></section></div>
  </div></main>;
}
