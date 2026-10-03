'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {api} from '@/lib/api';
import {organizationSchema,type OrganizationSummary} from '@/lib/organization-schema';
export default function OrganizationSetup(){
 const [rows,setRows]=useState<OrganizationSummary[]>([]);
 const [selected,setSelected]=useState('');
 const [name,setName]=useState('');
 const [error,setError]=useState('');
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 useEffect(()=>{let active=true;api<OrganizationSummary[]>('/api/organizations').then(data=>{if(active){setRows(data);setSelected(data[0]?.id||'');}}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[]);
 async function create(event:React.FormEvent){
  event.preventDefault();if(busy)return;
  const parsed=organizationSchema.safeParse({name});if(!parsed.success){setError('Revisa el nombre de tu empresa.');return;}
  setBusy(true);setError('');
  try{const row=await api<OrganizationSummary>('/api/organizations',{method:'POST',body:JSON.stringify(parsed.data)});setRows(old=>[...old,row]);setSelected(row.id);setName('');}catch(e){setError(e instanceof Error?e.message:'No se pudo crear la empresa.');}finally{setBusy(false);}
 }
 const field='mt-2 w-full rounded-xl border border-white/20 bg-[#102b22] p-3 text-white';
 return <section className="glass space-y-4 rounded-[1.7rem] p-6">
  <h2 className="text-2xl font-semibold">Tus empresas</h2>
  <p className="text-sm text-[#a9c1b3]">Registra tu organización. La configuración y las conversaciones del panel actual conservan su espacio por cuenta; todavía no se vinculan a esta selección.</p>
  {loading&&<p role="status">Cargando empresas…</p>}
  {error&&<p role="alert">{error}</p>}
  {!!rows.length&&<label className="block">Empresa<select className={field} value={selected} disabled={busy||loading} onChange={e=>setSelected(e.target.value)}>{rows.map(row=><option key={row.id} value={row.id}>{row.name}</option>)}</select></label>}
  {!loading&&!rows.length&&!error&&<p>Aún no hay empresas registradas.</p>}
  <form onSubmit={create} className="flex flex-col gap-3 md:flex-row md:items-end"><label className="flex-1">Nombre de la empresa<input className={field} required minLength={2} maxLength={120} value={name} disabled={busy||loading} onChange={e=>setName(e.target.value)}/></label><button disabled={busy||loading} className="rounded-xl bg-[#e8b37b] px-5 py-3 font-semibold text-black disabled:opacity-50">{busy?'Creando…':'Crear empresa'}</button></form>
  {selected&&<Link href={'/business/crm-org?organization_id='+encodeURIComponent(selected)} className="mr-5 inline-block underline">Abrir CRM de esta empresa</Link>}
  {selected&&<><Link href={'/business/agents?organization_id='+encodeURIComponent(selected)} className="mr-5 inline-block underline">Agentes</Link><Link href={'/business/intelligence?organization_id='+encodeURIComponent(selected)} className="mr-5 inline-block underline">Intelligence</Link></>}
  <Link href="/control-center" className="inline-block underline">Ver registros de tus empresas</Link>
 </section>;
}
