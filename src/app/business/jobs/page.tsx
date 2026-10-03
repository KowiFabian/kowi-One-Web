'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {api} from '@/lib/api';
type Organization={id:string;name:string};
type Job={job_id:string;objective:string;status:string;risk_level:string;steps_used:number;budget:{max_steps:number};started_at:string|null;completed_at:string|null;evidence:Record<string,unknown>;result:Record<string,unknown>};
export default function Page(){
 const [organizations,setOrganizations]=useState<Organization[]>([]),[org,setOrg]=useState('');
 const [jobs,setJobs]=useState<Job[]|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[refresh,setRefresh]=useState(0);
 useEffect(()=>{let active=true;api<Organization[]>('/api/organizations').then(data=>{if(active){setOrganizations(data);const selected=new URLSearchParams(window.location.search).get('organization_id');setOrg(data.find(o=>o.id===selected)?.id||data[0]?.id||'');}}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[]);
 useEffect(()=>{if(!org)return;let active=true;setJobs(null);setError('');setLoading(true);api<{items:Job[]}>('/api/agent-jobs?organization_id='+org).then(data=>{if(active)setJobs(data.items);}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[org,refresh]);
 const labels:Record<string,string>={running:'En curso',completed:'Respuesta guardada',failed:'No completado',cancelled:'Cancelado',timed_out:'Tiempo límite'};
 return <main className="kowi-shell min-h-screen p-5 text-white md:p-10"><div className="mx-auto max-w-5xl space-y-6">
 <Link href="/business#crear" className="underline">KOWI Business</Link><h1 className="text-3xl">Trabajos y evidencias del agente</h1><p>Seguimiento de consultas privadas de IA. Los estados describen la ejecución técnica; no acreditan una venta o resultado comercial.</p>
 {loading&&<p role="status">Cargando…</p>}{error&&<p role="alert">{error}</p>}
 {!!organizations.length&&<div className="flex flex-wrap gap-4"><label>Empresa<select className="ml-3 rounded-xl bg-[#102b22] p-3" value={org} disabled={loading} onChange={e=>setOrg(e.target.value)}>{organizations.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></label><button className="rounded-xl border border-white/20 p-3" disabled={loading} onClick={()=>setRefresh(n=>n+1)}>Actualizar</button></div>}
 {jobs?.length===0&&<p>No hay trabajos registrados.</p>}
 {jobs?.map(job=><article key={job.job_id} className="glass space-y-3 rounded-xl p-5"><h2 className="text-xl">{labels[job.status]||job.status}</h2><p>{job.objective}</p><p className="text-sm">Riesgo: {job.risk_level}. Intentos iniciados: {job.steps_used} de {job.budget.max_steps}.</p><p className="break-words text-sm">Inicio: {job.started_at||'No observado'}. Finalización: {job.completed_at||'No registrada'}.</p><details><summary className="cursor-pointer">Ver evidencia técnica</summary><p className="mt-3 break-all text-sm">Trabajo: {job.job_id}</p><pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-all text-xs">{JSON.stringify({evidence:job.evidence,result:job.result},null,2)}</pre></details></article>)}
 </div></main>;
}
