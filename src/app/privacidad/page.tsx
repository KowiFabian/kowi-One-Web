import Link from 'next/link';
export default function Privacy() {
  return <main className="mx-auto max-w-2xl px-6 py-16">
    <Link href="/" className="font-bold text-teal-800">← Kowi One</Link>
    <h1 className="mt-8 text-3xl font-semibold">Privacidad y uso de IA</h1>
    <p className="mt-6 rounded-xl bg-amber-50 p-4">Versión piloto. El aviso legal completo y los plazos de conservación deben concretarse antes de abrir el servicio comercial.</p>
    <section className="mt-8 space-y-5 leading-relaxed">
      <h2 className="text-xl font-semibold">Qué se guarda</h2>
      <p>El correo permite acceder a tu cuenta. Tus conversaciones, objetivos, planes y avances se guardan asociados a tu usuario para que puedas retomarlos.</p>
      <h2 className="text-xl font-semibold">Cómo se prepara tu respuesta</h2>
      <p>Supabase gestiona el acceso y la base de datos. El servidor envía tu mensaje y un historial reciente de la conversación a OpenAI para generar propuestas. Las propuestas pueden contener errores: revísalas antes de actuar.</p>
      <h2 className="text-xl font-semibold">Tu control</h2>
      <p>Desde cada conversación puedes exportar los mensajes y eliminarla junto con su plan. La eliminación en las copias de seguridad y en los sistemas de los proveedores sigue sus propias condiciones de conservación. No introduzcas contraseñas ni datos sensibles o confidenciales de terceros.</p>
      <h2 className="text-xl font-semibold">Información pendiente de publicación</h2>
      <p>Antes del lanzamiento deben publicarse la identidad y el contacto del responsable, las bases jurídicas, los plazos de conservación, las transferencias internacionales y el procedimiento para ejercer los derechos, incluida la supresión de la cuenta. Esta página no afirma certificación ISO ni cumplimiento legal verificado.</p>
    </section>
  </main>;
}
