'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {api} from '@/lib/api';
type Snapshot={organizations:{id:string;name:string}[];organization:{id:string;name:string}|null;observations:{label:string;status:string;count:number|null}[];observedAt:string};
export default function Page(){
 const [snapshot,setSnapshot]=useState<Snapshot|null>(null);
 const [selected,setSelected]=useState('');
 const [error,setError]=useState('');
 const [loading,setLoading]=useState(true);
 const [refresh,setRefresh]=useState(0);
 useEffect(()=>{let active=true;setLoading(true);setError('');setSnapshot(null);
 api<Snapshot>('/api/control-center'+(selected?'?organization_id='+encodeURIComponent(selected):'')).then(data=>{if(active)setSnapshot(data);}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});
 return()=>{active=false;};},[selected,refresh]);
 return <main className="kowi-shell min-h-screen px-5 py-10 text-white"><div className="mx-auto max-w-5xl space-y-6">
 <Link href="/business#crear" className="underline">KOWI Business</Link>
 <h1 className="text-3xl font-semibold">KOWI Control Center</h1>
 <p className="text-[#a9c1b3]">Vista privada de registros accesibles para tu cuenta. La administración global requiere autoridad de plataforma verificada.</p>
 {error&&<p role="alert">{error} <Link href="/business#crear" className="underline">Entrar</Link></p>}
 {loading&&<p role="status">Consultando registros…</p>}
 {snapshot&&<>
 <div className="flex flex-wrap gap-4"><label>Empresa<select className="ml-3 rounded-xl bg-[#102b22] p-3" disabled={loading} value={selected||snapshot.organization?.id||''} onChange={e=>setSelected(e.target.value)}>{snapshot.organizations.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></label><button className="rounded-xl border border-white/20 p-3" onClick={()=>setRefresh(n=>n+1)}>Actualizar</button></div>
 {!snapshot.organization&&<p>No hay empresas visibles. Puedes registrar una desde KOWI Business.</p>}
 <div className="grid gap-5 md:grid-cols-2">
 <section className="glass rounded-xl p-5"><h2 className="text-xl">NEGOCIO</h2><p className="mt-3">{snapshot.organization?.name||'Sin empresa seleccionada'}</p><p className="mt-2 text-sm">Ingresos y margen: no observados.</p></section>
 <section className="glass rounded-xl p-5"><h2 className="text-xl">PRODUCTO</h2>{snapshot.observations.map(o=><p key={o.label} className="mt-3">{o.label}: {o.status==='OBSERVED'?o.count:'No observado'}</p>)}<p className="mt-3 text-sm">Una instalación registrada no demuestra un agente activo.</p></section>
 <section className="glass rounded-xl p-5"><h2 className="text-xl">OPERACIONES</h2><p className="mt-3">Disponibilidad, consumo y costes de IA: no observados en este panel.</p></section>
 <section className="glass rounded-xl p-5"><h2 className="text-xl">SEGURIDAD</h2><p className="mt-3">Incidentes y análisis de infraestructura: sin cobertura en este panel.</p><p className="mt-3 text-sm">El informe diario de dependencias se conserva como evidencia en GitHub Actions; todavía no se integra aquí.</p></section>
 </div><p className="text-sm text-[#a9c1b3]">Consulta: {snapshot.observedAt}. Los datos ausentes no se representan como cero ni como estado OK.</p>
 </>}
 </div></main>;
}
