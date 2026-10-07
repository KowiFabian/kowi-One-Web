# KOWI School — Primera masterclass gratuita en directo

**Estado:** guion y especificación de implementación. No implica que exista transmisión, avatar o integración desplegada.

## Propuesta
**Título:** Descubre la IA: de tu primera pregunta a tu primer agente inteligente.
**Duración:** 45 minutos. **Acceso:** gratuito. **Presentación:** bienvenida grabada o en directo del fundador (consentimiento explícito), presentadora virtual identificada como IA, demostración real KOWI con datos ficticios.

## Guion de producción
- 00:00–05:00 — Fundador: «Bienvenidos a KOWI. Creemos que la inteligencia artificial debe ampliar las capacidades humanas. Hoy aprenderás a usarla y a crear tu primer asistente. Esta clase es gratuita y no necesitas experiencia previa.» Mostrar subtítulos y aviso de grabación.
- 05:00–12:00 — Presentadora virtual: explicación de IA generativa, capacidades, errores y protección de datos; una pregunta sencilla con antes/después.
- 12:00–22:00 — Presentadora y tutor KOWI: intención → contexto → restricciones → formato → revisión. Demostración de prompt seguro.
- 22:00–35:00 — Demo de peluquería ficticia: visitante consulta precios y horarios → agente responde con datos configurados → crea lead de prueba → propone reserva pendiente de confirmación; no contactar clientes reales ni ejecutar pagos.
- 35:00–40:00 — Preguntas moderadas, sin exponer información personal de participantes; alternativa accesible por formulario.
- 40:00–45:00 — Diagnóstico gratuito y ruta personalizada. Ofertas transparentes: Individual 9,90 €/mes, Pro + Builders 24,90 €/mes; cursos 29–79 € cuando se publiquen, sujeto a revisión IVA y condiciones. Nunca prometer ingresos.

## Guion de presentadora (apertura)
«Hola, soy la presentadora virtual de KOWI School. Soy un personaje generado con inteligencia artificial. Hoy descubrirás cómo convertir una idea en una herramienta útil. No necesitas saber programar. Aprenderemos con ejemplos, verificaremos las respuestas y construiremos un asistente de prueba. Al terminar, podrás descubrir tu nivel y elegir cómo continuar.»

## Integración web Next.js
- Ruta pública propuesta: /school/masterclass
- Landing accesible y responsive: programa, registro, fecha y hora local (no inventar fecha), política de privacidad, consentimiento opcional de marketing separado del registro.
- Registro en Supabase con tabla masterclass_registrations (id, user_id opcional, email, consent_marketing, created_at, session_id); RLS y rate limiting; doble opt-in cuando corresponda.
- Embed YouTube Live **solo tras configurar** stream y URL de vídeo oficiales; mostrar placeholder claro cuando no exista; evitar exponer claves RTMP.
- Chat de preguntas moderadas (YouTube o sistema propio con moderación y control de abuso); alternativa de preguntas por formulario.
- Demo de agente KOWI aislada en tenant de prueba, datos ficticios y límites de tokens; aprobación humana para reservas reales.
- Tras clase: grabación con consentimiento y accesibilidad (subtítulos/transcripción), diagnóstico y checkout separado de Free.
- Métricas: visitas, inscripciones, asistencia, finalización, diagnósticos y conversión, con analítica respetuosa del consentimiento.

## Streaming y avatar
YouTube Live + OBS para emitir; presentadora virtual con proveedor por seleccionar y derechos comerciales de imagen/voz verificados. Se puede empezar con clips pregrabados de presentadora + demostración en directo para reducir riesgos. Necesita operador humano de emisión y moderación; prueba privada de audio, subtítulos, latencia, enlaces, reconexión y carga antes de anunciar fecha.

## Pruebas de aceptación
1. Registro sin pago y confirmación de asistencia.
2. Página con estado «próximamente» sin URL de emisión configurada.
3. Transmisión privada de ensayo, audio/vídeo y móvil.
4. Demo aislada sin datos reales ni acciones irreversibles.
5. Accesibilidad, consentimiento, privacidad, cancelación de comunicaciones.
6. Reproducción de grabación y CTA diagnóstico gratuito.
7. Build, lint, test y validación E2E antes de merge y despliegue.

## Pendientes de configuración
Fecha y horario; canal YouTube verificado con emisión habilitada; elección y licencia del avatar; material del fundador; URL del stream; almacenamiento y reglas de registro; revisión legal de imagen, voz y privacidad.
