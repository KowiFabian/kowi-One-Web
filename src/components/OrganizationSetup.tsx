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
 const [notice,setNotice]=useState('');
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 useEffect(()=>{let active=true;api<OrganizationSummary[]>('/api/organizations').then(data=>{if(active){setRows(data);setSelected(data[0]?.id||'');}}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[]);
 async function create(event:React.FormEvent){
  event.preventDefault();if(busy)return;
  setError('');setNotice('');
  const parsed=organizationSchema.safeParse({name});
  if(!parsed.success){setError('Escribe un nombre válido de entre 2 y 120 caracteres para tu empresa.');return;}
  setBusy(true);
  try{
    const row=await api<OrganizationSummary>('/api/organizations',{method:'POST',body:JSON.stringify(parsed.data)});
    try{
      const fresh=await api<OrganizationSummary[]>('/api/organizations');
      if(!fresh.some(item=>item.id===row.id)){
        setError('El registro todavía no aparece en tu cuenta. Actualiza la página antes de volver a intentarlo.');
        return;
      }
      setRows(fresh);setSelected(row.id);setName('');
      setNotice('Empresa guardada y comprobada.');
    }catch{
      setError('La empresa pudo registrarse, pero no se pudo verificar. Actualiza la página antes de intentar crearla otra vez.');
    }
  }catch(e){setError(e instanceof Error?e.message:'No se pudo crear la empresa.');}
  finally{setBusy(false);}
 }
 const field='mt-2 w-full rounded-xl border border-white/20 bg-[#102b22] p-3 text-white';
 return <section className="glass space-y-4 rounded-[1.7rem] p-6">
  <h2 className="text-2xl font-semibold">Tus empresas</h2>
  <p className="text-sm text-[#a9c1b3]">Selecciona tu organización y utiliza los accesos de esta sección para trabajar con su agente, CRM, director y evidencias. La conversación empresarial de estos accesos queda vinculada a la empresa seleccionada.</p>
  {loading&&<p role="status">Cargando empresas…</p>}

  {!!rows.length&&<label className="block">Empresa<select className={field} value={selected} disabled={busy||loading} onChange={e=>setSelected(e.target.value)}>{rows.map(row=><option key={row.id} value={row.id}>{row.name}</option>)}</select></label>}
  {!loading&&!rows.length&&!error&&<p>Aún no hay empresas registradas.</p>}
  <form noValidate onSubmit={create} className="space-y-3">
   <div className="flex flex-col gap-3 md:flex-row md:items-end">
     <label className="flex-1">Nombre de la empresa
       <input className={field} required minLength={2} maxLength={120} value={name} disabled={busy||loading}
         aria-invalid={!!error} aria-describedby={error?'setup-create-error':undefined}
         onChange={e=>{setName(e.target.value);setError('');setNotice('');}}/>
     </label>
     <button disabled={busy||loading} className="rounded-xl bg-[#e8b37b] px-5 py-3 font-semibold text-black disabled:opacity-50">{busy?'Comprobando registro…':'Crear empresa'}</button>
   </div>
   {error&&<p id="setup-create-error" role="alert" aria-live="assertive" className="rounded-xl border border-red-400 bg-red-950/80 p-3 text-sm font-medium text-red-100">{error}</p>}
   {notice&&<p role="status" className="rounded-xl border border-emerald-400/50 bg-emerald-950/60 p-3 text-sm text-emerald-100">{notice}</p>}
 </form>
  {selected&&<div className="flex flex-wrap gap-3"><Link href={'/business/agent-chat?organization_id='+encodeURIComponent(selected)} className="inline-block rounded-xl bg-[#e8b37b] px-5 py-3 font-semibold text-black">Conversación IA de esta empresa ↗</Link><Link href={'/business/director?organization_id='+encodeURIComponent(selected)} className="inline-block rounded-xl border border-[#e8b37b] px-5 py-3">Abrir KOWI Director</Link><Link href="/app" className="inline-block rounded-xl border border-white/30 px-5 py-3">Mi espacio instalable</Link></div>}
  {selected&&<Link href={'/business/crm-org?organization_id='+encodeURIComponent(selected)} className="mr-5 inline-block underline">Abrir CRM de esta empresa</Link>}
  {selected&&<><Link href={'/business/agents?organization_id='+encodeURIComponent(selected)} className="mr-5 inline-block underline">Agentes</Link><Link href={'/business/intelligence?organization_id='+encodeURIComponent(selected)} className="mr-5 inline-block underline">Intelligence</Link></>}
  {selected&&<Link href={'/business/jobs?organization_id='+encodeURIComponent(selected)} className="mr-5 inline-block underline">Trabajos y evidencias</Link>}
  <Link href="/control-center" className="inline-block underline">Ver registros de tus empresas</Link>
 </section>;
}
