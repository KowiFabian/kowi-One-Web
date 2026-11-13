import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Agentes IA especializados | KOWI AI',
  description: 'Equipo de agentes IA comerciales, de atención al cliente, operaciones, administración, finanzas y marketing con supervisión humana.',
};

const agents = [
  { name:'Agente IA Comercial', icon:'↗', summary:'Ayuda a captar, cualificar y dar seguimiento a oportunidades de venta.', tasks:['Clasificación de consultas comerciales','Preparación de propuestas y seguimientos','Registro de oportunidades en CRM'], safeguard:'El envío externo y las condiciones comerciales requieren autorización.' },
  { name:'Agente IA Asesor al Cliente', icon:'◎', summary:'Responde consultas y organiza solicitudes de clientes.', tasks:['Preguntas frecuentes basadas en datos aprobados','Solicitudes de cita e incidencias','Escalado a un responsable'], safeguard:'La reserva confirmada, los recordatorios y WhatsApp dependen de integraciones validadas.' },
  { name:'Agente IA Operativo', icon:'▤', summary:'Coordina tareas repetitivas y ofrece visibilidad de procesos.', tasks:['Seguimiento de pedidos y tareas','Alertas y registro de incidencias','Indicadores e informes operativos'], safeguard:'No modifica inventario, pedidos o ERP sin permisos y aprobación.' },
  { name:'Agente IA Administrativo', icon:'▣', summary:'Organiza documentación, agendas y flujos administrativos.', tasks:['Clasificación de solicitudes','Preparación de documentos e informes','Recordatorios y tareas internas'], safeguard:'Los documentos legales y cambios de datos requieren revisión humana.' },
  { name:'Agente IA Financiero', icon:'◈', summary:'Asiste con análisis, presupuestos y control financiero.', tasks:['Análisis de gastos y márgenes','Previsiones y escenarios','Propuestas de conciliación y alertas'], safeguard:'Sin pagos, transferencias, decisiones crediticias ni asesoramiento financiero autónomo.' },
  { name:'Agente IA Marketing', icon:'✦', summary:'Ayuda a preparar campañas y evaluar resultados.', tasks:['Borradores de contenido y campañas','Calendarios editoriales','Análisis de métricas y propuestas'], safeguard:'Publicaciones, publicidad y uso de datos personales requieren autorización y base legal.' },
  { name:'Agente IA de Recursos Humanos', icon:'◇', summary:'Apoyo administrativo a equipos y formación.', tasks:['Preguntas internas aprobadas','Onboarding y documentación','Planificación de formación'], safeguard:'No selecciona, clasifica ni evalúa personas automáticamente; los usos laborales de alto riesgo requieren evaluación legal específica.' },
  { name:'Agente IA de Compras', icon:'▧', summary:'Organiza necesidades, solicitudes y comparativas.', tasks:['Recopilación de requisitos','Comparación de presupuestos','Seguimiento de entregas'], safeguard:'Sin órdenes de compra ni compromisos de gasto sin aprobación.' },
  { name:'Agente IA de Calidad', icon:'◉', summary:'Apoya la mejora continua de procesos.', tasks:['Checklists de control','Registro de no conformidades','Propuestas de mejora'], safeguard:'Las decisiones críticas y certificaciones corresponden a responsables humanos.' },
  { name:'Agente IA de Proyectos', icon:'◌', summary:'Convierte objetivos en planes y tareas verificables.', tasks:['Planificación por fases','Seguimiento de hitos','Informes de avance'], safeguard:'Los cambios de alcance y compromisos externos requieren autorización.' },
  { name:'Agente IA de Seguridad y Verificación', icon:'⬡', summary:'Identifica señales de riesgo y prepara evidencias para revisión.', tasks:['Detección preliminar de anomalías','Registro de incidencias','Recomendaciones de protección'], safeguard:'No emite veredictos definitivos de fraude ni ejecuta bloqueos sensibles por sí solo.' },
];

const mailto = 'mailto:info@kowi.one?subject=' + encodeURIComponent('Solicitud de agente especializado KOWI AI');

