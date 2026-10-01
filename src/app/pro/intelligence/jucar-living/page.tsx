import Link from 'next/link';

const scenarios=[
 {name:'Ácido',growth:'5% mensual',clients1:4,clients12:13,revenue:12474,costs:8265,result:4209,arpa:99},
 {name:'Normal',growth:'10% mensual',clients1:8,clients12:20,revenue:24841,costs:10392,result:14449,arpa:129},
 {name:'Optimista',growth:'20% mensual',clients1:12,clients12:77,revenue:81183,costs:15140,result:66043,arpa:149},
];
const monthly=[
 ['1',8,2224,796,1428],['2',9,1310,808,502],['3',10,1439,820,619],['4',11,1568,832,736],
 ['5',12,1697,844,853],['6',13,1826,856,970],['7',14,1955,868,1087],['8',15,2084,880,1204],
 ['9',17,2491,904,1587],['10',18,2620,916,1704],['11',19,2749,928,1821],['12',20,2878,940,1938],
];
const euro=(n:number)=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
export default function JucarLiving(){
 const baseline=2274*12;
 return <main className="kowi-cosmos min-h-screen text-[#f4f3f2]">
  <header className="border-b border-white/10 bg-[#050913]/90 px-6 py-5"><div className="mx-auto flex max-w-7xl justify-between gap-4"><Link href="/pro/intelligence" className="text-[#e8b37b]">← Intelligence Center</Link><Link href="/business/demo" className="rounded-full border border-white/20 px-4 py-2 text-sm">CRM Demo</Link></div></header>
  <div className="mx-auto max-w-7xl px-6 py-10">
   <p className="kowi-eyebrow">KOWI PROJECT LAB · JÚCAR LIVING</p>
   <h1 className="mt-3 max-w-5xl text-4xl font-semibold tracking-tight md:text-6xl">Un laboratorio turístico para probar crecimiento, caja y venta del agente KOWI.</h1>
   <p className="mt-5 max-w-4xl text-[#b9bfca]">Modelo de simulación: contenido turístico + servicios a negocios locales + KOWI Local Tourism Agent. Todos los importes son hipótesis de prueba, no resultados reales ni previsiones garantizadas.</p>
   <section className="mt-8 grid gap-4 md:grid-cols-3">
    <article className="cosmos-tile rounded-2xl p-5"><p className="kowi-eyebrow">NEGOCIO TURÍSTICO BASE</p><p className="mt-2 text-3xl font-semibold">{euro(baseline)}/año</p><p className="mt-2 text-sm text-[#aeb8c6]">2.274 €/mes del ejercicio Júcar Living.</p></article>
    <article className="cosmos-tile rounded-2xl p-5"><p className="kowi-eyebrow">+10% ANUAL</p><p className="mt-2 text-3xl font-semibold">{euro(baseline*1.10)}</p><p className="mt-2 text-sm text-[#aeb8c6]">Escenario de crecimiento adicional moderado.</p></article>
    <article className="cosmos-tile rounded-2xl p-5"><p className="kowi-eyebrow">+20% ANUAL</p><p className="mt-2 text-3xl font-semibold">{euro(baseline*1.20)}</p><p className="mt-2 text-sm text-[#aeb8c6]">Escenario de crecimiento adicional alto.</p></article>
   </section>
   <section className="mt-8 cosmos-panel rounded-[2rem] p-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="kowi-eyebrow">VENTA DEL AGENTE</p><h2 className="mt-2 text-2xl font-semibold">KOWI Local Tourism Agent</h2></div><div className="text-sm text-[#aeb8c6]">Hipótesis normal: 129 €/mes + 149 € de puesta en marcha</div></div>
    <div className="mt-5 grid gap-4 md:grid-cols-3">
     <div className="rounded-2xl border border-white/10 p-4"><p className="text-xs text-[#e8b37b]">OBJETIVO ~1.000 € MRR</p><p className="mt-2 text-3xl font-semibold">8 clientes</p><p className="mt-2 text-sm text-[#aeb8c6]">1.032 €/mes recurrentes.</p></div>
     <div className="rounded-2xl border border-white/10 p-4"><p className="text-xs text-[#e8b37b]">OBJETIVO ~2.000 € MRR</p><p className="mt-2 text-3xl font-semibold">16 clientes</p><p className="mt-2 text-sm text-[#aeb8c6]">2.064 €/mes recurrentes.</p></div>
     <div className="rounded-2xl border border-white/10 p-4"><p className="text-xs text-[#e8b37b]">MES 1 NORMAL</p><p className="mt-2 text-3xl font-semibold">8 clientes</p><p className="mt-2 text-sm text-[#aeb8c6]">2.224 € incluyendo altas; 1.032 € MRR.</p></div>
    </div>
   </section>
   <section className="mt-8 grid gap-4 lg:grid-cols-3">{scenarios.map(s=><article key={s.name} className="cosmos-tile rounded-2xl p-6"><p className="kowi-eyebrow">ESCENARIO {s.name.toUpperCase()}</p><h2 className="mt-2 text-2xl font-semibold">{s.growth}</h2><div className="mt-5 space-y-2 text-sm"><p>Clientes: {s.clients1} → <strong>{s.clients12}</strong></p><p>Ingresos año: <strong>{euro(s.revenue)}</strong></p><p>Costes operativos: {euro(s.costs)}</p><p>Contribución antes de impuestos y remuneración fundador: <strong>{euro(s.result)}</strong></p><p>ARPA: {euro(s.arpa)}/mes</p></div></article>)}</section>
   <section className="mt-8 cosmos-panel overflow-x-auto rounded-[2rem] p-6"><p className="kowi-eyebrow">FLUJO DE CAJA · ESCENARIO NORMAL</p><h2 className="mt-2 text-2xl font-semibold">12 meses</h2><table className="mt-5 w-full min-w-[720px] text-left text-sm"><thead className="text-[#e8b37b]"><tr><th className="py-3">Mes</th><th>Clientes</th><th>Ingresos</th><th>Costes</th><th>Contribución</th></tr></thead><tbody>{monthly.map(r=><tr key={r[0]} className="border-t border-white/10"><td className="py-3">{r[0]}</td><td>{r[1]}</td><td>{euro(Number(r[2]))}</td><td>{euro(Number(r[3]))}</td><td>{euro(Number(r[4]))}</td></tr>)}</tbody></table></section>
   <section className="mt-8 grid gap-4 md:grid-cols-3">
    <article className="rounded-2xl border border-rose-300/15 bg-rose-200/5 p-5"><p className="text-xs font-bold uppercase tracking-wider text-rose-200">Ácido financiero</p><p className="mt-3 text-sm">La prueba tolera crecimiento lento, pero no incluye todavía sueldo del fundador, impuestos ni inversión inmobiliaria. No comprar inmueble hasta validar demanda repetible.</p></article>
    <article className="rounded-2xl border border-amber-200/15 bg-amber-100/5 p-5"><p className="text-xs font-bold uppercase tracking-wider text-amber-100">Motor comercial</p><p className="mt-3 text-sm">Vídeo → landing → agente → lead → cita/reserva → CRM → seguimiento → ingreso. Medir cada transición y coste de adquisición.</p></article>
    <article className="rounded-2xl border border-emerald-300/15 bg-emerald-300/5 p-5"><p className="text-xs font-bold uppercase tracking-wider text-emerald-200">Escalabilidad</p><p className="mt-3 text-sm">Validar Alcalá del Júcar antes de replicar la plantilla en otros destinos. El producto es el agente + CRM + playbook, no la localidad.</p></article>
   </section>
  </div>
 </main>
}