# KOWI AI — Contratación, facturación y activación (especificación de implementación)

Estado: DISEÑO / NO HABILITADO PARA COBROS REALES. No se ha conectado una cuenta Stripe ni configurado un webhook.

## 1. Flujo comercial
1. Cliente autenticado elige plan, especialidades, límites, complementos y datos fiscales.
2. El servidor calcula precio desde catálogo versionado; nunca confía en importes enviados por navegador.
3. Se muestra resumen precontractual: servicio, impuestos aplicables, instalación, renovación, límites, cargos externos, duración, cancelación, privacidad y derecho de desistimiento cuando proceda.
4. El cliente acepta las condiciones vigentes con marca de tiempo, versión y referencia del documento; consentimiento comercial separado y opcional.
5. Se crea pedido idempotente con estado pending_checkout y sesión de Stripe Checkout en modo subscription; la implantación, si corresponde, se añade como cargo único en la primera factura.
6. Stripe verifica el pago. El webhook firmado y reintentable actualiza el pedido únicamente tras reconciliar customer, subscription, invoice, currency, price IDs y tenant. Nunca confiar en la URL success.
7. Tras pago confirmado se crea configuración de agente en estado draft/pending_review, sin credenciales ni acceso externo.
8. Revisión de identidad, permisos, integraciones, RLS, límites, pruebas y autorización humana; después estado active.

## 2. Facturación
Stripe Billing puede gestionar cobro recurrente, impuestos configurados y documentos de cobro. Validar obligación fiscal española, datos del emisor, numeración, IVA, rectificativas y requisitos VeriFactu / sistema informático de facturación aplicables con asesoría fiscal. No afirmar que un recibo de Stripe satisface por sí solo toda obligación de factura. Probar renovaciones, impagos, devoluciones, prorrateos y cancelaciones.

## 3. Contrato — campos obligatorios pendientes
Identidad y NIF de la entidad KOWI, domicilio, contacto, descripción y disponibilidad del servicio, precios finales e impuestos, período y renovación, límites y uso justo, terceros, soporte y SLA, duración, baja, reembolsos, protección de datos y DPA, subencargados, transferencias, propiedad intelectual, responsabilidad, jurisdicción y reclamaciones. No publicar texto contractual definitivo hasta completar estos datos y revisión jurídica.

## 4. Modelo de datos sugerido
- tenants(id, legal_name, owner_user_id, status)
- memberships(tenant_id, user_id, role)
- plan_catalog(version, stripe_price_id, price, currency, limits)
- orders(id, tenant_id, idempotency_key, catalog_version, status, totals, terms_version, terms_accepted_at)
- subscriptions(tenant_id, stripe_customer_id, stripe_subscription_id, status, current_period_end)
- invoices(tenant_id, stripe_invoice_id, status, document_url, tax_data)
- agent_instances(id, tenant_id, status, config_version, created_by)
- agent_permissions(agent_id, action, scope, requires_approval)
- agent_action_ledger(agent_id, tenant_id, actor_id, action, approval_id, status, timestamp)
- webhook_events(provider, event_id, processed_at, status)

Todas las tablas multi-tenant con RLS por pertenencia comprobada. Identificadores externos únicos; operaciones idempotentes y transaccionales. La clave service_role nunca se expone al cliente.

## 5. Reglas de seguridad
- No habilitar pagos reales sin secretos en servidor, precios Stripe válidos, webhook firmado, reconciliación, persistencia y pruebas.
- No habilitar agente sin tenant y membresía autenticados, permisos mínimos, pruebas de integraciones, cuota y aprobación.
- Acciones sensibles (pagos, publicaciones, envíos externos, cambios de datos, permisos, voz) requieren autorización humana específica y auditable.
- Rechazar replay de webhook, duplicados, eventos fuera de orden y cambios de precio desde navegador.
- Retener únicamente datos necesarios, con acceso por rol y política de borrado.

## 6. Pruebas de aceptación
- Checkout de prueba y cancelación; pago exitoso, fallido y reintento.
- Webhook válido, firma inválida, duplicado y eventos fuera de orden.
- Alta tenant A no permite ver ni modificar recursos de tenant B.
- Pago no activa integraciones automáticamente.
- Factura emitida y visible al tenant correcto; cancelación y reembolso reconciliados.
- Vista móvil 375px, 390px y 430px; teclado, accesibilidad, navegación y confirmaciones.
- Verificación de costes y margen con facturas de proveedores y telemetría de tokens.

## 7. Bloqueadores de activación
Cuenta Stripe de KOWI verificada, entidad fiscal, datos de facturación, catálogo y precios Stripe, secretos en Vercel, URL de webhook, modelo de datos con RLS y revisión jurídica. Sin estos requisitos la integración debe permanecer desactivada.
