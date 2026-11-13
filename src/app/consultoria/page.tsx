import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Consultoría y automatización para negocios | KOWI IA',
  description: 'Diagnóstico, automatización de tareas y seguimiento operativo para pequeños negocios. Solicita una valoración personalizada.',
};

const offers = [
  { name: 'Diagnóstico operativo', price: '149 €', detail: 'Mapa de un proceso, tres mejoras priorizadas y una hoja de ruta en 48 horas laborables tras recibir la información.', items: ['Entrevista de 30 minutos', 'Identificación de tareas repetitivas', 'Informe y prioridades de mejora'] },
  { name: 'Automatización inicial', price: '299 €', detail: 'Implementación de un flujo sencillo con herramientas acordadas, sujeto a evaluación técnica y alcance cerrado.', items: ['Un proceso y una integración básica', 'Prueba guiada con datos de ejemplo', 'Manual breve y entrega'] },
  { name: 'Acompañamiento mensual', price: '79 €/mes', detail: 'Supervisión ligera y ajustes menores del flujo contratado. No incluye nuevas integraciones.', items: ['Revisión mensual de funcionamiento', 'Hasta una hora de soporte', 'Informe breve de oportunidades'] },
];
const mail='info@kowi.one';
const subject='Solicitud de diagnóstico KOWI Operaciones';
const body='Hola, quiero solicitar información sobre KOWI Operaciones y Automatización.\n\nEmpresa / sector:\nProceso que quiero mejorar:\nTeléfono (opcional):\nHorario para contactar:\n\nHe leído que se trata de una solicitud de contacto, sin contratación automática.';
const contact='mailto:'+mail+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);

export default function ConsultoriaPage() {
  return <main className="min-h-screen bg-[#f8faf9] text-[#142a27]">
    <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
      <Link href="/" className="font-bold tracking-[.22em] text-[#087e75]">KOWI IA</Link>
      <Link href="/business" className="text-sm font-medium underline underline-offset-4">Conoce KOWI Business</Link>
    </header>
    <section className="mx-auto grid max-w-6xl gap-8 px-5 pb-16 pt-14 md:grid-cols-[1.3fr_.7fr] md:items-center">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#087e75]">KOWI · Operaciones & Automatización</p>
        <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight md:text-6xl">Menos tareas repetitivas. Más tiempo para tus clientes.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#4c625e]">Revisamos cómo trabaja tu negocio, detectamos procesos que consumen tiempo y te ayudamos a implementar mejoras digitales sencillas, con control humano.</p>
        <div className="mt-8 flex flex-wrap gap-3"><a href={contact} className="rounded-full bg-[#087e75] px-6 py-4 font-semibold text-white">Solicitar diagnóstico por email</a><a href="#servicios" className="rounded-full border border-[#a9c9c1] px-6 py-4 font-semibold">Ver servicios y precios</a></div>
        <p className="mt-4 text-xs text-[#627570]">Sin pago automático. Te confirmaremos alcance, disponibilidad y condiciones antes de contratar.</p>
      </div>
      <aside className="rounded-3xl border border-[#cce5dd] bg-white p-7 shadow-sm">
        <p className="text-sm font-semibold text-[#087e75]">Cómo empezamos</p>
        <ol className="mt-5 space-y-5">{[['01','Nos cuentas el problema'],['02','Evaluamos el proceso'],['03','Te enviamos una propuesta'],['04','Implementamos tras tu aprobación']].map(([n,t])=><li key={n} className="flex gap-4"><span className="font-bold text-[#087e75]">{n}</span><span>{t}</span></li>)}</ol>
      </aside>
    </section>
    <section id="servicios" className="bg-[#eaf4f0] py-16"><div className="mx-auto max-w-6xl px-5">
      <p className="text-xs font-bold uppercase tracking-widest text-[#087e75]">Servicios de lanzamiento</p><h2 className="mt-3 text-3xl font-semibold">Empieza pequeño. Mejora con resultados medibles.</h2>
      <div className="mt-8 grid gap-5 md:grid-cols-3">{offers.map(o=><article key={o.name} className="rounded-3xl border border-[#c9dfd8] bg-white p-7">
        <h3 className="text-xl font-semibold">{o.name}</h3><p className="mt-4 text-4xl font-semibold text-[#087e75]">{o.price}</p><p className="mt-4 min-h-20 text-sm leading-relaxed text-[#4c625e]">{o.detail}</p>
        <ul className="mt-5 space-y-3 text-sm">{o.items.map(i=><li key={i} className="flex gap-2"><span aria-hidden="true" className="text-[#087e75]">✓</span>{i}</li>)}</ul>
        <a href={contact} className="mt-7 inline-block font-semibold text-[#087e75] underline underline-offset-4">Consultar disponibilidad</a>
      </article>)}</div>
      <p className="mt-5 text-sm text-[#526862]">Precios orientativos sin IVA. Las licencias, APIs, servicios externos, mensajería y desarrollos fuera de alcance se presupuestan aparte. El diagnóstico no garantiza ahorros específicos.</p>
    </div></section>
    <section className="mx-auto max-w-6xl px-5 py-16"><h2 className="text-3xl font-semibold">Qué podemos mejorar</h2>
      <div className="mt-7 grid gap-4 md:grid-cols-3">{[
        ['Peluquerías y centros de belleza','Solicitudes de citas, consultas frecuentes y seguimiento de clientes.'],
        ['Clínicas y centros profesionales','Organización de solicitudes administrativas sin automatizar decisiones clínicas ni tratar datos sensibles sin garantías.'],
        ['Comercios y servicios','Pedidos, incidencias, hojas de control y reportes sencillos.'],
      ].map(([h,p])=><article key={h} className="rounded-2xl border border-[#d4e2dc] p-6"><h3 className="font-semibold">{h}</h3><p className="mt-3 text-sm text-[#526862]">{p}</p></article>)}</div>
    </section>
    <section className="bg-[#142a27] px-5 py-16 text-white"><div className="mx-auto max-w-6xl">
      <h2 className="text-3xl font-semibold">Una automatización útil, con tu autorización.</h2><p className="mt-4 max-w-3xl text-[#d0e4dc]">No activamos envíos masivos, cobros ni cambios sensibles sin aprobación. Las demos son ilustrativas. La integración automática de WhatsApp está sujeta a validación técnica y no se ofrece como funcionalidad confirmada en este servicio inicial.</p>
      <a href={contact} className="mt-8 inline-block rounded-full bg-white px-6 py-4 font-semibold text-[#142a27]">Hablar sobre mi negocio</a>
      <p className="mt-5 text-sm text-[#c2d9d0]">Contacto: {mail}. Al escribirnos por email compartes voluntariamente la información incluida en tu mensaje; evita enviar datos de pacientes, credenciales o datos sensibles.</p>
    </div></section>
    <footer className="mx-auto max-w-6xl px-5 py-8 text-xs text-[#526862]">KOWI IA · Servicio en fase de lanzamiento. La contratación y facturación requieren confirmación individual y cumplimiento fiscal aplicable.</footer>
  </main>;
}
