'use client';

import Link from 'next/link';
import { useState } from 'react';

type Persona = {
  name: string; role: string; assistant: string; project: string; preference: string;
  opening: string; next: string; response: string; request: string;
};

const personas: Persona[] = [
  {
    name: 'Lucía Vega', role: 'Peluquería de barrio', assistant: 'Luma',
    project: 'Un asistente para atender consultas de corte y color y preparar citas.',
    preference: 'Trato cálido, mensajes breves y tardes disponibles.',
    opening: 'Hola, llevo una peluquería pequeña. ¿Puedes ayudarme a organizar las citas sin perder mi trato personal?',
    next: 'Prefiero un tono cercano. Abrimos de martes a sábado y me gusta confirmar yo cada cita.',
    response: 'Sí, Lucía. Luma puede explicar tus servicios y recoger la hora preferida. Te dejará cada solicitud para que confirmes tú la disponibilidad y el precio. ¿Qué servicios quieres mostrar primero?',
    request: 'Quiero una prueba de Luma para mi peluquería; confirmaré las citas personalmente.',
  },
  {
    name: 'Mateo Ríos', role: 'Consulta dental', assistant: 'Nora',
    project: 'Un asistente de recepción para preguntas administrativas y solicitudes de visita.',
    preference: 'Lenguaje sereno, privacidad y derivación clínica al equipo humano.',
    opening: 'Necesito que recepción pueda responder cuando estamos atendiendo. ¿Cómo lo haría KOWI?',
    next: 'Quiero que pida solo lo necesario y que nunca haga diagnósticos ni dé citas por confirmadas.',
    response: 'Entendido, Mateo. Nora puede responder sobre horarios y servicios que hayas aprobado, recoger una solicitud de visita y pasarla a recepción. Las preguntas de salud irán al personal clínico; no pedirá detalles médicos en el chat.',
    request: 'Quiero probar Nora para recepción, con confirmación humana y sin datos de salud en el chat.',
  },
  {
    name: 'Inés Duarte', role: 'Estudio de arquitectura', assistant: 'Atlas',
    project: 'Un asistente para orientar proyectos de vivienda y preparar reuniones comerciales.',
    preference: 'Claridad, cuidado ambiental y propuestas con supuestos visibles.',
    opening: 'Mis clientes llegan con una idea de vivienda. Quiero ayudarlos a convertirla en un proyecto viable.',
    next: 'Me importa la eficiencia energética y necesito revisar yo presupuestos, permisos y promesas de plazo.',
    response: 'Atlas puede ordenar objetivos, ubicación, presupuesto aproximado y criterios ambientales. Preparará un resumen para tu revisión antes de proponer una reunión. Los costes, permisos y plazos solo se comunicarán cuando tu equipo los valide.',
    request: 'Quiero probar Atlas para orientar proyectos de vivienda sostenible y revisar cada propuesta.',
  },
];

