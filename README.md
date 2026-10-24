# KOWI One

Plataforma Human-First AI para convertir una intención en objetivo, plan y acción verificable. El piloto web reúne [KOWI One](/kowi), [KOWI Business](/business), [KOWI School](/school), [KOWI Proyectos](/proyectos), [Organización](/organizacion) y la iniciativa [Fundación](/fundacion).

El recorrido Business permite acceder con un código por email, configurar una empresa por cuenta, probar un agente de IA en una conversación privada y registrar contactos. La demostración pública de sectores usa datos ficticios. School y Fundación describen iniciativas en desarrollo, sin prometer acreditaciones, personalidad jurídica o convenios inexistentes.

## Desarrollo

Node 22 o superior. `npm ci`, `npm test`, `npm run type-check`, `npm run lint`, `npm run build`. Define las variables de `.env.example` en el entorno de despliegue; no incluyas secretos en Git. Aplica las migraciones de `supabase/migrations` en orden para una base nueva. Supabase Auth Email OTP debe enviar el token numérico en la plantilla; configura SMTP y límites apropiados.

Consulta [Operación y límites](docs/PUBLIC-PLATFORM.md), [Privacidad](docs/SECURITY-PRIVACY.md), [Education](docs/KOWI-EDUCATION.md) y [Business](docs/KOWI-BUSINESS.md). El código de ramas anteriores se ha integrado sobre el `main` que contenía el MVP operativo y el diseño visual aprobado.

## Lanzamiento MVP KOWI IA (octubre 2026)

La guía [Go/No-Go y configuración de producción](docs/KOWI-MVP-LAUNCH-RUNBOOK-20261024.md) distingue funciones implementadas, proveedor pendiente, verificación y límites comerciales. El [kit de presentación comercial y educativa](docs/KOWI-MVP-COMERCIAL-EDUCATIVO.md) aporta textos y demos señaladas como ficticias.

- **Chat y agentes:** comunicación OpenAI desde el servidor con tiempo y reintentos controlados; una respuesta de red incierta nunca se registra como completada.
- **Correo controlado:** Resend registra aceptación separadamente de entrega, rebote, queja o supresión; el webhook requiere firma y configuración real.
- **Formación inicial:** [School](/school) y [microcurso de verificación](/school/verificar).
- **Noticias:** [Hola Soy Tu IA](/news) y [KOWI Verifica](/news/verificar), prechequeo de evidencia pendiente de investigación humana.
- **Ecosistema:** [hoja de ruta pública](/ecosistema) de One, Business, School, Partners y Builders.

**Antes de ofrecer servicios de pago:** comprobar funcionamiento E2E con usuario y empresa autorizados, dominio SMTP/Resend, privacidades, costes, soporte y control de seguridad. Ningún ejemplo ficticio representa actividad de clientes reales. No introducir credenciales en el repositorio ni habilitar WhatsApp personal.
