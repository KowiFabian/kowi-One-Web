'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';

type AgentKey='finance'|'marketing'|'crm'|'operations'|'insights';
const agents:{id:AgentKey;name:string;mission:string;status:string}[]=[
 {id:'finance',name:'Financial Analyst Agent IA PRO',mission:'Márgenes, caja, costes, desviaciones y escenarios.',status:'Análisis y reporting'},
 {id:'marketing',name:'Marketing Agent IA PRO',mission:'Adquisición, conversión, campañas y oportunidades de crecimiento.',status:'Análisis y propuestas'},
 {id:'crm',name:'CRM Agent',mission:'Pipeline, leads, citas, seguimiento y calidad comercial.',status:'CRM operativo'},
 {id:'operations',name:'Operations Agent',mission:'Incidencias, procesos, cuellos de botella y mejora continua.',status:'Análisis operativo'},
 {id:'insights',name:'Performance & Insights Agent',mission:'Consolida señales de todos los agentes y prioriza mejoras.',status:'Centro de inteligencia'},
];

const demo={
 revenue:12840, costs:7160, cash:18400, leads:96, won:24, appointments:58, noShows:5,
 campaigns:3, marketingSpend:920, qualified:41, responseMinutes:4.8,
};

function euro(n:number){return new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n)}

