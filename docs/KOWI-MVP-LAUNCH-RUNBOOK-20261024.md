# KOWI IA — Runbook de lanzamiento MVP y go/no-go (24 octubre 2026)

**Estado:** guía de ejecución basada en comprobaciones reales del repositorio y conectores. No declara que correos de prueba, IA autenticada, cobros ni WhatsApp funcionen en producción sin pruebas.

## 1. Resumen ejecutivo y oferta inicial

La hipótesis de MVP para las primeras ventas es **KOWI Business: asistente supervisado que atiende preguntas frecuentes basadas en la ficha aprobada, cualifica oportunidades y ayuda al propietario a organizar seguimiento**. El negocio puede revisar los resultados y autorizar acciones sensibles. El alcance comercial debe comenzar por lo que pase pruebas E2E; no prometer integración bidireccional con WhatsApp o agenda externa antes de confirmarlas.

**KOWI School Free** mantiene la adquisición educativa gratuita con `/school` y `/school/verificar`. «Hola Soy Tu IA» (`/news`) descubre noticias, enseña a contrastarlas y crea confianza en la firma `kowi.one`. El módulo editorial `/news/verificar` es un **prechequeo documental**, no un verificador autónomo de hechos.

**Propuesta de valor:** información explicada, aprendizaje gratuito y agentes que transforman intención en acciones verificables bajo control humano. Diferenciarse por consentimiento, transparencia, identidad del agente, límites, auditoría y coste conocido.

## 2. Lo observado frente a lo no confirmado

- Código verificado: chat personal y de empresa, flujos y cuotas, conversaciones en Supabase; envío controlado Resend, webhook firmado y registro de eventos, UI de evidencia.
- GitHub CI existente: `npm ci`, test, TypeScript, ESLint, build, `npm audit --omit=dev`. El resultado debe comprobarse en el commit exacto; un build correcto no garantiza integración de proveedor.
- Supabase conectado `Kowi One` en estado `ACTIVE_HEALTHY` (24 octubre); lecturas SQL confirmaron RLS activado y SELECT autorizado por `authenticated` en tablas clave (conversaciones, mensajes, acciones, email_events, organizaciones y agentes).
- Avisos de seguridad Supabase: funciones `SECURITY DEFINER` ejecutables por usuarios autenticados (14), RLS en tablas privadas sin policy (10, que puede ser **intencional** si son inaccesibles al cliente), aviso de protección de contraseñas filtradas. Examinar función por función; **no** revocar privilegios a ciegas.
- Revisión Vercel: se observaron en el listado de variables de proyecto `RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` y tres variables de Google OAuth. No se observaron allí `OPENAI_API_KEY`, `KOWI_EMAIL_FROM` ni `RESEND_WEBHOOK_SECRET`. Esto **no demuestra** ausencia en todos los orígenes de variables; verificar flags en `/api/health` y panel de proyecto, sin revelar valores. `.env.production` del repositorio contiene únicamente claves públicas Supabase por nombre, no credenciales de IA.

## 3. Arquitectura inicial

```text
Browser / PWA (Next.js 15 + React)
   |  Supabase Auth, RLS, tenant isolation
API Next.js -> input schema, cuota, límites, idempotencia
   |-> OpenAI (solo servidor, timeout acotado, reintento por 429/5xx)
   |-> Business execution (Human Approval + Action Ledger)
   |-> Resend email (solo envío aprobado; ID aceptado ≠ entrega)
   |-> Supabase (CRM, conversaciones, evidencia de proveedor)
   |-> KOWI School Free / Verifica (sin cobro/publicación autónoma)
   +-> Canales externos: solo con aprobación, credenciales, pruebas E2E
```

### Política de fallos de OpenAI

- No reintentar 400, 401, 403 ni formatos de salida incorrectos: necesitan revisión, no repetición.
- Reintentar **con límite** 429/500/502/503/504, respetando `Retry-After` si cabe en la ventana y evitando esperas largas.
- Si el proveedor corta la conexión o agota tiempo sin resultado, el estado es ambiguo; **no** repetir automáticamente para evitar duplicar consumo.
- Mantener `store:false`, permisos de llamada en servidor, aislamiento por empresa y no registrar API keys, contenido confidencial ni datos sensibles en consola.
- Las llamadas fallidas no deben registrarse como conversación completada. El chat empresarial conserva el registro de trabajos fallidos y la cuota.
- Responder 429 con mensaje claro y `Retry-After` cuando lo facilite el proveedor; 502/503 y mensajes claros para fallos de formato/configuración.

