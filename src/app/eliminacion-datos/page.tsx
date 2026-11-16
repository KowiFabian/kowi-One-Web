import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Solicitar eliminación de datos | KOWI AI — Borrador',
  robots: { index: false, follow: false },
};

export default function EliminacionDatosPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-12 leading-relaxed">
      <Link href="/" className="font-semibold underline">← KOWI AI</Link>
      <p className="mt-8 rounded-xl border border-amber-400 bg-amber-50 p-4 text-amber-950">
        BORRADOR EN REVISIÓN. Antes de la publicación externa debe comprobarse que el procedimiento
        operativo de eliminación está disponible y funciona.
      </p>
      <h1 className="mt-8 text-3xl font-bold">Solicitud de eliminación de datos</h1>
      <p className="mt-4">Puedes pedir la supresión de información personal que KOWI AI
        haya recogido en una prueba o a través de sus canales.</p>
      <section className="mt-8 space-y-5">
        <h2 className="text-2xl font-semibold">Cómo solicitarla</h2>
        <ol className="list-decimal space-y-3 pl-6">
          <li>Escribe a <a className="underline" href="mailto:info@kowi.one?subject=Solicitud%20de%20supresi%C3%B3n%20de%20datos">info@kowi.one</a> con el asunto <strong>Solicitud de supresión de datos</strong>.</li>
          <li>Indica qué canal utilizaste (web KOWI o WhatsApp) y, si es necesario,
            el correo o número asociado. No envíes contraseñas, códigos de acceso ni documentación
            de identidad salvo que te expliquemos de forma segura por qué es indispensable.</li>
          <li>Se comprobará tu vínculo con los datos mediante la información mínima necesaria,
            para evitar borrados solicitados por otras personas.</li>
          <li>Se informará del resultado y, cuando proceda, de cualquier dato que deba conservarse
            por una obligación legal o en sistemas sujetos a plazos técnicos de respaldo.</li>
        </ol>
        <h2 className="text-2xl font-semibold">Plazo de respuesta</h2>
        <p>Las solicitudes de derechos de protección de datos deben contestarse, como regla general,
          dentro del plazo de un mes, con las prórrogas legalmente previstas y debidamente comunicadas
          cuando resulten aplicables.</p>
        <h2 className="text-2xl font-semibold">Alcance y limitaciones actuales</h2>
        <p>El piloto ofrece opciones limitadas de eliminación de conversaciones. Aún debe validarse
          el procedimiento integral de supresión de contactos, registros de WhatsApp, copias de
          seguridad y sistemas de proveedores. No afirmamos que exista un borrado automático
          integral ni inmediato.</p>
        <h2 className="text-2xl font-semibold">Responsable del tratamiento</h2>
        <p><strong>PENDIENTE:</strong> identificar a la persona física responsable y su dirección
          de contacto legal antes de utilizar esta página como instrucciones definitivas en Meta.</p>
        <p>Para más información, consulta nuestra <Link href="/privacidad" className="underline">
          política de privacidad</Link>.</p>
      </section>
      <footer className="mt-10 flex flex-wrap gap-5 border-t pt-5">
        <Link href="/aviso-legal" className="underline">Aviso legal</Link>
        <Link href="/condiciones" className="underline">Condiciones</Link>
      </footer>
    </main>
  );
}
