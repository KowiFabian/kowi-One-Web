import Link from 'next/link';

const sectors = [
  ['Peluquerías', 'Recibe consultas sobre servicios, prepara solicitudes de cita y organiza el seguimiento.'],
  ['Clínicas dentales', 'Atiende primeras preguntas, recoge la información necesaria y prepara una petición de cita.'],
  ['Inmobiliarias', 'Conoce qué busca cada persona y entrega al equipo una oportunidad comercial más clara.'],
];
export default function Home() {
  return <main className="site-shell min-h-screen text-[#ecf4e9]">
    <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-7">
      <Link href="/" className="text-2xl font-bold tracking-[.18em]">KOWI <span className="text-sm font-normal tracking-normal text-[#c5dabd]">ONE</span></Link>
      <nav aria-label="Principal" className="hidden gap-8 text-sm md:flex"><a href="#business">Business</a><a href="#vision">Visión</a><a href="#metodo">Cómo funciona</a></nav>
      <Link href="/business/demo" className="rounded-full border border-white/40 px-5 py-2.5 text-sm font-semibold hover:bg-white/10">Ver demo ↗</Link>
    </header>
    <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-24 pt-16 md:grid-cols-2 md:pb-32 md:pt-24">
      <div><p className="mb-7 text-xs font-bold uppercase tracking-[.24em] text-[#c5e6a7]">Human-First AI · Ideas que se convierten en acción</p>
        <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-.05em] md:text-7xl">La tecnología avanza. <em className="font-serif font-normal text-[#d5edaa]">Las personas también.</em></h1>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-[#c4d7cc]">Kowi conecta tus ideas con planes, personas y agentes de IA para hacerlas realidad. Para quienes emprenden, hacen crecer un negocio o quieren empezar.</p>
        <div className="mt-9 flex flex-wrap gap-3"><Link href="/business/demo" className="rounded-full bg-[#d9efae] px-7 py-4 font-semibold text-[#183d31] hover:bg-white">Explorar Kowi Business ↗</Link><Link href="/kowi" className="rounded-full border border-white/40 px-7 py-4 font-semibold hover:bg-white/10">Crear mi plan</Link></div>
        <p className="mt-5 text-sm text-[#abc7b5]">Las decisiones y autorizaciones siguen en tus manos.</p>
      </div>
      <div className="connection-field relative flex min-h-[430px] items-center justify-center overflow-hidden rounded-[2.5rem] border border-white/10 md:min-h-[530px]" aria-label="Una idea conectada con personas, agentes y acciones">
        <div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="orb z-10 flex h-44 w-44 items-center justify-center rounded-full border border-[#d5edaa]/50 text-6xl font-semibold text-[#e5f5c7] shadow-[0_0_90px_30px_#a6c58c30]">K</div>
        <div className="flow-card left-[6%] top-[10%]"><small>01 · INTENCIÓN</small><p>Tengo una idea</p></div>
        <div className="flow-card right-[4%] top-[40%]"><small>02 · CONEXIÓN</small><p>Personas + agentes</p></div>
        <div className="flow-card bottom-[10%] left-[12%]"><small>03 · ACCIÓN</small><p>Hacerla realidad</p></div>
      </div>
    </section>
    <section id="business" className="bg-[#eef2e8] px-6 py-24 text-[#193d32]"><div className="mx-auto max-w-7xl">
      <div className="grid gap-8 md:grid-cols-2 md:items-end"><div><p className="eyebrow">KOWI BUSINESS</p><h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">Una atención más cercana. Un negocio más capaz.</h2></div><p className="text-lg leading-relaxed text-[#526b5b]">Un agente configurable para responder consultas, preparar citas, identificar oportunidades y organizar el seguimiento. Tu equipo conserva el control de cada decisión sensible.</p></div>
      <div className="mt-12 grid gap-4 md:grid-cols-3">{sectors.map(([name,body],i)=><article key={name} className="rounded-[1.75rem] border border-[#d2dfcc] bg-white p-7"><span className="text-3xl text-[#568064]" aria-hidden="true">{['✳','✦','⌂'][i]}</span><h3 className="mt-8 text-2xl font-semibold">{name}</h3><p className="mt-4 leading-relaxed text-[#526b5b]">{body}</p></article>)}</div>
      <div className="mt-10 flex flex-wrap items-center gap-6"><Link href="/business/demo" className="rounded-full bg-[#194538] px-7 py-4 font-semibold text-white hover:bg-[#28634d]">Probar casos de ejemplo ↗</Link><a href="mailto:info@kowi.one?subject=Kowi%20Business" className="font-semibold underline underline-offset-4">Hablar de mi negocio</a></div>
    </div></section>
    <section id="metodo" className="mx-auto max-w-7xl px-6 py-24"><p className="eyebrow text-[#c9e4a7]">UNA FORMA DE AVANZAR</p><h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">Del «quiero hacerlo» al primer paso concreto.</h2><div className="mt-12 grid gap-6 md:grid-cols-4">{[
      ['01','Cuéntanos tu intención','Una idea, una necesidad o un objetivo. Empezamos por escucharte.'],
      ['02','Damos forma al objetivo','Kowi hace las preguntas necesarias y propone un camino claro.'],
      ['03','Conectamos capacidades','Un agente especializado o una persona adecuada puede ayudarte a avanzar.'],
      ['04','Actúas con control','Revisas lo importante, autorizas las acciones sensibles y aprendes del resultado.'],
    ].map(([n,t,d])=><article key={n} className="border-t border-white/25 pt-5"><p className="text-sm text-[#c9e4a7]">{n}</p><h3 className="mt-5 text-xl font-semibold">{t}</h3><p className="mt-3 leading-relaxed text-[#bed1c3]">{d}</p></article>)}</div></section>
    <section id="vision" className="bg-[#dbeaa9] px-6 py-20 text-[#173d31]"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 md:flex-row md:items-end"><div><p className="eyebrow">LA VISIÓN KOWI</p><h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">Más personas capaces de ayudar a otras personas.</h2><p className="mt-6 max-w-2xl text-lg leading-relaxed">Kowi One comienza con planes personales y Kowi Business con agentes para negocios. Kowi School y la comunidad ampliarán lo que podemos aprender, construir y compartir juntos.</p></div><Link href="/kowi" className="shrink-0 rounded-full bg-[#194538] px-7 py-4 font-semibold text-white">Empezar con mi idea ↗</Link></div></section>
    <footer className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-6 py-10 text-sm text-[#b7d0c1] md:flex-row"><div><p className="text-xl font-bold tracking-[.16em] text-white">KOWI ONE</p><p className="mt-2">Human-First AI · Madrid, España</p></div><div className="flex flex-wrap items-center gap-6"><a href="mailto:info@kowi.one">info@kowi.one</a><Link href="/privacidad">Privacidad y uso de IA</Link></div></footer>
  </main>;
}