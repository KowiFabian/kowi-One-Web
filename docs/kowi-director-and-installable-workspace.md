# KOWI Director y espacio instalable
El director ejecuta de forma determinista un alcance interno: crear tareas y grupos privados. La conversación empresarial existente aporta IA server-side; preparar un plan no invoca un LLM ni ejecuta una campaña internacional.

## Recorrido
/app → registro y empresa → configuración real → conversación IA persistente → activar agente validado → /business/director → orden → plan inmutable → aval del propietario verificado → ejecución interna → director_events.

Una orden comercial guarda mercados para preparar país, idioma, moneda, oferta, procedencia del contacto y consentimiento. No prueba presencia ni ventas internacionales. El envío exacto conserva el recorrido independiente /test-email y su Human Approval.

## Permisos y límites
Únicamente Company Owner con correo verificado propone, decide y ejecuta. Admin, Configurator, Operator y Viewer pueden leer según pertenencia, pero no conceder ese aval. No se inventa Platform Owner.
- Agente ACTIVE, last_verified_at registrado y sin marca synthetic.
- Máximo 10 órdenes por organización en 24 horas, con bloqueo transaccional.
- Plan pendiente 7 días; aprobación válida 24 horas.
- Ejecución atómica e idempotente, sin efectos externos.
- Cambios directos y eliminación de planes o evidencias no concedidos al navegador.
- PAUSED, REVOKED y TERMINATED cancelan órdenes pendientes y conservan resultados.
- Trabajo interno creado no significa objetivo cumplido: objective_achieved=false.

## Decisiones de mediodía
La primera orden configura una zona IANA de la organización. pg_cron revisa cada 5 minutos; durante la hora local 12 guarda una instantánea diaria única. Maneja horario de verano mediante PostgreSQL. Datos observados, interpretación y recomendación aparecen separados. No se envía el informe a nadie. Consultar cron.job_run_details verifica ejecución técnica; cero informes antes de configurar una organización es un estado válido. Cambiar zona posteriormente requiere una configuración administrativa pendiente de UI.

## Grupos Fundación
Una orden aprobada crea grupos privados de investigación/verificación, educación y bienestar. No se inscribe a nadie. Cada miembro autenticado y verificado de la organización acepta individualmente o retira participación. Se conserva versión, fecha y retirada; no se publican identidades ni se autoriza marketing o donaciones. La inscripción pública y acuerdos de una fundación legal siguen pendientes.

## Contactos, agenda y correo
El CRM existente guarda nombre, email, teléfono, consentimiento y relaciones; citas son propuestas locales. No hay acceso activo a Google Calendar o buzones. El propietario debe conectar OAuth oficial con alcances mínimos antes de verificar sincronización. No pedir credenciales por chat.

## Web instalable
Manifest standalone, iconos PNG 192/512, accesos directos y espacio /app. Chrome puede ofrecer instalación; iOS usa Safari y Añadir a pantalla de inicio. No es una app distribuida por App Store/Play Store.
El service worker solo guarda /offline.html. No cachea datos, API, conversaciones, páginas privadas ni tokens. Sin conexión muestra un aviso y recomienda consultar evidencia antes de repetir una operación. No permite IA o ejecución offline.

## Verificación
Tests SQL locales usan cuentas y datos de fixture: no acreditan conversaciones ni envío real. CI lint, type-check, tests, build y audit de dependencias de producción. Playwright Desktop/Pixel comprueba espacio, iconos, rechazo sin sesión y fallback offline. El E2E autenticado requiere una cuenta legítima y una conversación real; no usar fixtures sintéticas de producción como clientes.
