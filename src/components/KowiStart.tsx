'use client';

import Link from 'next/link';
import { useState } from 'react';

const examples = [
  { label: 'Atender clientes', message: 'Quiero un asistente para mi peluquería.', reply: 'Empieza con tus servicios, precios confirmados y horarios. Prueba una pregunta sobre un corte y define cuándo debe intervenir recepción.', href: '/builders?template=belleza', action: 'Configurar un recepcionista' },
  { label: 'Estudiar una idea', message: 'Quiero saber si mi idea de negocio es viable.', reply: 'Define el cliente, el problema y tu presupuesto. Para validar la idea, elige una hipótesis y compruébala con cinco conversaciones antes de invertir.', href: '/kowi#entrar', action: 'Analizar mi propia idea con KOWI' },
  { label: 'Crear un proyecto', message: 'Quiero convertir mi idea en un proyecto.', reply: 'Describe qué resultado quieres conseguir este mes. Divídelo en tres hitos y empieza por una tarea que puedas completar esta semana.', href: '/proyectos', action: 'Abrir KOWI Proyectos' },
];

export default function KowiStart() {
  const [selected, setSelected] = useState<number | null>(null);
  const example = selected === null ? null : examples[selected];

  return <section aria-labelledby="kowi-start" className="kowi-shell px-5 py-12 text-[#f4f3f2] md:py-16">
    <div className="mx-auto max-w-5xl">
      <Link href="/" className="text-sm font-semibold tracking-widest text-[#e8b37b]">KOWI IA</Link>
      <h1 id="kowi-start" className="mt-6 text-4xl font-semibold tracking-tight md:text-5xl">Hablar con KOWI</h1>
      <p className="mt-4 max-w-2xl text-[#c3d0ca]">Explora un ejemplo o entra para contarle a KOWI qué quieres conseguir y guardar tu conversación.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a href="#entrar" className="kowi-gold-btn rounded-full px-5 py-3 font-semibold">Iniciar conversación con IA</a>
        <Link href="/builders?template=personalizado" className="rounded-full border border-white/30 px-5 py-3">Crear un agente personalizado</Link>
      </div>
      <div className="glass mt-8 rounded-2xl p-5 sm:p-6">
        <h2 className="text-xl font-semibold">Prueba una conversación de ejemplo</h2>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Ejemplos de conversación">
          {examples.map((item, index) => <button key={item.label} type="button" aria-pressed={selected === index} onClick={() => setSelected(index)} className="rounded-full border border-[#e8b37b]/45 px-4 py-2 text-sm aria-pressed:bg-[#e8b37b] aria-pressed:text-[#17121a]">{item.label}</button>)}
        </div>
        <div aria-live="polite">
          {example && <div className="mt-5 space-y-3">
            <p className="ml-auto max-w-[90%] rounded-xl bg-[#283a50] p-4">{example.message}</p>
            <p className="max-w-[90%] rounded-xl bg-white/10 p-4">{example.reply}</p>
            <Link href={example.href} className="inline-block font-semibold text-[#e8b37b] underline">{example.action} ↗</Link>
          </div>}
        </div>
      </div>
    </div>
  </section>;
}
