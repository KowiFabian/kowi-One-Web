import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Aviso legal | KOWI AI — Borrador',
  robots: { index: false, follow: false },
};

export default function AvisoLegalPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-12 leading-relaxed">
      <Link href="/" className="font-semibold underline">← KOWI AI</Link>
      <p className="mt-8 rounded-xl border border-amber-400 bg-amber-50 p-4 text-amber-950">
        BORRADOR EN REVISIÓN. Esta página no contiene todavía toda la información de
        identificación necesaria para utilizarla como aviso legal definitivo.
      </p>
      <h1 className="mt-8 text-3xl font-bold">Aviso legal de KOWI AI</h1>
      <section className="mt-8 space-y-5">
        <h2 className="text-2xl font-semibold">Identificación del titular</h2>
        <p>Denominación del proyecto: <strong>KOWI AI</strong> (proyecto en desarrollo;
          no es una sociedad mercantil constituida).</p>
        <p>Titular persona física: <strong>PENDIENTE de confirmar nombre legal completo</strong>.</p>
        <p>Domicilio o dirección válida de contacto: <strong>PENDIENTE de confirmar</strong>.</p>
        <p>Identificación fiscal, si procede su publicación: <strong>PENDIENTE de revisión</strong>.</p>
        <p>Contacto: <a href="mailto:info@kowi.one" className="underline">info@kowi.one</a>.</p>
        <p>Sitio web: <a href="https://kowi.one" className="underline">https://kowi.one</a>.</p>
        <h2 className="text-2xl font-semibold">Estado del servicio</h2>
        <p>Actualmente KOWI AI se desarrolla y prueba como proyecto piloto.
          La publicación técnica de una aplicación en Meta no acredita el alta de una
          actividad económica, la aprobación de permisos de terceros ni el funcionamiento
          comercial del agente de WhatsApp.</p>
        <h2 className="text-2xl font-semibold">Contenido y propiedad intelectual</h2>
        <p>El contenido de este sitio se facilita para informar sobre el proyecto y sus pruebas.
          Las marcas, nombres y materiales de terceros pertenecen a sus respectivos titulares.
          No se afirma aquí que KOWI AI sea una marca registrada.</p>
        <h2 className="text-2xl font-semibold">Protección de datos</h2>
        <p>Consulta la <Link href="/privacidad" className="underline">política de privacidad</Link>
          {' '}y la <Link href="/eliminacion-datos" className="underline">solicitud de supresión</Link>.
          Estas páginas seguirán en borrador hasta completar los datos y procesos que faltan.</p>
        <h2 className="text-2xl font-semibold">Información pendiente</h2>
        <p>Antes de lanzar públicamente el servicio se debe confirmar titular, domicilio de
          contacto y cualquier dato de identificación o inscripción exigible en el caso
          concreto; además, revisar las obligaciones de la LSSI-CE y normativa aplicable.</p>
      </section>
      <footer className="mt-10 flex flex-wrap gap-5 border-t pt-5">
        <Link href="/privacidad" className="underline">Privacidad</Link>
        <Link href="/condiciones" className="underline">Condiciones del piloto</Link>
      </footer>
    </main>
  );
}
