'use client';
import {useState} from 'react';
import Link from 'next/link';
import {BUILDER_ECONOMICS,calculateBuilderEconomics} from '@/lib/builder-economics';

const euro=(n:number)=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
const ranges=[{c:1,label:'1 cliente'},{c:10,label:'10 clientes'},{c:30,label:'30 clientes'},{c:100,label:'100 clientes'}];
const steps=[
  ['01','El Partner consigue un negocio','Presenta una demo honesta, verifica las necesidades y registra una oportunidad con consentimiento.'],
  ['02','El negocio contrata KOWI Business','KOWI valida el servicio disponible, su precio, el cobro y el alcance contractual.'],
  ['03','El Builder adapta la solución','Configura un agente por empresa con plantilla, servicios, conocimiento autorizado y pruebas.'],
  ['04','KOWI revisa antes de activar','El propietario aprueba acciones sensibles. Se comprueban seguridad, permisos y resultados reales.'],
  ['05','KOWI presta servicio y registra el cobro','La empresa utiliza el producto bajo los límites contratados. No se confunden pruebas con ventas.'],
  ['06','Se calculan comisiones elegibles','Solo tras el cobro validado, asignación y contrato; sin pagos automáticos en esta fase.'],
];
export default function BuildersEconomics(){
  const [clients,setClients]=useState(10);
  const [partner,setPartner]=useState(true);
  const [builder,setBuilder]=useState(true);
  const [variable,setVariable]=useState(15);
  const result=calculateBuilderEconomics({
    clients,hasPartner:partner,hasBuilder:builder,assumedVariableCostPerClient:variable
  });
  return <main className="min-h-screen bg-[#f8f9fa] px-4 py-8 text-[#202327] sm:px-8">
    <div className="mx-auto max-w-6xl space-y-9">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-xl bg-[#eff0f1] text-3xl">◎</span><span><strong className="block text-xl">KOWI IA</strong><small className="text-[#70757e]">Human-First AI · Modelo de colaboración</small></span></Link>
        <div className="flex flex-wrap items-center gap-3 text-sm"><Link href="/builders" className="rounded-full border border-[#d9dde1] bg-white px-4 py-2 font-medium">Construir agente</Link><Link href="/business" className="rounded-full border border-[#d9dde1] bg-white px-4 py-2 font-medium">Business</Link></div>
      </header>
      <section className="rounded-[28px] border border-[#e7e8e9] bg-white px-5 py-8 sm:px-8">
        <span className="rounded-full bg-[#f0f1f2] px-3 py-1 text-xs font-semibold">MODELO PROPUESTO · NO CONTRACTUAL</span>
        <h1 className="mt-5 max-w-4xl text-3xl font-semibold tracking-tight sm:text-5xl">Tú creas soluciones. KOWI las convierte en servicios recurrentes.</h1>
        <p className="mt-5 max-w-3xl text-[#5c6570]">Un negocio necesita atención digital. El Partner presenta la solución; el Builder configura y mantiene el agente; KOWI proporciona la plataforma, la infraestructura y el control. Cada función debe aportar valor verificable para recibir una remuneración.</p>
        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          {[['BUSINESS','Paga la suscripción por el servicio contratado.'],['PARTNER','Consigue clientes y acompaña la venta.'],['BUILDER','Configura, prueba y mantiene agentes autorizados.']].map(([t,d])=><div key={t} className="rounded-2xl border border-[#ebedef] bg-[#fafafa] p-4"><h2 className="text-sm font-semibold">{t}</h2><p className="mt-2 text-sm text-[#656b72]">{d}</p></div>)}
        </div>
      </section>
      <section aria-label="Calculadora de ingresos" className="grid gap-5 lg:grid-cols-[.95fr_1.05fr]">
        <div className="rounded-3xl border border-[#e4e6e8] bg-white p-5 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[.15em] text-[#6c737b]">SIMULADOR COMERCIAL</p>
          <h2 className="mt-3 text-2xl font-semibold">Calcula los ingresos potenciales</h2>
          <p className="mt-2 text-sm text-[#69717a]">Son escenarios hipotéticos; no representan clientes existentes, beneficios garantizados ni comisiones aprobadas.</p>
          <div className="mt-6 flex items-center justify-between"><label htmlFor="builder-client-count" className="text-sm font-medium">Clientes de pago activos</label><strong className="text-2xl tabular-nums">{clients}</strong></div>
          <input id="builder-client-count" type="range" min="0" max="100" step="1" className="mt-3 w-full accent-[#24272c]" value={clients} onChange={e=>setClients(Number(e.target.value))}/>
          <div className="mt-3 flex flex-wrap gap-2">{ranges.map(item=><button key={item.c} type="button" onClick={()=>setClients(item.c)} aria-pressed={clients===item.c} className={'rounded-full border px-3 py-2 text-xs '+(clients===item.c?'border-[#202227] bg-[#202227] text-white':'border-[#dedfe1] bg-white hover:bg-[#f0f1f2]')}>{item.label}</button>)}</div>
          <div className="mt-6 space-y-3 rounded-xl bg-[#f6f7f8] p-4">
            <label className="flex cursor-pointer items-center gap-3 text-sm"><input type="checkbox" checked={partner} onChange={e=>setPartner(e.target.checked)} className="h-4 w-4 accent-[#22252a]"/> Interviene un Partner elegible (15 %)</label>
            <label className="flex cursor-pointer items-center gap-3 text-sm"><input type="checkbox" checked={builder} onChange={e=>setBuilder(e.target.checked)} className="h-4 w-4 accent-[#22252a]"/> Interviene un Builder elegible (20 %)</label>
          </div>
          <div className="mt-6 flex justify-between gap-3"><label htmlFor="builder-variable-cost" className="text-sm font-medium">Coste técnico variable supuesto por cliente/mes</label><strong className="whitespace-nowrap text-sm">{euro(variable)}</strong></div>
          <input id="builder-variable-cost" type="range" min="0" max="50" step="1" className="mt-3 w-full accent-[#22252a]" value={variable} onChange={e=>setVariable(Number(e.target.value))}/>
          <p className="mt-3 text-xs leading-relaxed text-[#70767e]">Precio fijo del escenario: {euro(BUILDER_ECONOMICS.monthlyFee)} al mes sin IVA. La cuota de coste técnico es una hipótesis editable, no una medición de KOWI.</p>
        </div>
        <div className="rounded-3xl border border-[#e4e6e8] bg-white p-5 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[.15em] text-[#6c737b]">RESULTADO MENSUAL ESTIMADO</p>
          <div className="mt-4 flex items-end justify-between gap-2"><div><p className="text-sm text-[#666d75]">Facturación sin IVA</p><strong className="text-3xl tabular-nums sm:text-4xl">{euro(result.billed)}</strong></div><span className="rounded-full bg-[#f2f3f4] px-3 py-1 text-xs">Business Basic</span></div>
          <div role="img" aria-label="Reparto ilustrativo de ingresos entre KOWI, Partner y Builder" className="mt-5 flex h-4 overflow-hidden rounded-full bg-[#eef1f4]">
            {result.billed>0&&<><div style={{width:100*result.platformBeforeCosts/result.billed+'%',background:'#23344c'}}/><div style={{width:100*result.partner/result.billed+'%',background:'#d5a16a'}}/><div style={{width:100*result.builder/result.billed+'%',background:'#8ca9b5'}}/></>}
          </div>
          <div className="mt-5 space-y-3 text-sm tabular-nums">
            <div className="flex justify-between"><span>Suscripciones cobradas</span><strong>{euro(result.billed)}</strong></div>
            <div className="flex justify-between"><span>Comisión Partner (propuesta)</span><strong>{euro(result.partner)}</strong></div>
            <div className="flex justify-between"><span>Comisión Builder (propuesta)</span><strong>{euro(result.builder)}</strong></div>
            <div className="flex justify-between border-t border-[#e6e7e8] pt-3"><span>Para KOWI antes de costes</span><strong>{euro(result.platformBeforeCosts)}</strong></div>
            <div className="flex justify-between text-[#656b73]"><span>Coste técnico supuesto</span><span>− {euro(result.operatingCostAssumption)}</span></div>
            <div className="flex justify-between text-[#656b73]"><span>Pago tarjeta EEE estimado</span><span>− {euro(result.cardProcessingEstimate)}</span></div>
            <div className="flex justify-between border-t border-[#e6e7e8] pt-4 font-semibold"><span>Contribución estimada de KOWI</span><strong>{euro(result.platformContributionBeforeFixedCostsAndTaxes)}</strong></div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-2 rounded-xl bg-[#f4f5f6] p-4">
            <div><small className="text-[#727983]">Partner / mes</small><strong className="mt-2 block text-sm tabular-nums">{euro(result.partner)}</strong></div>
            <div><small className="text-[#727983]">Builder / mes</small><strong className="mt-2 block text-sm tabular-nums">{euro(result.builder)}</strong></div>
            <div><small className="text-[#727983]">KOWI / mes*</small><strong className="mt-2 block text-sm tabular-nums">{euro(result.platformContributionBeforeFixedCostsAndTaxes)}</strong></div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-[#777d83]">*Antes de gastos fijos, atención al cliente, cuotas, impuestos y otras incidencias. El coste de pago supone tarifa pública Stripe de tarjeta EEE (1,5 % + 0,25 €), sobre un cobro ilustrativo con IVA español del 21 %. Otras tarjetas, países o métodos tienen tarifas diferentes.</p>
        </div>
      </section>
      <section className="rounded-3xl border border-[#e4e6e8] bg-white p-5 sm:p-8">
        <h2 className="text-2xl font-semibold">Cómo funciona desde la primera venta</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">{steps.map(([n,t,d])=><article key={n} className="rounded-2xl border border-[#e9eaec] p-5"><span className="text-xs font-semibold text-[#888e96]">{n}</span><h3 className="mt-2 font-semibold">{t}</h3><p className="mt-2 text-sm leading-relaxed text-[#686f78]">{d}</p></article>)}</div>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl border border-[#e4e6e8] bg-white p-6">
          <h2 className="text-xl font-semibold">Qué puede ganar un Builder</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#606873]">Ejemplo: si implanta y mantiene 10 agentes elegibles con cuota de 99 € cada uno, su participación propuesta del 20 % sería de <strong>{euro(10*99*.2)}/mes</strong> antes de impuestos y gastos propios, durante los meses cobrados que establezca el acuerdo. No hay remuneración por plantillas sin clientes atribuidos.</p>
          <Link href="/builders" className="mt-5 inline-block rounded-full bg-[#1c1e22] px-5 py-3 text-sm font-semibold text-white">Configurar una plantilla</Link>
        </article>
        <article className="rounded-3xl border border-[#e4e6e8] bg-white p-6">
          <h2 className="text-xl font-semibold">Qué gana KOWI IA</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#606873]">KOWI conserva la suscripción no asignada a comisiones y asume infraestructura, IA, seguridad, soporte y operación. A mayor uso, mayor coste: por eso WhatsApp, voz y automatizaciones avanzadas requieren límites y precios verificados antes de venderse como ilimitados.</p>
          <Link href="/business" className="mt-5 inline-block rounded-full border border-[#d7d9dc] px-5 py-3 text-sm font-semibold">Conocer Business</Link>
        </article>
      </section>
      <section className="rounded-3xl border border-[#e4e6e8] bg-white p-6 sm:p-8">
        <h2 className="text-2xl font-semibold">Condiciones antes de comercializar</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-sm leading-relaxed text-[#606873]">
          <li>Comisiones y porcentajes sujetos a contrato, cumplimiento fiscal, atribución y cobro efectivo. Cancelaciones, impagos y devoluciones reducen el importe elegible.</li>
          <li>Una misma contratación puede retribuir ambos roles solo si son servicios diferenciados y aprobados; el reparto combinado máximo propuesto es del 35 %.</li>
          <li>Los Builders no pueden consultar datos de otras empresas ni publicar agentes sin pruebas y aprobación humana.</li>
          <li>El registro profesional de Partners/Builders, las liquidaciones y los pagos automáticos <strong>todavía no están implementados</strong>. Este simulador no crea derechos de comisión.</li>
          <li>Debemos completar el contrato comercial, la fiscalidad y el cumplimiento de protección de datos y de transparencia de IA antes de abrir la red.</li>
        </ul>
        <div className="mt-7 flex flex-wrap gap-3"><a className="rounded-full bg-[#1c1e22] px-5 py-3 text-sm font-semibold text-white" href="mailto:info@kowi.one?subject=Interes%20en%20KOWI%20Builders">Solicitar información sobre Builders</a><Link className="rounded-full border border-[#d7d9dc] px-5 py-3 text-sm font-medium" href="/partners-builders">Conocer Partners y Builders</Link></div>
      </section>
      <footer className="flex flex-wrap justify-between gap-4 border-t border-[#e4e6e8] py-6 text-sm text-[#66707a]"><span>KOWI IA · Human-First AI · Simulaciones, no promesas de rentabilidad.</span><div className="flex gap-4"><Link href="/privacidad" className="underline">Privacidad</Link><Link href="/builders" className="underline">Builders Studio</Link></div></footer>
    </div>
  </main>;
}