export default function CatalogoAgentesPage() {
  return <main className="min-h-screen bg-[#f7faf9] text-[#142a27]">
    <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
      <Link href="/" className="font-bold tracking-[.2em] text-[#087e75]">KOWI AI</Link>
      <Link href="/partners-builders" className="text-sm underline underline-offset-4">Partners & Builders</Link>
    </header>
    <section className="mx-auto max-w-6xl px-5 pb-12 pt-12">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-[#087e75]">Ecosistema de agentes especializados · Catálogo comercial</p>
      <h1 className="mt-4 max-w-5xl text-4xl font-semibold tracking-tight md:text-6xl">Tu equipo de agentes inteligentes, disponible 24/7.</h1>
      <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#536a63]">Agentes IA para ventas, clientes, operaciones, administración, finanzas y marketing. Diseñados para trabajar con objetivos claros, permisos limitados, tareas programadas y supervisión humana. La disponibilidad depende del plan, las integraciones y el estado del servicio.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a href={mailto} className="rounded-full bg-[#087e75] px-6 py-3 font-semibold text-white">Solicitar una propuesta</a>
        <Link href="/builders" className="rounded-full border border-[#b9d4cb] px-6 py-3 font-semibold">Explorar el constructor</Link>
      </div>
      <p className="mt-4 text-sm text-[#536a63]">Catálogo de capacidades objetivo. Cada agente se activa solo tras verificar su alcance, seguridad y funcionamiento real.</p>
    </section>
    <section className="mx-auto max-w-6xl px-5 pb-16">
      <h2 className="mb-6 text-2xl font-semibold">Especialidades KOWI AI</h2>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{agents.map(a=><article key={a.name} className="flex flex-col rounded-3xl border border-[#d6e6e0] bg-white p-6 shadow-sm">
        <span className="text-3xl text-[#087e75]" aria-hidden="true">{a.icon}</span>
        <h3 className="mt-4 text-xl font-semibold">{a.name}</h3>
        <p className="mt-3 text-sm leading-relaxed text-[#50665e]">{a.summary}</p>
        <ul className="mt-5 space-y-2 text-sm">{a.tasks.map(t=><li key={t} className="flex gap-2"><span className="text-[#087e75]" aria-hidden="true">✓</span>{t}</li>)}</ul>
        <p className="mt-5 rounded-xl bg-[#f0f6f3] p-4 text-xs leading-relaxed text-[#415a52]"><strong>Control humano:</strong> {a.safeguard}</p>
        <a href={mailto} className="mt-6 inline-block font-semibold text-[#087e75] underline underline-offset-4">Consultar configuración y precio</a>
      </article>)}</div>
    </section>
    <section className="bg-[#142a27] px-5 py-16 text-white"><div className="mx-auto max-w-6xl">
      <p className="text-xs font-bold uppercase tracking-widest text-[#9ad7c7]">KOWI Human-First AI</p>
      <h2 className="mt-4 text-3xl font-semibold">Automatización con responsabilidad y trazabilidad.</h2>
      <div className="mt-7 grid gap-4 md:grid-cols-3">{[
        ['Identidad y permisos','Cada agente debe tener identidad propia, acceso mínimo y límites de actuación.'],
        ['Aprobación proporcional al riesgo','Pagos, comunicaciones externas, datos, voz, permisos y eliminación requieren autorización explícita.'],
        ['Registro y supervisión','Las acciones deben quedar registradas, con responsable, estado y posibilidad de revisión o interrupción.'],
      ].map(([h,p])=><div key={h} className="rounded-2xl border border-white/20 p-5"><h3 className="font-semibold">{h}</h3><p className="mt-3 text-sm text-[#cde0d8]">{p}</p></div>)}</div>
      <p className="mt-7 max-w-4xl text-sm leading-relaxed text-[#cde0d8]">Diseño orientado al RGPD, al Reglamento europeo de IA (AI Act) y a otras normas aplicables según el caso de uso. Esto no constituye una certificación ni una declaración de cumplimiento legal verificado. Los usos de alto riesgo exigen evaluación específica antes de su comercialización.</p>
      <div className="mt-8 flex flex-wrap gap-3"><Link href="/partners-builders" className="rounded-full bg-white px-6 py-3 font-semibold text-[#142a27]">Ser Partner o Builder</Link><Link href="/consultoria" className="rounded-full border border-white/40 px-6 py-3 font-semibold">Consultoría e implementación</Link></div>
    </div></section>
    <footer className="mx-auto max-w-6xl px-5 py-8 text-xs text-[#536a63]">KOWI AI · Catálogo en desarrollo. Precios y funciones se confirman por propuesta. Los servicios no validados no se anuncian como operativos.</footer>
  </main>;
}
