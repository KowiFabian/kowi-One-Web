'use client';

import { useState } from 'react';

const examples = [
  { name: 'Belleza', prompt: 'Quiero corte y color el viernes', answer: 'Puedo preparar tu solicitud de corte y color para el viernes. ¿Cuál es tu nombre y cómo prefieres que te contacten? El equipo confirmará disponibilidad y precio.' },
  { name: 'Comercio', prompt: '¿Puedo consultar un producto?', answer: 'Claro. Cuéntame qué producto buscas y qué necesitas saber. El equipo verificará existencias, precio y entrega antes de confirmarte una compra.' },
  { name: 'Inmobiliaria', prompt: 'Busco un piso de dos habitaciones', answer: '¿En qué zona y con qué presupuesto aproximado? Con esos datos puedo preparar una consulta para que un asesor te proponga opciones y una visita.' },
];

export default function BusinessEmbed() {
  const [sector, setSector] = useState(0);
  const [input, setInput] = useState('');
  const [conversation, setConversation] = useState<{ question: string; answer: string }[]>([]);
  function send() {
    const question = input.trim();
    if (!question) return;
    setConversation(previous => [...previous, { question, answer: examples[sector].answer }]);
    setInput('');
  }
  return <main className="flex min-h-screen flex-col bg-[#f4f5ec] font-sans text-[#183c30]" aria-label="Demostración integrable de Kowi Business">
    <header className="flex items-center justify-between gap-3 bg-[#123d31] px-5 py-4 text-white"><div><strong className="tracking-[.15em]">KOWI BUSINESS</strong><p className="text-xs text-[#c8e2d0]">Demostración de atención comercial</p></div><span aria-hidden="true" className="h-8 w-8 rounded-full bg-[#dce8a7] shadow-[0_0_20px_#dce8a7]" /></header>
    <div className="flex flex-wrap gap-2 border-b border-[#d6dfce] p-4" role="group" aria-label="Sector de ejemplo">{examples.map((item, index) => <button type="button" key={item.name} aria-pressed={sector===index} onClick={() => {setSector(index);setConversation([]);}} className={`rounded-full px-4 py-2 text-xs font-semibold ${sector===index?'bg-[#184b38] text-white':'border border-[#b6c9b3] bg-white'}`}>{item.name}</button>)}</div>
    <section className="flex min-h-[230px] flex-1 flex-col gap-3 overflow-y-auto p-5" role="log" aria-live="polite"><p className="max-w-[85%] rounded-2xl bg-white p-3 text-sm leading-relaxed shadow-sm">Hola, soy la demo de Kowi. Cuéntame qué necesitas y te mostraré cómo se prepara el siguiente paso para un negocio.</p>{conversation.map((item,index)=><div key={index} className="contents"><p className="ml-auto max-w-[85%] rounded-2xl bg-[#dce8a7] p-3 text-sm">{item.question}</p><p className="max-w-[85%] rounded-2xl bg-white p-3 text-sm leading-relaxed shadow-sm">{item.answer}</p></div>)}</section>
    <form onSubmit={event=>{event.preventDefault();send();}} className="flex gap-2 border-t border-[#d6dfce] p-4"><label className="sr-only" htmlFor="business-demo-input">Escribe tu consulta</label><input id="business-demo-input" value={input} onChange={event=>setInput(event.target.value)} maxLength={300} placeholder={examples[sector].prompt} className="min-w-0 flex-1 rounded-xl border border-[#b6c9b3] bg-white px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#184b38]"/><button type="submit" className="rounded-xl bg-[#184b38] px-4 text-sm font-semibold text-white">Enviar</button></form>
    <p className="px-4 pb-4 text-[11px] leading-relaxed text-[#677a6a]">Demo de respuestas de ejemplo. No envía datos, crea leads ni confirma citas. <a href="https://kowi.one/business" target="_blank" rel="noopener noreferrer" className="underline">Conoce el piloto ↗</a></p>
  </main>;
}
