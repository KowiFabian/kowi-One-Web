'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {api} from '@/lib/api';
import {CONTROLLED_EMAIL_SUBJECT,CONTROLLED_EMAIL_BODY} from '@/lib/controlled-email-test';
type Organization={id:string;name:string};
type Action={id:string;status:string;payload:{to:string;subject:string;body:string;organization_id:string;conversation_id:string};approved_at:string|null;executed_at:string|null};
type Snapshot={recipient:string;sender:string|null;emailConfigured:boolean;tenantPersistenceConfigured:boolean;action:Action|null;events:{event_type:string;external_id:string;created_at:string}[]|null;receipt:{external_id:string;status:string}|null};
export default function Page(){
 const [orgs,setOrgs]=useState<Organization[]>([]),[org,setOrg]=useState(''),[conversation,setConversation]=useState('');
 const [snapshot,setSnapshot]=useState<Snapshot|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true);
 const [consent,setConsent]=useState(false),[approval,setApproval]=useState(false);
 useEffect(()=>{let active=true;Promise.all([api<Organization[]>('/api/organizations'),api<Snapshot>('/api/test-email')]).then(([organizations,data])=>{if(active){setOrgs(organizations);setSnapshot(data);const params=new URLSearchParams(window.location.search);setOrg(organizations.find(o=>o.id===params.get('organization_id'))?.id||organizations[0]?.id||'');setConversation(params.get('conversation_id')||'');}}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[]);
 async function refresh(){setSnapshot(await api<Snapshot>('/api/test-email'));}
 async function prepare(event:React.FormEvent){event.preventDefault();if(busy)return;setBusy(true);setError('');setApproval(false);try{await api('/api/test-email',{method:'POST',body:JSON.stringify({organization_id:org,conversation_id:conversation,consent})});await refresh();}catch(e){setError(e instanceof Error?e.message:'No se pudo preparar la prueba.');}finally{setBusy(false);}}
 async function send(){if(busy||!approval||snapshot?.action?.status!=='pending_approval')return;setBusy(true);setError('');try{await api('/api/business/actions/'+snapshot.action.id+'/approve',{method:'POST'});await refresh();setApproval(false);}catch(e){setError(e instanceof Error?e.message:'No se pudo confirmar el resultado.');try{await refresh();}catch{}}finally{setBusy(false);}}
 async function reload(){if(busy)return;setBusy(true);setError('');try{await refresh();}catch(e){setError(e instanceof Error?e.message:'No se pudo consultar.');}finally{setBusy(false);}}
 const field='mt-2 w-full rounded-xl border border-white/20 bg-[#102b22] p-3';
 const ready=snapshot?.emailConfigured&&snapshot.tenantPersistenceConfigured;
 return <main className="kowi-shell min-h-screen p-5 text-white md:p-10"><div className="mx-auto max-w-3xl space-y-6">
 <Link href="/business#crear" className="underline">KOWI Business · Entrar</Link><h1 className="text-3xl">Prueba de correo KOWI</h1>
 <p>Recorrido controlado: conversación de IA guardada → propuesta → Human Approval → envío → evidencia. El mensaje se limita al correo verificado de tu propia cuenta. No activa un canal comercial.</p>
 {loading&&<p role="status">Comprobando sesión y registros…</p>}{error&&<p role="alert">{error}</p>}
 {snapshot&&<>
 <section className="glass space-y-3 rounded-xl p-5"><h2 className="text-xl">Configuración observada</h2><p>Persistencia del backend: {snapshot.tenantPersistenceConfigured?'Configurada':'Pendiente'}. Proveedor y remitente: {snapshot.emailConfigured?'Configurados':'Pendientes'}.</p><p>Destinatario: {snapshot.recipient}. Remitente: {snapshot.sender||'No configurado'}.</p><p className="text-sm">Estas comprobaciones observan configuración; la validez de las credenciales y la entrega aún deben verificarse.</p></section>
 <Link className="inline-block underline" href={'/business/agent-chat'+(org?'?organization_id='+org:'')}>Abrir conversación privada de IA</Link>
 <form onSubmit={prepare} className="glass space-y-4 rounded-xl p-5">
 <label className="block">Organización<select className={field} value={org} disabled={busy} required onChange={e=>{setOrg(e.target.value);setConversation('');}}><option value="">Selecciona una organización</option>{orgs.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></label>
 <label className="block">Identificador de conversación guardada<input className={field} value={conversation} disabled={busy} required maxLength={36} onChange={e=>setConversation(e.target.value)}/></label>
 <p className="text-sm">Usa el enlace de prueba de correo que aparece después de una conversación empresarial guardada. Se exige Company Owner/Admin, mensaje de IA y evidencia del proveedor en esa organización.</p>
 <p>Asunto: {CONTROLLED_EMAIL_SUBJECT}</p><p>{CONTROLLED_EMAIL_BODY}</p>
 <label className="block"><input type="checkbox" checked={consent} disabled={busy} onChange={e=>setConsent(e.target.checked)}/> Consiento recibir únicamente esta prueba técnica en mi correo verificado; no es una suscripción comercial.</label>
 <button className="rounded-xl border border-white/20 p-3 disabled:opacity-50" disabled={busy||!ready||!consent}>Preparar propuesta · no envía correo</button>
 <p className="text-sm">Máximo una propuesta cada 24 horas. No se envía nada al abrir la página.</p>
 </form>
 {snapshot.action&&<section className="glass space-y-4 rounded-xl p-5"><h2 className="text-xl">Human Approval · HIGH</h2><p className="break-all">Acción: {snapshot.action.id}. Estado: {snapshot.action.status}.</p><p>Destinatario de esta acción: {snapshot.action.payload.to}</p><p>Asunto: {snapshot.action.payload.subject}</p><p>{snapshot.action.payload.body}</p>
 {snapshot.action.status==='pending_approval'&&<><label className="block"><input type="checkbox" checked={approval} disabled={busy} onChange={e=>setApproval(e.target.checked)}/> Autorizo enviar exactamente este mensaje una vez al destinatario mostrado.</label><button className="rounded-xl bg-[#e8b37b] p-3 text-black disabled:opacity-50" disabled={busy||!approval||!ready} onClick={send}>Autorizar y enviar una prueba</button></>}
 {snapshot.action.status==='approved'&&<p>La acción requiere revisión del resultado. No repitas el envío hasta comprobar su evidencia y el proveedor.</p>}
 {snapshot.receipt&&<p className="break-all">Proveedor aceptó el mensaje. Identificador: {snapshot.receipt.external_id}. Esto no prueba entrega.</p>}
 {snapshot.events===null?<p>Evidencia de entrega no observada.</p>:snapshot.events.map((event,index)=><p className="break-all text-sm" key={index}>Evento observado: {event.event_type} · {event.created_at} · {event.external_id}</p>)}
 <p className="text-sm">La entrega solo se acredita con un evento firmado del proveedor o la confirmación del destinatario. No se cambia automáticamente el canal a ACTIVE.</p></section>}
 <button className="rounded-xl border border-white/20 p-3" disabled={busy} onClick={reload}>Actualizar evidencia</button>
 </>}
 </div></main>;
}
