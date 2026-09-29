'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

type Status = 'borrador' | 'en_marcha' | 'completado';
type Project = { id: string; idea: string; objective: string; phases: string[]; tasks: string[]; next_action: string; status: Status };
type Draft = { idea: string; objective: string; phases: string; tasks: string; next_action: string };
const empty: Draft = { idea: '', objective: '', phases: '', tasks: '', next_action: '' };
const labels: Record<Status, string> = { borrador: 'Borrador', en_marcha: 'En marcha', completado: 'Completado' };
const lines = (value: string) => value.split('\n').map(line => line.trim()).filter(Boolean);

export default function ProjectsWorkspace() {
  const [items, setItems] = useState<Project[]>([]);
  const [form, setForm] = useState<Draft>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('borrador');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('kowi-project-draft');
      if (saved) {
        const draft = JSON.parse(saved) as Partial<Draft>;
        if (typeof draft.idea === 'string' && typeof draft.objective === 'string' && typeof draft.next_action === 'string') {
          setForm({ idea: draft.idea, objective: draft.objective, phases: draft.phases ?? '', tasks: draft.tasks ?? '', next_action: draft.next_action });
          setNotice('Plan preparado desde Kowi One. Revísalo y guárdalo cuando esté listo.');
        }
        sessionStorage.removeItem('kowi-project-draft');
      }
    } catch { /* Browser storage may be unavailable. */ }
    api<Project[]>('/api/projects').then(setItems)
      .catch(() => setNotice('Inicia sesión en Kowi One para consultar y guardar tus proyectos.'))
      .finally(() => setLoading(false));
  }, []);

  function reset() { setForm(empty); setEditing(null); setStatus('borrador'); }
  function edit(item: Project) {
    setForm({ ...item, phases: item.phases.join('\n'), tasks: item.tasks.join('\n') });
    setStatus(item.status); setEditing(item.id); setDeleting(null); setNotice('');
    document.getElementById('project-form')?.scrollIntoView({ behavior: 'smooth' });
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setNotice('');
    try {
      const payload = { ...form, phases: lines(form.phases), tasks: lines(form.tasks) };
      const item = editing
        ? await api<Project>(`/api/projects/${editing}`, { method: 'PATCH', body: JSON.stringify({ ...payload, status }) })
        : await api<Project>('/api/projects', { method: 'POST', body: JSON.stringify(payload) });
      setItems(previous => editing ? previous.map(existing => existing.id === item.id ? item : existing) : [item, ...previous]);
      const message = editing ? 'Cambios guardados.' : 'Proyecto guardado en tu cuenta.';
      reset(); setNotice(message);
    } catch (error) { setNotice(error instanceof Error ? error.message : 'No se pudo guardar el proyecto.'); }
    finally { setBusy(false); }
  }
  async function remove(id: string) {
    setBusy(true); setNotice('');
    try {
      await api(`/api/projects/${id}`, { method: 'DELETE' });
      setItems(previous => previous.filter(item => item.id !== id));
      if (editing === id) reset();
      setDeleting(null); setNotice('Proyecto eliminado.');
    } catch (error) { setNotice(error instanceof Error ? error.message : 'No se pudo eliminar el proyecto.'); }
    finally { setBusy(false); }
  }

  const field = 'mt-2 w-full rounded-xl border border-white/15 bg-[#102b22] p-3 text-white outline-none focus:border-[#e8b37b]';
  return <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr]">
    <form id="project-form" onSubmit={submit} className="glass h-fit space-y-4 rounded-2xl p-6">
      <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#e8b37b]">Tu espacio de trabajo</p>
        <h2 className="mt-2 text-2xl font-semibold">{editing ? 'Editar proyecto' : 'Da forma a tu idea'}</h2>
        <p className="mt-2 text-sm text-[#a9c1b3]">Define un resultado observable y la próxima acción que puedes realizar.</p></div>
      {([['idea', 'Idea o desafío', 2000], ['objective', 'Objetivo verificable', 1000], ['phases', 'Fases (una por línea)', 6000], ['tasks', 'Tareas (una por línea)', 12000], ['next_action', 'Siguiente acción concreta', 500]] as const).map(([key, label, maxLength]) =>
        <label key={key} className="block text-sm text-[#d9e9dd]">{label}
          <textarea required={key !== 'tasks' && key !== 'phases'} maxLength={maxLength} rows={key === 'idea' ? 3 : 2}
            className={field} value={form[key]} onChange={event => setForm(previous => ({ ...previous, [key]: event.target.value }))} />
        </label>)}
      {editing && <label className="block text-sm text-[#d9e9dd]">Estado
        <select value={status} onChange={event => setStatus(event.target.value as Status)} className={field}>
          {(Object.keys(labels) as Status[]).map(value => <option key={value} value={value}>{labels[value]}</option>)}
        </select></label>}
      <div className="flex flex-wrap items-center gap-3">
        <button disabled={busy} className="rounded-full bg-[#e8b37b] px-6 py-3 font-semibold text-[#17121a] disabled:opacity-50">{busy ? 'Guardando…' : editing ? 'Guardar cambios' : 'Guardar proyecto'}</button>
        {editing && <button type="button" disabled={busy} onClick={reset} className="text-sm text-[#d9e9dd] underline">Cancelar edición</button>}
      </div>
      {notice && <p role="status" className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-[#d7e9dc]">{notice} {notice.includes('Inicia sesión') && <Link href="/kowi" className="underline">Entrar</Link>}</p>}
    </form>
    <section aria-label="Mis proyectos" className="space-y-4">
      <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#e8b37b]">Seguimiento</p><h2 className="mt-2 text-2xl font-semibold">Mis proyectos</h2></div><span className="text-sm text-[#a9c1b3]">{items.length} guardados</span></div>
      {loading && <p className="text-[#a9c1b3]">Cargando proyectos…</p>}
      {!loading && items.length === 0 && <div className="glass rounded-2xl p-6 text-[#a9c1b3]">Tus proyectos aparecerán aquí después de guardarlos.</div>}
      {items.map(item => <article key={item.id} className="glass rounded-2xl p-5">
        <div className="flex items-start justify-between gap-3"><span className="rounded-full border border-[#e8b37b]/25 bg-[#e8b37b]/10 px-3 py-1 text-xs text-[#e8b37b]">{labels[item.status]}</span>
          <button disabled={busy} onClick={() => edit(item)} className="text-sm text-[#e8b37b] underline disabled:opacity-50">Editar</button></div>
        <h3 className="mt-3 text-xl font-semibold">{item.idea}</h3>
        <p className="mt-3 text-sm text-[#bbd0c1]"><span className="font-semibold">Objetivo:</span> {item.objective}</p>
        <p className="mt-3 text-sm text-[#e8b37b]"><span className="font-semibold">Siguiente acción:</span> {item.next_action}</p>
        {(item.phases.length > 0 || item.tasks.length > 0) && <details className="mt-4 border-t border-white/10 pt-3 text-sm"><summary className="cursor-pointer text-[#d5e4d8]">Ver fases y tareas</summary>
          {item.phases.length > 0 && <div className="mt-3"><h4 className="font-semibold">Fases</h4><ol className="mt-2 list-inside list-decimal space-y-1 text-[#a9c1b3]">{item.phases.map((phase, index) => <li key={index}>{phase}</li>)}</ol></div>}
          {item.tasks.length > 0 && <div className="mt-3"><h4 className="font-semibold">Tareas</h4><ul className="mt-2 list-inside list-disc space-y-1 text-[#a9c1b3]">{item.tasks.map((task, index) => <li key={index}>{task}</li>)}</ul></div>}
        </details>}
        <div className="mt-5 border-t border-white/10 pt-3 text-right">
          {deleting === item.id ? <span className="flex justify-end gap-4 text-sm"><span>¿Eliminar definitivamente?</span><button disabled={busy} onClick={() => remove(item.id)} className="font-semibold text-red-200">Sí, eliminar</button><button disabled={busy} onClick={() => setDeleting(null)}>Cancelar</button></span> :
            <button disabled={busy} onClick={() => setDeleting(item.id)} className="text-xs text-[#d6a7a7] underline disabled:opacity-50">Eliminar</button>}
        </div>
      </article>)}
    </section>
  </div>;
}