### Flujo y estados de Resend

- `accepted`: Resend devuelve un identificador; no acredita llegada.
- `delivered`: webhook `email.delivered` firmado y almacenado.
- `bounced`, `complained`, `suppressed`: eventos firmados y conservados; tratar como riesgo de entrega.
- Sin webhook: mostrar **pendiente o desconocido**, nunca `failed` por ausencia de evidencia.
- El webhook usa `RESEND_WEBHOOK_SECRET` y cabeceras Svix; no desactivar firma para «hacerlo funcionar».
- **Pendiente:** eventos `email.failed`, `email.sent` y `email.delivery_delayed` no forman parte de la actual enumeración de `email_events` y requieren una migración y evaluación explícitas, no mapearlos falsamente como `failed` o `delivered`.
- **Pendiente de prueba real:** dominio/remitente verificado en Resend, webhook público registrado con firma, uno o varios correos controlados con comprobación de entrega/bounce y consentimiento. No modificar registros MX de Zoho.

## 4. Configuración por entorno

| Variable | Dónde | Acción / protección |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | cliente + servidor | URL del proyecto autorizado, pública por diseño |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | cliente + servidor | clave publicable, RLS obligatorio |
| `SUPABASE_SERVICE_ROLE_KEY` | servidor | secreto en Vercel, nunca navegador/Git |
| `OPENAI_API_KEY` | servidor | configurar en Vercel, comprobar presencia mediante health y prueba autenticada |
| `OPENAI_MODEL` | servidor | elegir modelo probado compatible con esquema JSON y presupuesto |
| `RESEND_API_KEY` | servidor | API key Resend con permisos mínimos |
| `KOWI_EMAIL_FROM` | servidor | dirección autorizada del dominio verificado |
| `RESEND_WEBHOOK_SECRET` | servidor | secreto proporcionado por Resend al crear webhook, nunca público |
| `KOWI_VERIFIED_CHANNELS` | servidor | vacío por defecto; marcar cada canal solo tras prueba completa |
| `WHATSAPP_*` y `META_GRAPH_VERSION` | servidor | piloto Meta con número de prueba; **no** conectar ni migrar WhatsApp personal |

En Vercel distinguir Production, Preview y Development; no copiar credenciales de producción en Preview sin razón. Verificar `/api/health` sin divulgar las claves; el campo `aiConfigured` solo indica presencia, no éxito de proveedor. `/api/test-email` requiere autenticación y permiso.

## 5. Ejecución local — comandos reproducibles

```bash
git clone https://github.com/KowiFabian/kowi-One-Web.git
cd kowi-One-Web
node --version                       # Node >=22
npm ci
npm test
npm run type-check
npm run lint
npm run build
npm audit --omit=dev
npm run dev
```

Crear `.env.local` exclusivamente en desarrollo y con valores propios; no almacenar ni imprimir tokens. Para pruebas de integración usar proyectos/usuarios controlados y datos ficticios.

**Comprobación HTTP pública sin credenciales:**
```bash
curl -sS https://kowi.one/api/health
curl -I https://kowi.one/news
curl -I https://kowi.one/school/verificar
curl -I https://kowi.one/business
```

Las rutas privadas requieren autenticación y deben devolver 401 si no hay sesión. Probar usuario A / B para aislamiento RLS y propietario versus operador. Las pruebas de navegador usan `npx playwright test --config=playwright.public.config.mjs` dentro del flujo CI con versión compatible y fixture controlado; no ejecutar scripts sin revisar el entorno.

## 6. CI: avanzar sin silenciar vulnerabilidades

No retirar `npm audit --omit=dev`. Clasificar:
- **Bloqueante para producción:** secreto expuesto, fallo de autentificación/RLS, lectura cruzada entre empresas, crash en flujos críticos, vulnerabilidad high/critical explotable, pérdida de evidencia o duplicación de pagos/emails.
- **Advertencia documentada:** deuda no explotable en este alcance, fallos de pruebas opcionales por infraestructura, recomendaciones de estilo/performance.
- **Fallback:** si falla Playwright por runtime del navegador, corregir runner o probar en Preview sin afirmar que el E2E pasó.
- Mantener branch/PR y despliegue Preview mientras se investiga un bloqueo; no convertir «no bloqueante» en publicación sin aprobación.

