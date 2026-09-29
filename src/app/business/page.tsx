import Link from 'next/link';
import AuthGate from '@/components/AuthGate';

const sectors = [
  ['Peluquería', 'Recibe consultas sobre servicios y horarios; prepara solicitudes de cita para revisión.'],
  ['Clínica dental', 'Recoge intereses y preferencias de horario; la clínica confirma precios e indicaciones.'],
  ['Promotora', 'Organiza búsquedas de vivienda, presupuestos y visitas propuestas para el equipo.'],
];

export default function BusinessPage() {
  return <main className="kowi-shell text-[#eef8ef]">
    <section id="producto" className="relative mx-auto max-w-7xl px-6 pb-16 pt-16">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-[#e8b37b]">KOWI BUSINESS · AGENTE WEB PARA NEGOCIOS</p>
      <h1 className="mt-5 max-w-3xl text-5xl font-semibold tracking-tight">Una sola voz para atender a tus clientes.</h1>
      <p className="mt-6 max-w-2xl text-lg text-[#abc3b4]">Configura servicios, horarios y reglas de tu negocio. Kowi conversa desde tu web, organiza oportunidades en el CRM y deja las acciones externas bajo tu aprobación.</p>
      <nav className="mt-8 flex flex-wrap gap-3 text-sm" aria-label="Secciones de Kowi Business">
        <a href="#casos" className="underline underline-offset-4">Casos de uso</a><a href="#crear" className="underline underline-offset-4">Crear agente</a><a href="#integraciones" className="underline underline-offset-4">Integraciones</a><a href="#contacto" className="underline underline-offset-4">Precios y contacto</a>
      </nav>
      <div className="mt-8 flex flex-wrap gap-3"><a href="#crear" className="rounded-full bg-[#e8b37b] px-7 py-4 font-semibold text-[#17121a]">Crear mi agente</a><Link href="/business/demo" className="rounded-full border border-white/20 px-7 py-4">Probar KOWI</Link><Link href="/business/instalar" className="rounded-full border border-white/20 px-7 py-4">Instalar KOWI en mi negocio ↗</Link></div>
      <div className="mt-12 grid gap-4 md:grid-cols-3">{[['Atención comercial','Respuestas guiadas por la ficha aprobada y preparación de solicitudes.'],['CRM y seguimiento','Oportunidades, estado, notas y siguientes pasos en un mismo lugar.'],['Control del negocio','Revisión de acciones y estado visible de cada canal antes de ejecutar.']].map(([title,body])=><article key={title} className="glass rounded-2xl p-6"><h2 className="text-xl font-semibold">{title}</h2><p className="mt-3 text-[#a9c1b3]">{body}</p></article>)}</div>
    </section>
    <section id="casos" className="border-y border-white/10 bg-[#0b2019] px-6 py-16"><div className="mx-auto max-w-7xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#e8b37b]">CASOS DE USO · EJEMPLOS</p><h2 className="mt-4 text-3xl font-semibold">Una conversación, un siguiente paso claro.</h2><div className="mt-8 grid gap-4 md:grid-cols-3">{sectors.map(([title,body])=><article className="glass rounded-2xl p-6" key={title}><h3 className="text-xl font-semibold">{title}</h3><p className="mt-3 text-[#abc3b4]">{body}</p><Link href="/business/demo" className="mt-6 inline-block text-sm font-semibold text-[#e8b37b]">Ver simulación ↗</Link></article>)}</div><p className="mt-6 text-sm text-[#abc3b4]">Los escenarios de la demo usan negocios ficticios. Ningún caso representa un cliente real.</p></div></section>
    <section id="integraciones" className="mx-auto max-w-7xl px-6 py-16"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#e8b37b]">INTEGRACIONES</p><h2 className="mt-4 text-3xl font-semibold">Empieza por tu web y amplía los canales.</h2><div className="mt-8 grid gap-4 md:grid-cols-3"><article className="glass rounded-2xl p-6"><h3 className="text-xl font-semibold">Web</h3><p className="mt-3 text-[#abc3b4]">Copia un script, autoriza tu dominio y prueba el agente desde tu propia página.</p></article><article className="glass rounded-2xl p-6"><h3 className="text-xl font-semibold">Correo</h3><p className="mt-3 text-[#abc3b4]">El envío automatizado requiere configurar el remitente y aprobar las comunicaciones externas.</p></article><article className="glass rounded-2xl p-6"><h3 className="text-xl font-semibold">WhatsApp y calendario</h3><p className="mt-3 text-[#abc3b4]">Canales previstos para integración por negocio; requieren credenciales y configuración independientes.</p></article></div><Link href="/business/instalar" className="mt-8 inline-block rounded-full bg-[#e8b37b] px-7 py-4 font-semibold text-[#17121a]">Instalar en mi web ↗</Link></section>
    <section id="contacto" className="border-t border-white/10 bg-[#0b2019] px-6 py-16"><div className="mx-auto max-w-7xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#e8b37b]">PRECIOS Y CONTACTO</p><h2 className="mt-4 text-3xl font-semibold">Diseñemos el piloto para tu negocio.</h2><p className="mt-4 max-w-2xl text-[#abc3b4]">El alcance y precio se acuerdan según el agente, el volumen y los canales que quieras conectar. Solicita una propuesta sin compromiso.</p><a href="mailto:info@kowi.one?subject=Propuesta%20Kowi%20Business" className="mt-7 inline-block rounded-full border border-white/20 px-7 py-4 font-semibold">Solicitar propuesta ↗</a></div></section>
    <div id="crear"><AuthGate mode="business"/></div>
  </main>;
}
