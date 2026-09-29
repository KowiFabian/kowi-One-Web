'use client';
import { useState } from 'react';
import Link from 'next/link';

const cases = [
  { sector: 'Peluquería', company: 'Estudio Raíz', prompt: 'Quiero corte y color el viernes por la tarde.', response: '¿Me dices tu nombre, un contacto y hora preferida? El equipo confirmará disponibilidad y precio.', appointment: 'Corte y color · viernes por la tarde · pendiente de confirmar', lead: 'Interés en corte y color; concretar hora y presupuesto.', followup: 'El equipo revisa disponibilidad y, si lo aprueba, contacta para confirmar.' },
  { sector: 'Clínica dental', company: 'Clínica Sonrisa', prompt: 'Me interesa una limpieza dental. ¿Puedo pedir una cita?', response: 'Puedo recoger tu solicitud y preferencia de horario. La clínica confirmará disponibilidad, precio e indicaciones. No realizo diagnósticos.', appointment: 'Limpieza dental · horario por concretar · pendiente de confirmar', lead: 'Interés en limpieza dental; concretar disponibilidad.', followup: 'Recepción valida la solicitud y, si la aprueba, contacta para proponer una cita.' },
  { sector: 'Promotora', company: 'Hábitat Norte', prompt: 'Busco una vivienda de dos habitaciones cerca de Madrid.', response: '¿Qué presupuesto y municipios prefieres? El equipo comprobará opciones y propondrá una visita.', appointment: 'Visita comercial · vivienda por elegir · pendiente de disponibilidad', lead: 'Busca vivienda de dos habitaciones cerca de Madrid; preguntar presupuesto y municipios.', followup: 'El equipo comprueba viviendas disponibles y, si lo aprueba, propone opciones y visita.' },
];
const steps = ['Consulta', 'Solicitud de cita', 'Oportunidad', 'Seguimiento'];

