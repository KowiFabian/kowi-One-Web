'use client';

import { useMemo, useState } from 'react';

const plans = [
  { id:'start',name:'Start',monthly:39,setup:149,agents:1,conversations:300,users:1,flows:1,channels:'Web' },
  { id:'business',name:'Business',monthly:89,setup:299,agents:2,conversations:1000,users:3,flows:3,channels:'Web + email' },
  { id:'pro',name:'Pro',monthly:179,setup:599,agents:4,conversations:3000,users:10,flows:8,channels:'Web + email' },
] as const;
const specialties = [
  {id:'comercial',name:'IA Comercial',uses:'Captación, cualificación y seguimiento',channels:'Web y email; WhatsApp tras validación',integrations:'CRM, formularios, correo',limits:'Envíos externos y ofertas bajo aprobación',state:'Piloto/configuración'},
  {id:'clientes',name:'IA Asesor al Cliente',uses:'FAQ, incidencias y solicitudes',channels:'Web; WhatsApp tras validación',integrations:'Base de conocimiento, CRM',limits:'Escalado humano; no prometer citas confirmadas',state:'Piloto web'},
  {id:'operativo',name:'IA Operativa',uses:'Pedidos, tareas y alertas',channels:'Panel web y email',integrations:'Hojas, CRM y ERP a medida',limits:'Sin modificaciones ERP sin autorización',state:'Proyecto a medida'},
  {id:'administrativo',name:'IA Administrativa',uses:'Agenda, documentos y tareas',channels:'Panel web y email',integrations:'Calendario y repositorio documental',limits:'Cambios y documentos sensibles bajo aprobación',state:'Proyecto a medida'},
  {id:'financiero',name:'IA Financiera',uses:'Presupuestos, análisis y previsiones',channels:'Panel web e informes',integrations:'Hojas contables y ERP a medida',limits:'Sin pagos, transferencias ni decisiones crediticias',state:'Proyecto a medida'},
  {id:'marketing',name:'IA Marketing',uses:'Contenidos, campañas y métricas',channels:'Web, email y redes autorizadas',integrations:'Analítica y herramientas publicitarias',limits:'Publicación y campañas requieren aprobación',state:'Proyecto a medida'},
  {id:'reservas',name:'IA Reservas',uses:'Solicitudes, calendario y recordatorios',channels:'Web; WhatsApp opcional tras validación',integrations:'Google Calendar o Microsoft 365 por proyecto',limits:'No confirma disponibilidad sin conexión probada',state:'En desarrollo'},
  {id:'compras',name:'IA Compras',uses:'Comparativas y solicitudes',channels:'Panel y email',integrations:'Hojas y proveedores',limits:'Sin compras autónomas',state:'En diseño'},
  {id:'calidad',name:'IA Calidad',uses:'Checklists, incidencias y mejora',channels:'Panel y email',integrations:'Hojas y sistemas de calidad',limits:'No sustituye certificaciones ni responsables',state:'En diseño'},
  {id:'proyectos',name:'IA Proyectos',uses:'Planificación y seguimiento',channels:'Panel y email',integrations:'Calendario y gestores de tareas',limits:'Cambios de alcance bajo aprobación',state:'En diseño'},
  {id:'seguridad',name:'IA Seguridad',uses:'Señales de riesgo y auditoría',channels:'Panel e informes',integrations:'Registros y sistemas autorizados',limits:'Sin veredictos de fraude ni bloqueos automáticos',state:'En diseño'},
] as const;
const extras=[
  {id:'more',name:'Agente adicional',monthly:25,setup:79,desc:'Una especialidad adicional configurada'},
  {id:'volume',name:'+500 conversaciones IA/mes',monthly:15,setup:0,desc:'Bolsa mensual adicional, no acumulable'},
  {id:'calendar',name:'Calendario conectado',monthly:19,setup:99,desc:'Una agenda; sujeto a prueba técnica'},
  {id:'whatsapp',name:'WhatsApp Business',monthly:29,setup:149,desc:'Integración condicionada a validación Meta; cargos de mensajería aparte'},
  {id:'support',name:'Asesoría prioritaria',monthly:49,setup:0,desc:'Hasta 2 horas de soporte al mes'},
] as const;
const eur=(n:number)=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
export default function AgentConfigurator(){
 const [planId,setPlanId]=useState<'start'|'business'|'pro'>('business');
 const [selected,setSelected]=useState<string[]>(['clientes']);
 const [addons,setAddons]=useState<string[]>([]);
 const [assisted,setAssisted]=useState(true);
 const [sector,setSector]=useState('');
 const [volume,setVolume]=useState('hasta 1000');
 const plan=plans.find(p=>p.id===planId)!;
 const neededExtra=Math.max(0,selected.length-plan.agents);
 const chosen=extras.filter(x=>addons.includes(x.id)&&x.id!=='more');
 const recurring=plan.monthly+neededExtra*25+chosen.reduce((s,x)=>s+x.monthly,0);
 const initial=(assisted?plan.setup:0)+neededExtra*79+chosen.reduce((s,x)=>s+x.setup,0);
 const effectiveCap=plan.conversations+(addons.includes('volume')?500:0);
 const send=()=>{
  const names=specialties.filter(x=>selected.includes(x.id)).map(x=>x.name).join(', ')||'Por definir';
  const note=['Hola, quiero una propuesta de KOWI AI.','Plan: '+plan.name,'Especialidades: '+names,'Complementos: '+(chosen.map(x=>x.name).join(', ')||'Ninguno'),'Modalidad: '+(assisted?'Asesoría e implantación':'Autoconfiguración sujeta a validación'),'Sector: '+(sector||'Sin indicar'),'Volumen estimado: '+volume,'Estimación mensual: '+eur(recurring)+' + IVA','Implantación estimada: '+eur(initial)+' + IVA','Solicito confirmación de disponibilidad, alcance, costes de terceros y presupuesto definitivo.'].join('\n');
  window.location.href='mailto:info@kowi.one?subject='+encodeURIComponent('Configuración de agente KOWI AI')+'&body='+encodeURIComponent(note);
 };
 const toggle=(id:string,arr:string[],setter:(v:string[])=>void)=>setter(arr.includes(id)?arr.filter(x=>x!==id):[...arr,id]);
 const projection=useMemo(()=>[1,5,10,20,50].map(n=>({n,revenue:n*recurring})),[recurring]);
 return <section id="configurar" className="mx-auto max-w-6xl px-5 py-16 text-[#142a27]">
  <p className="text-xs font-bold uppercase tracking-widest text-[#087e75]">Configura tu solución</p>
  <h2 className="mt-3 text-3xl font-semibold">Construye tu equipo de agentes IA</h2>
  <p className="mt-3 max-w-3xl text-sm text-[#536a63]">Selecciona especialidades, consumos y complementos. La configuración genera una solicitud de presupuesto, no activa servicios ni realiza cobros.</p>
  <div className="mt-8 grid gap-7 lg:grid-cols-[1.5fr_1fr]">
   <div className="space-y-8">
    <fieldset><legend className="text-lg font-semibold">1. Elige un plan</legend><div className="mt-3 grid gap-3 sm:grid-cols-3">{plans.map(p=><label key={p.id} className={'cursor-pointer rounded-2xl border p-4 '+(planId===p.id?'border-[#087e75] bg-[#e6f5ef]':'border-[#d6e6e0] bg-white')}><input type="radio" name="plan" checked={planId===p.id} onChange={()=>setPlanId(p.id)} className="mr-2 accent-[#087e75]"/><strong>{p.name}</strong><p className="mt-2 text-2xl font-bold">{eur(p.monthly)}<span className="text-xs font-normal">/mes</span></p><p className="mt-2 text-xs">{p.agents} agentes · {p.conversations.toLocaleString('es-ES')} conversaciones · {p.users} usuarios · {p.flows} flujos</p><p className="mt-2 text-xs">Canales: {p.channels}</p></label>)}</div></fieldset>
    <fieldset><legend className="text-lg font-semibold">2. Selecciona especialidades</legend><p className="mt-1 text-xs text-[#536a63]">Puedes combinar especialidades. Las adicionales al plan se presupuestan como complemento.</p><div className="mt-3 grid gap-3 sm:grid-cols-2">{specialties.map(a=><label key={a.id} className={'cursor-pointer rounded-xl border p-4 '+(selected.includes(a.id)?'border-[#087e75] bg-[#e6f5ef]':'border-[#d6e6e0] bg-white')}><span className="flex gap-2"><input type="checkbox" checked={selected.includes(a.id)} onChange={()=>toggle(a.id,selected,setSelected)} className="accent-[#087e75]"/><strong className="text-sm">{a.name}</strong></span><p className="mt-2 text-xs text-[#536a63]">{a.uses}</p><details className="mt-3 text-xs"><summary className="cursor-pointer font-semibold text-[#087e75]">Ficha de capacidades y límites</summary><p className="mt-2"><strong>Canales:</strong> {a.channels}</p><p className="mt-1"><strong>Integraciones:</strong> {a.integrations}</p><p className="mt-1"><strong>Límites:</strong> {a.limits}</p><p className="mt-1"><strong>Disponibilidad:</strong> {a.state}</p></details></label>)}</div></fieldset>
    <fieldset><legend className="text-lg font-semibold">3. Añade capacidades opcionales</legend><div className="mt-3 grid gap-3 sm:grid-cols-2">{extras.filter(x=>x.id!=='more').map(x=><label key={x.id} className="cursor-pointer rounded-xl border border-[#d6e6e0] bg-white p-4"><span className="flex gap-2"><input type="checkbox" checked={addons.includes(x.id)} onChange={()=>toggle(x.id,addons,setAddons)} className="accent-[#087e75]"/><strong className="text-sm">{x.name}</strong></span><p className="mt-2 text-xs text-[#536a63]">{x.desc}</p><p className="mt-2 text-sm font-semibold">+{eur(x.monthly)}/mes · alta {eur(x.setup)}</p></label>)}</div></fieldset>
    <fieldset><legend className="text-lg font-semibold">4. Cómo quieres empezar</legend><div className="mt-3 flex flex-wrap gap-4"><label className="text-sm"><input type="radio" checked={!assisted} onChange={()=>setAssisted(false)} className="mr-2 accent-[#087e75]"/>Quiero configurarlo yo</label><label className="text-sm"><input type="radio" checked={assisted} onChange={()=>setAssisted(true)} className="mr-2 accent-[#087e75]"/>Necesito un asesor KOWI</label></div><p className="mt-2 text-xs text-[#536a63]">La autoconfiguración completa y la activación aún no están habilitadas. Un asesor debe verificar la solicitud antes de contratar.</p></fieldset>
    <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-semibold">Sector o actividad<input value={sector} onChange={e=>setSector(e.target.value.slice(0,100))} placeholder="Ej. peluquería" className="mt-2 w-full rounded-xl border border-[#b9d4cb] bg-white p-3 font-normal"/></label><label className="text-sm font-semibold">Conversaciones estimadas al mes<select value={volume} onChange={e=>setVolume(e.target.value)} className="mt-2 w-full rounded-xl border border-[#b9d4cb] bg-white p-3 font-normal"><option value="hasta 300">Hasta 300</option><option value="hasta 1000">Hasta 1.000</option><option value="hasta 3000">Hasta 3.000</option><option value="más de 3000">Más de 3.000</option></select></label></div>
   </div>
   <aside className="self-start rounded-3xl border border-[#b9d4cb] bg-white p-6 lg:sticky lg:top-5"><h3 className="text-xl font-semibold">Tu presupuesto estimado</h3><p className="mt-4 text-xs uppercase tracking-widest text-[#536a63]">Cuota mensual</p><p className="mt-1 text-4xl font-bold text-[#087e75]">{eur(recurring)}<span className="text-sm font-normal">/mes</span></p><p className="mt-4 text-xs uppercase tracking-widest text-[#536a63]">Implantación estimada, pago único</p><p className="mt-1 text-2xl font-semibold">{eur(initial)}</p><div className="mt-5 space-y-2 border-t border-[#d6e6e0] pt-4 text-sm"><p>Plan: <strong>{plan.name}</strong></p><p>Agentes elegidos: <strong>{selected.length}</strong></p><p>Incluidos: <strong>{plan.agents}</strong></p><p>Adicionales: <strong>{neededExtra}</strong></p><p>Conversaciones incluidas: <strong>{effectiveCap.toLocaleString('es-ES')}</strong></p></div>
   {selected.length===0&&<p className="mt-4 text-sm text-[#9b4a32]">Selecciona al menos un agente.</p>}
   {volume==='más de 3000'&&<p className="mt-4 text-sm text-[#9b4a32]">Tu volumen requiere presupuesto personalizado; el importe mostrado no incluye ese exceso.</p>}
   <button type="button" onClick={send} disabled={selected.length===0} className="mt-6 w-full rounded-full bg-[#087e75] px-5 py-4 font-semibold text-white disabled:opacity-50">Solicitar propuesta a KOWI</button>
   <p className="mt-4 text-xs leading-relaxed text-[#536a63]">Importes orientativos sin IVA, uso excesivo, consumo Meta, SMS, llamadas, proveedores ni integraciones especiales. Una conversación incluida se limita provisionalmente a 20 mensajes y un presupuesto de IA definido en contrato. Sin compromiso de disponibilidad ni precio definitivo hasta validación.</p>
   <details className="mt-5 border-t border-[#d6e6e0] pt-4"><summary className="cursor-pointer text-sm font-semibold">Tabla de crecimiento de ingresos del proveedor</summary><table className="mt-3 w-full text-sm"><thead><tr><th className="py-2 text-left">Clientes</th><th className="text-right">Mensualidad total</th></tr></thead><tbody>{projection.map(p=><tr key={p.n}><td className="py-1">{p.n}</td><td className="text-right">{eur(p.revenue)}</td></tr>)}</tbody></table><p className="mt-2 text-xs text-[#536a63]">Simulación de ingresos brutos recurrentes de KOWI, no beneficios ni garantía de ventas.</p></details>
   </aside>
  </div>
 </section>;
}
