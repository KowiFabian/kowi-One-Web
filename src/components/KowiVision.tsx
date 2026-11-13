'use client';
import { useState } from 'react';

const examples: Record<string, Record<string,string>>={
 belleza:{citas:'Puedo ayudarte a solicitar una cita. ¿Qué servicio te gustaría reservar?',ventas:'¿Buscas un servicio de belleza? Te explico las opciones disponibles.',consultas:'¿Quieres consultar nuestros servicios, horarios o ubicación?'},
 clinica:{citas:'Puedo ayudarte a solicitar una cita con recepción.',ventas:'Puedo explicarte los servicios generales de la clínica, sin ofrecer diagnósticos.',consultas:'¿Necesitas información administrativa, ubicación u horarios?'},
 inmobiliaria:{citas:'¿Quieres solicitar una visita a un inmueble?',ventas:'Cuéntame qué tipo de vivienda buscas y te explicaré cómo consultar opciones.',consultas:'Puedo ayudarte con información sobre visitas y consultas comerciales.'},
 comercio:{citas:'Puedo registrar una solicitud para hablar con nuestro equipo.',ventas:'¿Qué tipo de producto buscas? Te ayudaré a explorar las opciones disponibles.',consultas:'¿Quieres consultar productos, horarios o seguimiento de pedidos?'},
};
const sectorLabels:Record<string,string>={belleza:'Peluquería o estética',clinica:'Clínica',inmobiliaria:'Inmobiliaria',comercio:'Comercio o servicios'};
export default function KowiVision(){
 const [sector,setSector]=useState('belleza');
 const [goal,setGoal]=useState('citas');
 const [tone,setTone]=useState('cercano');
 const [business,setBusiness]=useState('');
 const [consent,setConsent]=useState(false);
 const [info,setInfo]=useState('');
 const text=(tone==='premium'?'Será un placer atenderte. ':tone==='profesional'?'Gracias por contactar. ':'¡Hola! ')+(business.trim()?'Soy el asistente virtual de '+business.trim()+'. ':'')+examples[sector][goal];
 const request=()=>{const body=['Solicito asesoría para una demostración personalizada KOWI Vision.','Negocio: '+(business||'Sin indicar'),'Sector: '+sectorLabels[sector],'Objetivo: '+goal,'Tono: '+tone,'Información aportada: '+(info||'Ninguna'),'Confirmo que autorizo utilizar estos datos voluntariamente facilitados para preparar la demostración.','Solicito revisión de funciones, costes, privacidad y disponibilidad.'].join('\n');window.location.href='mailto:info@kowi.one?subject='+encodeURIComponent('KOWI Vision - demo personalizada')+'&body='+encodeURIComponent(body)};
 return <section id="vision" className="mx-auto max-w-6xl px-5 py-14"><div className="grid gap-6 rounded-3xl border border-[#d6e6e0] bg-white p-5 md:grid-cols-2 md:p-8">
  <div><p className="text-xs font-bold uppercase tracking-widest text-[#087e75]">KOWI Vision · Demo personalizada</p><h2 className="mt-3 text-3xl font-semibold">Tu negocio, tu agente, tu estilo.</h2><p className="mt-3 text-sm text-[#536a63]">Configura una demostración de ejemplo sin necesidad de programar. Solo usaremos los datos que introduzcas en esta pantalla; no consultamos perfiles personales externos.</p>
   <div className="mt-5 space-y-4">
    <label className="block text-sm font-semibold">Nombre del negocio (opcional)<input maxLength={80} value={business} onChange={e=>setBusiness(e.target.value)} placeholder="Ej. Estudio Belleza" className="mt-2 w-full rounded-xl border border-[#b9d4cb] p-3 font-normal"/></label>
    <label className="block text-sm font-semibold">Sector<select value={sector} onChange={e=>setSector(e.target.value)} className="mt-2 w-full rounded-xl border border-[#b9d4cb] p-3 font-normal">{Object.entries(sectorLabels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
    <label className="block text-sm font-semibold">Objetivo<select value={goal} onChange={e=>setGoal(e.target.value)} className="mt-2 w-full rounded-xl border border-[#b9d4cb] p-3 font-normal"><option value="citas">Solicitudes de citas</option><option value="ventas">Ventas y oportunidades</option><option value="consultas">Atención al cliente</option></select></label>
    <label className="block text-sm font-semibold">Estilo de comunicación<select value={tone} onChange={e=>setTone(e.target.value)} className="mt-2 w-full rounded-xl border border-[#b9d4cb] p-3 font-normal"><option value="cercano">Cercano y amable</option><option value="profesional">Profesional y directo</option><option value="premium">Elegante y exclusivo</option></select></label>
    <label className="block text-sm font-semibold">Información pública autorizada (opcional)<textarea rows={3} maxLength={500} value={info} onChange={e=>setInfo(e.target.value)} placeholder="Ej. Servicios y horarios públicos. No incluyas datos personales de terceros ni información médica." className="mt-2 w-full rounded-xl border border-[#b9d4cb] p-3 font-normal"/></label>
   </div>
  </div>
  <div className="flex flex-col justify-between gap-5"><div className="rounded-2xl bg-[#f0f6f3] p-5"><p className="text-sm font-semibold">Vista previa · Mensaje del agente</p><div className="mt-4 rounded-2xl bg-white p-4 text-sm leading-relaxed shadow-sm">{text}</div><p className="mt-4 text-xs text-[#536a63]">Simulación local con textos predefinidos. No se envía ningún mensaje, no se consulta una agenda y no se activa un agente real.</p></div>
  <div><label className="flex items-start gap-3 text-xs leading-relaxed text-[#536a63]"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} className="mt-1 accent-[#087e75]"/>Autorizo enviar la información que he introducido para recibir una propuesta de demostración. No incluyo datos sensibles ni de terceros.</label><button type="button" disabled={!consent} onClick={request} className="mt-4 w-full rounded-full bg-[#087e75] px-5 py-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">Solicitar demo personalizada con un asesor</button><p className="mt-3 text-xs text-[#536a63]">La solicitud abre tu aplicación de correo con un borrador. Solo se envía si confirmas el envío. Consulta las condiciones de privacidad antes de compartir información adicional.</p></div></div>
 </div></section>
}