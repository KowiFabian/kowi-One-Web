'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {api} from '@/lib/api';
type Snapshot={organizations:{id:string;name:string}[];organization:{id:string;name:string}|null;observations:{label:string;status:string;count:number|null}[];observedAt:string};
export default function Page(){
 type Report={id:string;recorded_at:string;status:string;report:{title:string;interpretation:string;observed:{tables_without_rls:number;missing_target_tables:string[]};recommendations:string[]}};
 const [reports,setReports]=useState<Report[]|null>(null);
 const [reportError,setReportError]=useState('');
 const [reportBusy,setReportBusy]=useState(false);
 async function loadReports(){if(reportBusy)return;setReportBusy(true);setReportError('');setReports(null);try{const result=await api<{items:Report[]}>('/api/control-center/security-reports');setReports(result.items);}catch(e){setReportError(e instanceof Error?e.message:'Informes no disponibles.');}finally{setReportBusy(false);}}
 const [globalData,setGlobalData]=useState<{organizations:number;installations:number;observed_at:string}|null>(null);
 const [globalError,setGlobalError]=useState('');
 const [globalBusy,setGlobalBusy]=useState(false);
 async function loadGlobal(){if(globalBusy)return;setGlobalBusy(true);setGlobalError('');setGlobalData(null);try{const result=await api<{observed:{organizations:number;installations:number;observed_at:string}}>('/api/control-center/platform');setGlobalData(result.observed);}catch(e){setGlobalError(e instanceof Error?e.message:'Vista global no disponible.');}finally{setGlobalBusy(false);}}
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
 <section className="glass rounded-xl p-5"><h2 className="text-xl">Administración global</h2><p className="mt-3 text-sm">Solo Platform Owner y KOWI Admin verificados. Cada consulta autorizada queda auditada.</p><button className="mt-3 rounded-xl border border-white/20 p-3" disabled={globalBusy} onClick={loadGlobal}>{globalBusy?'Consultando…':'Consultar vista global'}</button>{globalError&&<p className="mt-3" role="alert">{globalError}</p>}{globalData&&<p className="mt-3">Empresas registradas: {globalData.organizations}. Instalaciones registradas: {globalData.installations}. Consulta: {globalData.observed_at}.</p>}</section>
 <section className="glass rounded-xl p-5"><h2 className="text-xl">KOWI DAILY SECURITY REPORT</h2><p className="mt-3 text-sm">Observador de base de datos diario a las 07:45 UTC. Consulta restringida a Platform Owner y KOWI Admin; cobertura parcial de seguridad.</p><button className="mt-3 rounded-xl border border-white/20 p-3" disabled={reportBusy} onClick={loadReports}>{reportBusy?'Consultando…':'Consultar histórico de seguridad'}</button>{reportError&&<p className="mt-3" role="alert">{reportError}</p>}{reports?.length===0&&<p className="mt-3">No hay informes registrados.</p>}{reports?.map(item=><article key={item.id} className="mt-4 rounded-xl border border-white/20 p-4"><h3 className="font-semibold">{item.status} · {item.recorded_at}</h3><p className="mt-3">{item.report.interpretation}</p><p className="mt-3 text-sm">Tablas observadas sin RLS: {item.report.observed.tables_without_rls}. Componentes de datos pendientes: {item.report.observed.missing_target_tables.join(', ')||'Ninguno en la lista observada'}.</p><ul className="mt-3 space-y-2">{item.report.recommendations.map(text=><li key={text}>{text}</li>)}</ul></article>)}</section>
 {error&&<p role="alert">{error} <Link href="/business#crear" className="underline">Entrar</Link></p>}
 {loading&&<p role="status">Consultando registros…</p>}
 {snapshot&&<>
 <div className="flex flex-wrap gap-4"><label>Empresa<select className="ml-3 rounded-xl bg-[#102b22] p-3" disabled={loading} value={selected||snapshot.organization?.id||''} onChange={e=>setSelected(e.target.value)}>{snapshot.organizations.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></label><button className="rounded-xl border border-white/20 p-3" onClick={()=>setRefresh(n=>n+1)}>Actualizar</button></div>
 {!snapshot.organization&&<p>No hay empresas visibles. Puedes registrar una desde KOWI Business.</p>}
 <div className="grid gap-5 md:grid-cols-2">
 <section className="glass rounded-xl p-5"><h2 className="text-xl">NEGOCIO</h2><p className="mt-3">{snapshot.organization?.name||'Sin empresa seleccionada'}</p><p className="mt-2 text-sm">Ingresos y margen: no observados.</p></section>
 <section className="glass rounded-xl p-5"><h2 className="text-xl">PRODUCTO</h2>{snapshot.observations.map(o=><p key={o.label} className="mt-3">{o.label}: {o.status==='OBSERVED'?o.count:'No observado'}</p>)}<p className="mt-3 text-sm">Los registros marcados como prueba no acreditan clientes reales. El estado ACTIVE o una fecha de verificación no demuestran por sí solos una respuesta de IA o un resultado comercial.</p></section>
 <section className="glass rounded-xl p-5"><h2 className="text-xl">OPERACIONES</h2><p className="mt-3">Disponibilidad, consumo y costes de IA: no observados en este panel.</p></section>
 <section className="glass rounded-xl p-5"><h2 className="text-xl">SEGURIDAD</h2><p className="mt-3">Incidentes y análisis de infraestructura: sin cobertura en este panel.</p><p className="mt-3 text-sm">El observador de base de datos tiene histórico restringido arriba. El informe de dependencias se conserva por separado en GitHub Actions.</p></section>
 </div><p className="text-sm text-[#a9c1b3]">Consulta: {snapshot.observedAt}. Los datos ausentes no se representan como cero ni como estado OK.</p>
 </>}
 </div></main>;
}