export default function PilotPage() {
  const [selected, setSelected] = useState(0);
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState('');
  const [custom, setCustom] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [notice, setNotice] = useState('');
  const [prepared, setPrepared] = useState(false);
  const persona = personas[selected];
  const turns = [persona.opening, persona.next];

  function choose(index: number) { setSelected(index); setStep(0); setCustom([]); setMessage(''); setNotice(''); }
  function reply() {
    const value = message.trim();
    if (!value) return;
    setCustom(previous => [...previous, value.slice(0, 400)]);
    setMessage('');
  }
  function simulateLead() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setNotice('Escribe un correo de prueba válido para preparar las fichas.'); return; }
    setPrepared(true);
    setNotice('Tres fichas de ensayo preparadas para un mismo buzón. No se ha enviado ningún correo ni guardado leads en el CRM.');
  }

  return <main className="min-h-screen bg-[#111b19] text-[#f4f0e7]">
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-8 md:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <Link href="/" className="text-lg font-semibold tracking-[.3em]">KOWI<span className="text-[#c9d997]">.</span></Link>
        <nav className="flex flex-wrap gap-5 text-sm text-[#cad6cb]" aria-label="Navegación del piloto"><Link href="/business">Business</Link><Link href="/business/demo">Demo</Link><Link href="/business/instalar">Instalación</Link></nav>
      </header>
      <section className="grid gap-10 py-14 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
        <div><p className="text-xs font-semibold uppercase tracking-[.27em] text-[#d7aa79]">Laboratorio piloto · tres historias ficticias</p><h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">Cada persona tiene una idea. KOWI ayuda a darle forma.</h1><p className="mt-7 max-w-2xl text-lg leading-relaxed text-[#bbcabf]">Explora cómo un asistente distinto acompaña a una peluquería, una consulta y un estudio de arquitectura. La persona conserva el criterio, la relación y la decisión final.</p></div>
        <div className="rounded-3xl border border-[#bbc994]/20 bg-[#22332d] p-7"><span className="text-xs uppercase tracking-[.2em] text-[#d7aa79]">Estado de esta prueba</span><h2 className="mt-4 text-2xl font-semibold">Simulación interactiva</h2><p className="mt-3 text-sm leading-relaxed text-[#c7d4c9]">Estos personajes y respuestas son ejemplos escritos para probar la experiencia. El chat de esta página no llama a OpenAI, no registra cuentas ni envía correos. La activación real del agente permanece sujeta a la verificación del servidor.</p></div>
      </section>
      <section aria-labelledby="personas-title"><h2 id="personas-title" className="mb-5 text-2xl font-semibold">Elige un cliente de prueba</h2><div className="grid gap-4 md:grid-cols-3">{personas.map((item,index)=><button key={item.name} type="button" onClick={()=>choose(index)} aria-pressed={selected===index} className={`rounded-3xl border p-6 text-left transition ${selected===index?'border-[#d7aa79] bg-[#263b31]':'border-white/10 bg-[#192823] hover:border-[#d7aa79]/60'}`}><span className="text-xs uppercase tracking-widest text-[#d7aa79]">0{index+1} / {item.role}</span><strong className="mt-5 block text-2xl">{item.name}</strong><span className="mt-2 block text-sm text-[#b8c9bc]">{item.project}</span><span className="mt-5 block text-sm font-semibold text-[#d6e4b3]">Agente {item.assistant} ↗</span></button>)}</div></section>
      <div className="mt-9 grid gap-6 lg:grid-cols-[.75fr_1.25fr]"><aside className="rounded-3xl border border-white/10 bg-[#1a2924] p-7"><p className="text-xs uppercase tracking-[.2em] text-[#d7aa79]">Ficha del proyecto</p><h2 className="mt-4 text-2xl font-semibold">{persona.assistant} para {persona.name}</h2><p className="mt-4 text-sm leading-relaxed text-[#c7d4c9]">{persona.project}</p><div className="mt-6 border-t border-white/10 pt-5"><strong className="text-sm">Gustos y decisiones</strong><p className="mt-2 text-sm text-[#b8c9bc]">{persona.preference}</p></div><div className="mt-6 border-t border-white/10 pt-5"><strong className="text-sm">Control humano</strong><p className="mt-2 text-sm text-[#b8c9bc]">Cada cita, presupuesto, comunicación externa y dato sensible requiere revisión de la persona responsable.</p></div></aside>
        <section className="flex min-h-[510px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#eeeae0] text-[#20382c]" aria-label={`Conversación simulada con ${persona.assistant}`}><div className="flex items-center justify-between border-b border-[#d5dccd] bg-[#e4eadb] p-5"><div><strong>{persona.assistant} · KOWI Business</strong><p className="text-xs text-[#5d7365]">Ensayo conversacional · {persona.role}</p></div><span className="h-3 w-3 rounded-full bg-[#679b77]" aria-hidden="true" /></div><div className="flex flex-1 flex-col gap-3 p-5" role="log" aria-live="polite"><p className="max-w-[85%] rounded-2xl bg-white p-4 text-sm">Hola, {persona.name}. Estoy aquí para ayudarte a dar el siguiente paso, con tus preferencias y decisiones en el centro. ¿Por dónde empezamos?</p>{step>0&&<><p className="ml-auto max-w-[85%] rounded-2xl bg-[#d5e3ad] p-4 text-sm">{turns[0]}</p><p className="max-w-[85%] rounded-2xl bg-white p-4 text-sm">{persona.response}</p></>}{step>1&&<><p className="ml-auto max-w-[85%] rounded-2xl bg-[#d5e3ad] p-4 text-sm">{turns[1]}</p><p className="max-w-[85%] rounded-2xl bg-white p-4 text-sm">He anotado esa preferencia para la configuración de prueba. El siguiente paso sería revisar juntos servicios, horarios y qué consultas pasan a una persona. No activaríamos envíos ni reservas sin tu aprobación.</p></>}{custom.map((item,index)=><div key={index} className="contents"><p className="ml-auto max-w-[85%] rounded-2xl bg-[#d5e3ad] p-4 text-sm">{item}</p><p className="max-w-[85%] rounded-2xl bg-white p-4 text-sm">Gracias por contármelo. Para tener una respuesta real y adaptada a ese detalle, habrá que activar y probar el agente conectado. De momento lo dejaría como pregunta para revisar contigo.</p></div>)}</div><div className="border-t border-[#d5dccd] p-5"><button type="button" disabled={step>=2} onClick={()=>setStep(value=>value+1)} className="rounded-full bg-[#244837] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{step===0?'Comenzar conversación':step===1?'Continuar conversación':'Recorrido completo'}</button><form onSubmit={event=>{event.preventDefault();reply();}} className="mt-4 flex gap-2"><label htmlFor="pilot-message" className="sr-only">Escribe como cliente de prueba</label><input id="pilot-message" value={message} onChange={event=>setMessage(event.target.value)} maxLength={400} placeholder="Escribe una pregunta para el ensayo…" className="min-w-0 flex-1 rounded-xl border border-[#cad4c5] bg-white p-3 text-sm"/><button type="submit" className="rounded-xl bg-[#244837] px-4 text-sm font-semibold text-white">Enviar</button></form><p className="mt-2 text-xs text-[#5d7365]">Las respuestas a texto libre son de ejemplo; no simulan una IA conectada.</p></div></section></div>
      <section className="mt-10 rounded-3xl border border-[#d7aa79]/25 bg-[#20322a] p-7 md:p-9"><div className="grid gap-8 md:grid-cols-2"><div><p className="text-xs uppercase tracking-[.2em] text-[#d7aa79]">Ensayo de captación</p><h2 className="mt-4 text-3xl font-semibold">Tres fichas, un solo buzón de prueba.</h2><p className="mt-4 text-sm leading-relaxed text-[#c7d4c9]">Escribe el correo que controlas una sola vez para preparar las tres fichas. No publicamos aquí tu dirección personal. Tres personajes pueden compartir un contacto en CRM; no serían tres cuentas de acceso independientes.</p></div><div><label htmlFor="pilot-email" className="text-sm font-semibold">Correo de prueba para las tres fichas</label><input id="pilot-email" type="email" autoComplete="email" value={email} onChange={event=>{setEmail(event.target.value);setPrepared(false);}} placeholder="tu-correo-de-prueba@ejemplo.com" className="mt-2 w-full rounded-xl border border-white/20 bg-[#15251e] p-3 text-white"/><button type="button" onClick={simulateLead} className="mt-5 rounded-full bg-[#d5e3ad] px-6 py-3 text-sm font-semibold text-[#20382c]">Preparar las tres fichas</button>{notice&&<p role="status" className="mt-4 text-sm text-[#d5e3ad]">{notice}</p>}</div></div>{prepared&&<div className="mt-7 grid gap-3 md:grid-cols-3" aria-label="Fichas ficticias preparadas">{personas.map(item=><article key={item.name} className="rounded-2xl border border-white/10 bg-[#14251e] p-5"><strong>{item.name} · {item.assistant}</strong><p className="mt-2 text-sm text-[#c7d4c9]">{item.request}</p><p className="mt-3 text-xs text-[#d5e3ad]">Buzón común: {email.trim()}</p><p className="mt-2 text-xs text-[#a9bcae]">Estado: ensayo local · pendiente de registro real</p></article>)}</div>}</section>
      <div className="mt-10 flex flex-wrap items-center gap-4"><Link href="/business/instalar" className="rounded-full border border-[#d7aa79] px-6 py-3 text-sm font-semibold">Ver instalación real ↗</Link><Link href="/business/demo" className="text-sm text-[#d5e3ad] underline">Explorar recorrido comercial</Link></div>
    </div>
  </main>;
}
