import Link from 'next/link';
import InstallKowi from '@/components/InstallKowi';
const spaces=[
 ['/kowi','KOWI One','Convierte una intención en un objetivo y un plan personal.'],
 ['/business/agent-chat','Conversación empresarial','Habla con IA y conserva respuestas y evidencia en tu empresa.'],
 ['/business/director','KOWI Director','Ordena, revisa el plan, concede aval y consulta decisiones de mediodía.'],
 ['/business/crm-org','Contactos y agenda','Organiza clientes, oportunidades, citas propuestas y tareas.'],
 ['/test-email','Correo controlado','Prepara una prueba a tu cuenta verificada y autoriza el envío exacto.'],
 ['/business/intelligence','KOWI Intelligence','Revisa datos observados, interpretación y siguientes pasos.'],
 ['/business/jobs','Trabajos y evidencias','Comprueba qué se ejecutó y qué quedó pendiente.'],
 ['/business/agents','Agentes y permisos','Configura, verifica, pausa o revoca agentes de tu empresa.'],
 ['/fundacion','Iniciativa Fundación','Conoce el propósito y prepara colaboración voluntaria Human-First.'],
 ['/school','KOWI School','Explora guías abiertas para aprender y verificar.']
];
export default function AppHome(){return <main className="kowi-shell min-h-screen px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-6xl space-y-8">
 <header className="flex flex-wrap items-center justify-between gap-4"><Link href="/" className="text-xl font-semibold tracking-widest text-[#e8b37b]">KOWI</Link><Link href="/business#crear" className="rounded-full border border-white/30 px-5 py-3">Entrar o crear cuenta</Link></header>
 <section><p className="text-sm uppercase tracking-widest text-[#e8b37b]">HUMAN PURPOSE · AI CAPABILITY</p><h1 className="mt-4 text-4xl font-semibold md:text-6xl">Tu espacio KOWI</h1><p className="mt-5 max-w-3xl text-lg text-[#abc3b4]">Una intención, un siguiente paso y evidencia del resultado. Elige tu herramienta; tú conservas propósito, autoridad y control.</p></section>
 <InstallKowi/>
 <nav aria-label="Espacios KOWI" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{spaces.map(([href,title,description])=><Link key={href} href={href} className="glass rounded-2xl p-6 transition hover:border-[#e8b37b]/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#e8b37b]"><h2 className="text-xl font-semibold">{title} ↗</h2><p className="mt-3 text-[#abc3b4]">{description}</p></Link>)}</nav>
 <section className="glass rounded-2xl p-6"><h2 className="text-2xl">Empieza con una prueba verificable</h2><ol className="mt-4 list-inside list-decimal space-y-3"><li>Entra con tu correo verificado y selecciona tu empresa.</li><li>Configura un agente con información real y prueba una conversación privada.</li><li>Revisa la respuesta guardada y verifica el agente antes de activarlo.</li><li>Da una orden al director, revisa su alcance y aprueba el trabajo interno.</li><li>Para correo, autoriza por separado la prueba controlada y revisa su evidencia.</li></ol></section>
 <footer className="flex flex-wrap gap-5 border-t border-white/20 py-6 text-sm"><Link href="/privacidad">Privacidad y uso de IA</Link><Link href="/pro">Agentes especializados</Link><Link href="/control-center">Control Center</Link></footer>
 </div></main>;}
