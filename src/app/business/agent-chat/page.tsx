'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {api} from '@/lib/api';
import {businessConfigSchema} from '@/lib/business-schema';
type Organization={id:string;name:string};
type Agent={id:string;name:string;status:string;last_verified_at?:string|null;config?:unknown};
type Message={role:string;content:string;id?:string};
type Conversation={id:string;title:string};
export default function Page(){
 const [organizations,setOrganizations]=useState<Organization[]>([]),[org,setOrg]=useState('');
 const [agents,setAgents]=useState<Agent[]>([]),[agentId,setAgentId]=useState(''),[role,setRole]=useState('');
 const [conversations,setConversations]=useState<Conversation[]>([]),[conversationId,setConversationId]=useState('');
 const [messages,setMessages]=useState<Message[]>([]),[message,setMessage]=useState('');
 const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const [contact,setContact]=useState({name:'',email:'',phone:'',consent:false,title:''});
 const requestRef=useRef<string|null>(null),captureRef=useRef<string|null>(null);
 useEffect(()=>{let active=true;api<Organization[]>('/api/organizations').then(rows=>{if(active){setOrganizations(rows);const selected=new URLSearchParams(window.location.search).get('organization_id');setOrg(rows.find(o=>o.id===selected)?.id||rows[0]?.id||'');}}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[]);
 useEffect(()=>{if(!org)return;let active=true;setLoading(true);setError('');setAgents([]);setAgentId('');setConversationId('');setMessages([]);setConversations([]);setRole('');requestRef.current=null;captureRef.current=null;
 api<{items:Agent[];role:string}>('/api/organization-agents?organization_id='+org).then(data=>{if(active){setAgents(data.items);setRole(data.role);const selected=new URLSearchParams(window.location.search).get('agent_id');setAgentId(data.items.find(a=>a.id===selected)?.id||data.items.find(a=>businessConfigSchema.safeParse(a.config).success)?.id||data.items[0]?.id||'');}}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[org]);
 useEffect(()=>{if(!org||!agentId)return;let active=true;setError('');setConversationId('');setMessages([]);setConversations([]);requestRef.current=null;captureRef.current=null;
 api<{items:Conversation[]}>('/api/organization-chat?organization_id='+org+'&agent_id='+agentId).then(data=>{if(active)setConversations(data.items);}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[org,agentId]);
 const agent=agents.find(a=>a.id===agentId);
 const configurer=['owner','admin','configurator'].includes(role);
 const validConfig=businessConfigSchema.safeParse(agent?.config).success;
 const canChat=validConfig&&!!agent&&(['active'].includes(agent.status)||(agent.status==='draft'&&configurer))&&['owner','admin','configurator','operator'].includes(role);
 async function open(id:string){if(busy)return;setBusy(true);setError('');setNotice('');setMessages([]);requestRef.current=null;captureRef.current=null;
 try{const data=await api<{messages:Message[]}>('/api/organization-chat?organization_id='+org+'&conversation_id='+id);setMessages(data.messages);setConversationId(id);}catch(e){setError(e instanceof Error?e.message:'Historial no disponible.');}finally{setBusy(false);}}
 async function send(event:React.FormEvent){event.preventDefault();if(busy||!canChat||!message.trim())return;setBusy(true);setError('');setNotice('');
 const text=message.trim();requestRef.current??=crypto.randomUUID();
 try{const result=await api<{conversationId:string;response:string}>('/api/organization-chat?organization_id='+org,{method:'POST',body:JSON.stringify({agentId,conversationId:conversationId||undefined,requestId:requestRef.current,userMessage:text})});
 setMessages(old=>[...old,{role:'user',content:text},{role:'assistant',content:result.response}]);setConversationId(result.conversationId);if(!conversationId)setConversations(old=>[{id:result.conversationId,title:text.slice(0,72)},...old]);
 setMessage('');requestRef.current=null;
 const current=await api<{items:Agent[];role:string}>('/api/organization-agents?organization_id='+org);setAgents(current.items);setNotice('Respuesta y evidencia guardadas. Ninguna comunicación externa se ha enviado.');
 }catch(e){setError(e instanceof Error?e.message:'La IA no pudo responder.');}finally{setBusy(false);}}
 async function capture(event:React.FormEvent){event.preventDefault();if(busy||!conversationId)return;setBusy(true);setError('');setNotice('');captureRef.current??=crypto.randomUUID();
 try{await api('/api/organization-chat/capture?organization_id='+org,{method:'POST',body:JSON.stringify({...contact,conversationId,requestId:captureRef.current})});setNotice('Contacto, lead y oportunidad registrados y vinculados a esta conversación.');captureRef.current=null;setContact({name:'',email:'',phone:'',consent:false,title:''});}catch(e){setError(e instanceof Error?e.message:'No se pudo registrar la oportunidad.');}finally{setBusy(false);}}
 async function activate(){if(busy||!agent)return;if(!window.confirm('¿Activar este agente para las conversaciones privadas de tu empresa? Los canales externos requieren verificación separada.'))return;setBusy(true);setError('');try{const updated=await api<Agent>('/api/organization-agents?organization_id='+org,{method:'PATCH',body:JSON.stringify({id:agent.id,status:'active'})});setAgents(old=>old.map(a=>a.id===updated.id?updated:a));setNotice('Canal de conversación privado activado.');}catch(e){setError(e instanceof Error?e.message:'No se pudo activar.');}finally{setBusy(false);}}
 const field='mt-2 w-full rounded-xl border border-white/20 bg-[#102b22] p-3';
 return <main className="kowi-shell min-h-screen p-5 text-white md:p-10"><div className="mx-auto max-w-5xl space-y-6">
 <Link href="/business#crear" className="underline">KOWI Business</Link><h1 className="text-3xl">Conversación empresarial con IA</h1><p>Prueba privada con un agente de inteligencia artificial. Usa información empresarial autorizada; revisa las respuestas antes de compartirlas con clientes.</p>
 {loading&&<p role="status">Cargando…</p>}{error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
 {!!organizations.length&&<label className="block">Empresa<select className={field} disabled={busy||loading} value={org} onChange={e=>setOrg(e.target.value)}>{organizations.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></label>}
 {!!agents.length&&<label className="block">Agente<select className={field} disabled={busy||loading} value={agentId} onChange={e=>setAgentId(e.target.value)}>{agents.map(a=><option key={a.id} value={a.id}>{a.name} · {a.status.toUpperCase()}</option>)}</select></label>}
 {!loading&&org&&configurer&&!error&&<Link href={'/business/agents?organization_id='+org} className="inline-block underline">Registrar agente con información autorizada</Link>}
 {agent&&!validConfig&&<p role="alert">Este agente no tiene una ficha empresarial válida. Registra un agente con datos autorizados antes de probar la IA.</p>}
 {agent&&<>
 <nav className="flex flex-wrap gap-3">{conversations.map(c=><button key={c.id} className="rounded-xl border border-white/20 p-3 text-sm" disabled={busy} onClick={()=>open(c.id)}>{c.title}</button>)}<button className="rounded-xl border border-white/20 p-3" disabled={busy} onClick={()=>{setConversationId('');setMessages([]);setNotice('');requestRef.current=null;captureRef.current=null;}}>Nueva conversación</button></nav>
 <div role="log" aria-label="Conversación empresarial" className="glass max-h-[32rem] space-y-4 overflow-y-auto rounded-xl p-5">{!messages.length&&<p>Pregunta sobre los datos confirmados de tu empresa.</p>}{messages.map((m,index)=><article key={m.id||index} className="rounded-xl border border-white/15 p-4"><h2 className="text-sm font-semibold">{m.role==='assistant'?'KOWI · IA':'Persona'}</h2><p className="mt-2 whitespace-pre-wrap break-words">{m.content}</p></article>)}</div>
 {canChat?<form onSubmit={send} className="flex flex-col gap-3 md:flex-row"><label className="flex-1">Mensaje<input className={field} required maxLength={2000} disabled={busy} value={message} onChange={e=>{setMessage(e.target.value);requestRef.current=null;}}/></label><button className="rounded-xl bg-[#e8b37b] px-5 py-3 text-black disabled:opacity-50" disabled={busy}>{busy?'Procesando…':'Enviar a KOWI'}</button></form>:<p>Este estado o tu rol no permite nuevas conversaciones. El historial conserva sus resultados.</p>}
 {agent.status==='draft'&&agent.last_verified_at&&configurer&&<button className="rounded-xl border border-white/20 p-3" disabled={busy} onClick={activate}>Activar conversación privada</button>}
 {conversationId&&messages.some(m=>m.role==='assistant')&&['owner','admin','configurator','operator'].includes(role)&&<form onSubmit={capture} className="glass grid gap-4 rounded-xl p-5 md:grid-cols-2"><h2 className="text-xl md:col-span-2">Registrar una oportunidad real</h2><p className="text-sm md:col-span-2">Introduce únicamente datos necesarios y autorizados. Este registro no envía mensajes ni reserva citas.</p>
 {(['name','email','phone','title'] as const).map(key=><label key={key}>{{name:'Nombre del contacto',email:'Correo',phone:'Teléfono',title:'Título de oportunidad'}[key]}<input className={field} type={key==='email'?'email':'text'} disabled={busy} required={key==='name'||key==='title'} maxLength={key==='email'?254:key==='phone'?40:160} value={contact[key]} onChange={e=>{captureRef.current=null;setContact(old=>({...old,[key]:e.target.value}));}}/></label>)}
 <label className="md:col-span-2"><input type="checkbox" disabled={busy} checked={contact.consent} onChange={e=>{captureRef.current=null;setContact(old=>({...old,consent:e.target.checked}));}}/> Consentimiento de seguimiento registrado</label><button className="rounded-xl bg-[#e8b37b] p-3 text-black disabled:opacity-50" disabled={busy}>Crear contacto, lead y oportunidad</button></form>}
 {conversationId&&messages.some(m=>m.role==='assistant')&&['owner','admin'].includes(role)&&<Link href={'/test-email?organization_id='+org+'&conversation_id='+conversationId} className="inline-block underline">Preparar prueba de correo con Human Approval</Link>}
 <Link href={'/business/crm-org?organization_id='+org} className="inline-block underline">Abrir CRM y registrar seguimiento</Link>
 </>}
 </div></main>;
}
