'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {api} from '@/lib/api';

type Org={id:string;name:string};
type Inbox={id:string;sender_e164:string;message_text:string;received_at:string;expires_at:string};
type Outbound={inbox_id:string;status:string;provider_message_id:string|null};
type Response={messages:Inbox[];outbox:Outbound[];mode:string};
export default function WhatsAppTest(){
 const [orgs,setOrgs]=useState<Org[]>([]),[org,setOrg]=useState('');
 const [data,setData]=useState<Response|null>(null),[reply,setReply]=useState<Record<string,string>>({});
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 useEffect(()=>{let live=true;api<Org[]>('/api/organizations').then(rows=>{
  if(!live)return;setOrgs(rows);const selected=new URLSearchParams(location.search).get('organization_id');
  setOrg(rows.find(o=>o.id===selected)?.id||rows[0]?.id||'');
 }).catch(e=>{if(live)setError(e.message);});return()=>{live=false;};},[]);
 async function refresh(selected=org){
  if(!selected)return;setBusy(true);setError('');
  try{setData(await api<Response>('/api/integrations/whatsapp/pilot?organization_id='+encodeURIComponent(selected)));}
  catch(e){setData(null);setError(e instanceof Error?e.message:'No se pudo consultar el piloto.');}
  finally{setBusy(false);}
 }
 useEffect(()=>{setData(null);if(org)void refresh(org);},[org]);
 async function send(message:Inbox){
  const text=reply[message.id]?.trim();
  if(!text||busy)return;
  if(!confirm('Enviar esta respuesta desde el número de PRUEBA de Meta a '+message.sender_e164+'? Esta acción externa requiere tu autorización.'))return;
  setBusy(true);setError('');setNotice('');
  try{await api('/api/integrations/whatsapp/pilot?organization_id='+encodeURIComponent(org),{
   method:'POST',body:JSON.stringify({messageId:message.id,reply:text,approved:true}),
  });setNotice('Meta confirmó la recepción del envío. Comprueba que el mensaje llega al WhatsApp de prueba.');
  }catch(e){setError(e instanceof Error?e.message:'No se pudo verificar el envío.');}
  finally{setBusy(false);void refresh(org);}
 }
 return <main className="kowi-shell min-h-screen p-5 text-white"><div className="mx-auto max-w-3xl space-y-5">
 <header className="flex items-center justify-between gap-3"><h1 className="text-2xl font-semibold">WhatsApp · Piloto Meta</h1><Link href="/business/app" className="underline">Volver a Business</Link></header>
 <p className="rounded-xl border border-amber-400/40 p-4 text-sm">Prueba privada: ningún número de cliente ni tu WhatsApp personal se migra. No existe respuesta automática. Cada envío exige aprobación explícita.</p>
 {!!orgs.length&&<label className="block">Empresa autorizada<select className="mt-2 block w-full rounded-xl bg-[#102b22] p-3" value={org} onChange={e=>setOrg(e.target.value)}>
 {orgs.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></label>}
 <button type="button" className="rounded-xl border border-white/30 px-5 py-3 disabled:opacity-50" disabled={busy||!org} onClick={()=>void refresh()}>Actualizar mensajes</button>
 {error&&<p role="alert" className="rounded-xl border-2 border-red-400 bg-red-950 p-4">{error}</p>}
 {notice&&<p role="status" className="rounded-xl border border-white/30 p-4">{notice}</p>}
 {data&&!data.messages.length&&<p>No hay mensajes de prueba registrados.</p>}
 {data?.messages.map(m=>{const sent=data.outbox.find(o=>o.inbox_id===m.id);
  return <section className="space-y-3 rounded-2xl border border-white/25 p-5" key={m.id}>
  <p className="text-sm text-[#d3e7d9]">Remitente de prueba: {m.sender_e164} · {new Date(m.received_at).toLocaleString('es-ES')}</p>
  <p className="whitespace-pre-wrap break-words">{m.message_text}</p>
  {sent?<p role="status">Envío: {sent.status==='sent'?'Meta aceptó la respuesta':sent.status==='uncertain'?'Resultado incierto: revisar Meta, no reenviar':'Procesando. No reintentar.'}</p>:
  <form onSubmit={e=>{e.preventDefault();void send(m);}} className="space-y-3">
   <label className="block">Respuesta revisada<input className="mt-2 w-full rounded-xl bg-[#102b22] p-3" required maxLength={1000}
    value={reply[m.id]??''} onChange={e=>setReply(v=>({...v,[m.id]:e.target.value}))}
    placeholder="Gracias por escribir a KOWI IA. ¿En qué podemos ayudarte?"/></label>
   <button type="submit" className="rounded-xl bg-[#e8b37b] px-4 py-3 text-black disabled:opacity-50" disabled={busy||!reply[m.id]?.trim()}>Aprobar y enviar por Meta</button>
  </form>}
  </section>;
 })}
 </div></main>;
}
