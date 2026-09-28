'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

type Lead = { id:string; name:string; contact:string; status:string; next_action:string; notes:string; updated_at:string };
type Action = { id:string; lead_id:string|null; action_type:string; status:string; summary:string; payload:Record<string,unknown>; error:string; created_at:string };
type Appointment = { id:string; lead_id:string|null; title:string; starts_at:string; status:string };
type Channel = { channel:string; provider:string; enabled:boolean; status:string };
type Overview = { leads:Lead[]; actions:Action[]; appointments:Appointment[]; channels:Channel[] };

const statuses=['nuevo','contactado','propuesta','ganado','perdido'] as const;

export default function BusinessAgent() {
  const [data,setData]=useState<Overview>({leads:[],actions:[],appointments:[],channels:[]});
  const [busy,setBusy]=useState(false);
  const [notice,setNotice]=useState('');
  const [name,setName]=useState('');
  const [contact,setContact]=useState('');
  const [notes,setNotes]=useState('');
  const [consent,setConsent]=useState(false);

  const refresh=useCallback(async()=>setData(await api<Overview>('/api/business/overview')),[]);
  useEffect(()=>{ refresh().catch(e=>setNotice(e instanceof Error?e.message:'No se pudo cargar.')); },[refresh]);

  async function run(fn:()=>Promise<void>) {
    setBusy(true); setNotice('');
    try { await fn(); }
    catch(e){ setNotice(e instanceof Error?e.message:'No se pudo completar.'); }
    finally { setBusy(false); }
  }

  async function createLead(e:React.FormEvent){
    e.preventDefault();
    if(!name.trim()) return;
    await run(async()=>{
      await api('/api/business/leads',{method:'POST',body:JSON.stringify({name,contact,notes,next_action:'Primer contacto',consent,source:'manual'})});
      setName('');setContact('');setNotes('');setConsent(false);await refresh();
    });
  }

  async function changeStatus(lead:Lead,status:string){
    await run(async()=>{ await api(`/api/business/leads/${lead.id}`,{method:'PATCH',body:JSON.stringify({status})}); await refresh(); });
  }

  async function prepare(lead:Lead, type:'send_whatsapp'|'send_email'|'create_appointment'){
    const payload = type==='send_whatsapp'
      ? {to:lead.contact,body:`Hola ${lead.name}, soy Kowi Business. Quería hacer seguimiento a tu consulta. ¿Te viene bien que continuemos por aquí?`}
      : type==='send_email'
      ? {to:lead.contact,subject:'Seguimiento Kowi Business',body:`Hola ${lead.name},\n\nQuería hacer seguimiento a tu consulta. ¿Te viene bien que continuemos por este medio?\n\nUn saludo,\nKowi Business`}
      : {title:`Seguimiento con ${lead.name}`,starts_at:new Date(Date.now()+86400000).toISOString(),ends_at:new Date(Date.now()+90000000).toISOString(),notes:'Cita preparada desde Kowi Business'};
    await run(async()=>{
      await api('/api/business/actions',{method:'POST',body:JSON.stringify({
        lead_id:lead.id,action_type:type,
        summary:type==='send_whatsapp'? `Enviar WhatsApp a ${lead.name}` : type==='send_email'? `Enviar email a ${lead.name}` : `Crear cita con ${lead.name}`,
        payload
      })});
      await refresh();
    });
  }

  const pending=useMemo(()=>data.actions.filter(a=>a.status==='pending_approval'),[data.actions]);
  const channelStatus=(name:string)=>data.channels.find(c=>c.channel===name)?.status || 'not_configured';

  return <main className="kowi-shell min-h-screen text-[#eef8ef]">
    <div className="kowi-grid pointer-events-none fixed inset-0 opacity-30"/>
    <header className="relative z-10 border-b border-white/10 bg-[#071612]/80 px-6 py-5 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3"><span className="hero-orb h-8 w-8 rounded-full"/><span className="text-sm font-bold tracking-[.24em]">KOWI BUSINESS</span></Link>
        <div className="flex gap-3 text-sm"><Link href="/business/demo" className="rounded-full border border-white/10 px-4 py-2">Demo</Link><Link href="/kowi" className="rounded-full bg-[#d7f2a7] px-4 py-2 font-semibold text-[#17382f]">Kowi Personal</Link></div>
      </div>
    </header>

    <div className="relative z-10 mx-auto max-w-7xl px-6 py-10">
      <div className="grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
        <section>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#d7f2a7]">Agente comercial operativo</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-.04em] md:text-5xl">CRM, seguimiento y acciones con aprobación humana.</h1>
          <p className="mt-4 max-w-3xl text-[#a8c0b2]">Kowi organiza leads, prepara mensajes y citas y solo ejecuta comunicaciones externas cuando tú las apruebas.</p>
        </section>
        <section className="glass rounded-[1.5rem] p-5">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#7f9d8c]">Canales</p>
          <div className="mt-4 grid gap-3 text-sm">
            {[
              ['WhatsApp',channelStatus('whatsapp')],
              ['Email',channelStatus('email')],
              ['Agenda',channelStatus('calendar')],
              ['CRM','ready'],
            ].map(([label,status])=><div key={label} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[.03] px-4 py-3">
              <span>{label}</span><span className={status==='ready'?'text-[#d7f2a7]':'text-amber-200'}>{status==='ready'?'Activo':status==='credentials_present'?'Credenciales presentes · verificar':'Pendiente'}</span>
            </div>)}
          </div>
        </section>
      </div>

      {notice && <div className="mt-6 rounded-2xl border border-amber-200/15 bg-amber-100/5 p-4 text-sm text-amber-50">{notice}</div>}

      <div className="mt-8 grid gap-6 xl:grid-cols-[.72fr_1.28fr]">
        <form onSubmit={createLead} className="glass rounded-[1.6rem] p-5">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#d7f2a7]">Nuevo lead</p>
          <div className="mt-4 space-y-3">
            <input value={name} onChange={e=>setName(e.target.value)} required maxLength={100} placeholder="Nombre" className="w-full rounded-xl border border-white/10 bg-white/5 p-3 outline-none"/>
            <input value={contact} onChange={e=>setContact(e.target.value)} maxLength={120} placeholder="Email o teléfono" className="w-full rounded-xl border border-white/10 bg-white/5 p-3 outline-none"/>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} maxLength={1000} placeholder="Necesidad, contexto o notas" rows={4} className="w-full rounded-xl border border-white/10 bg-white/5 p-3 outline-none"/>
            <label className="block text-xs"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/> Consentimiento para comunicaciones de seguimiento</label>
            <button disabled={busy} className="w-full rounded-xl bg-[#d7f2a7] p-3 font-semibold text-[#17382f] disabled:opacity-50">Crear oportunidad</button>
          </div>
        </form>

        <section className="glass rounded-[1.6rem] p-5">
          <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#d7f2a7]">Pipeline</p><h2 className="mt-1 text-2xl font-semibold">Leads activos</h2></div><button disabled={busy} onClick={()=>run(refresh)} className="text-sm underline">Actualizar</button></div>
          <div className="mt-5 space-y-3">
            {data.leads.length===0 && <p className="rounded-xl border border-white/10 p-5 text-sm text-[#8da899]">Aún no hay leads. Crea el primero para probar el flujo.</p>}
            {data.leads.map(lead=><article key={lead.id} className="rounded-2xl border border-white/10 bg-white/[.03] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><h3 className="font-semibold">{lead.name}</h3><p className="mt-1 text-sm text-[#8fa99a]">{lead.contact||'Sin contacto'} · {lead.next_action||'Sin siguiente acción'}</p></div>
                <select value={lead.status} disabled={busy} onChange={e=>changeStatus(lead,e.target.value)} className="rounded-full border border-white/10 bg-[#10281f] px-3 py-2 text-xs">
                  {statuses.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              {lead.notes && <p className="mt-3 text-sm leading-relaxed text-[#b3c8bb]">{lead.notes}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                <button disabled={busy||!lead.contact} onClick={()=>prepare(lead,'send_whatsapp')} className="rounded-full border border-white/10 px-3 py-2 text-xs disabled:opacity-40">Preparar WhatsApp</button>
                <button disabled={busy||!lead.contact} onClick={()=>prepare(lead,'send_email')} className="rounded-full border border-white/10 px-3 py-2 text-xs disabled:opacity-40">Preparar email</button>
                <button disabled={busy} onClick={()=>prepare(lead,'create_appointment')} className="rounded-full border border-white/10 px-3 py-2 text-xs">Preparar cita</button>
              </div>
            </article>)}
          </div>
        </section>
      </div>

      <section className="mt-6 glass rounded-[1.6rem] p-5">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#d7f2a7]">Human Approval</p>
        <div className="mt-2 flex items-end justify-between gap-4"><h2 className="text-2xl font-semibold">Acciones pendientes</h2><span className="text-sm text-[#8da899]">{pending.length} por revisar</span></div>
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {pending.length===0 && <p className="text-sm text-[#8da899]">No hay acciones pendientes.</p>}
          {pending.map(action=><article key={action.id} className="rounded-2xl border border-[#d7f2a7]/15 bg-[#d7f2a7]/5 p-4">
            <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#d7f2a7]">{action.action_type}</p><h3 className="mt-2 font-semibold">{action.summary}</h3></div><span className="rounded-full border border-amber-200/20 px-2 py-1 text-[10px] text-amber-100">{action.status}</span></div>
            {action.error && <p className="mt-3 text-xs text-amber-100">{action.error}</p>}
            <div className="mt-4 flex gap-2">
              <button disabled={busy} onClick={()=>run(async()=>{await api(`/api/business/actions/${action.id}/approve`,{method:'POST'});await refresh();})} className="rounded-full bg-[#d7f2a7] px-4 py-2 text-xs font-semibold text-[#17382f]">Aprobar y ejecutar</button>
              {action.status==='pending_approval' && <button disabled={busy} onClick={()=>run(async()=>{await api(`/api/business/actions/${action.id}/reject`,{method:'POST'});await refresh();})} className="rounded-full border border-white/10 px-4 py-2 text-xs">Rechazar</button>}
            </div>
          </article>)}
        </div>
      </section>
    </div>
  </main>;
}
