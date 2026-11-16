import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Condiciones del piloto | KOWI AI — Borrador',
  robots: { index: false, follow: false },
};

export default function CondicionesPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-12 leading-relaxed">
      <Link href="/" className="font-semibold underline">← KOWI AI</Link>
      <p className="mt-8 rounded-xl border border-amber-400 bg-amber-50 p-4 text-amber-950">
        BORRADOR EN REVISIÓN. Este texto describe un piloto no comercial y aún no constituye
        condiciones contractuales listas para contratar un servicio de pago.
      </p>
      <h1 className="mt-8 text-3xl font-bold">Condiciones de uso del piloto KOWI AI</h1>
      <section className="mt-8 space-y-5">
        <h2 className="text-2xl font-semibold">1. Identidad del operador</h2>
        <p>KOWI AI es un proyecto en fase de pruebas, sin sociedad constituida.
          <strong> PENDIENTE:</strong> confirmar el nombre y apellidos y la dirección de
          contacto de la persona física responsable.
          Contacto: <a href="mailto:info@kowi.one" className="underline">info@kowi.one</a>.</p>
        <h2 className="text-2xl font-semibold">2. Ámbito de uso</h2>
        <p>Se permiten demostraciones limitadas, con participantes autorizados y datos
          sintéticos o adecuados a la finalidad y garantías del piloto.
          El uso comercial general y la contratación de planes de pago no están habilitados
          por estas condiciones.</p>
        <h2 className="text-2xl font-semibold">3. Funcionamiento de la IA</h2>
        <p>KOWI puede ayudar a entender consultas, elaborar respuestas de prueba y preparar
          solicitudes de contacto. Una respuesta automática no certifica que sea correcta.
          No se garantizan disponibilidad continua, exactitud ni resultados comerciales.</p>
        <p>El agente de demostración de WhatsApp no confirma reservas, pagos, pedidos ni
          compromisos de terceros. Las acciones sensibles requieren comprobación y,
          cuando corresponda, aprobación humana.</p>
        <h2 className="text-2xl font-semibold">4. Uso responsable</h2>
        <p>No utilices el piloto para enviar comunicaciones no solicitadas, suplantar
          identidades, introducir información de terceros sin legitimación o tratar datos
          especialmente sensibles sin un marco apropiado. Se pueden limitar o interrumpir
          pruebas por motivos de seguridad.</p>
        <h2 className="text-2xl font-semibold">5. Servicios externos</h2>
        <p>Las pruebas pueden utilizar infraestructura de Vercel, Supabase, Meta WhatsApp
          Business Platform y servicios de IA de OpenAI, según el canal habilitado.
          El funcionamiento de los canales depende de sus requisitos y disponibilidad.
          La conexión por WhatsApp debe superar pruebas reales antes de ofrecerse como activa.</p>
        <h2 className="text-2xl font-semibold">6. Privacidad y solicitudes</h2>
        <p>Consulta la <Link href="/privacidad" className="underline">política de privacidad</Link>
          {' '}y las <Link href="/eliminacion-datos" className="underline">instrucciones de supresión</Link>.
          Se revisarán los textos antes de admitir participantes externos al piloto.</p>
        <h2 className="text-2xl font-semibold">7. Antes del servicio de pago</h2>
        <p><strong>PENDIENTE:</strong> definición del operador legal, alta y obligaciones
          fiscales pertinentes, alcance de planes, precios, impuestos, pagos, cancelación,
          atención de reclamaciones y régimen de contratación electrónica. Este borrador
          no sustituye las condiciones de venta exigibles cuando KOWI empiece a facturar.</p>
      </section>
      <footer className="mt-10 flex flex-wrap gap-5 border-t pt-5">
        <Link href="/aviso-legal" className="underline">Aviso legal</Link>
        <Link href="/privacidad" className="underline">Privacidad</Link>
      </footer>
    </main>
  );
}
