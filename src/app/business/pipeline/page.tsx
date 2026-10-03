'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {api} from '@/lib/api';
type Stage={id:string;name:string;position:number;outcome:string};
export default function Page(){
 const [organizations,setOrganizations]=useState<{id:string;name:string}[]>([]),[org,setOrg]=useState('');
 const [stages,setStages]=useState<Stage[]>([]),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 useEffect(()=>{let active=true;api<{id:string;name:string}[]>('/api/organizations').then(rows=>{if(active){setOrganizations(rows);const requested=new URLSearchParams(window.location.search).get('organization_id');setOrg(rows.find(o=>o.id===requested)?.id||rows[0]?.id||'');}}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[]);
 useEffect(()=>{if(!org)return;let active=true;setLoading(true);setStages([]);setError('');setNotice('');api<{items:Stage[]}>('/api/crm-stages?organization_id='+org).then(data=>{if(active)setStages(data.items);}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[org]);
 async function save(event:React.FormEvent,stage:Stage){event.preventDefault();if(busy)return;setBusy(true);setError('');setNotice('');try{await api('/api/crm-stages?organization_id='+org,{method:'PATCH',body:JSON.stringify({id:stage.id,name:stage.name})});setNotice('Nombre de etapa guardado.');}catch(e){setError(e instanceof Error?e.message:'No se pudo guardar.');}finally{setBusy(false);}}
 return <main className="kowi-shell min-h-screen p-5 text-white md:p-10"><div className="mx-auto max-w-3xl space-y-6"><Link href="/business#crear" className="underline">KOWI Business</Link><h1 className="text-3xl">Configurar pipeline</h1><p>Personaliza nombres para tu actividad. Ganado y perdido conservan su significado para los resultados.</p>{loading&&<p role="status">Cargando…</p>}{error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
 {!!organizations.length&&<label className="block">Empresa<select className="ml-3 rounded-xl bg-[#102b22] p-3" disabled={busy||loading} value={org} onChange={e=>setOrg(e.target.value)}>{organizations.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></label>}
 {stages.map(stage=><form key={stage.id} onSubmit={e=>save(e,stage)} className="glass flex flex-wrap items-end gap-4 rounded-xl p-4"><label className="flex-1">Etapa {stage.position+1}<input className="mt-2 w-full rounded-xl bg-[#102b22] p-3" required maxLength={80} disabled={busy} value={stage.name} onChange={e=>setStages(old=>old.map(s=>s.id===stage.id?{...s,name:e.target.value}:s))}/></label><button className="rounded-xl border border-white/20 p-3" disabled={busy}>Guardar</button></form>)}
 {org&&<Link href={'/business/crm-org?organization_id='+org} className="inline-block underline">Volver al CRM</Link>}
 </div></main>;
}
