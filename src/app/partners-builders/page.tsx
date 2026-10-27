import Link from 'next/link';

const tracks=[
  {
    id:'partners',label:'01 · KOWI PARTNERS',title:'Ayuda a negocios a descubrir KOWI.',
    description:'Un Partner identifica necesidades, demuestra el producto real y acompaña el proceso comercial. No necesita escribir código.',
    activities:['Conoce el producto en KOWI School y con la demo.','Obtiene autorización para registrar un contacto comercial.','Presenta al negocio una oferta real, con límites claros.','KOWI valida contrato, cobro y atribución antes de calcular una comisión.'],
    href:'/business/demo',cta:'Probar la demo Business',
    economics:'Comisión orientativa: 15 % de mensualidades elegibles, durante un máximo propuesto de 12 meses. No hay programa de liquidaciones activo.',
  },
  {
    id:'builders',label:'02 · KOWI BUILDERS',title:'Crea agentes que resuelven problemas reales.',
    description:'Un Builder prepara soluciones por sector, configura datos autorizados, prueba respuestas y mantiene agentes verificados.',
    activities:['Elige una de las seis plantillas actuales.','Define servicios, horarios, políticas y respuestas comprobadas.','Prueba el agente con datos de ejemplo; registra un DRAFT autorizado.','La empresa y KOWI revisan antes de activar funciones sensibles.'],
    href:'/builders',cta:'Abrir Builders Studio',
    economics:'Participación orientativa: 20 % en clientes asignados con implantación y mantenimiento verificables, hasta 12 meses propuestos. No hay cobros ni marketplace automatizados.',
  },
];
export default function PartnersBuildersPage(){
 return <main className="min-h-screen bg-[#f8f9fa] px-4 py-8 text-[#202327] sm:px-8"><div className="mx-auto max-w-6xl space-y-8">
   <header className="flex flex-wrap items-center justify-between gap-4"><Link href="/" className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#eef0f2] text-2xl">◎</span><span><strong className="block text-xl">KOWI IA</strong><small className="text-[#70757e]">Human-First AI · Colaboradores</small></span></Link>
     <nav aria-label="KOWI" className="flex flex-wrap gap-4 text-sm"><Link href="/business">Business</Link><Link href="/builders">Builders Studio</Link><Link href="/school">School</Link><Link href="/builders/ingresos">Ingresos</Link></nav>
   </header>
   <section className="rounded-[28px] border border-[#e6e8eb] bg-white px-5 py-10 sm:px-8">
     <span className="rounded-full bg-[#eef0f1] px-3 py-1 text-xs font-semibold">RED DE COLABORACIÓN · PILOTO</span>
     <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight md:text-5xl">Vende soluciones. Construye agentes. Crece con KOWI.</h1>
     <p className="mt-5 max-w-3xl text-lg leading-relaxed text-[#646b74]">Los negocios contratan KOWI Business; los Partners consiguen clientes; los Builders configuran y mantienen soluciones. KOWI aporta la tecnología, la supervisión humana y el control de la plataforma.</p>
     <div className="mt-7 flex flex-wrap gap-3"><Link href="/builders/ingresos" className="rounded-full bg-[#202328] px-6 py-3 text-sm font-semibold text-white">Ver cómo repartimos ingresos</Link><Link href="/builders" className="rounded-full border border-[#d9dde1] px-6 py-3 text-sm font-semibold">Crear un agente de prueba</Link></div>
     <p className="mt-5 max-w-3xl rounded-xl border border-[#e4e7eb] bg-[#f7f8f9] p-4 text-sm text-[#666d75]">La plataforma de creación de borradores existe; las altas profesionales, la gestión de referidos, contratos, distribución de plantillas y pagos a colaboradores todavía no están activados. Las cifras son propuestas para estudio.</p>
   </section>
   <div className="grid gap-4 lg:grid-cols-2">{tracks.map(t=><article id={t.id} key={t.id} className="scroll-mt-6 rounded-3xl border border-[#e5e7e9] bg-white p-6 sm:p-8">
     <p className="text-xs font-semibold tracking-widest text-[#707780]">{t.label}</p><h2 className="mt-4 text-2xl font-semibold">{t.title}</h2><p className="mt-3 text-sm leading-relaxed text-[#656c76]">{t.description}</p>
     <ol className="mt-6 list-decimal space-y-3 pl-5 text-sm leading-relaxed">{t.activities.map(a=><li key={a}>{a}</li>)}</ol>
     <p className="mt-6 rounded-xl bg-[#f4f5f6] p-4 text-sm leading-relaxed text-[#545d66]">{t.economics}</p>
     <Link href={t.href} className="mt-6 inline-block rounded-full bg-[#202328] px-5 py-3 text-sm font-semibold text-white">{t.cta}</Link>
   </article>)}</div>
   <section className="rounded-3xl border border-[#e5e7e9] bg-white p-6 sm:p-8">
     <h2 className="text-2xl font-semibold">Requisitos para trabajar con KOWI</h2>
     <div className="mt-5 grid gap-4 md:grid-cols-3">
       {[['Aprender','Comprender el alcance comercial, las limitaciones del producto y la atención responsable.'],['Autorizar','Cada empresa controla sus datos y aprueba la configuración, integraciones y acciones sensibles.'],['Verificar','Probar funcionamiento real, documentar evidencias y mantener trazabilidad antes de publicar.']].map(([a,b])=><div key={a} className="rounded-xl border border-[#e9eaeb] p-4"><h3 className="font-semibold">{a}</h3><p className="mt-2 text-sm text-[#656c76]">{b}</p></div>)}
     </div>
     <div className="mt-6 flex flex-wrap gap-4"><Link href="/school" className="text-sm font-semibold underline">Conocer KOWI School</Link><Link href="/builders/ingresos" className="text-sm font-semibold underline">Simular reparto de ingresos</Link><Link href="/privacidad" className="text-sm font-semibold underline">Privacidad</Link></div>
   </section>
   <footer className="border-t border-[#e4e6e9] py-6 text-sm text-[#676f78]">KOWI IA · Human-First AI. No se garantizan ingresos ni se conceden autorizaciones para acceder a datos de otros clientes.</footer>
 </div></main>;
}
