'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {api} from '@/lib/api';
type Row={id:string;name?:string;title?:string;stage_id?:string;status?:string};
const entities=['contacts','leads','opportunities','tasks'] as const;
type Entity=typeof entities[number];
const labels={contacts:'Contactos',leads:'Leads',opportunities:'Oportunidades',tasks:'Tareas'};
const empty:Record<Entity,Row[]>={contacts:[],leads:[],opportunities:[],tasks:[]};
export default function Page(){
 const [orgs,setOrgs]=useState<Row[]>([]),[org,setOrg]=useState(''),[entity,setEntity]=useState<Entity>('contacts');
 const [rows,setRows]=useState(empty),[stages,setStages]=useState<Row[]>([]);
 const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [title,setTitle]=useState(''),[contact,setContact]=useState(''),[lead,setLead]=useState(''),[stage,setStage]=useState(''),[opportunity,setOpportunity]=useState('');
 const [email,setEmail]=useState(''),[phone,setPhone]=useState(''),[consent,setConsent]=useState(false);
 useEffect(()=>{let active=true;api<Row[]>('/api/organizations').then(data=>{if(active){setOrgs(data);const wanted=new URLSearchParams(window.location.search).get('organization_id');setOrg(data.find(o=>o.id===wanted)?.id||data[0]?.id||'');}}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[]);
 useEffect(()=>{if(!org)return;let active=true;setLoading(true);setError('');setRows(empty);setStages([]);setContact('');setLead('');setOpportunity('');setStage('');
 Promise.all([...entities.map(e=>api<{items:Row[]}>('/api/crm/'+e+'?organization_id='+org)),api<{items:Row[]}>('/api/crm-stages?organization_id='+org)]).then(data=>{if(active){setRows({contacts:data[0].items,leads:data[1].items,opportunities:data[2].items,tasks:data[3].items});setStages(data[4].items);setStage(data[4].items[0]?.id||'');}}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[org]);
 async function save(event:React.FormEvent){event.preventDefault();if(busy)return;setBusy(true);setError('');
 const payload=entity==='contacts'?{name:title,email,phone,consent}:entity==='leads'?{title,contact_id:contact||null}:entity==='opportunities'?{title,contact_id:contact||null,lead_id:lead||null,stage_id:stage}:{title,contact_id:contact||null,opportunity_id:opportunity||null};
 try{const data=await api<{item:Row}>('/api/crm/'+entity+'?organization_id='+org,{method:'POST',body:JSON.stringify(payload)});setRows(old=>({...old,[entity]:[data.item,...old[entity]]}));setTitle('');setEmail('');setPhone('');setConsent(false);}catch(e){setError(e instanceof Error?e.message:'No se pudo guardar.');}finally{setBusy(false);}}
 async function update(id:string,changes:object){if(busy)return;setBusy(true);setError('');try{const data=await api<{item:Row}>('/api/crm/'+entity+'?organization_id='+org,{method:'PATCH',body:JSON.stringify({id,changes})});setRows(old=>({...old,[entity]:old[entity].map(row=>row.id===id?data.item:row)}));}catch(e){setError(e instanceof Error?e.message:'No se pudo actualizar.');}finally{setBusy(false);}}
 const field='mt-2 w-full rounded-xl border border-white/20 bg-[#102b22] p-3';
 function relation(label:string,value:string,set:(s:string)=>void,list:Row[]){return <label>{label}<select className={field} disabled={busy} value={value} onChange={e=>set(e.target.value)}><option value="">Sin relación</option>{list.map(row=><option key={row.id} value={row.id}>{row.name||row.title}</option>)}</select></label>;}
 return <main className="kowi-shell min-h-screen p-5 text-white md:p-10"><div className="mx-auto max-w-5xl space-y-6">
 <Link className="underline" href="/business#crear">KOWI Business</Link><h1 className="text-3xl">CRM de tu empresa</h1>
 {error&&<p role="alert">{error}</p>}{loading&&<p role="status">Cargando…</p>}
 {!!orgs.length&&<label className="block">Empresa<select className={field} disabled={busy||loading} value={org} onChange={e=>setOrg(e.target.value)}>{orgs.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></label>}
 {!loading&&!orgs.length&&!error&&<p>Registra una empresa desde KOWI Business.</p>}
 {org&&!loading&&!error&&<>
 <nav className="flex flex-wrap gap-3">{entities.map(e=><button className="rounded-xl border border-white/20 p-3" disabled={busy} aria-pressed={entity===e} key={e} onClick={()=>{setEntity(e);setTitle('');}}>{labels[e]}</button>)}</nav>
 <Link href={'/business/pipeline?organization_id='+org} className="inline-block underline">Configurar nombres del pipeline</Link>
 <p className="text-sm">Los permisos de tu empresa determinan qué cambios puedes guardar.</p>
 <form onSubmit={save} className="glass grid gap-4 rounded-xl p-5 md:grid-cols-2">
 <label>{entity==='contacts'?'Nombre':'Título'}<input className={field} disabled={busy} required maxLength={160} value={title} onChange={e=>setTitle(e.target.value)}/></label>
 {entity==='contacts'?<><label>Correo<input className={field} type="email" disabled={busy} value={email} maxLength={254} onChange={e=>setEmail(e.target.value)}/></label><label>Teléfono<input className={field} disabled={busy} value={phone} maxLength={40} onChange={e=>setPhone(e.target.value)}/></label><label><input type="checkbox" disabled={busy} checked={consent} onChange={e=>setConsent(e.target.checked)}/> Consentimiento de seguimiento registrado</label></>:relation('Contacto',contact,setContact,rows.contacts)}
 {entity==='opportunities'&&<>{relation('Lead',lead,setLead,rows.leads)}<label>Etapa<select className={field} disabled={busy} required value={stage} onChange={e=>setStage(e.target.value)}>{stages.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label></>}
 {entity==='tasks'&&relation('Oportunidad',opportunity,setOpportunity,rows.opportunities)}
 <button className="rounded-xl bg-[#e8b37b] p-3 text-black disabled:opacity-50" disabled={busy}>Crear registro</button>
 </form>
 {!rows[entity].length?<p>Aún no hay registros.</p>:<ul className="space-y-3">{rows[entity].map(row=><li key={row.id} className="glass flex flex-wrap items-center justify-between gap-4 rounded-xl p-4"><span>{row.name||row.title}</span>{entity==='opportunities'&&<select className="rounded-xl bg-[#102b22] p-3" aria-label={'Etapa de '+row.title} value={row.stage_id} disabled={busy} onChange={e=>update(row.id,{stage_id:e.target.value})}>{stages.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>}{entity==='tasks'&&<select className="rounded-xl bg-[#102b22] p-3" aria-label={'Estado de '+row.title} value={row.status} disabled={busy} onChange={e=>update(row.id,{status:e.target.value})}><option value="open">Pendiente</option><option value="done">Completada</option><option value="cancelled">Cancelada</option></select>}</li>)}</ul>}
 <p className="text-sm text-[#a9c1b3]">Hasta 200 registros recientes por sección. La selección de empresa se aplica a este CRM. El historial del panel anterior conserva su espacio original.</p>
 </>}
 </div></main>;
}
