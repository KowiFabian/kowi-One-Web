'use client';
import {useEffect,useState,type FormEvent} from 'react';
import Link from 'next/link';
import {api} from '@/lib/api';
import {builderTemplates,templateById,validateBuilderConfig,previewBuilderReply} from '@/lib/builder-templates';
import type {BusinessConfig} from '@/lib/business-schema';

type Organization={id:string;name:string};
type Agent={id:string;name:string;status:string;config?:unknown};
type ChatItem={from:'cliente'|'kowi';text:string};
const field='mt-1.5 block w-full rounded-xl border border-[#d9dcdf] bg-white px-3 py-2.5 text-sm text-[#1c1e21] outline-none focus:border-[#343b45] focus:ring-2 focus:ring-[#cbd5e1]';
const lbl='block text-sm font-medium text-[#40464f]';
const secondary='rounded-full border border-[#dadddf] bg-white px-4 py-2 text-sm font-medium text-[#34383e] transition hover:bg-[#f2f3f4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#27292c]';
const primary='rounded-full bg-[#191b1f] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#343941] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#27292c]';
function cloneConfig(config:BusinessConfig):BusinessConfig{return {...config,services:config.services.map(s=>({...s})),faq:config.faq.map(f=>({...f})),automaticActions:[...config.automaticActions]};}
function Section({number,title,description,children}:{number:string;title:string;description:string;children:React.ReactNode}){
 return <section className="rounded-2xl border border-[#e7e8ea] bg-white p-5 md:p-6">
   <div className="mb-5 flex items-start gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f1f2f4] text-xs font-semibold">{number}</span><div><h2 className="text-lg font-semibold">{title}</h2><p className="mt-1 text-sm text-[#6b717a]">{description}</p></div></div>
   {children}
 </section>;
}
export default function BuildersStudio(){
 const initial=builderTemplates[0];
 const [sector,setSector]=useState(initial.id);
 const [config,setConfig]=useState<BusinessConfig>(()=>cloneConfig(initial.config));
 const [agentName,setAgentName]=useState(initial.agentName);
 const [previewInput,setPreviewInput]=useState('');
 const [messages,setMessages]=useState<ChatItem[]>([]);
 const [orgs,setOrgs]=useState<Organization[]>([]);
 const [org,setOrg]=useState('');
 const [role,setRole]=useState('');
 const [agents,setAgents]=useState<Agent[]>([]);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [signedIn,setSignedIn]=useState(false);
 const [notice,setNotice]=useState('');
 const [error,setError]=useState('');
 const [step,setStep]=useState<'config'|'preview'|'review'>('config');
 const selected=templateById(sector);
 const selectedCompany=orgs.find(o=>o.id===org);
 const canSave=['owner','admin','configurator'].includes(role);
 const validated=validateBuilderConfig({...config,name:selectedCompany?.name||config.name});
 function change<K extends keyof BusinessConfig>(key:K,value:BusinessConfig[K]){setConfig(c=>({...c,[key]:value}));setNotice('');}

 useEffect(()=>{let live=true;
   api<Organization[]>('/api/organizations').then(rows=>{
     if(!live)return;
     setSignedIn(true);setOrgs(rows);
     const requested=new URLSearchParams(window.location.search).get('organization_id');
     setOrg(rows.find(o=>o.id===requested)?.id||rows[0]?.id||'');
   }).catch(e=>{if(live&&!String(e?.message||'').includes('Inicia sesión'))setError('No se pudieron cargar las empresas. Puedes seguir con la simulación.');})
     .finally(()=>{if(live)setLoading(false);});
   return()=>{live=false;};
 },[]);
 useEffect(()=>{if(!org){setRole('');setAgents([]);return;}
   let live=true;setRole('');setAgents([]);
   api<{role:string;items:Agent[]}>('/api/organization-agents?organization_id='+encodeURIComponent(org))
     .then(data=>{if(live){setRole(data.role);setAgents(data.items);}})
     .catch(e=>{if(live)setError(e instanceof Error?e.message:'No se pudieron cargar los agentes de la empresa.');});
   return()=>{live=false;};
 },[org]);
 function chooseSector(id:string){
   if(id===sector)return;
   const t=templateById(id);
   setSector(t.id);setConfig(cloneConfig(t.config));setAgentName(t.agentName);
   setMessages([]);setPreviewInput('');setError('');setNotice('Plantilla de '+t.label+' cargada. Los campos anteriores se han reemplazado.');
   setStep('config');
 }
 function simulate(question:string){
   const q=question.trim();
   if(!q)return;
   setMessages(old=>[...old,{from:'cliente',text:q},{from:'kowi',text:previewBuilderReply(config,q)}]);
   setPreviewInput('');
   setStep('preview');
 }
 async function save(e:FormEvent){
   e.preventDefault();setError('');setNotice('');
   if(!signedIn||!org){setError('Inicia sesión y crea o selecciona una empresa antes de guardar en KOWI.');return;}
   if(!canSave){setError('Tu rol no permite registrar agentes en esta empresa. Solicita acceso al propietario.');return;}
   if(agentName.trim().length<2||agentName.trim().length>120){setError('El nombre del agente debe tener entre 2 y 120 caracteres.');return;}
   const final=validateBuilderConfig({...config,name:selectedCompany?.name||config.name});
   if(!final.success){const first=final.error.issues[0];setError('Revisa '+(first?.path.join(' → ')||'la ficha')+': '+(first?.message||'valor inválido')+'.');setStep('config');return;}
   setBusy(true);
   try{
     const saved=await api<Agent>('/api/organization-agents?organization_id='+encodeURIComponent(org),{
       method:'POST',body:JSON.stringify({name:agentName.trim(),config:final.data}),
     });
     setAgents(old=>[saved,...old.filter(a=>a.id!==saved.id)]);
     setNotice('Agente '+saved.name+' registrado en DRAFT. No está activo ni envía mensajes. Debes probarlo y verificarlo antes de su activación.');
     setStep('review');
   }catch(e){setError(e instanceof Error?e.message:'No se pudo registrar el agente.');}
   finally{setBusy(false);}
 }
 const updateService=(index:number,key:'name'|'price',value:string)=>change('services',config.services.map((s,i)=>i===index?{...s,[key]:value}:s));
 const updateFaq=(index:number,key:'question'|'answer',value:string)=>change('faq',config.faq.map((f,i)=>i===index?{...f,[key]:value}:f));
 return <main className="min-h-screen bg-[#fafafa] px-4 pb-20 pt-8 text-[#1b1d21] sm:px-6 lg:px-10"><div className="mx-auto max-w-6xl">
   <header className="flex flex-wrap items-center justify-between gap-4">
     <Link href="/" className="flex items-center gap-3" aria-label="KOWI IA, inicio">
       <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0f1f2] text-2xl font-bold">◎</span>
       <span><strong className="block text-2xl tracking-tight">KOWI IA</strong><small className="text-[#777b81]">Human-First AI · Builders Studio</small></span>
     </Link>
     <div className="flex flex-wrap items-center gap-2"><Link href="/builders/ingresos" className="rounded-full border border-[#dadddf] bg-white px-4 py-2 text-sm font-medium hover:bg-[#f0f1f2]">Cómo ganan los Builders</Link><span className="rounded-full bg-[#eeeeef] px-3 py-1 text-xs font-semibold">PILOTO</span></div>
   </header>
   <div className="mt-7 rounded-[28px] border border-[#e7e7e8] bg-white p-4 shadow-sm sm:p-6">
     <nav aria-label="Explorar KOWI" className="flex flex-wrap gap-2 border-b border-[#eeeeef] pb-5">
       {[{title:'Cliente',href:'/business/demo'},{title:'Business',href:'/business/app'},{title:'Partner',href:'/partners-builders#partners'},{title:'Builder',href:'/builders'}].map(t=><Link key={t.title} href={t.href} aria-current={t.title==='Builder'?'page':undefined} className={t.title==='Builder'?primary:secondary}>{t.title}</Link>)}
     </nav>
     <section className="mt-7">
       <p className="text-xs font-semibold uppercase tracking-[.14em] text-[#73777d]">KOWI BUILDERS · ESPACIO DE CREACIÓN</p>
       <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Crea un agente que conozca tu negocio.</h1>
       <p className="mt-4 max-w-3xl leading-relaxed text-[#686e76]">Elige una plantilla, personaliza información confirmada, prueba respuestas en una simulación y registra un borrador en tu empresa. Sin código, sin inventar reservas y sin enviar mensajes a terceros.</p><Link href="/builders/ingresos" className="mt-4 inline-block text-sm font-semibold underline underline-offset-4">Descubre el modelo de ingresos de KOWI, Partners y Builders ↗</Link>
     </section>
     <section className="mt-8">
       <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">1. Elige una plantilla sectorial</h2><span className="text-xs text-[#6f737a]">Las plantillas contienen únicamente datos ficticios</span></div>
       <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
         {builderTemplates.map(t=><button type="button" key={t.id} aria-pressed={t.id===sector} onClick={()=>chooseSector(t.id)}
           className={'rounded-2xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 '+(t.id===sector?'border-[#22252a] bg-[#f4f5f6]':'border-[#e3e5e8] bg-white hover:border-[#8b9098]')}>
           <span className="text-2xl" aria-hidden="true">{t.icon}</span><strong className="mt-3 block">{t.label}</strong><span className="mt-1 block text-sm text-[#6f747b]">{t.description}</span>
         </button>)}
       </div>
     </section>
     <div className="mt-8 flex flex-wrap gap-2" aria-label="Etapas del constructor">
       {[{id:'config',title:'Configurar'},{id:'preview',title:'Probar agente'},{id:'review',title:'Registrar borrador'}].map((t,index)=><button key={t.id} type="button" aria-pressed={step===t.id} onClick={()=>setStep(t.id as typeof step)} className={step===t.id?primary:secondary}>{index+1}. {t.title}</button>)}
     </div>
     {notice&&<p role="status" className="mt-4 rounded-xl border border-[#d2e5d7] bg-[#f2f9f3] p-3 text-sm text-[#25472c]">{notice}</p>}
     {error&&<p role="alert" aria-live="assertive" className="mt-4 rounded-xl border border-[#edb7b7] bg-[#fff0f0] p-3 text-sm text-[#9b2525]">{error}</p>}
     {step==='config'&&<form noValidate onSubmit={save} className="mt-6 space-y-4">
       <Section number="01" title="Identidad y objetivos" description="Qué hace tu agente, qué negocio representa y cómo debe comunicarse.">
         <div className="grid gap-4 sm:grid-cols-2">
           <label className={lbl}>Nombre del agente<input className={field} required maxLength={120} value={agentName} onChange={e=>setAgentName(e.target.value)}/></label>
           <label className={lbl}>Nombre de la empresa de ejemplo<input className={field} maxLength={120} value={config.name} onChange={e=>change('name',e.target.value)}/></label>
           <label className={lbl+' sm:col-span-2'}>Objetivo y descripción del negocio<textarea className={field} rows={3} maxLength={1200} value={config.description} onChange={e=>change('description',e.target.value)}/></label>
           <label className={lbl}>Tono de la conversación<input className={field} maxLength={300} value={config.tone} onChange={e=>change('tone',e.target.value)}/></label>
           <label className={lbl}>Contacto público<input className={field} maxLength={300} value={config.contact} onChange={e=>change('contact',e.target.value)}/></label>
           <label className={lbl+' sm:col-span-2'}>Horario confirmado<textarea className={field} rows={2} maxLength={700} value={config.hours} onChange={e=>change('hours',e.target.value)}/></label>
         </div>
       </Section>
       <Section number="02" title="Servicios y precios" description="Añade solo servicios y precios autorizados. No es un inventario conectado.">
         <div className="space-y-3">{config.services.map((s,i)=><div key={i} className="grid gap-2 rounded-xl bg-[#f7f7f8] p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
           <label className={lbl}>Servicio {i+1}<input className={field} maxLength={100} value={s.name} onChange={e=>updateService(i,'name',e.target.value)}/></label>
           <label className={lbl}>Precio autorizado<input className={field} maxLength={120} value={s.price} onChange={e=>updateService(i,'price',e.target.value)}/></label>
           <button type="button" className={secondary} aria-label={'Retirar servicio '+(i+1)} onClick={()=>change('services',config.services.filter((_,j)=>j!==i))}>Retirar</button>
         </div>)}</div>
         <button type="button" disabled={config.services.length>=30} className={secondary+' mt-3 disabled:opacity-40'} onClick={()=>change('services',[...config.services,{name:'',price:''}])}>+ Añadir servicio</button>
       </Section>
       <Section number="03" title="Conocimiento: preguntas frecuentes" description="La vista previa utiliza estas respuestas aprobadas, no un modelo de IA.">
         <div className="space-y-3">{config.faq.map((f,i)=><div key={i} className="grid gap-2 rounded-xl bg-[#f7f7f8] p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
           <label className={lbl}>Pregunta {i+1}<input className={field} maxLength={200} value={f.question} onChange={e=>updateFaq(i,'question',e.target.value)}/></label>
           <label className={lbl}>Respuesta aprobada<textarea className={field} rows={2} maxLength={600} value={f.answer} onChange={e=>updateFaq(i,'answer',e.target.value)}/></label>
           <button type="button" className={secondary} aria-label={'Retirar pregunta '+(i+1)} onClick={()=>change('faq',config.faq.filter((_,j)=>j!==i))}>Retirar</button>
         </div>)}</div>
         <button type="button" disabled={config.faq.length>=25} className={secondary+' mt-3 disabled:opacity-40'} onClick={()=>change('faq',[...config.faq,{question:'',answer:''}])}>+ Añadir respuesta</button>
       </Section>
       <Section number="04" title="Seguridad y supervisión" description="Un borrador no puede enviar mensajes ni confirmar pagos o reservas.">
         <div className="grid gap-4 sm:grid-cols-2">
           <label className={lbl}>Políticas y límites<textarea className={field} rows={3} maxLength={1500} value={config.policies} onChange={e=>change('policies',e.target.value)}/></label>
           <label className={lbl}>Cuándo derivar a una persona<textarea className={field} rows={3} maxLength={700} value={config.escalation} onChange={e=>change('escalation',e.target.value)}/></label>
         </div>
         <div className="mt-4 grid gap-2 sm:grid-cols-3">{['Información por empresa','Control de permisos','Aprobación de acciones'].map(x=><span key={x} className="rounded-lg bg-[#f3f4f5] px-3 py-2 text-xs text-[#555c64]">✓ {x}</span>)}</div>
       </Section>
       <div className="flex flex-wrap justify-between gap-3">
         <button type="button" className={secondary} onClick={()=>setStep('preview')}>Probar antes de guardar</button>
         <button type="submit" className={primary} disabled={busy||!signedIn||!org||!canSave}>{busy?'Registrando…':'Registrar agente DRAFT'}</button>
       </div>
       {!signedIn&&<p className="text-sm text-[#666b72]">Puedes probar esta plantilla sin cuenta. Para registrar el agente, <Link href="/business#crear" className="font-semibold underline">entra a KOWI Business</Link> y crea una empresa.</p>}
     </form>}
     {step==='preview'&&<div className="mt-6 grid gap-5 lg:grid-cols-[1fr_.85fr]">
       <Section number="02" title="Simulador de conversación" description="Reglas locales de ejemplo: no ejecuta IA real ni consulta sistemas externos.">
         <div className="h-[330px] space-y-3 overflow-auto rounded-xl border border-[#e4e5e7] bg-[#f7f7f8] p-4" role="log" aria-label="Mensajes simulados" aria-live="polite">
           <div className="max-w-[90%] rounded-xl bg-white p-3 text-sm shadow-sm">¡Hola! Soy {agentName}. ¿En qué puedo ayudarte? Responderé únicamente con la información configurada.</div>
           {messages.map((m,i)=><div key={i} className={'max-w-[90%] rounded-xl p-3 text-sm '+(m.from==='cliente'?'ml-auto bg-[#24272d] text-white':'bg-white shadow-sm')}><span className="mb-1 block text-[10px] opacity-70">{m.from==='cliente'?'Cliente':'KOWI · respuesta simulada'}</span>{m.text}</div>)}
         </div>
         <form className="mt-3 flex gap-2" onSubmit={e=>{e.preventDefault();simulate(previewInput);}}>
           <input className={field+' !mt-0 min-w-0 flex-1'} aria-label="Mensaje ficticio" maxLength={500} value={previewInput} onChange={e=>setPreviewInput(e.target.value)} placeholder="Ej.: ¿Cuánto cuesta un corte?"/>
           <button type="submit" className={primary} disabled={!previewInput.trim()}>Enviar</button>
         </form>
         <div className="mt-3 flex flex-wrap gap-2">{selected.prompts.map(p=><button type="button" key={p} className={secondary} onClick={()=>simulate(p)}>{p}</button>)}</div>
         <button type="button" className="mt-3 text-xs text-[#656b73] underline" onClick={()=>setMessages([])}>Limpiar simulación</button>
       </Section>
       <Section number="03" title="Ficha del agente" description="Vista de la configuración que recibirá el negocio.">
         <div className="space-y-3 text-sm">
           <p><strong>Agente: </strong>{agentName}</p>
           <p><strong>Sector: </strong>{selected.label}</p>
           <p><strong>Empresa: </strong>{config.name}</p>
           <p><strong>Servicios: </strong>{config.services.filter(x=>x.name.trim()).map(x=>x.name).join(', ')||'Pendientes'}</p>
           <p><strong>Horario: </strong>{config.hours||'No confirmado'}</p>
           <p><strong>Derivación: </strong>{config.escalation||'Pendiente'}</p>
         </div>
         <div className="mt-5 rounded-xl border border-[#e5e6e7] bg-[#f9fafb] p-3 text-sm">Para registrar y activar el agente en KOWI Business hace falta iniciar sesión, elegir una empresa y verificarlo con una conversación real. No se activan canales externos desde esta pantalla.</div>
         <button type="button" className={primary+' mt-5'} onClick={()=>setStep('config')}>Volver a configurar</button>
       </Section>
     </div>}
     {step==='review'&&<div className="mt-6 grid gap-4 lg:grid-cols-[1fr_.8fr]">
       <Section number="03" title="Registrar borrador en tu empresa" description="Solo los roles owner, admin o configurator pueden guardar agentes.">
         {loading?<p role="status" className="text-sm">Comprobando tu sesión…</p>:!signedIn?<div className="space-y-3 text-sm"><p>La simulación está abierta a todos, pero guardar requiere iniciar sesión.</p><Link href="/business#crear" className={primary+' inline-block'}>Entrar a KOWI Business</Link></div>:orgs.length===0?<div className="space-y-3 text-sm"><p>Todavía no tienes una empresa configurada.</p><Link href="/business/app" className={primary+' inline-block'}>Crear empresa</Link></div>:<form onSubmit={save} className="space-y-4">
           <label className={lbl}>Empresa de destino<select className={field} value={org} onChange={e=>setOrg(e.target.value)}>{orgs.map(o=><option value={o.id} key={o.id}>{o.name}</option>)}</select></label>
           <p className="text-sm text-[#666b72]">Rol: {role||'comprobando permisos'}. El agente se guardará en <strong>DRAFT</strong>, no estará activo ni se conectará a WhatsApp.</p>
           {!validated.success&&<p role="alert" className="text-sm text-[#a42727]">Faltan campos válidos. Revisa la configuración antes de guardarla.</p>}
           <button type="submit" className={primary} disabled={busy||!canSave||!validated.success}>{busy?'Guardando…':'Registrar agente en DRAFT'}</button>
           <button type="button" className={secondary+' ml-2'} onClick={()=>setStep('config')}>Editar ficha</button>
           {!canSave&&<p className="text-xs text-[#9b2525]">No tienes permisos de configuración en esta empresa o están por comprobarse.</p>}
         </form>}
       </Section>
       <Section number="04" title="Agentes registrados" description="Resultados del servidor para la empresa seleccionada; no incluye agentes de otras empresas.">
         {!signedIn?<p className="text-sm text-[#747b83]">Inicia sesión para consultar agentes reales.</p>:!org?<p className="text-sm text-[#747b83]">Elige una empresa.</p>:agents.length===0?<p className="text-sm text-[#747b83]">Aún no hay agentes registrados en esta empresa.</p>:<div className="space-y-3">{agents.map(a=><div key={a.id} className="rounded-xl border border-[#e5e5e5] p-3"><div className="flex flex-wrap items-center justify-between gap-2"><strong>{a.name}</strong><span className="rounded-full bg-[#f0f1f2] px-2 py-1 text-xs">{a.status.toUpperCase()}</span></div><Link href={'/business/agent-chat?organization_id='+encodeURIComponent(org)+'&agent_id='+encodeURIComponent(a.id)} className="mt-3 inline-block text-sm font-medium underline">Probar conversación real ↗</Link></div>)}</div>}
       </Section>
     </div>}
     <footer className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-[#e8e8e8] pt-5 text-xs text-[#6d737b]"><span>KOWI IA · Human-First AI · Los datos de ejemplo no representan clientes reales.</span><div className="flex gap-4"><Link href="/privacidad" className="underline">Privacidad</Link><Link href="/business/app" className="underline">KOWI Business</Link></div></footer>
   </div>
 </div></main>;
}