## 7. Checklist go/no-go (hacer con usuario real controlado)

- [ ] Contrato/página de privacidad, responsable, datos y consentimiento revisados para España y UE.
- [ ] `/api/health`: `authenticationConfigured`, `tenantPersistenceConfigured` y `aiConfigured` en true con commit esperado.
- [ ] Usuario de prueba: recepción de OTP real, login, logout, recuperación y sesión caducada.
- [ ] Crear empresa y registrar agente; errores visibles en el chat sin salir de la pantalla.
- [ ] Conversación IA con historial persistido, coste/cuota y respuesta correcta.
- [ ] CRM: crear contacto ficticio con consentimiento y comprobar datos aislados por organización.
- [ ] Resend: remitente verificado; preparar prueba vinculada a conversación; aprobar contenido exacto; registrar ID aceptado; webhook firmado y estado real.
- [ ] Meta WhatsApp **solo número de prueba**; el WhatsApp personal no se migra ni modifica.
- [ ] School: cinco ejercicios, navegación móvil, accesibilidad, claridad de oferta gratuita.
- [ ] Verifica: evidencia insuficiente bloquea publicación; ningún titular generado automáticamente sin revisión humana.
- [ ] CI completo, auditoría y smoke del commit; prueba de rollback; métricas básicas y presupuesto máximo.

## 8. Plan de comercialización por etapas

**Etapa A — MVP técnico controlado:** tests, salud de credenciales y aislamiento; demo Business reproducible con datos ficticios y correo controlado; educación gratuita y contenido verificado.

**Etapa B — Validación de demanda:** entrevistas con al menos 5 pymes; elegir un solo sector inicial (peluquería o recepción), 2 demostraciones comparables, medir tiempo antes/después, conversiones y satisfacción. No inventar clientes, ingresos ni resultados.

**Etapa C — Comercial piloto:** propuesta por escrito, onboarding asistido, condiciones de servicio, protección de datos, soporte y costes. Primer contrato solo después de pasar go/no-go; opción de piloto limitado con autorización de acciones externas.

**Etapa D — Lanzamiento repetible:** Partners e instaladores formados, seguimiento de casos reales, pruebas A/B de titulares y demos, mejora de márgenes antes de ampliar verticales.

### Ofertas candidatas (hipótesis internas)

- **School Free:** contenidos y ejercicios abiertos; métricas de aprendizaje, sin certificado oficial.
- **School Pro:** tutor, revisión y recursos, posible suscripción de 9,90–24,90 €/mes *pendiente de validar*.
- **Business Basic:** referencia **99 €/mes**, sujeta a alcance funcional, costes API/mensajería, instalación y soporte; no publicitar funciones aún no conectadas.
- **Business Pro / Setup:** presupuesto por complejidad y trabajo; Human Approval y auditoría incorporados por diseño.
- **Partners y Builders:** comisiones e ingresos solo mediante acuerdos firmados, ventas válidas y calidad comprobada.

### Economía unitaria

`Margen mensual = Ingreso neto sin IVA − API IA − email/WhatsApp/voz − infraestructura − soporte − captación/comisiones amortizadas − incidencias`.

Métricas iniciales: % registro→demo, conversaciones resueltas, tiempo ahorrado observado, ratio de derivación a humano, incidencias, coste por interacción y margen por negocio. Separar datos reales de supuestos. School: inicio, finalización, comprensión demostrada y problemas reales descubiertos.

## 9. Decisión de salida

**No-go** si faltan credenciales, la segregación de empresas no se prueba, no hay trazabilidad de mensajes externos o fallan controles high/critical de seguridad. **Go limitado** si el recorrido público y la demo ficticia son estables, y las funciones que requieren proveedores externos permanecen claramente desactivadas hasta su validación real.

La prioridad comercial es vender una **solución útil que ya funciona**, no la promesa de un ecosistema futuro. «Hola Soy Tu IA» informa con fuentes; School enseña; Business monetiza valor demostrado; KOWI IA responde del control humano.
