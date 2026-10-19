'use client';
import Link from 'next/link';import {useMemo,useState} from 'react';import {skillNames,type SkillLevel} from '@/lib/school/curriculum';
const qs=[
 ['digital','Cuando una app pide acceso a todos tus contactos para una función que no los necesita, ¿qué harías?'],
 ['ai','Explica una situación donde NO confiarías en una respuesta de IA sin verificarla.'],
 ['prompt','Mejora este encargo: “hazme un plan”. Incluye objetivo, contexto y criterio de calidad.'],
 ['agent','Un agente puede enviar correos y modificar un CRM. ¿Qué acción exigiría aprobación humana y por qué?'],
 ['data','Tienes clientes y citas. ¿Qué campo usarías para relacionarlos sin repetir todos los datos del cliente?'],
] as const;
export default function Diagnostic(){
 const [answers,setAnswers]=useState<Record<string,string>>({});const [submitted,setSubmitted]=useState(false);
 const graph=useMemo(()=>skillNames.map((name,i)=>{const answer=Object.values(answers)[i%qs.length]||'';const words=answer.trim().split(/\s+/).filter(Boolean).length;const level:SkillLevel=words>=18?'COMPETENT':words>=8?'OPERATIONAL':words>=3?'FOUNDATIONAL':'NOT STARTED';return{name,level};}),[answers]);
 function finish(){setSubmitted(true);try{localStorage.setItem('kowi-school-skill-graph',JSON.stringify(graph));}catch{}}
 return <main className="min-h-screen bg-[#fbfbf8] px-5 py-8 text-[#17211c]"><div className="mx-auto max-w-3xl"><Link href="/school" className="text-sm">← KOWI School</Link><p className="mt-12 text-xs font-semibold uppercase tracking-[.2em] text-[#4f765f]">KOWI LEARNING DIAGNOSTIC</p><h1 className="mt-3 text-4xl font-semibold">Demuestra cómo piensas.</h1><p className="mt-4 text-[#5d6962]">Este diagnóstico inicial usa explicaciones y microescenarios. No concede VERIFIED automáticamente: ese nivel exige evidencia suficiente y verificación.</p>
 {!submitted?<><div className="mt-8 space-y-5">{qs.map(([id,q],i)=><label key={id} className="block rounded-2xl border border-[#e0e3df] bg-white p-5"><span className="text-sm font-semibold">Microproblema {i+1}</span><span className="mt-2 block text-lg">{q}</span><textarea value={answers[id]||''} onChange={e=>setAnswers(a=>({...a,[id]:e.target.value}))} rows={4} className="mt-4 w-full rounded-xl border border-[#d8ddd9] p-3 outline-none focus:border-[#4f765f]" placeholder="Explica tu decisión y por qué…"/></label>)}</div><button onClick={finish} className="mt-7 rounded-full bg-[#173e2d] px-6 py-3 font-semibold text-white">Generar Skill Graph</button></>:<><div className="mt-8 grid gap-3 sm:grid-cols-2">{graph.map(s=><div key={s.name} className="rounded-2xl border border-[#e0e3df] bg-white p-4"><p className="font-semibold">{s.name}</p><p className="mt-2 text-sm text-[#315d45]">{s.level}</p></div>)}</div><p className="mt-5 rounded-xl bg-[#fff8df] p-4 text-sm">Resultado provisional. La longitud de una respuesta solo permite orientar el punto de partida; no verifica dominio. Las evaluaciones prácticas posteriores pueden subir o bajar el nivel.</p><Link href="/school" className="mt-6 inline-block rounded-full bg-[#173e2d] px-6 py-3 font-semibold text-white">Construir mi ruta →</Link></>}
 </div></main>
}