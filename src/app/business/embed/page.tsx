'use client';

import { useEffect, useState } from 'react';

const examples = [
  { name: 'Belleza', prompt: 'Quiero corte y color el viernes', answer: 'Puedo preparar tu solicitud de corte y color para el viernes. ¿Cuál es tu nombre y cómo prefieres que te contacten? El equipo confirmará disponibilidad y precio.' },
  { name: 'Comercio', prompt: '¿Puedo consultar un producto?', answer: 'Claro. Cuéntame qué producto buscas y qué necesitas saber. El equipo verificará existencias, precio y entrega antes de confirmarte una compra.' },
  { name: 'Inmobiliaria', prompt: 'Busco un piso de dos habitaciones', answer: '¿En qué zona y con qué presupuesto aproximado? Con esos datos puedo preparar una consulta para que un asesor te proponga opciones y una visita.' },
];

export default function BusinessEmbed() {
  const [sector, setSector] = useState(0);
  const [input, setInput] = useState('');
  const [conversation, setConversation] = useState<{ question: string; answer: string }[]>([]);
  const [installation,setInstallation]=useState<{businessId:string;siteOrigin:string}|null>(null);
  const [busy,setBusy]=useState(false);
  const [notice,setNotice]=useState('');
  const [leadOpen,setLeadOpen]=useState(false);
  const [lead,setLead]=useState({name:'',contact:'',request:'',preferredTime:'',consent:false});
  useEffect(()=>{const params=new URLSearchParams(window.location.search);const businessId=params.get('business');const siteOrigin=params.get('siteOrigin');if(businessId&&siteOrigin)setInstallation({businessId,siteOrigin});},[]);
  async function send() {
    const question = input.trim();
    if (!question||busy) return;
    setBusy(true);setNotice('');
    try {
      let answer=examples[sector].answer;
      if(installation){const response=await fetch('/api/business/embed/chat',{method:'POST',headers:{'Content-Type':'application/json','x-kowi-site-origin':installation.siteOrigin},body:JSON.stringify({businessId:installation.businessId,message:question,history:conversation.slice(-4)})});const result=await response.json();if(!response.ok)throw new Error(result.error||'No se pudo responder.');answer=result.answer;}
      setConversation(previous => [...previous, { question, answer }]);
    } catch(error){setNotice(error instanceof Error?error.message:'No se pudo responder.');}
    finally{setBusy(false);}
    setInput('');
  }
  async function submitLead(event:React.FormEvent){event.preventDefault();if(!installation||busy)return;setBusy(true);setNotice('');try{const response=await fetch('/api/business/embed/lead',{method:'POST',headers:{'Content-Type':'application/json','x-kowi-site-origin':installation.siteOrigin},body:JSON.stringify({businessId:installation.businessId,...lead})});const result=await response.json();if(!response.ok)throw new Error(result.error||'No se pudo registrar la solicitud.');setLeadOpen(false);setLead({name:'',contact:'',request:'',preferredTime:'',consent:false});setNotice(result.message);}catch(error){setNotice(error instanceof Error?error.message:'No se pudo registrar la solicitud.');}finally{setBusy(false);}}
  return <main className="flex min-h-screen flex-col bg-[#f4f5ec] font-sans text-[#183c30]" aria-label="Demostración integrable de Kowi Business">
    <header className="flex items-center justify-between gap-3 bg-[#123d31] px-5 py-4 text-white"><div><strong className="tracking-[.15em]">KOWI BUSINESS</strong><p className="text-xs text-[#c8e2d0]">{installation?'Atención comercial · solicitudes sujetas a confirmación':'Demostración de atención comercial'}</p></div><span aria-hidden="true" className="h-8 w-8 rounded-full bg-[#dce8a7] shadow-[0_0_20px_#dce8a7]" /></header>
    {!installation&&<div className="flex flex-wrap gap-2 border-b border-[#d6dfce] p-4" role="group" aria-label="Sector de ejemplo">{examples.map((item, index) => <button type="button" key={item.name} aria-pressed={sector===index} onClick={() => {setSector(index);setConversation([]);}} className={`rounded-full px-4 py-2 text-xs font-semibold ${sector===index?'bg-[#184b38] text-white':'border border-[#b6c9b3] bg-white'}`}>{item.name}</button>)}</div>}
    <section className="flex min-h-[230px] flex-1 flex-col gap-3 overflow-y-auto p-5" role="log" aria-live="polite"><p className="max-w-[85%] rounded-2xl bg-white p-3 text-sm leading-relaxed shadow-sm">Hola, soy la demo de Kowi. Cuéntame qué necesitas y te mostraré cómo se prepara el siguiente paso para un negocio.</p>{conversation.map((item,index)=><div key={index} className="contents"><p className="ml-auto max-w-[85%] rounded-2xl bg-[#dce8a7] p-3 text-sm">{item.question}</p><p className="max-w-[85%] rounded-2xl bg-white p-3 text-sm leading-relaxed shadow-sm">{item.answer}</p></div>)}</section>
    {notice&&<p role="status" className="mx-4 rounded-xl bg-[#e5eccf] p-3 text-xs">{notice}</p>}
    {installation&&<button type="button" onClick={()=>setLeadOpen(value=>!value)} className="mx-4 mb-2 rounded-xl border border-[#b6c9b3] bg-white px-4 py-3 text-sm font-semibold">{leadOpen?'Volver al chat':'Solicitar contacto o visita ↗'}</button>}
    {installation&&leadOpen&&<form onSubmit={submitLead} className="mx-4 mb-2 grid gap-2 rounded-xl bg-white p-4 text-sm"><input required maxLength={100} placeholder="Tu nombre" aria-label="Tu nombre" value={lead.name} onChange={e=>setLead({...lead,name:e.target.value})} className="rounded-lg border p-2"/><input required maxLength={120} placeholder="Correo o teléfono" aria-label="Correo o teléfono" value={lead.contact} onChange={e=>setLead({...lead,contact:e.target.value})} className="rounded-lg border p-2"/><textarea required maxLength={1000} placeholder="¿Qué necesitas?" aria-label="Tu solicitud" value={lead.request} onChange={e=>setLead({...lead,request:e.target.value})} className="rounded-lg border p-2"/><input maxLength={120} placeholder="Horario preferido (opcional)" aria-label="Horario preferido" value={lead.preferredTime} onChange={e=>setLead({...lead,preferredTime:e.target.value})} className="rounded-lg border p-2"/><label><input required type="checkbox" checked={lead.consent} onChange={e=>setLead({...lead,consent:e.target.checked})}/> Acepto que el negocio use estos datos para responder a mi solicitud.</label><button disabled={busy} type="submit" className="rounded-lg bg-[#184b38] p-2 text-white disabled:opacity-50">Enviar solicitud</button><p className="text-xs text-[#677a6a]">Es una solicitud, no una cita confirmada. No incluyas datos sensibles.</p></form>}
    <form onSubmit={event=>{event.preventDefault();void send();}} className="flex gap-2 border-t border-[#d6dfce] p-4"><label className="sr-only" htmlFor="business-demo-input">Escribe tu consulta</label><input id="business-demo-input" value={input} onChange={event=>setInput(event.target.value)} maxLength={600} placeholder={installation?'Escribe tu consulta…':examples[sector].prompt} className="min-w-0 flex-1 rounded-xl border border-[#b6c9b3] bg-white px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#184b38]"/><button type="submit" disabled={busy} className="rounded-xl bg-[#184b38] px-4 text-sm font-semibold text-white disabled:opacity-50">{busy?'…':'Enviar'}</button></form>
    <p className="px-4 pb-4 text-[11px] leading-relaxed text-[#677a6a]">{installation?'IA: verifica los datos importantes con el negocio. Las solicitudes se revisan antes de confirmar.':'Demo de respuestas de ejemplo. No envía datos, crea leads ni confirma citas.'} <a href="https://kowi.one/business" target="_blank" rel="noopener noreferrer" className="underline">Kowi Business ↗</a></p>
  </main>;
}
