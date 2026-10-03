'use client';
import Link from 'next/link';
import {useMemo,useState} from 'react';
import {pathFor,schoolLevels} from '@/lib/school/curriculum';
import SchoolTutor from '@/components/school/SchoolTutor';

const examples=['Quiero aprender IA desde cero.','Quiero crear un agente para mi empresa.','Quiero conseguir trabajo en operaciones con IA.','Quiero aprender programación.','Quiero transformar mi negocio con IA.'];
export default function SchoolHome(){
 const [goal,setGoal]=useState(''); const [active,setActive]=useState('');
 const route=useMemo(()=>active?pathFor(active):[],[active]);
 function build(){const g=goal.trim();if(!g)return;setActive(g);try{localStorage.setItem('kowi-school-goal',g);localStorage.setItem('kowi-school-path',JSON.stringify(pathFor(g)));}catch{}}
 return <main className="min-h-screen bg-[#fbfbf8] text-[#17211c]">
  <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5"><Link href="/" className="font-semibold tracking-[.16em]">KOWI</Link><div className="flex gap-4 text-sm"><Link href="/school/dashboard">Mi aprendizaje</Link><Link href="/school/lab">Lab</Link><Link href="/school/passport">Skills Passport</Link><Link href="/school/portfolio">Portfolio</Link></div></nav>
  <section className="mx-auto max-w-4xl px-5 pb-16 pt-12 text-center">
   <p className="text-xs font-semibold uppercase tracking-[.22em] text-[#4f765f]">KOWI SCHOOL AI</p>
   <h1 className="mt-5 text-4xl font-semibold tracking-[-.04em] sm:text-6xl">¿Qué quieres aprender o conseguir?</h1>
   <p className="mx-auto mt-5 max-w-2xl text-lg text-[#56635c]">Learn freely. Build for real. Prove what you can do.</p>
   <div className="mx-auto mt-9 max-w-2xl rounded-3xl border border-[#d9ddd7] bg-white p-3 text-left shadow-sm">
    <label htmlFor="school-goal" className="sr-only">Objetivo de aprendizaje</label><textarea id="school-goal" rows={3} value={goal} onChange={e=>setGoal(e.target.value)} placeholder="Escribe tu objetivo…" className="w-full resize-none rounded-2xl p-4 text-lg outline-none"/>
    <div className="flex justify-end"><button onClick={build} className="rounded-full bg-[#173e2d] px-6 py-3 font-semibold text-white">Construir mi ruta →</button></div>
   </div>
   <div className="mx-auto mt-5 flex max-w-3xl flex-wrap justify-center gap-2">{examples.map(x=><button key={x} onClick={()=>setGoal(x)} className="rounded-full border border-[#d9ddd7] bg-white px-4 py-2 text-sm text-[#56635c] hover:border-[#70927e]">{x}</button>)}</div>
   <Link href="/school/diagnostico" className="mt-8 inline-block text-sm font-semibold text-[#315d45] underline underline-offset-4">No sé por dónde empezar: hacer diagnóstico</Link>
  </section>
  {active&&<section className="border-y border-[#e1e4df] bg-white"><div className="mx-auto max-w-6xl px-5 py-12"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#4f765f]">TU RUTA ADAPTATIVA</p><h2 className="mt-2 text-3xl font-semibold">{active}</h2></div><span className="rounded-full bg-[#eef4ef] px-4 py-2 text-sm">{route.length} niveles seleccionados de 25</span></div>
   <div className="mt-7 grid gap-3 md:grid-cols-2">{route.map((id,index)=>{const l=schoolLevels[id];return <Link href={'/school/learn/'+l.slug} key={l.id} className="rounded-2xl border border-[#e0e3df] p-5 hover:border-[#70927e]"><span className="text-xs text-[#6c7a72]">MISIÓN {index+1} · NIVEL {l.id}</span><h3 className="mt-2 text-xl font-semibold">{l.title}</h3><p className="mt-2 text-sm text-[#5d6962]">{l.outcome}</p>{id!==0&&<p className="mt-3 text-xs font-semibold text-[#315d45]">SKIP BY PROOF disponible →</p>}</Link>})}</div>
  </div></section>}
  <section className="mx-auto grid max-w-6xl gap-5 px-5 py-14 md:grid-cols-3">{[['STUDY','Aprende solo lo necesario para tu objetivo.'],['BUILD','Cada concepto termina en una construcción o decisión.'],['PROVE','La evidencia pesa más que completar páginas.']].map(([a,b])=><article key={a} className="rounded-2xl border border-[#e0e3df] bg-white p-6"><p className="font-mono text-sm text-[#4f765f]">{a}</p><p className="mt-3 text-lg">{b}</p></article>)}</section>
  <SchoolTutor goal={active||goal}/>
  <footer className="mx-auto max-w-6xl border-t border-[#e0e3df] px-5 py-8 text-sm text-[#657169]">KOWI School · No demuestres solamente lo que estudiaste. Demuestra lo que puedes hacer.</footer>
 </main>
}