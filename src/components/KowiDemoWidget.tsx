'use client';
import { useEffect,useRef,useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Msg={role:'kowi'|'user';text:string};
const demos=[
 'Tengo una peluquería. ¿Cómo puede KOWI atender clientes y generar oportunidades?',
 'Enséñame cómo KOWI organiza un lead y prepara su seguimiento en el CRM.',
 'Soy una inmobiliaria. Simula cómo cualificarías a una persona interesada en una vivienda.'
];
export default function KowiDemoWidget(){
 const pathname=usePathname();
 const [open,setOpen]=useState(false),[text,setText]=useState(''),[listening,setListening]=useState(false),[voice,setVoice]=useState(true);
 const [messages,setMessages]=useState<Msg[]>([{role:'kowi',text:'Soy una demostración con respuestas de ejemplo de KOWI. Puedo enseñarte cómo un negocio atiende, cualifica oportunidades y organiza el seguimiento. Elige un ejemplo o escríbeme.'}]);
 const recognition=useRef<any>(null);
 useEffect(()=>()=>{recognition.current?.stop?.();},[]);
 function speak(value:string){if(!voice||typeof window==='undefined'||!('speechSynthesis'in window))return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(value);u.lang='es-ES';window.speechSynthesis.speak(u);}
 function reply(q:string){const l=q.toLowerCase();let r='En la demo comercial, KOWI comprende la solicitud, selecciona el agente adecuado y prepara la siguiente acción. Las acciones externas o sensibles requieren aprobación humana y quedan registradas.';
  if(l.includes('pelu'))r='Ejemplo: entra “Quiero corte y color el viernes”. Business Agent identifica servicio y necesidad; CRM Agent prepara el lead y siguiente acción. Una reserva real solo se ejecuta con calendario verificado y autorización.';
  else if(l.includes('crm')||l.includes('lead'))r='El CRM guarda nombre, contacto, origen, estado, notas y siguiente acción. KOWI puede preparar el seguimiento; antes de enviar correo, WhatsApp o modificar sistemas externos aplica permisos y aprobación.';
  else if(l.includes('inmobili'))r='Ejemplo: KOWI pregunta zona, tipo de vivienda, presupuesto orientativo y cuándo quiere visitar. Con esas respuestas cualifica la oportunidad y prepara el siguiente paso para el asesor, sin inventar disponibilidad.';
  setMessages(m=>[...m,{role:'user',text:q},{role:'kowi',text:r}]);speak(r);
 }
 function send(){const q=text.trim();if(!q)return;setText('');reply(q);}
 function mic(){const w=window as any;const SR=w.SpeechRecognition||w.webkitSpeechRecognition;if(!SR){setMessages(m=>[...m,{role:'kowi',text:'Tu navegador no ofrece reconocimiento de voz aquí. Puedes seguir escribiendo; la lectura en voz puede continuar disponible.'}]);return;} if(listening){recognition.current?.stop();return;}const rec=new SR();recognition.current=rec;rec.lang='es-ES';rec.interimResults=false;rec.onstart=()=>setListening(true);rec.onend=()=>setListening(false);rec.onerror=()=>setListening(false);rec.onresult=(e:any)=>{const q=e.results?.[0]?.[0]?.transcript||'';setText(q);if(q)reply(q);};rec.start();}
 if(pathname==='/piloto')return null;
 return <div className="fixed bottom-5 right-5 z-[80]">
  {open&&<section className="mb-3 flex h-[min(650px,78vh)] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[1.7rem] border border-white/15 bg-[#071612]/95 text-[#eef8ef] shadow-2xl backdrop-blur-xl" aria-label="Demo KOWI">
   <header className="flex items-center justify-between border-b border-white/10 p-4"><div className="flex items-center gap-3"><span className="hero-orb h-9 w-9 rounded-full"/><div><strong>KOWI</strong><p className="text-xs text-[#9fb9aa]">Respuestas de ejemplo · no es una conversación IA real</p></div></div><button onClick={()=>setOpen(false)} aria-label="Cerrar">✕</button></header>
   <div className="border-b border-white/10 p-3"><p className="mb-2 text-xs uppercase tracking-wider text-[#e8b37b]">Prueba un caso</p><div className="flex gap-2 overflow-x-auto">{demos.map((d,i)=><button key={d} onClick={()=>reply(d)} className="shrink-0 rounded-full border border-white/15 px-3 py-2 text-xs">Demo {i+1}</button>)}</div></div>
   <div className="flex-1 space-y-3 overflow-y-auto p-4" role="log">{messages.map((m,i)=><p key={i} className={m.role==='user'?'ml-auto max-w-[85%] rounded-2xl bg-[#e8b37b] p-3 text-sm text-[#17121a]':'max-w-[92%] rounded-2xl bg-white/10 p-3 text-sm leading-relaxed'}>{m.text}</p>)}</div>
   <div className="border-t border-white/10 p-3"><div className="mb-2 flex items-center justify-between text-xs"><Link href="/business#crear" className="text-[#e8b37b] underline">Crear mi agente KOWI ↗</Link><button onClick={()=>setVoice(v=>!v)}>{voice?'🔊 Voz KOWI':'🔇 Voz off'}</button></div><div className="flex gap-2"><button onClick={mic} className="rounded-xl border border-white/15 px-3" title="Hablar">{listening?'■':'🎙'}</button><input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Escribe o habla con KOWI…" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 p-3 text-sm outline-none"/><button onClick={send} className="rounded-xl bg-[#e8b37b] px-4 font-semibold text-[#17121a]">↑</button></div><Link href="/kowi" className="mt-2 block text-sm text-[#e8b37b] underline">Hablar con KOWI One ↗</Link><p className="mt-2 text-[10px] text-[#809d8d]">La voz usa funciones disponibles en tu navegador. Esta ventana usa respuestas locales de ejemplo y no crea leads. Para conversar con IA y guardar tu historia, entra en KOWI One.</p></div>
  </section>}
  <button onClick={()=>setOpen(v=>!v)} className="kowi-gold-btn ml-auto flex items-center gap-3 rounded-full px-5 py-4 font-semibold shadow-2xl"><span className="hero-orb h-7 w-7 rounded-full"/> {open?'Cerrar demo':'Ver demo ilustrativa'}</button>
 </div>;
}
