import Link from 'next/link';
import type {Metadata} from 'next';

export const metadata:Metadata={
 title:'Ecosistema KOWI IA · Del conocimiento a la acción',
 description:'Cómo se conectan Hola Soy Tu IA, KOWI Verifica, School, One, Business, Partners, Builders y Comunidad. Estado real y desarrollo responsable.'
};
const stages=[
 {number:'01',title:'Informar y contrastar',description:'Hola Soy Tu IA explica novedades con fuentes, contexto y revisión editorial. Las publicaciones no se certifican por una respuesta de IA.',href:'/news',cta:'Conocer el informativo',state:'Radar técnico existente; informativo global pendiente de ampliar.'},
 {number:'02',title:'Aprender gratuitamente',description:'KOWI School propone rutas prácticas. El microcurso de verificación permite entrenar el pensamiento crítico con ejemplos ficticios.',href:'/school/verificar',cta:'Hacer el microcurso gratis',state:'Rutas disponibles y microcurso en revisión.'},
 {number:'03',title:'Descubrir necesidades y crear proyectos',description:'Aprendemos, compartimos, identificamos problemas y construimos soluciones con personas y comunidades.',href:'/proyectos',cta:'Explorar proyectos',state:'Herramientas iniciales; resultados reales deben validarse.'},
 {number:'04',title:'Resolver tareas humanas y empresariales',description:'KOWI One ayuda a planificar; KOWI Business pretende conectar IA, CRM, agenda y canales con consentimiento y supervisión.',href:'/business',cta:'Conocer Business',state:'Módulos existentes; integraciones externas requieren pruebas E2E.'},
 {number:'05',title:'Multiplicar el impacto',description:'Partners puede implementar soluciones y Builders desarrollar aplicaciones, tras controles, acuerdos y verificación de resultados.',href:'/partners-builders',cta:'Conocer Partners & Builders',state:'Programa definido, comisiones y marketplace aún no activos.'}
];
const streams=[
 {title:'Conocimiento para todos',description:'Acceso público a contenido contrastado y formación gratuita.',cta:'KOWI School',href:'/school'},
 {title:'Valor económico verificable',description:'Servicios de atención y automatización para pymes. Precios sujetos a validación, capacidad y costes.',cta:'KOWI Business',href:'/business'},
 {title:'Comunidad y alianzas',description:'Participación voluntaria, proyectos reales, mentoría y financiación solo cuando se confirme.',cta:'Fundación y comunidad',href:'/fundacion'}
];
export default function Ecosystem(){
 return <main className="kowi-cosmos min-h-screen px-5 py-9 text-[#f4f3f2] md:px-10"><div className="mx-auto max-w-6xl space-y-12">
 <nav aria-label="Navegación"><Link href="/" className="font-semibold underline">← KOWI IA</Link></nav>
 <header className="max-w-4xl space-y-5"><p className="kowi-eyebrow">VISIÓN HUMAN-FIRST · MODELO OPERATIVO</p>
 <h1 className="text-4xl font-semibold leading-tight md:text-6xl">Informar, aprender, construir y transformar.</h1>
 <p className="text-lg leading-relaxed text-[#bdc4cf]">Un ecosistema que transforma noticias comprobables e inquietudes reales en aprendizaje, proyectos, servicios útiles e impacto medible. La IA apoya; las personas verifican, autorizan y deciden.</p>
 <p className="rounded-xl border border-[#e8b37b]/40 p-4 text-sm text-[#e9d6bf]">Esta página describe una visión, productos existentes y módulos en desarrollo. No acredita funcionalidades no desplegadas, usuarios, ingresos, ayudas obtenidas ni certificaciones oficiales.</p></header>
 <section aria-labelledby="stages-heading"><p className="kowi-eyebrow">Un recorrido conectado</p><h2 id="stages-heading" className="mt-3 text-3xl font-semibold">Del conocimiento a la acción</h2>
 <div className="mt-7 grid gap-4 md:grid-cols-2">{stages.map(stage=><article key={stage.number} className="cosmos-panel rounded-2xl p-6">
 <p className="text-sm font-semibold text-[#e8b37b]">{stage.number}</p><h3 className="mt-3 text-2xl font-semibold">{stage.title}</h3>
 <p className="mt-4 text-[#bdc4cf]">{stage.description}</p>
 <p className="mt-4 text-sm text-[#aeb6c4]">Estado: {stage.state}</p>
 <Link href={stage.href} className="mt-5 inline-block underline underline-offset-4">{stage.cta} ↗</Link></article>)}</div></section>
 <section className="cosmos-panel space-y-6 rounded-3xl p-6 md:p-9"><p className="kowi-eyebrow">Cómo construiremos una organización sostenible</p>
 <h2 className="text-3xl font-semibold">Tres fuentes de valor, una misma misión</h2>
 <div className="grid gap-5 md:grid-cols-3">{streams.map(item=><article key={item.title} className="rounded-xl border border-white/15 p-5"><h3 className="text-xl font-semibold">{item.title}</h3><p className="mt-3 text-[#bdc4cf]">{item.description}</p><Link className="mt-5 inline-block underline" href={item.href}>{item.cta} ↗</Link></article>)}</div>
 <p className="text-sm text-[#bdc4cf]">Los posibles planes de pago, comisiones, talleres y patrocinios son hipótesis. Antes de contratar: oferta clara, costes, soporte, protección de datos y condiciones legales revisadas.</p>
 </section>
 <section className="space-y-4"><h2 className="text-3xl font-semibold">Seguridad informativa y control humano</h2>
 <p className="max-w-4xl text-[#bdc4cf]">Una URL real no convierte una afirmación en verdadera. KOWI Verifica comienza como un prechequeo que bloquea fuentes insuficientes. La investigación documental, verificación de testimonios, trazabilidad de multimedia y aprobación editorial siguen requiriendo personas e integraciones aún por implementar.</p>
 <div className="flex flex-wrap gap-4"><Link href="/news/verificar" className="kowi-gold-btn rounded-full px-6 py-3 font-semibold">Abrir KOWI Verifica ↗</Link><Link href="/school" className="rounded-full border border-white/30 px-6 py-3 font-semibold">Aprender con KOWI School ↗</Link></div></section>
 <footer className="border-t border-white/15 py-6 text-sm text-[#bdc4cf]">KOWI IA · Human-First AI · kowi.one</footer>
 </div></main>;
}
