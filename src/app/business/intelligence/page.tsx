'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {api} from '@/lib/api';
type Organization={id:string;name:string};
type Intelligence={organization:Organization;observed:{counts:Record<string,number>;pipeline:{id:string;name:string;count:number}[];observedAt:string};interpretation:string;recommendations:string[];unobserved:string[];limitations:string[]};
export default function Page(){
 const [organizations,setOrganizations]=useState<Organization[]>([]),[org,setOrg]=useState('');
 const [data,setData]=useState<Intelligence|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true);
 useEffect(()=>{let active=true;api<Organization[]>('/api/organizations').then(rows=>{if(active){setOrganizations(rows);const selected=new URLSearchParams(window.location.search).get('organization_id');setOrg(rows.find(o=>o.id===selected)?.id||rows[0]?.id||'');}}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[]);
 useEffect(()=>{if(!org)return;let active=true;setData(null);setError('');setLoading(true);api<Intelligence>('/api/intelligence?organization_id='+org).then(result=>{if(active)setData(result);}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[org]);
 const labels:Record<string,string>={contacts:'Contactos',leads:'Leads',opportunities:'Oportunidades',tasks:'Tareas'};
 return <main className="kowi-shell min-h-screen p-5 text-white md:p-10"><div className="mx-auto max-w-5xl space-y-6"><Link href="/business#crear" className="underline">KOWI Business</Link><h1 className="text-3xl">KOWI Intelligence</h1><p>Datos registrados, interpretación y recomendaciones para decidir.</p>
 {!!organizations.length&&<label className="block">Empresa<select className="ml-3 rounded-xl bg-[#102b22] p-3" value={org} disabled={loading} onChange={e=>setOrg(e.target.value)}>{organizations.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></label>}
 {loading&&<p role="status">Observando registros…</p>}{error&&<p role="alert">{error}</p>}
 {!loading&&!organizations.length&&!error&&<p>Registra una empresa para comenzar.</p>}
 {data&&<>
 <section className="glass rounded-xl p-5"><h2 className="text-xl">DATOS OBSERVADOS</h2><div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">{Object.entries(data.observed.counts).map(([key,count])=><p key={key}>{labels[key]||key}: <strong>{count}</strong></p>)}</div><ul className="mt-5 flex flex-wrap gap-4">{data.observed.pipeline.map(stage=><li key={stage.id}>{stage.name}: {stage.count}</li>)}</ul><p className="mt-4 text-sm">Consulta: {data.observed.observedAt}</p></section>
 <section className="glass rounded-xl p-5"><h2 className="text-xl">INTERPRETACIÓN</h2><p className="mt-3">{data.interpretation}</p></section>
 <section className="glass rounded-xl p-5"><h2 className="text-xl">RECOMENDACIÓN</h2><ul className="mt-3 space-y-2">{data.recommendations.map(item=><li key={item}>{item}</li>)}</ul><p className="mt-4 text-sm">Estas recomendaciones no ejecutan cambios.</p><Link href={'/business/crm-org?organization_id='+org} className="mt-4 inline-block underline">Revisar CRM</Link></section>
 <section className="glass rounded-xl p-5"><h2 className="text-xl">Cobertura y límites</h2><p className="mt-3">Sin medición: {data.unobserved.join(', ')}.</p>{data.limitations.map(item=><p className="mt-3 text-sm" key={item}>{item}</p>)}</section>
 </>}
 </div></main>;
}