export default function ProIntelligenceCenter(){
 const [active,setActive]=useState<AgentKey>('insights');
 const [runs,setRuns]=useState(0);
 const [lastRun,setLastRun]=useState<string|null>(null);
 const margin=(demo.revenue-demo.costs)/demo.revenue*100;
 const conversion=demo.won/demo.leads*100;
 const showRate=(demo.appointments-demo.noShows)/demo.appointments*100;
 const cpl=demo.marketingSpend/demo.leads;
 const report=useMemo(()=>({
  finance:[
   `Margen operativo demo: ${margin.toFixed(1)}% (${euro(demo.revenue-demo.costs)}).`,
   `Caja disponible demo: ${euro(demo.cash)}.`,
   'Mejora sugerida: separar costes variables por canal y servicio para detectar rentabilidad real.',
  ],
  marketing:[
   `Coste por lead demo: ${euro(cpl)}.`,
   `Conversión lead→ganado: ${conversion.toFixed(1)}%.`,
   'Mejora sugerida: medir campaña→lead→cita→venta con una única fuente de atribución.',
  ],
  crm:[
   `${demo.leads} leads · ${demo.qualified} cualificados · ${demo.won} ganados.`,
   `${demo.appointments} citas; asistencia estimada ${showRate.toFixed(1)}%.`,
   'Problema detectado: priorizar oportunidades sin siguiente acción y seguimientos vencidos.',
  ],
  operations:[
   `Tiempo medio de primera respuesta demo: ${demo.responseMinutes.toFixed(1)} min.`,
   'Riesgo operativo: canales externos aún dependen de credenciales y verificación por negocio.',
   'Mejora sugerida: SLA por canal + alerta automática cuando una solicitud quede sin responsable.',
  ],
  insights:[
   `Ingresos demo ${euro(demo.revenue)} · margen ${margin.toFixed(1)}% · conversión ${conversion.toFixed(1)}%.`,
   'Prioridad 1: cerrar el circuito CRM → cita → venta → ingreso para medir ROI por cliente.',
   'Prioridad 2: conectar datos reales antes de usar estas métricas para decisiones financieras.',
  ],
 }),[margin,conversion,showRate,cpl]);
 const selected=agents.find(a=>a.id===active)!;
 function run(){
   setRuns(v=>v+1);
   setLastRun(new Date().toLocaleString('es-ES'));
 }
 return <main className="kowi-cosmos min-h-screen text-[#f4f3f2]">
  <header className="border-b border-white/10 bg-[#050913]/90 px-6 py-5 backdrop-blur">
   <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
    <Link href="/pro" className="text-[#e8b37b]">← KOWI PRO</Link>
    <div className="flex gap-2"><Link href="/pro/intelligence/jucar-living" className="rounded-full border border-white/20 px-4 py-2 text-sm">Júcar Living</Link><Link href="/business/agent" className="rounded-full border border-white/20 px-4 py-2 text-sm">CRM real</Link><Link href="/business/demo" className="kowi-gold-btn rounded-full px-4 py-2 text-sm font-semibold">Demo Business</Link></div>
   </div>
  </header>
  <div className="mx-auto max-w-7xl px-6 py-10">
   <p className="kowi-eyebrow">KOWI PRO · INTELLIGENCE CENTER</p>
   <div className="mt-3 flex flex-wrap items-end justify-between gap-6"><div><h1 className="max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">Agentes que observan, analizan y reportan.</h1><p className="mt-5 max-w-3xl text-[#b9bfca]">Centro de control para CRM, finanzas, marketing y operaciones. Las cifras visibles en esta pantalla son un dataset de demostración claramente aislado de datos reales.</p></div><button onClick={run} className="kowi-gold-btn rounded-full px-6 py-3 font-semibold">Ejecutar análisis demo ↗</button></div>
   <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
    {[
      ['Ingresos',euro(demo.revenue),'+8,4% demo'],['Margen',margin.toFixed(1)+'%','objetivo ≥ 40%'],['Leads',String(demo.leads),`${demo.qualified} cualificados`],['Conversión',conversion.toFixed(1)+'%',`${demo.won} ganados`],['Citas',String(demo.appointments),`${showRate.toFixed(1)}% asistencia`],
    ].map(([a,b,c])=><article key={a} className="cosmos-tile rounded-2xl p-5"><p className="text-xs uppercase tracking-wider text-[#e8b37b]">{a}</p><p className="mt-2 text-3xl font-semibold">{b}</p><p className="mt-2 text-xs text-[#aeb8c6]">{c}</p></article>)}
   </div>
   <div className="mt-8 grid gap-6 lg:grid-cols-[.72fr_1.28fr]">
    <section className="cosmos-panel rounded-[2rem] p-5"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Equipo de agentes</h2><span className="text-xs text-[#e8b37b]">5 activos en demo</span></div><div className="mt-5 space-y-2">{agents.map(a=><button key={a.id} onClick={()=>setActive(a.id)} className={`w-full rounded-2xl border p-4 text-left transition ${active===a.id?'border-[#e8b37b] bg-[#e8b37b]/10':'border-white/10 bg-white/[.02]'}`}><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{a.name}</h3><p className="mt-1 text-xs leading-relaxed text-[#aeb8c6]">{a.mission}</p></div><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-300"/></div></button>)}</div></section>
    <section className="cosmos-panel rounded-[2rem] p-6">
     <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="kowi-eyebrow">REPORTE DEL AGENTE</p><h2 className="mt-2 text-2xl font-semibold">{selected.name}</h2><p className="mt-2 text-sm text-[#aeb8c6]">{selected.status}</p></div><span className="rounded-full border border-emerald-300/20 bg-emerald-300/5 px-3 py-1 text-xs text-emerald-200">● Disponible</span></div>
     <div className="mt-6 space-y-3">{report[active].map((line,i)=><div key={line} className="rounded-2xl border border-white/10 bg-white/[.03] p-4"><div className="flex gap-3"><span className="text-[#e8b37b]">0{i+1}</span><p className="text-sm leading-relaxed">{line}</p></div></div>)}</div>
     <div className="mt-6 rounded-2xl border border-amber-200/15 bg-amber-100/5 p-4"><p className="text-xs font-bold uppercase tracking-wider text-amber-100">Human Approval</p><p className="mt-2 text-sm text-[#d5d2c9]">Estos agentes pueden analizar y preparar reportes automáticamente. Pagos, publicaciones, mensajes externos, cambios de permisos y compromisos financieros permanecen bloqueados hasta autorización explícita.</p></div>
     <div className="mt-5 flex flex-wrap gap-3 text-xs text-[#aeb8c6]"><span>Ejecuciones demo: {runs}</span><span>·</span><span>{lastRun?`Último análisis: ${lastRun}`:'Ejecuta el análisis para registrar esta sesión.'}</span></div>
    </section>
   </div>
   <section className="mt-6 grid gap-4 md:grid-cols-3">
    <article className="rounded-2xl border border-rose-300/15 bg-rose-200/5 p-5"><p className="text-xs font-bold uppercase tracking-wider text-rose-200">Problemas</p><p className="mt-3 text-sm">Integraciones externas no verificadas no deben considerarse operativas. Sin datos contables conectados, el informe financiero es demostrativo.</p></article>
    <article className="rounded-2xl border border-amber-200/15 bg-amber-100/5 p-5"><p className="text-xs font-bold uppercase tracking-wider text-amber-100">Mejoras</p><p className="mt-3 text-sm">Unificar eventos de CRM, agenda, marketing y facturación para medir el embudo completo y coste por resultado.</p></article>
    <article className="rounded-2xl border border-emerald-300/15 bg-emerald-300/5 p-5"><p className="text-xs font-bold uppercase tracking-wider text-emerald-200">Siguiente evidencia</p><p className="mt-3 text-sm">Conectar fuentes reales con permisos de solo lectura y comparar este panel con resultados del CRM operativo.</p></article>
   </section>
  </div>
 </main>;
}
