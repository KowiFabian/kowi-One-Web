import type { Metadata } from 'next';
import Link from 'next/link';
import AgentConfigurator from '@/components/AgentConfigurator';
import KowiVision from '@/components/KowiVision';

export const metadata: Metadata = {
 title:'KOWI AI Studio | Diseña tu agente empresarial',
 description:'Elige agentes, configura consumos, consulta precios y solicita ayuda de un asesor KOWI.',
};

const steps=[
 {number:'01',title:'Diseña',detail:'Describe tu empresa y selecciona los objetivos del agente.'},
 {number:'02',title:'Configura',detail:'Elige especialidades, canales, volumen y supervisión.'},
 {number:'03',title:'Prueba',detail:'Revisa respuestas y escenarios antes de solicitar activación.'},
 {number:'04',title:'Activa',detail:'Un responsable valida integraciones, permisos, precio y puesta en marcha.'},
];
export default function StudioPage(){return <main className="min-h-screen bg-[#f7faf9] text-[#142a27]">
 <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-6"><Link href="/" className="text-xl font-bold tracking-widest text-[#087e75]">KOWI AI</Link><nav className="flex gap-4 text-sm"><Link href="/agentes" className="underline underline-offset-4">Catálogo</Link><Link href="/partners-builders" className="underline underline-offset-4">Partners</Link></nav></header>
 <section className="mx-auto max-w-6xl px-5 pb-12 pt-12"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#087e75]">KOWI AI STUDIO · Experiencia inicial</p><h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">Crea el agente que tu negocio necesita.</h1><p className="mt-6 max-w-3xl text-lg text-[#536a63]">Sin conocimientos de programación: elige tu especialidad, ajusta consumos, consulta el presupuesto y pide ayuda cuando la necesites.</p><div className="mt-7 flex flex-wrap gap-3"><a href="#configurar" className="rounded-full bg-[#087e75] px-6 py-3 font-semibold text-white">Configurar mi agente</a><Link href="/builders" className="rounded-full border border-[#b9d4cb] px-6 py-3 font-semibold">Probar Builders Studio</Link></div></section>
 <section className="mx-auto max-w-6xl px-5 pb-8"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{steps.map(s=><article key={s.number} className="rounded-2xl border border-[#d6e6e0] bg-white p-5"><p className="text-xs font-bold text-[#087e75]">{s.number}</p><h2 className="mt-3 text-lg font-semibold">{s.title}</h2><p className="mt-2 text-sm text-[#536a63]">{s.detail}</p></article>)}</div><p className="mt-4 text-xs text-[#536a63]">La prueba técnica y activación autónoma son capacidades objetivo. Actualmente puedes preparar una solicitud de configuración y presupuesto; la aprobación y puesta en producción son manuales.</p></section>
 <KowiVision/>
 <AgentConfigurator/>
 <section className="bg-[#142a27] px-5 py-14 text-white"><div className="mx-auto max-w-6xl"><h2 className="text-3xl font-semibold">Human-First AI, desde el primer día</h2><p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#cde0d8]">Cada implementación requiere comprobar identidad y permisos, registrar acciones, minimizar datos y someter a autorización humana pagos, mensajes externos y cambios sensibles. Las funciones no validadas no se activan automáticamente.</p><Link href="/partners-builders" className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-semibold text-[#142a27]">Conocer asesores y Builders</Link></div></section>
 </main>}