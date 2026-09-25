import Link from 'next/link';

export default function Home() {
  return <main className="min-h-screen bg-[#f7f8f3] text-[#153c35]">
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-7">
      <Link href="/" className="text-xl font-bold tracking-[0.2em]">KOWI <span className="font-normal tracking-normal">Business</span></Link>
      <Link href="/kowi" className="rounded-full border border-teal-900/20 px-5 py-2 text-sm font-semibold">Entrar ↗</Link>
    </header>
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
      <div>
        <p className="mb-6 text-xs font-semibold uppercase tracking-[0.22em]">Human-First AI · Para ideas en movimiento</p>
        <h1 className="text-5xl font-semibold leading-[1.08] tracking-tight md:text-6xl">Tienes una idea.<br /><span className="text-teal-700">Ahora conviértela en acción.</span></h1>
        <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-600">Dale dirección a tu próximo proyecto. Kowi te ayuda a definir un objetivo, crear un plan de 30 días y elegir qué hacer hoy.</p>
        <Link href="/kowi" className="mt-8 inline-block rounded-full bg-teal-900 px-8 py-4 font-semibold text-white">Probar Kowi <span aria-hidden="true">↗</span></Link>
        <p className="mt-4 text-xs text-slate-500">Tú decides el rumbo. Kowi te ayuda a avanzar.</p>
      </div>
      <div className="relative rounded-[2rem] bg-[#deeadf] p-6 md:p-10">
        <p className="mb-5 text-xs font-bold uppercase tracking-widest text-teal-800">Así puede empezar tu plan · Ejemplo</p>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Tu intención</p>
          <p className="mt-2 text-xl font-medium">“Quiero validar mi idea de negocio.”</p>
          <div className="my-6 h-px bg-slate-100" />
          <p className="text-sm text-slate-500">Tu objetivo en 30 días</p>
          <p className="mt-2">Hablar con 10 posibles clientes y probar una primera propuesta.</p>
          <ol className="mt-6 space-y-3 text-sm">
            {['1–7 · Define a quién quieres ayudar', '8–14 · Escucha a tus posibles clientes', '15–21 · Prueba una propuesta sencilla', '22–30 · Aprende y decide tu siguiente paso'].map(t => <li key={t} className="rounded-lg bg-slate-50 p-3">{t}</li>)}
          </ol>
          <div className="mt-6 rounded-xl bg-[#e8f4b8] p-4"><p className="text-xs font-bold uppercase tracking-wide">Tu primera acción</p><p className="mt-2 text-sm">Escribe los nombres de tres personas con las que puedas hablar esta semana.</p></div>
        </div>
      </div>
    </section>
    <section className="mx-auto max-w-6xl border-t border-teal-900/10 px-6 py-16" aria-labelledby="how">
      <h2 id="how" className="text-3xl font-semibold">Menos vueltas. Un siguiente paso claro.</h2>
      <div className="mt-10 grid gap-8 md:grid-cols-3">{[
        ['01', 'Expresa tu intención', 'Empieza con lo que tienes en mente. Unas pocas preguntas ayudan a encontrar el foco.'],
        ['02', 'Dale forma a tu plan', 'Un objetivo concreto y cuatro etapas para avanzar durante los próximos 30 días.'],
        ['03', 'Actúa y vuelve', 'Guarda tu conversación, comparte tus avances y ajusta el camino cuando lo necesites.'],
      ].map(([n, title, body]) => <article key={n}><p className="text-sm text-teal-700">{n}</p><h3 className="mt-3 text-xl font-semibold">{title}</h3><p className="mt-3 leading-relaxed text-slate-600">{body}</p></article>)}</div>
    </section>
    <footer className="mx-auto flex max-w-6xl flex-wrap justify-between gap-4 border-t border-teal-900/10 px-6 py-8 text-sm text-slate-600">
      <p>Kowi One · La decisión sigue siendo tuya.</p><Link href="/privacidad" className="underline">Privacidad y uso de IA</Link>
    </footer>
  </main>;
}
