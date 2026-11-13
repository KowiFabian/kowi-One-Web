# KOWI AI Studio — Contenido y criterios de lanzamiento

## Propuesta de valor
«Imagina tu agente. Descubre cómo atendería a tus clientes.» KOWI Vision ofrece una demo interactiva contextualizada por sector, objetivo y tono, seguida del configurador de agentes y una solicitud de presupuesto.

## Recorrido implementado en /studio
1. Tu perfil: sector, nombre comercial opcional, objetivo y personalidad.
2. Tu demo: escenarios simulados con mensajes progresivos y reinicio.
3. Preparación: checklist de información necesaria y controles de seguridad.
4. Propuesta: referencia Business 89 €/mes y 299 € de implantación asistida, IVA no incluido, solicitud mediante borrador de email.
Después se muestra el configurador comercial existente con planes y complementos.

## Sectores y guiones incluidos
- Inmobiliaria: búsqueda de vivienda, solicitud de visita, seguimiento de consulta.
- Belleza: consulta de servicios.
- Clínica: atención administrativa sin consejo médico.
- Comercio: consulta de productos sin afirmar stock no verificado.

## Reglas de contenido
- No afirmar que una visita, cita, compra o precio está confirmado sin datos integrados y verificados.
- La demo no se presenta como conversación real ni agente activo.
- El tono premium debe ser elegante, claro, respetuoso y no prometer resultados.
- No incluir datos personales de terceros, salud ni información financiera en la demo.
- No afirmar cumplimiento legal certificado sin auditoría.

## Límites actuales
- Demo local predefinida; no modelo generativo ni aprendizaje de perfiles.
- No guarda preferencias ni registra leads en base de datos.
- Solicitud vía mailto con consentimiento explícito; depende del correo del usuario.
- No hay pago, provisión, integración WhatsApp/CRM/calendario ni despliegue de agentes.
- Tarifas y límites provisionales, sujetos a pruebas de consumo y rentabilidad.

## Bloqueadores antes de lanzar a clientes de pago
1. Ejecutar typecheck, lint, build y pruebas móviles de /studio, /agentes y navegación.
2. Confirmar preview de Vercel y validar enlaces, accesibilidad, foco y flujo de correo.
3. Medir costes por conversación (tokens, proveedor, WhatsApp, almacenamiento, infraestructura), soporte y comisiones.
4. Validar márgenes y límites contractuales; añadir IVA, excedentes y condiciones visibles.
5. Publicar privacidad, términos, política de retención, subencargados y consentimiento adecuado.
6. Crear registro de leads seguro, seguimiento comercial y confirmación de recepción.
7. Construir creación de borradores de agentes con revisión humana, identidad, permisos mínimos y ledger.
8. Integrar pagos y activación únicamente tras pruebas de seguridad, autorización y reversión.

## Criterios de aceptación
- Cambiar sector, objetivo y tono actualiza la demo sin recargar.
- Navegación entre cuatro pasos, diálogos y reinicio funcionan en iPhone y escritorio.
- Ningún botón afirma activar un agente, cobrar o confirmar una visita.
- No se envía información sin intervención explícita.
- Los escenarios se mantienen claramente como simulaciones.
