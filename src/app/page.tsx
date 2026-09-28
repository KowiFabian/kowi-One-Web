import Link from 'next/link';

const capabilities = [
  ['Kowi Personal', 'Convierte una intención en objetivo, plan y primera acción concreta.'],
  ['Kowi Business', 'Atención, seguimiento, ventas y coordinación con revisión humana.'],
  ['Human Approval', 'Las acciones sensibles se detienen hasta recibir autorización explícita.'],
  ['Action Ledger', 'Cada acción importante deja contexto, permisos y evidencia para poder revisarla.'],
];

const sectors = [
  ['Peluquerías', 'Consultas, solicitudes de cita y seguimiento comercial.'],
  ['Clínicas dentales', 'Primera atención, captación y preparación de citas sin automatizar decisiones clínicas.'],
  ['Inmobiliarias', 'Cualificación de oportunidades, seguimiento y coordinación de visitas.'],
];

export default function Home() {
  return <main className="kowi-shell min-h-screen text-[#eef8ef]">
    <div className="kowi-grid pointer-events-none absolute inset-0 opacity-50" />
    <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-6">
      <Link href="/" className="flex items-center gap-3">
        <span className="hero-orb h-9 w-9 rounded-full" />
        <span className="text-sm font-bold tracking-[.28em]">KOWI ONE</span>
      </Link>
      <nav className="hidden items-center gap-8 text-sm text-[#bad0c1] md:flex" aria-label="Principal">
        <a href="#vision">Visión</a><a href="#business">Business</a><a href="#safety">Control humano</a>
      </nav>
      <Link href="/kowi" className="rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold hover:bg-white/10">Entrar a Kowi ↗</Link>
    </header>

    <section className="relative mx-auto grid max-w-7xl gap-12 px-6 pb-24 pt-14 md:grid-cols-[1.02fr_.98fr] md:items-center md:pb-32 md:pt-20">
      <div className="relative z-10">
        <div className="fade-up inline-flex items-center gap-2 rounded-full border border-[#d7f2a7]/20 bg-[#d7f2a7]/5 px-4 py-2 text-xs font-bold uppercase tracking-[.2em] text-[#d7f2a7]"><span className="signal-dot"/>Human‑First AI</div>
        <h1 className="fade-up d2 mt-7 max-w-3xl text-5xl font-semibold leading-[1.02] tracking-[-.055em] md:text-7xl">
          Convierte lo que imaginas en <span className="text-[#d7f2a7]">acción real.</span>
        </h1>
        <p className="fade-up d3 mt-7 max-w-2xl text-lg leading-relaxed text-[#b8cec0] md:text-xl">
          Kowi une personas, agentes de IA y herramientas para transformar una intención en un objetivo, un plan y una ejecución controlada por ti.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/kowi" className="rounded-full bg-[#d7f2a7] px-7 py-4 font-semibold text-[#173b31] shadow-[0_0_45px_rgba(215,242,167,.18)] hover:bg-white">Crear mi plan ↗</Link>
          <Link href="/business/demo" className="rounded-full border border-white/20 bg-white/5 px-7 py-4 font-semibold hover:bg-white/10">Ver Kowi Business</Link>
        </div>
        <div className="mt-8 flex flex-wrap gap-5 text-sm text-[#9db9aa]">
          <span>✓ decisiones sensibles con aprobación</span>
          <span>✓ historial y continuidad</span>
          <span>✓ diseñado para personas y negocios</span>
        </div>
      </div>

      <div className="relative min-h-[520px] overflow-hidden rounded-[2.4rem] border border-white/10 bg-[#0d2a22]/80 shadow-[0_40px_100px_rgba(0,0,0,.28)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(83,147,105,.24),transparent_50%)]" />
        <div className="orbit-ring"/><div className="orbit-ring two"/><div className="orbit-ring three"/>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="hero-orb kowi-pulse z-10 flex h-44 w-44 items-center justify-center rounded-full border border-[#d7f2a7]/30">
            <div className="text-center"><div className="text-5xl font-semibold">K</div><div className="mt-1 text-[10px] tracking-[.28em] text-[#d7f2a7]">HUMAN FIRST</div></div>
          </div>
        </div>
        <div className="signal-card float-a left-[5%] top-[9%]"><small>INTENCIÓN</small><p className="text-sm">“Quiero hacer realidad una idea.”</p></div>
        <div className="signal-card float-b right-[4%] top-[37%]"><small>CONEXIÓN</small><p className="text-sm">Persona + agente + herramienta</p></div>
        <div className="signal-card float-a bottom-[8%] left-[10%]"><small>ACCIÓN</small><p className="text-sm">Plan, aprobación y evidencia</p></div>
        <div className="absolute bottom-6 right-6 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-[#a9c8b5]">Kowi está diseñado para amplificar capacidad humana.</div>
      </div>
    </section>

    <section id="vision" className="relative border-y border-white/10 bg-white/[.025] px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-bold uppercase tracking-[.22em] text-[#d7f2a7]">La plataforma</p>
        <div className="mt-4 grid gap-8 md:grid-cols-[.9fr_1.1fr] md:items-end">
          <h2 className="text-4xl font-semibold tracking-[-.04em] md:text-5xl">Una IA que no te reemplaza. Te ayuda a avanzar.</h2>
          <p className="text-lg leading-relaxed text-[#adc5b6]">Kowi parte de una idea sencilla: la tecnología debe aumentar la capacidad de una persona para decidir, crear, organizarse y ayudar a otras. Por eso combina automatización con control humano, memoria útil y agentes especializados.</p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {capabilities.map(([title,body],i)=><article key={title} className="glass rounded-[1.7rem] p-6">
            <div className="mb-8 flex items-center justify-between"><span className="text-sm text-[#d7f2a7]">0{i+1}</span><span className="signal-dot"/></div>
            <h3 className="text-xl font-semibold">{title}</h3><p className="mt-3 leading-relaxed text-[#a9c1b3]">{body}</p>
          </article>)}
        </div>
      </div>
    </section>

    <section id="business" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-2 md:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[.22em] text-[#d7f2a7]">Kowi Business</p><h2 className="mt-4 text-4xl font-semibold tracking-[-.04em] md:text-5xl">Un agente que trabaja con tu negocio, no por encima de él.</h2></div>
          <p className="text-lg leading-relaxed text-[#adc5b6]">Atiende, organiza, detecta oportunidades y prepara el siguiente paso. Cuando una acción tiene impacto real, Kowi pide autorización.</p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">{sectors.map(([title,body])=><article key={title} className="glass rounded-[1.7rem] p-7">
          <div className="mb-8 h-12 w-12 rounded-2xl border border-[#d7f2a7]/20 bg-[#d7f2a7]/5 p-3"><div className="hero-orb h-full w-full rounded-full"/></div>
          <h3 className="text-2xl font-semibold">{title}</h3><p className="mt-4 leading-relaxed text-[#a9c1b3]">{body}</p>
        </article>)}</div>
        <div className="mt-10"><Link href="/business/demo" className="inline-flex rounded-full bg-[#d7f2a7] px-7 py-4 font-semibold text-[#173b31]">Probar demo comercial ↗</Link></div>
      </div>
    </section>

    <section id="safety" className="px-6 pb-24">
      <div className="mx-auto grid max-w-7xl gap-6 rounded-[2rem] border border-[#d7f2a7]/15 bg-[#d7f2a7]/5 p-8 md:grid-cols-[1fr_.8fr] md:p-12">
        <div><p className="text-xs font-bold uppercase tracking-[.22em] text-[#d7f2a7]">Control humano por diseño</p><h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">Automatizar lo útil. Detener lo sensible.</h2><p className="mt-5 max-w-2xl leading-relaxed text-[#b2c9bb]">Pagos, identidad, voz, permisos, comunicaciones externas, borrado o cambios sensibles requieren aprobación explícita. Kowi puede preparar; la persona conserva la decisión.</p></div>
        <div className="grid gap-3 text-sm">
          {['Bajo riesgo → automatizable','Riesgo medio → revisión sugerida','Alto impacto → autorización obligatoria'].map((x,i)=><div key={x} className="glass rounded-2xl p-4"><span className="mr-3 text-[#d7f2a7]">0{i+1}</span>{x}</div>)}
        </div>
      </div>
    </section>

    <footer className="border-t border-white/10 px-6 py-10 text-sm text-[#9db9aa]"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 md:flex-row">
      <div><div className="font-bold tracking-[.24em] text-white">KOWI ONE</div><div className="mt-2">Human‑First AI · Madrid, España</div></div>
      <div className="flex flex-wrap gap-6"><a href="mailto:info@kowi.one">info@kowi.one</a><Link href="/privacidad">Privacidad</Link><Link href="/kowi">Entrar</Link></div>
    </div></footer>
  </main>;
}
