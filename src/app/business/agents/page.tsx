'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {api} from '@/lib/api';
import {businessConfigSchema} from '@/lib/business-schema';
type Organization={id:string;name:string};
type Agent={id:string;name:string;status:string;config?:{synthetic?:boolean}};
export default function Page(){
 const [organizations,setOrganizations]=useState<Organization[]>([]),[org,setOrg]=useState('');
 const [agents,setAgents]=useState<Agent[]>([]),[role,setRole]=useState(''),[error,setError]=useState('');
 const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 const [services,setServices]=useState<{name:string;price:string}[]>([]),[faq,setFaq]=useState<{question:string;answer:string}[]>([]);
 const [name,setName]=useState('KOWI Comercial'),[description,setDescription]=useState(''),[contact,setContact]=useState(''),[hours,setHours]=useState(''),[policies,setPolicies]=useState('');
 useEffect(()=>{let active=true;api<Organization[]>('/api/organizations').then(data=>{if(active){setOrganizations(data);const selected=new URLSearchParams(window.location.search).get('organization_id');setOrg(data.find(o=>o.id===selected)?.id||data[0]?.id||'');}}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[]);
 useEffect(()=>{if(!org)return;let active=true;setLoading(true);setError('');setAgents([]);setRole('');
 api<{items:Agent[];role:string}>('/api/organization-agents?organization_id='+org).then(data=>{if(active){setAgents(data.items);setRole(data.role);}}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[org]);
 const canWrite=['owner','admin','configurator'].includes(role);
 async function create(event:React.FormEvent){event.preventDefault();if(busy)return;setError('');setNotice('');
 if(name.trim().length<2){setError('Falta el nombre del agente. Escribe al menos 2 caracteres.');return;}
 const missingService=services.findIndex(item=>!item.name.trim());if(missingService!==-1){setError('Falta el nombre del producto o servicio '+(missingService+1)+'. Complétalo o retira esa fila.');return;}
 const missingFaq=faq.findIndex(item=>!item.question.trim()||!item.answer.trim());if(missingFaq!==-1){setError('La pregunta frecuente '+(missingFaq+1)+' necesita una pregunta y una respuesta, o puedes retirar esa fila.');return;}
 const config=businessConfigSchema.safeParse({name:organizations.find(o=>o.id===org)?.name||'',sector:'otro',description,contact,hours,policies,escalation:'Derivar los datos no confirmados al responsable de la empresa.',team:'',services,faq,tone:'Claro y cercano',automaticActions:['answer_faq','qualify']});
 if(!config.success){const first=config.error.issues[0];setError('Revisa '+(first?.path.join(' → ')||'los datos de la empresa')+': '+(first?.message||'valor no válido')+'.');return;}setBusy(true);
 try{const data=await api<Agent>('/api/organization-agents?organization_id='+org,{method:'POST',body:JSON.stringify({name,config:config.data})});setAgents(old=>[...old,data]);setNotice('Agente «'+data.name+'» registrado correctamente en estado DRAFT. Ya aparece en la lista inferior.');}catch(e){setError(e instanceof Error?e.message:'No se pudo registrar.');}finally{setBusy(false);}}
 async function change(agent:Agent,status:string){if(busy)return;
 if(!window.confirm(status==='terminated'?'¿Terminar este agente definitivamente? Se conservarán sus registros y evidencias.':'¿Revocar este agente? No podrá reactivarse y se conservará su evidencia.'))return;
 setBusy(true);setError('');try{const data=await api<Agent>('/api/organization-agents?organization_id='+org,{method:'PATCH',body:JSON.stringify({id:agent.id,status})});setAgents(old=>old.map(row=>row.id===data.id?data:row));}catch(e){setError(e instanceof Error?e.message:'No se pudo cambiar el estado.');}finally{setBusy(false);}}
 const field='mt-2 w-full rounded-xl border border-white/20 bg-[#102b22] p-3';
 return <main className="kowi-shell min-h-screen p-5 text-white md:p-10"><div className="mx-auto max-w-5xl space-y-6">
 <Link href="/business#crear" className="underline">KOWI Business</Link><h1 className="text-3xl">Agentes de tu empresa</h1>
 <p>Registra identidad y configuración empresarial. Las nuevas instalaciones quedan en DRAFT. Prueba una conversación privada y verifica sus resultados antes de activar el agente. Los canales externos requieren verificación separada.</p>
 {loading&&<p role="status">Cargando…</p>}{notice&&<p role="status" className="rounded-xl border-2 border-emerald-400 bg-emerald-950/80 p-4 text-emerald-100">✓ {notice}</p>}{error&&<div role="alert" aria-live="assertive" className="rounded-xl border-2 border-red-400 bg-red-950/80 p-4 text-red-100"><p className="font-bold">⚠ No se pudo registrar el agente</p><p className="mt-1">{error}</p></div>}
 {!!organizations.length&&<label className="block">Empresa<select className={field} disabled={busy||loading} value={org} onChange={e=>setOrg(e.target.value)}>{organizations.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></label>}
 {!loading&&!organizations.length&&!error&&<p>Registra primero una empresa en KOWI Business.</p>}
 {canWrite&&!loading&&<form noValidate onSubmit={create} className="glass grid gap-4 rounded-xl p-5 md:grid-cols-2">
 <label>Nombre del agente<input className={field} required minLength={2} maxLength={120} disabled={busy} value={name} onChange={e=>setName(e.target.value)}/></label>
 <label>Contacto público<input className={field} maxLength={300} disabled={busy} value={contact} onChange={e=>setContact(e.target.value)}/></label>
 <label>Descripción de la empresa<textarea className={field} maxLength={1200} disabled={busy} value={description} onChange={e=>setDescription(e.target.value)}/></label>
 <label>Horarios confirmados<textarea className={field} maxLength={700} disabled={busy} value={hours} onChange={e=>setHours(e.target.value)}/></label>
 <label className="md:col-span-2">Políticas confirmadas<textarea className={field} maxLength={1500} disabled={busy} value={policies} onChange={e=>setPolicies(e.target.value)}/></label>
 <fieldset className="space-y-3 md:col-span-2"><legend>Productos y servicios confirmados</legend><p className="text-sm">Deja el precio vacío cuando no esté confirmado. El agente deberá reconocer que lo desconoce.</p>{services.map((service,index)=><div key={index} className="grid gap-3 md:grid-cols-3"><label>Producto o servicio<input className={field} required maxLength={100} disabled={busy} value={service.name} onChange={e=>setServices(old=>old.map((item,i)=>i===index?{...item,name:e.target.value}:item))}/></label><label>Precio confirmado<input className={field} maxLength={120} disabled={busy} value={service.price} onChange={e=>setServices(old=>old.map((item,i)=>i===index?{...item,price:e.target.value}:item))}/></label><button type="button" disabled={busy} onClick={()=>setServices(old=>old.filter((_,i)=>i!==index))}>Retirar producto {index+1}</button></div>)}<button type="button" className="rounded-xl border border-white/20 p-3" disabled={busy||services.length>=30} onClick={()=>setServices(old=>[...old,{name:'',price:''}])}>Añadir producto o servicio</button></fieldset>
 <fieldset className="space-y-3 md:col-span-2"><legend>Conocimiento autorizado: preguntas frecuentes</legend>{faq.map((item,index)=><div key={index} className="grid gap-3 md:grid-cols-2"><label>Pregunta<input className={field} required maxLength={200} disabled={busy} value={item.question} onChange={e=>setFaq(old=>old.map((row,i)=>i===index?{...row,question:e.target.value}:row))}/></label><label>Respuesta confirmada<textarea className={field} required maxLength={600} disabled={busy} value={item.answer} onChange={e=>setFaq(old=>old.map((row,i)=>i===index?{...row,answer:e.target.value}:row))}/></label><button type="button" disabled={busy} onClick={()=>setFaq(old=>old.filter((_,i)=>i!==index))}>Retirar pregunta {index+1}</button></div>)}<button type="button" className="rounded-xl border border-white/20 p-3" disabled={busy||faq.length>=25} onClick={()=>setFaq(old=>[...old,{question:'',answer:''}])}>Añadir pregunta frecuente</button></fieldset>
 <button type="submit" className="rounded-xl bg-[#e8b37b] p-3 text-black disabled:opacity-50" disabled={busy}>{busy?'Registrando agente…':'Registrar agente en DRAFT'}</button>
 </form>}
 {!loading&&org&&<ul className="space-y-3">{agents.map(agent=><li key={agent.id} className="glass flex flex-wrap items-center justify-between gap-4 rounded-xl p-5"><div><h2 className="font-semibold">{agent.name}</h2><p className="text-sm">{agent.status.toUpperCase()}</p>{agent.config?.synthetic===true&&<p className="mt-2 text-sm">Registro de prueba sintético. No acredita una conversación de IA ni un cliente real.</p>}<Link href={'/business/agent-chat?organization_id='+org+'&agent_id='+agent.id} className="mt-2 inline-block underline">Conversación e historial</Link></div>{canWrite&&agent.status!=='terminated'&&<div className="flex gap-3">{agent.status!=='revoked'&&<button className="rounded-lg border border-white/20 p-3" disabled={busy} onClick={()=>change(agent,'revoked')}>Revocar</button>}<button className="rounded-lg border border-white/20 p-3" disabled={busy} onClick={()=>change(agent,'terminated')}>Terminar</button></div>}</li>)}</ul>}
 <Link href="/control-center" className="inline-block underline">Control Center</Link>
 </div></main>;
}
