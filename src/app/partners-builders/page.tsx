import Link from 'next/link';

const routes = [
  { id: 'partners', name: 'KOWI Partners', title: 'Conecta negocios con soluciones.', description: 'Para profesionales comerciales, consultores e implementadores que quieren acompañar a una empresa desde su necesidad hasta una solución útil.', steps: ['Aprender el producto y sus límites.', 'Preparar una demostración con datos ficticios.', 'Definir con el cliente el alcance y sus autorizaciones.', 'Acompañar la implantación y comprobar el resultado.'], href: '/business/demo', cta: 'Explorar la demo comercial', pending: 'El alta de colaboradores, la atribución de ventas y las comisiones todavía no están habilitadas.' },
  { id: 'builders', name: 'KOWI Builders', title: 'Convierte conocimiento en soluciones.', description: 'Para creadores y desarrolladores que quieren transformar una necesidad en un agente, una aplicación o un proyecto verificable.', steps: ['Aprender y definir una necesidad concreta.', 'Organizar objetivo, tareas y evidencias.', 'Configurar una plantilla y probar respuestas simuladas con datos ficticios.', 'Solicitar revisión antes de instalarlo para un cliente.'], href: '/builders', cta: 'Abrir KOWI Builders Studio', pending: 'El constructor de plantillas está disponible para explorar y registrar borradores en empresas autorizadas. La distribución de plantillas entre cuentas, la revisión de código, la aprobación como Builder profesional y el marketplace aún no están habilitados.' },
];

export default function PartnersBuildersPage() {
  return <main className="kowi-cosmos min-h-screen text-[#f4f3f2]">
    <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
      <Link href="/" className="font-semibold tracking-[.2em] text-[#f5c795]">KOWI</Link>
      <nav aria-label="Partners y Builders" className="flex flex-wrap gap-5 text-sm"><Link href="/business">Business</Link><Link href="/school">School</Link><Link href="/proyectos">Projects</Link></nav>
    </header>
    <section className="mx-auto max-w-6xl px-6 pb-16 pt-12">
      <p className="text-sm font-semibold text-[#f5c795]">HUMAN-FIRST AI · PARTNERS & BUILDERS</p>
      <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">Aprende. Crea. Ayuda a otros a avanzar.</h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#d3dce5]">Dos caminos conectados con KOWI School y Business: acompañar a negocios o construir soluciones para necesidades reales.</p>
      <p className="mt-6 rounded-xl border border-[#d6ad7d] bg-[#211b15] p-4 text-sm text-[#ffe2bd]">Vista previa del programa. Puedes explorar los recorridos y acceder a las herramientas existentes. La inscripción y la gestión comercial del programa están pendientes de implementación.</p>
      <div className="mt-8 flex flex-wrap gap-3"><a href="#partners" className="kowi-gold-btn rounded-full px-6 py-3 font-semibold">Quiero comercializar</a><a href="#builders" className="rounded-full border border-[#94a3b8] px-6 py-3 font-semibold">Quiero crear</a></div>
      <div className="mt-12 grid gap-6 lg:grid-cols-2">{routes.map(route => <article id={route.id} key={route.id} className="scroll-mt-6 rounded-3xl border border-[#617086] bg-[#101b2b] p-6 md:p-8">
        <p className="font-semibold text-[#f5c795]">{route.name}</p><h2 className="mt-4 text-3xl font-semibold">{route.title}</h2><p className="mt-4 leading-relaxed text-[#d3dce5]">{route.description}</p>
        <ol className="mt-6 list-decimal space-y-3 pl-5 text-[#e3e9f0]">{route.steps.map(step => <li key={step}>{step}</li>)}</ol>
        <Link href={route.href} className="kowi-gold-btn mt-8 inline-block rounded-full px-5 py-3 font-semibold">{route.cta} ↗</Link>
        <details className="mt-6 border-t border-[#617086] pt-4"><summary className="cursor-pointer font-semibold text-[#f5c795]">Qué falta para activar este programa</summary><p className="mt-3 text-sm leading-relaxed text-[#d3dce5]">{route.pending}</p></details>
      </article>)}</div>
    </section>
    <section className="border-t border-[#617086] bg-[#0b1421] px-6 py-12"><div className="mx-auto max-w-6xl"><h2 className="text-3xl font-semibold">Aprendizaje gratuito. Responsabilidad compartida.</h2><p className="mt-4 max-w-3xl leading-relaxed text-[#d3dce5]">School es el punto de entrada para aprender a utilizar la IA con criterio. Las instalaciones requieren autorización del negocio y las soluciones deben revisarse antes de publicarse. Los acuerdos económicos y las comisiones no están activos; no se garantizan ingresos.</p><Link href="/school" className="mt-6 inline-block font-semibold text-[#f5c795] underline underline-offset-4">Explorar KOWI School ↗</Link></div></section>
  </main>;
}
