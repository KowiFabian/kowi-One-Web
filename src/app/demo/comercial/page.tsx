const demos = [
  {
    sector:'Peluquería / estética',
    problema:'Llamadas y WhatsApp sin responder mientras el equipo atiende.',
    flujo:['Cliente pregunta por disponibilidad','KOWI identifica servicio y preferencia','Consulta reglas/agenda autorizadas','Propone hueco','Registra lead/cita','Programa seguimiento'],
    resultado:'Menos oportunidades perdidas y un CRM actualizado con trazabilidad.'
  },
  {
    sector:'Clínica / consulta',
    problema:'Recepción saturada con dudas repetitivas, citas y cambios.',
    flujo:['Paciente pregunta por un servicio','KOWI responde solo con información aprobada','Cualifica necesidad no clínica','Propone cita','Escala información sensible','Registra seguimiento'],
    resultado:'Atención más consistente sin sustituir decisiones clínicas ni humanas.'
  },
  {
    sector:'Pyme B2B',
    problema:'Leads dispersos, propuestas sin seguimiento y poca visibilidad del pipeline.',
    flujo:['Lead entra por web/email','KOWI resume necesidad','Crea oportunidad','Propone siguiente acción','Sales Agent prepara respuesta','Humano aprueba compromiso','CRM mide avance'],
    resultado:'Pipeline comercial visible y seguimiento disciplinado.'
  }
];

export default function CommercialDemoPage(){
  return <main className="min-h-screen bg-[#f7f4ed] text-[#111827] px-5 py-10 sm:px-8">
    <div className="mx-auto max-w-6xl">
      <p className="text-sm font-semibold tracking-[.22em] text-[#55715f]">KOWI BUSINESS · DEMOS DE RESULTADO</p>
      <h1 className="mt-4 max-w-4xl text-4xl font-semibold sm:text-6xl">De conversación a oportunidad, acción y evidencia.</h1>
      <p className="mt-6 max-w-3xl text-lg text-slate-600">Tres ejemplos ilustrativos del recorrido comercial objetivo. No representan clientes ni resultados reales todavía.</p>
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {demos.map((d)=><section key={d.sector} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#55715f]">{d.sector}</p>
          <h2 className="mt-3 text-xl font-semibold">Problema</h2><p className="mt-2 text-slate-600">{d.problema}</p>
          <h3 className="mt-6 font-semibold">Flujo KOWI</h3>
          <ol className="mt-3 space-y-2 text-sm text-slate-700">{d.flujo.map((x,i)=><li key={x} className="flex gap-3"><span className="font-semibold text-[#55715f]">{String(i+1).padStart(2,'0')}</span><span>{x}</span></li>)}</ol>
          <div className="mt-6 rounded-2xl bg-[#eef3ef] p-4"><p className="text-xs font-semibold uppercase tracking-[.16em] text-[#55715f]">Resultado esperado</p><p className="mt-2 text-sm">{d.resultado}</p></div>
        </section>)}
      </div>
      <section className="mt-10 rounded-3xl bg-[#111827] p-7 text-white">
        <p className="text-sm font-semibold tracking-[.18em] text-[#d9b989]">CONTROL HUMANO</p>
        <h2 className="mt-3 text-2xl font-semibold">KOWI prepara y ejecuta dentro de permisos; el humano conserva la autoridad.</h2>
        <p className="mt-3 max-w-3xl text-slate-300">Precios, descuentos, contratos, gasto publicitario, compromisos externos y acciones sensibles permanecen sujetos a aprobación.</p>
      </section>
    </div>
  </main>
}
