import Link from 'next/link';

const pillars=[
 {title:'KOWI Places',text:'Detecta activos y lugares con potencial: vivienda, hotelería, restauración, suelo e infraestructura.'},
 {title:'KOWI Land & Food',text:'Campo, agricultura, producción local, agua, energía y cadenas de abastecimiento resilientes.'},
 {title:'KOWI Living',text:'Convierte destinos y experiencias en proyectos sostenibles que puedan generar actividad económica.'},
 {title:'KOWI Community',text:'Mide necesidades, recursos, empleo, vivienda, energía, alimentos e impacto territorial.'},
];
const projects=[
 ['Stay Upgrade','Recuperar o mejorar un alojamiento existente','150–350k €','Hospedaje + experiencias'],
 ['Eco-Lodge','Terreno + alojamiento integrado en el paisaje','700k–1,3M €','Noches + gastronomía + experiencias'],
 ['Living Village','Vivienda + hotel + restauración + coworking','1,2–2,5M €','Cartera diversificada'],
 ['Smart Farm','Campo + producción + tecnología + venta local','80–250k €','Alimentos + ahorro + experiencias'],
 ['Community Solar','Generación y ahorro energético compartido','Según estudio','Ahorro + energía'],
 ['Housing Recovery','Rehabilitación de vivienda infrautilizada','Según activo','Alquiler/venta + regeneración'],
];
const gates=['Necesidad real','Demanda verificable','Viabilidad legal/urbanística','CAPEX y financiación','Flujo de caja','Escenario ácido','Impacto medible','Human Approval'];
export default function ProjectFactory(){
 return <main className="kowi-cosmos min-h-screen text-[#f4f3f2]">
  <header className="border-b border-white/10 bg-[#050913]/90 px-6 py-5"><div className="mx-auto flex max-w-7xl justify-between gap-4"><Link href="/proyectos" className="text-[#e8b37b]">← KOWI Projects</Link><Link href="/pro/intelligence" className="rounded-full border border-white/20 px-4 py-2 text-sm">Intelligence Center</Link></div></header>
  <div className="mx-auto max-w-7xl px-6 py-12">
   <p className="kowi-eyebrow">KOWI PROJECT FACTORY</p>
   <h1 className="mt-4 max-w-5xl text-4xl font-semibold tracking-tight md:text-6xl">De sueños, recursos e ideales a proyectos medibles.</h1>
   <p className="mt-5 max-w-4xl text-lg text-[#b9bfca]">KOWI identifica una oportunidad, la somete a análisis humano + IA y la convierte en un proyecto con inversión, riesgos, fases, responsables, impacto, evidencia y retorno. Ninguna cifra estimada equivale a una promesa de rentabilidad.</p>
   <section className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{pillars.map(p=><article key={p.title} className="cosmos-tile rounded-2xl p-5"><p className="kowi-eyebrow">{p.title}</p><p className="mt-3 text-sm leading-6 text-[#c7ccd5]">{p.text}</p></article>)}</section>
   <section className="mt-10 cosmos-panel rounded-[2rem] p-6"><p className="kowi-eyebrow">MOTOR DE DECISIÓN</p><h2 className="mt-2 text-2xl font-semibold">Idea → estudio → inversión → ejecución → evidencia → aprendizaje → reinversión</h2>
    <div className="mt-6 grid gap-3 md:grid-cols-4">{gates.map((g,i)=><div key={g} className="rounded-2xl border border-white/10 bg-white/[.03] p-4"><span className="text-xs text-[#e8b37b]">0{i+1}</span><p className="mt-2 font-semibold">{g}</p></div>)}</div>
   </section>
   <section className="mt-10"><p className="kowi-eyebrow">LABORATORIO DE PROYECTOS</p><h2 className="mt-2 text-3xl font-semibold">Seis modelos para comparar</h2>
    <div className="mt-5 grid gap-4 lg:grid-cols-3">{projects.map(([name,concept,capex,revenue])=><article key={name} className="cosmos-tile rounded-2xl p-6"><h3 className="text-xl font-semibold">{name}</h3><p className="mt-2 text-sm text-[#b9bfca]">{concept}</p><div className="mt-5 border-t border-white/10 pt-4 text-sm"><p><span className="text-[#e8b37b]">CAPEX laboratorio:</span> {capex}</p><p className="mt-2"><span className="text-[#e8b37b]">Motor:</span> {revenue}</p></div></article>)}</div>
   </section>
   <section className="mt-10 grid gap-4 lg:grid-cols-3">
    <article className="cosmos-tile rounded-2xl p-6"><p className="kowi-eyebrow">CUENTA FINANCIERA</p><p className="mt-3 text-sm leading-6">CAPEX, OPEX, ingresos, margen, caja, deuda, punto de equilibrio, VAN, TIR, payback y escenarios. Siempre separando hipótesis de resultados reales.</p></article>
    <article className="cosmos-tile rounded-2xl p-6"><p className="kowi-eyebrow">CUENTA DE IMPACTO</p><p className="mt-3 text-sm leading-6">Empleo, vivienda recuperada, alimentos, energía, agua, actividad local, circularidad y otros indicadores definidos para cada proyecto.</p></article>
    <article className="cosmos-tile rounded-2xl p-6"><p className="kowi-eyebrow">CUENTA DEL SOCIO</p><p className="mt-3 text-sm leading-6">Capital aportado, participación, distribuciones, riesgo, valor y retorno atribuible. No se presenta una rentabilidad como garantizada.</p></article>
   </section>
   <section className="mt-10 rounded-[2rem] border border-[#e8b37b]/25 bg-[#e8b37b]/5 p-7"><p className="kowi-eyebrow">PRINCIPIO HUMAN-FIRST</p><h2 className="mt-2 text-2xl font-semibold">KOWI puede investigar, comparar, simular y preparar. La persona decide.</h2><p className="mt-3 max-w-4xl text-sm leading-6 text-[#c7ccd5]">Comprar suelo, contratar obra, invertir capital, asumir deuda, firmar, publicar, transferir fondos o comprometer a una organización permanece bajo autorización humana explícita.</p></section>
  </div>
 </main>
}