export default function BusinessDemo() {
  const [sector, setSector] = useState(0);
  const [step, setStep] = useState(0);
  const scenario = cases[sector];
  return <main className="min-h-screen bg-[#edf2e8] text-[#193d32]">
    <header className="border-b border-[#d4dfcd] bg-[#10372f] px-6 py-5 text-white"><div className="mx-auto flex max-w-6xl items-center justify-between gap-3"><Link href="/business" className="font-bold tracking-[.17em]">KOWI BUSINESS</Link><Link href="/business/instalar" className="rounded-full bg-[#d9efae] px-5 py-2 text-sm font-semibold text-[#193d32]">Instalar en mi web ↗</Link></div></header>
    <div className="mx-auto max-w-6xl px-6 py-12">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-[#66865d]">DEMO INTERACTIVA · SIMULACIÓN</p>
      <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">Una consulta puede convertirse en una oportunidad concreta.</h1>
      <p className="mt-5 max-w-3xl text-lg text-[#53695c]">Explora cuatro pasos del recorrido comercial. Los negocios y datos son ficticios: esta simulación no envía mensajes, guarda leads ni reserva citas.</p>
      <div className="mt-8 flex flex-wrap gap-3" role="group" aria-label="Elegir sector">{cases.map((item,index)=><button type="button" key={item.sector} onClick={()=>{setSector(index);setStep(0);}} aria-pressed={sector===index} className={`rounded-full px-5 py-3 font-medium ${sector===index?'bg-[#194538] text-white':'border border-[#b9cfb8] bg-white'}`}>{item.sector}</button>)}</div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
        <section className="overflow-hidden rounded-[1.5rem] border border-[#d4dfcd] bg-white shadow-sm" aria-label="Recorrido comercial simulado">
          <div className="border-b border-[#e2e9dc] p-5"><h2 className="text-xl font-semibold">{scenario.company} · negocio ficticio</h2><p className="mt-1 text-sm text-[#65776a]">Recorrido de ejemplo · paso {step+1} de {steps.length}</p></div>
          <div className="grid grid-cols-2 gap-2 p-5 sm:grid-cols-4" role="group" aria-label="Etapas de la demostración">{steps.map((label,index)=><button key={label} type="button" onClick={()=>setStep(index)} aria-current={step===index?'step':undefined} className={`rounded-xl px-3 py-3 text-left text-sm font-semibold ${step===index?'bg-[#194538] text-white':'bg-[#eef3e8] text-[#405c4b]'}`}>{index+1}. {label}</button>)}</div>
          <div className="min-h-[260px] space-y-4 px-5 pb-5" aria-live="polite">
            {step===0 && <><p className="max-w-[85%] rounded-2xl rounded-tl-sm bg-[#eef3e8] p-4">{scenario.prompt}</p><p className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-[#dcecab] p-4">{scenario.response}</p></>}
            {step===1 && <div className="rounded-2xl bg-[#eef3e8] p-5"><p className="text-xs font-bold uppercase tracking-widest text-[#66865d]">Solicitud preparada</p><p className="mt-3 text-lg font-semibold">{scenario.appointment}</p><p className="mt-3 text-sm text-[#53695c]">El negocio debe comprobar su agenda y confirmar la cita. Ninguna reserva ocurre en esta simulación.</p></div>}
            {step===2 && <div className="rounded-2xl bg-[#eef3e8] p-5"><p className="text-xs font-bold uppercase tracking-widest text-[#66865d]">Ficha CRM de ejemplo</p><p className="mt-3 text-lg font-semibold">{scenario.lead}</p><p className="mt-3 text-sm text-[#53695c]">Estado: nuevo · Responsable: equipo del negocio · Siguiente paso: revisión humana.</p></div>}
            {step===3 && <div className="rounded-2xl bg-[#eef3e8] p-5"><p className="text-xs font-bold uppercase tracking-widest text-[#66865d]">Acción propuesta</p><p className="mt-3 text-lg font-semibold">{scenario.followup}</p><p className="mt-3 text-sm text-[#53695c]">Kowi prepara el seguimiento. El envío externo requiere aprobación y un canal configurado.</p></div>}
          </div>
          <div className="border-t border-[#e2e9dc] p-5"><button type="button" onClick={()=>setStep(step===steps.length-1?0:step+1)} className="w-full rounded-xl bg-[#194538] p-4 font-semibold text-white hover:bg-[#28634d]">{step===steps.length-1?'Reiniciar recorrido':'Ver siguiente paso'} ↗</button></div>
        </section>
        <aside className="rounded-[1.5rem] bg-[#dcebab] p-7"><p className="text-xs font-bold uppercase tracking-[.2em]">DEL EJEMPLO A TU NEGOCIO</p><h2 className="mt-5 text-2xl font-semibold">Configura tu propio agente.</h2><p className="mt-5 leading-relaxed">Describe servicios, horarios, preguntas frecuentes y forma de atender. Después prueba el chat web y revisa oportunidades y acciones desde tu panel.</p><ol className="mt-6 list-inside list-decimal space-y-3 text-sm"><li>Crea la ficha de tu negocio.</li><li>Prueba una conversación con datos aprobados.</li><li>Autoriza tus dominios y copia el código de instalación.</li><li>Activa canales adicionales cuando estén conectados.</li></ol><Link href="/business#crear" className="mt-8 inline-block rounded-full bg-[#194538] px-6 py-3 font-semibold text-white">Crear mi agente ↗</Link><p className="mt-6 text-sm"><Link href="/piloto" className="font-semibold underline">Explorar el piloto con tres clientes ficticios ↗</Link></p><p className="mt-4 text-sm">¿Quieres acompañamiento? <a href="mailto:info@kowi.one?subject=Piloto%20Kowi%20Business" className="font-semibold underline">Solicita un piloto.</a></p></aside>
      </div>
    </div>
  </main>;
}
