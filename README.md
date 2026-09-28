# KOWI One

Plataforma Human-First AI para convertir una intención en objetivo, plan y acción verificable. El piloto web reúne [KOWI One](/kowi), [KOWI Business](/business), [KOWI School](/school), [KOWI Proyectos](/proyectos), [Organización](/organizacion) y la iniciativa [Fundación](/fundacion).

El recorrido Business permite acceder con un código por email, configurar una empresa por cuenta, probar un agente de IA en una conversación privada y registrar contactos. La demostración pública de sectores usa datos ficticios. School y Fundación describen iniciativas en desarrollo, sin prometer acreditaciones, personalidad jurídica o convenios inexistentes.

## Desarrollo

Node 22 o superior. `npm ci`, `npm test`, `npm run type-check`, `npm run lint`, `npm run build`. Define las variables de `.env.example` en el entorno de despliegue; no incluyas secretos en Git. Aplica las migraciones de `supabase/migrations` en orden para una base nueva. Supabase Auth Email OTP debe enviar el token numérico en la plantilla; configura SMTP y límites apropiados.

Consulta [Operación y límites](docs/PUBLIC-PLATFORM.md), [Privacidad](docs/SECURITY-PRIVACY.md), [Education](docs/KOWI-EDUCATION.md) y [Business](docs/KOWI-BUSINESS.md). El código de ramas anteriores se ha integrado sobre el `main` que contenía el MVP operativo y el diseño visual aprobado.
