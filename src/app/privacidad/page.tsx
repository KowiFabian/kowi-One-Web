import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacidad y uso de IA | KOWI AI — Borrador',
  robots: { index: false, follow: false },
};

export default function PrivacidadPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-12 leading-relaxed">
      <Link href="/" className="font-semibold underline">← KOWI AI</Link>
      <p className="mt-8 rounded-xl border border-amber-400 bg-amber-50 p-4 text-amber-950">
        BORRADOR EN REVISIÓN. Información incompleta: no utilizar como declaración de cumplimiento
        RGPD ni como política definitiva para publicar la aplicación en Meta.
      </p>
      <h1 className="mt-8 text-3xl font-bold">Política de privacidad y uso de IA</h1>
      <p className="mt-4">KOWI AI es actualmente un proyecto piloto, no una sociedad mercantil constituida.
        La identidad y dirección de contacto del responsable del tratamiento deben confirmarse antes de
        recabar datos reales de personas externas al equipo de pruebas.</p>
      <section className="mt-8 space-y-5">
        <h2 className="text-2xl font-semibold">1. Responsable y contacto</h2>
        <p>Responsable del proyecto: <strong>Fabian Garay</strong> (nombre facilitado por el titular; pendiente de verificar si coincide con la identificación legal completa).</p>
        <p>Localización comunicada: <strong>Madrid, 28014, España</strong>. Dirección postal para notificaciones legales: <strong>PENDIENTE de confirmar</strong>.</p>
        <p>Correo para información y ejercicio de derechos: <a href="mailto:info@kowi.one" className="underline">info@kowi.one</a>.</p>
        <h2 className="text-2xl font-semibold">2. Información que puede tratar el piloto</h2>
        <p>Correo de acceso a la cuenta, conversaciones y proyectos introducidos en KOWI, datos de configuración
          de negocios, y en funciones Business los contactos y las solicitudes de atención aportados al servicio.
          En el piloto WhatsApp pueden recibirse número de teléfono, texto del mensaje, identificadores técnicos
          y estado de entrega. No deben introducirse datos especialmente sensibles ni de terceros sin autorización.</p>
        <h2 className="text-2xl font-semibold">3. Para qué se utiliza</h2>
        <p>Gestionar el acceso, responder a las consultas solicitadas, probar la calidad de agentes de IA,
          mantener la seguridad, evitar mensajes duplicados y atender solicitudes de privacidad.
          No se activará publicidad por WhatsApp ni prospección automática sin una base jurídica apropiada.</p>
        <h2 className="text-2xl font-semibold">4. Base jurídica</h2>
        <p><strong>PENDIENTE de documentar por finalidad:</strong> la base jurídica aplicable a las pruebas
          de conversación, la gestión de cuentas, la seguridad y cualquier contacto comercial. No se presumirá
          que abrir una conversación implica consentimiento para recibir publicidad.</p>
        <h2 className="text-2xl font-semibold">5. Proveedores e inteligencia artificial</h2>
        <p>Las operaciones técnicas del proyecto pueden involucrar a Meta (WhatsApp Business Platform),
          OpenAI (procesamiento de solicitudes a la IA), Supabase (autenticación y datos) y Vercel
          (alojamiento). Las condiciones contractuales, el papel de cada proveedor, los subencargados
          y las transferencias internacionales deben revisarse y describirse antes del lanzamiento externo.</p>
        <p>Las respuestas de IA pueden ser incorrectas y no equivalen a una reserva o compra confirmada.
          El agente de demostración no debe tomar compromisos sensibles sin confirmación humana.</p>
        <h2 className="text-2xl font-semibold">6. Conservación</h2>
        <p><strong>PENDIENTE:</strong> calendario de conservación real por categoría de dato, respaldo y proveedor,
          y verificación del borrado efectivo. La fecha de caducidad registrada por el piloto de WhatsApp no
          implica por sí sola eliminación automática de la base de datos.</p>
        <h2 className="text-2xl font-semibold">7. Tus derechos</h2>
        <p>Puedes solicitar información, acceso, rectificación, supresión, oposición, limitación y, cuando
          proceda, portabilidad, así como retirar un consentimiento dado. Escribe a
          {' '}<a href="mailto:info@kowi.one" className="underline">info@kowi.one</a>.
          Puedes reclamar ante la Agencia Española de Protección de Datos (AEPD).
          Consulta las <Link href="/eliminacion-datos" className="underline">instrucciones de supresión</Link>.</p>
        <h2 className="text-2xl font-semibold">8. Información previa al lanzamiento</h2>
        <p>Faltan verificación de identidad legal completa y dirección postal de contacto, bases jurídicas documentadas, plazos de
          conservación, contratos y garantías de los proveedores, y el procedimiento operativo de ejercicio
          de derechos. Hasta resolverlo, el servicio se mantiene en entorno de prueba controlado.</p>
      </section>
      <footer className="mt-10 flex flex-wrap gap-5 border-t pt-5">
        <Link href="/aviso-legal" className="underline">Aviso legal</Link>
        <Link href="/condiciones" className="underline">Condiciones</Link>
        <Link href="/eliminacion-datos" className="underline">Eliminación de datos</Link>
      </footer>
    </main>
  );
}
