'use client';
import Link from 'next/link';
import {useState} from 'react';
import {literacyQuestions,checkLiteracyAnswer,type LiteracyAnswer} from '@/lib/school-media-literacy';

export default function SchoolVerify(){
 const [answers,setAnswers]=useState<Record<string,LiteracyAnswer>>({});
 const [index,setIndex]=useState(0);
 const current=literacyQuestions[index];
 const answer=answers[current.id];
 const checked=answer?checkLiteracyAnswer(current.id,answer):null;
 const score=literacyQuestions.reduce((n,q)=>n+(answers[q.id]===q.correct?1:0),0);
 const last=index===literacyQuestions.length-1;
 function answerQuestion(id:LiteracyAnswer){setAnswers(currentAnswers=>({...currentAnswers,[current.id]:id}));}
 function reset(){setAnswers({});setIndex(0);}
 return <main className="kowi-cosmos min-h-screen px-5 py-9 text-[#f4f3f2] md:px-10"><div className="mx-auto max-w-4xl space-y-8">
  <nav className="flex justify-between gap-4 text-sm"><Link href="/school" className="underline">← KOWI School</Link><Link href="/news/verificar" className="underline">KOWI Verifica ↗</Link></nav>
  <header className="space-y-4"><p className="kowi-eyebrow">KOWI SCHOOL · FORMACIÓN GRATUITA</p><h1 className="text-4xl font-semibold md:text-5xl">Aprende a detectar información engañosa</h1>
  <p className="max-w-3xl text-lg leading-relaxed text-[#bdc4cf]">Cinco microlecciones con ejemplos ficticios para verificar noticias y reconocer limitaciones de la IA. No exige registro ni recopila tus respuestas en servidores.</p></header>
  <section aria-label="Progreso del aprendizaje" className="cosmos-panel rounded-2xl p-5"><div className="flex justify-between gap-4 text-sm"><span>Lección {index+1} de {literacyQuestions.length}</span><span>{Object.keys(answers).length} respondidas</span></div>
  <div className="mt-3 h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-[#e8b37b] transition-all" style={{width:((index+1)/literacyQuestions.length)*100+'%'}}/></div></section>
  <section className="cosmos-panel space-y-6 rounded-3xl p-6 md:p-8" aria-labelledby="lesson-title">
   <h2 id="lesson-title" className="text-2xl font-semibold">{current.title}</h2>
   <p className="leading-relaxed text-[#bdc4cf]">{current.scenario}</p>
   <fieldset className="space-y-3"><legend className="mb-3 font-semibold">¿Qué harías?</legend>
   {current.options.map(opt=><label key={opt.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${answer===opt.id?'border-[#e8b37b] bg-[#e8b37b]/10':'border-white/20 hover:border-[#e8b37b]/50'}`}>
    <input className="mt-1 accent-[#e8b37b]" type="radio" name={current.id} checked={answer===opt.id} onChange={()=>answerQuestion(opt.id)}/><span>{opt.label}</span>
   </label>)}</fieldset>
   {checked&&<div aria-live="polite" role="status" className="rounded-xl border border-white/20 p-5"><p className="font-semibold">{checked.correct?'Respuesta adecuada':'Esta respuesta no es suficiente'}</p>
    <p className="mt-2 text-[#bdc4cf]">{checked.explanation}</p><p className="mt-3 text-[#e8b37b]">Práctica: {current.practice}</p></div>}
   <div className="flex flex-wrap items-center gap-4">
    {index>0&&<button type="button" onClick={()=>setIndex(index-1)} className="rounded-full border border-white/30 px-6 py-3">Anterior</button>}
    {!last&&<button disabled={!answer} type="button" onClick={()=>setIndex(index+1)} className="kowi-gold-btn rounded-full px-6 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-40">Siguiente lección →</button>}
   </div>
  </section>
  {last&&answer&&<section className="cosmos-panel space-y-4 rounded-2xl p-6" aria-live="polite">
   <h2 className="text-2xl font-semibold">Tu práctica: {score} de {literacyQuestions.length} respuestas adecuadas</h2>
   <p className="text-[#bdc4cf]">El resultado es orientativo y no es un certificado. Puedes revisar las respuestas, repetir el ejercicio y aplicar el método a una noticia real con KOWI Verifica.</p>
   <div className="flex flex-wrap gap-4"><Link href="/news/verificar" className="kowi-gold-btn rounded-full px-6 py-3 font-semibold">Comprobar una noticia ↗</Link><button type="button" onClick={reset} className="rounded-full border border-white/30 px-6 py-3">Repetir</button></div>
  </section>}
  <section className="space-y-3 rounded-2xl border border-white/15 p-6"><h2 className="text-xl font-semibold">De la información a la acción</h2>
   <p className="text-[#bdc4cf]">Aprendemos → Compartimos conocimientos → Descubrimos necesidades → Creamos una idea juntos → Construimos y comprobamos → Compartimos resultados.</p>
   <p className="text-sm text-[#bdc4cf]">Nunca compartas datos privados de terceros ni difundas testimonios sin autorización.</p><Link href="/proyectos" className="inline-block underline">Convertir lo aprendido en un proyecto ↗</Link>
  </section>
  <footer className="border-t border-white/15 pt-6 text-sm text-[#bdc4cf]">HOLA SOY TU IA · kowi.one · Educación gratuita y responsable</footer>
 </div></main>;
}
