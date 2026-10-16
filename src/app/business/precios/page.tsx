import { basePlanIncludes, commercialGuardrails, pricingRegions } from '@/lib/commercial-pricing';

export default function PricingPage() {
  return <main className="min-h-screen bg-[#f7f4ed] px-5 py-10 text-[#15231c] sm:px-8">
    <div className="mx-auto max-w-6xl">
      <p className="text-xs font-bold uppercase tracking-[.22em] text-[#55715f]">KOWI BUSINESS · LANZAMIENTO GLOBAL</p>
      <h1 className="mt-4 max-w-4xl text-4xl font-semibold sm:text-6xl">Atención comercial con IA desde 99 € al mes en España.</h1>
      <p className="mt-5 max-w-3xl text-lg text-slate-600">Un agente para atender, enseñar servicios y precios, organizar clientes y gestionar reservas desde los canales conectados de tu negocio.</p>
      <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">KOWI Business Basic</h2>
        <p className="mt-2 text-4xl font-semibold">99 € <span className="text-base font-normal text-slate-500">/ mes · España</span></p>
        <p className="mt-2 text-slate-600">990 € al año. Los precios regionales se muestran en la moneda indicada y pueden ajustarse por impuestos y costes de canal.</p>
        <ul className="mt-6 grid gap-3 md:grid-cols-2">{basePlanIncludes.map(item=><li key={item} className="rounded-2xl bg-[#eef3ef] px-4 py-3">✓ {item}</li>)}</ul>
      </div>
      <section className="mt-10">
        <h2 className="text-3xl font-semibold">Precios regionales recomendados</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pricingRegions.map(region=><article key={region.id} className="rounded-3xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-[#55715f]">{region.label}</p>
            <p className="mt-3 text-3xl font-semibold">{region.monthly} {region.currency}<span className="text-sm font-normal text-slate-500"> / mes</span></p>
            <p className="mt-1 text-sm text-slate-500">{region.annual} {region.currency} / año</p>
            <p className="mt-4 text-sm text-slate-600">{region.positioning}</p>
          </article>)}
        </div>
      </section>
      <section className="mt-10 rounded-3xl bg-[#15231c] p-7 text-white">
        <h2 className="text-2xl font-semibold">Condiciones transparentes</h2>
        <ul className="mt-4 space-y-3 text-slate-200">{commercialGuardrails.map(item=><li key={item}>• {item}</li>)}</ul>
      </section>
    </div>
  </main>;
}
