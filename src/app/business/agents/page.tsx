'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {api} from '@/lib/api';
import {businessConfigSchema} from '@/lib/business-schema';
type Organization={id:string;name:string};
type Agent={id:string;name:string;status:string};
export default function Page(){
 const [organizations,setOrganizations]=useState<Organization[]>([]),[org,setOrg]=useState('');
 const [agents,setAgents]=useState<Agent[]>([]),[role,setRole]=useState(''),[error,setError]=useState('');
 const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false);
 const [name,setName]=useState('KOWI Comercial'),[description,setDescription]=useState(''),[contact,setContact]=useState(''),[hours,setHours]=useState(''),[policies,setPolicies]=useState('');
 useEffect(()=>{let active=true;api<Organization[]>('/api/organizations').then(data=>{if(active){setOrganizations(data);const selected=new URLSearchParams(window.location.search).get('organization_id');setOrg(data.find(o=>o.id===selected)?.id||data[0]?.id||'');}}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[]);
 useEffect(()=>{if(!org)return;let active=true;setLoading(true);setError('');setAgents([]);setRole('');
 api<{items:Agent[];role:string}>('/api/organization-agents?organization_id='+org).then(data=>{if(active){setAgents(data.items);setRole(data.role);}}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[org]);
 const canWrite=['owner','admin','configurator'].includes(role);
 async function create(event:React.FormEvent){event.preventDefault();if(busy)return;setError('');
 const config=businessConfigSchema.safeParse({name:organizations.find(o=>o.id===org)?.name||'',sector:'otro',description,contact,hours,policies,escalation:'Derivar los datos no confirmados al responsable de la empresa.',team:'',services:[],faq:[],tone:'Claro y cercano',automaticActions:['answer_faq','qualify']});
 if(!config.success){setError('Revisa la información de la empresa.');return;}setBusy(true);
 try{const data=await api<Agent>('/api/organization-agents?organization_id='+org,{method:'POST',body:JSON.stringify({name,config:config.data})});setAgents(old=>[...old,data]);}catch(e){setError(e instanceof Error?e.message:'No se pudo registrar.');}finally{setBusy(false);}}
 async function change(agent:Agent,status:string){if(busy)return;
 if(!window.confirm(status==='terminated'?'¿Terminar este agente definitivamente? Se conservarán sus registros y evidencias.':'¿Revocar este agente? No podrá reactivarse y se conservará su evidencia.'))return;
 setBusy(true);setError('');try{const data=await api<Agent>('/api/organization-agents?organization_id='+org,{method:'PATCH',body:JSON.stringify({id:agent.id,status})});setAgents(old=>old.map(row=>row.id===data.id?data:row));}catch(e){setError(e instanceof Error?e.message:'No se pudo cambiar el estado.');}finally{setBusy(false);}}
 const field='mt-2 w-full rounded-xl border border-white/20 bg-[#102b22] p-3';
 return <main className="kowi-shell min-h-screen p-5 text-white md:p-10"><div className="mx-auto max-w-5xl space-y-6">
 <Link href="/business#crear" className="underline">KOWI Business</Link><h1 className="text-3xl">Agentes de tu empresa</h1>
 <p>Registra identidad y configuración empresarial. Las nuevas instalaciones quedan en DRAFT. Prueba una conversación privada y verifica sus resultados antes de activar el agente. Los canales externos requieren verificación separada.</p>
 {loading&&<p role="status">Cargando…</p>}{error&&<p role="alert">{error}</p>}
 {!!organizations.length&&<label className="block">Empresa<select className={field} disabled={busy||loading} value={org} onChange={e=>setOrg(e.target.value)}>{organizations.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></label>}
 {!loading&&!organizations.length&&!error&&<p>Registra primero una empresa en KOWI Business.</p>}
 {canWrite&&!loading&&<form onSubmit={create} className="glass grid gap-4 rounded-xl p-5 md:grid-cols-2">
 <label>Nombre del agente<input className={field} required minLength={2} maxLength={120} disabled={busy} value={name} onChange={e=>setName(e.target.value)}/></label>
 <label>Contacto público<input className={field} maxLength={300} disabled={busy} value={contact} onChange={e=>setContact(e.target.value)}/></label>
 <label>Descripción de la empresa<textarea className={field} maxLength={1200} disabled={busy} value={description} onChange={e=>setDescription(e.target.value)}/></label>
 <label>Horarios confirmados<textarea className={field} maxLength={700} disabled={busy} value={hours} onChange={e=>setHours(e.target.value)}/></label>
 <label className="md:col-span-2">Políticas confirmadas<textarea className={field} maxLength={1500} disabled={busy} value={policies} onChange={e=>setPolicies(e.target.value)}/></label>
 <button className="rounded-xl bg-[#e8b37b] p-3 text-black disabled:opacity-50" disabled={busy}>Registrar agente en DRAFT</button>
 </form>}
 {!loading&&org&&<ul className="space-y-3">{agents.map(agent=><li key={agent.id} className="glass flex flex-wrap items-center justify-between gap-4 rounded-xl p-5"><div><h2 className="font-semibold">{agent.name}</h2><p className="text-sm">{agent.status.toUpperCase()}</p><Link href={'/business/agent-chat?organization_id='+org+'&agent_id='+agent.id} className="mt-2 inline-block underline">Conversación e historial</Link></div>{canWrite&&agent.status!=='terminated'&&<div className="flex gap-3">{agent.status!=='revoked'&&<button className="rounded-lg border border-white/20 p-3" disabled={busy} onClick={()=>change(agent,'revoked')}>Revocar</button>}<button className="rounded-lg border border-white/20 p-3" disabled={busy} onClick={()=>change(agent,'terminated')}>Terminar</button></div>}</li>)}</ul>}
 <Link href="/control-center" className="inline-block underline">Control Center</Link>
 </div></main>;
}
