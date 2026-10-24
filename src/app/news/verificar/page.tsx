'use client';
import Link from 'next/link';
import {useMemo,useState} from 'react';
import {assessEvidence,type EvidenceKind} from '@/lib/news-verifier';

type Entry={url:string;excerpt:string;kind:EvidenceKind;originalLocated:boolean;derivedFrom:string};
const initial=():Entry=>({url:'',excerpt:'',kind:'independent_report',originalLocated:false,derivedFrom:''});
const kinds:{value:EvidenceKind;label:string}[]=[
 {value:'primary',label:'Fuente primaria (documento o comunicado)'},
 {value:'independent_report',label:'Investigación de un medio'},
 {value:'eyewitness',label:'Testimonio presencial'},
 {value:'fact_check',label:'Verificación de hechos'}
];
const field='mt-2 w-full rounded-xl border border-white/20 bg-black/30 p-3 text-white placeholder:text-[#9ca9b8]';

export default function VerifyNewsPage(){
 const [claim,setClaim]=useState('');
 const [claimDate,setClaimDate]=useState('');
 const [sources,setSources]=useState<Entry[]>([initial(),initial()]);
 const [show,setShow]=useState(false);
 const report=useMemo(()=>assessEvidence({claim,claimDate,sources}),[claim,claimDate,sources]);
 function edit(i:number,patch:Partial<Entry>){setSources(sources.map((s,j)=>i===j?{...s,...patch}:s));setShow(false);}
 return <main className="kowi-cosmos min-h-screen px-5 py-9 text-[#f4f3f2] md:px-10"><div className="mx-auto max-w-4xl space-y-8">
  <Link href="/news" className="underline">← Volver a noticias</Link>
  <header className="space-y-3"><p className="kowi-eyebrow">HOLA SOY TU IA · KOWI.ONE</p><h1 className="text-4xl font-semibold">KOWI Verifica</h1>
   <p className="text-[#bdc4cf]">Prechequeo de trazabilidad. Un enlace auténtico no demuestra la veracidad de una noticia. Esta herramienta no lee ni autentica páginas externas, no declara hechos verificados y no publica contenido.</p></header>
  <section className="cosmos-panel space-y-4 rounded-2xl p-5">
   <label className="block font-semibold">¿Qué afirmación exacta quieres verificar?<textarea className={field} rows={3} maxLength={1000} value={claim} onChange={e=>{setClaim(e.target.value);setShow(false);}} placeholder="Un hecho concreto: quién, qué y cuándo."/></label>
   <label className="block">Fecha del hecho, si se conoce<input type="date" className={field} value={claimDate} onChange={e=>{setClaimDate(e.target.value);setShow(false);}}/></label>
  </section>
  <section className="space-y-4"><h2 className="text-2xl font-semibold">Evidencias</h2>{sources.map((s,i)=><div key={i} className="cosmos-panel space-y-4 rounded-2xl p-5">
   <h3 className="text-xl">Fuente {i+1}</h3>
   <label className="block">Enlace HTTPS directo<input type="url" className={field} value={s.url} onChange={e=>edit(i,{url:e.target.value})} placeholder="https://sitio-del-medio.com/noticia-original"/></label>
   <label className="block">Tipo de fuente<select className={field} value={s.kind} onChange={e=>edit(i,{kind:e.target.value as EvidenceKind})}>{kinds.map(k=><option key={k.value} value={k.value}>{k.label}</option>)}</select></label>
   <label className="block">Prueba o fragmento que respalda exactamente el hecho<textarea className={field} rows={2} maxLength={2000} value={s.excerpt} onChange={e=>edit(i,{excerpt:e.target.value})}/></label>
   <label className="flex items-start gap-3"><input type="checkbox" className="mt-1" checked={s.originalLocated} onChange={e=>edit(i,{originalLocated:e.target.checked})}/><span>He localizado la publicación, documento o material original, no solo una captura o resumen.</span></label>
   <label className="block text-sm">Si es una republicación, ¿de qué medio proviene?<input className={field} value={s.derivedFrom} onChange={e=>edit(i,{derivedFrom:e.target.value})} placeholder="reuters.com, etc."/></label>
  </div>)}</section>
  <div className="flex flex-wrap gap-3"><button type="button" className="kowi-gold-btn rounded-full px-6 py-3 font-semibold" onClick={()=>setShow(true)}>Comprobar requisitos</button>
   {sources.length<5&&<button type="button" className="rounded-full border border-white/30 px-6 py-3" onClick={()=>{setSources([...sources,initial()]);setShow(false);}}>Añadir fuente</button>}</div>
  {show&&<section role="status" aria-live="polite" className="cosmos-panel space-y-4 rounded-2xl p-6">
   <h2 className="text-2xl">{report.readiness==='blocked'?'Bloqueado: evidencia insuficiente':'Pendiente de verificación humana'}</h2>
   <p>{report.validSourceCount} evidencias con datos mínimos · {report.independentSourceCount} orígenes declarados distintos.</p>
   {report.reasons.length?<ul className="list-disc space-y-2 pl-6">{report.reasons.map(r=><li key={r}>{r}</li>)}</ul>:<p>Requisitos declarados suficientes para investigar. Una persona debe abrir las fuentes originales, comprobar lo que dicen, buscar contradicciones y autorizar la versión exacta antes de publicarla.</p>}
   <p className="font-semibold">Publicación autorizada: NO.</p>
  </section>}
  <section className="cosmos-panel space-y-3 rounded-2xl p-6"><h2 className="text-2xl">Faltan verificaciones humanas</h2>
   <p className="text-[#bdc4cf]">Confirmar autoría, fechas, fuentes independientes y correcciones. Para testimonios: identidad, contexto, grabación original, consentimiento y lugar. Para imágenes o vídeos: primera publicación, búsqueda inversa y posibles alteraciones. Los metadatos C2PA ayudan a rastrear el origen, pero no garantizan la verdad de lo representado.</p></section>
  <footer className="border-t border-white/15 pt-6 text-sm text-[#bdc4cf]">«Hola Soy Tu IA» · kowi.one · Revisión humana obligatoria</footer>
 </div></main>;
}
