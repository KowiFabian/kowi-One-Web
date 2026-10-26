# KOWI: revisión P0 y secuencia de integración — 26 octubre 2026

## Estado observado

- Repositorio: `KowiFabian/kowi-One-Web`; base `0229a8f65f7ca70ad0f1fcd2bcff2c00516ec33b`.
- 18 PR abiertos. Se revisaron sus descripciones y las diferencias de los fixes P0 y especificaciones relacionadas.
- Vercel: producción READY, deployment `dpl_3H9RmStEWETWCTUDz36RQsGmgeRm`, mismo commit de base; alias `kowi.one`.
- Supabase Kowi One: ACTIVE_HEALTHY. RLS habilitado en organizations, agent_installations, conversations y messages.
- Las funciones save_organization_chat, begin_organization_chat_job y consume_organization_ai_quota permiten ejecución a service_role y la deniegan a authenticated.
- El historial de migraciones remoto incluye chat con evidencia, ciclo de vida, trabajos acotados y captura CRM. Los nombres/versiones remotos difieren de algunos archivos históricos: no aplicar migraciones en bloque sin conciliación.
- HTTP público y rechazo de accesos sin sesión: verificados con scripts/production-smoke.mjs. Health indica CONFIGURED; no demuestra OTP ni conectividad con el proveedor IA.

## Incremento de este PR

- Adapta la validación del PR #74 conservando estilos; muestra campos incompletos y confirmación del registro. Una respuesta idempotente del servidor no duplica el agente en la lista.
- Usa validación explícita de empresa en ambos formularios, relacionada con #73, sin incorporar los cambios de color del PR original.
- Muestra fallos de inicialización del chat aunque no exista agente y el menú esté cerrado.
- Una respuesta guardada sigue siendo éxito aunque falle el refresco posterior del agente. El aviso diferencia persistencia y refresco; queda visible con el menú cerrado.
- Integra las especificaciones documentales existentes de #66 y #71. Los porcentajes y precios propuestos no están aprobados como política activa ni se ejecutan pagos.
- No modifica CSS, clases de estilo, imágenes, logotipo, rutas de navegación ni esquema de producción.

## Siguiente secuencia y límites de evidencia

1. P0: ejecutar en una cuenta de pruebas autorizada: crear empresa → comprobar recarga → registrar agente DRAFT → conversar con API real → comprobar historial tras recarga → verificar aislamiento con otra empresa. Repetir conflicto, cuota y fallo del proveedor. Aún pendiente; las pruebas locales con fixtures no acreditan este recorrido real.
2. Business: resolver el error real de creación si persiste; las alertas no demuestran que la causa de un POST fallido haya desaparecido. #56 ya tiene acceso equivalente en la base actual; revisar duplicidades antes de fusionar.
3. School #26: revisar migración/RLS y tutor en entorno aislado. No integrar su sustitución visual de /school sin aprobación. La persistencia autenticada completa sigue pendiente.
4. Partners/Builders #66/#71: especificaciones integradas; inscripción, atribución y comisiones requieren implementación, autorización empresarial, pruebas y revisión de condiciones. No presentar marketplace o ingresos como activos.
5. WhatsApp #91: conservar como piloto desactivado. Revisar firma, deduplicación, aislamiento y resultado incierto; después migración y credenciales solo en entorno de pruebas autorizado. Verificar mensaje entrante → persistencia → aprobación humana → respuesta recibida. Retención automática, límites y monitorización pendientes. Ningún envío real realizado aquí.
6. #86, #83, #76 y #75 incluyen cambios visuales o de navegación; quedan fuera de este incremento por la instrucción de conservar diseño.

## Seguridad observada

Supabase devuelve 14 avisos de funciones SECURITY DEFINER ejecutables por authenticated, 10 observaciones informativas de RLS sin políticas y protección de contraseñas filtradas deshabilitada. No equivalen por sí solos a acceso indebido: revisar predicados y uso previsto antes de cambiar permisos. No se modificaron permisos ni configuración.

Referencias de remediación: https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable ; https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy ; https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

## Publicación

Este incremento se entrega en rama y PR. Sin merge, promoción a producción, migraciones remotas, cambios de credenciales, pagos ni mensajes externos. Las funciones sensibles y E2E real pendientes no se marcan completadas.
