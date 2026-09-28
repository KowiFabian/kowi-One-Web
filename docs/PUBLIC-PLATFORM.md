# KOWI: piloto público y límites

## Recorrido disponible

`/` presenta One, Business, School, Proyectos, Organización y la iniciativa Fundación. `/business` ofrece registro/acceso OTP con Supabase, configuración de una empresa por cuenta, tres fichas ficticias (peluquería, clínica dental y promotora inmobiliaria), chat privado con IA basado en la ficha, historial y contactos manuales. `/business/agent` contiene CRM, propuestas de acciones y aprobación humana. `/proyectos` guarda ideas, objetivos, fases, tareas y siguiente acción. `/school` informa del proyecto educativo; no vende formación aún.

La vista `/business/demo` usa respuestas fijas claramente indicadas como ejemplo. El chat autenticado de `/business` llama realmente a `/api/chat`, que usa el proveedor de IA configurado en el servidor. No hay un widget público de atención a clientes ni recepción automática de WhatsApp o correo. Una conversación de prueba no crea por sí sola un lead; el propietario registra solicitudes manualmente.

## Datos y permisos

Cada cuenta posee una sola empresa en este piloto, representada por `business_profiles.user_id`. Los registros de CRM, mensajes, citas, acciones, conversaciones, proyectos y ledger se aíslan por `user_id` con políticas RLS. No hay miembros de equipo ni varias empresas bajo una misma cuenta. Todas las rutas de escritura comprueban el token con Supabase Auth. Los tokens no dan acceso entre propietarios.

El Action Ledger `agent_ledger` registra respuestas de Business y creación de proyectos (actor, agente, permiso, hora, resultado y referencias de evidencia). Las propuestas de comunicación y citas se guardan en `business_actions`, con estado de aprobación, ejecutado y fecha. Para habilitar canales de producción falta asociar evidencia de entrega, idempotencia y configuración por empresa. La aprobación de acciones de alto impacto usa `transition_business_action` y no permite que un usuario modifique directamente el estado de la tabla. Se exige consentimiento para preparar y ejecutar comunicaciones de seguimiento.

Agentes: **One** orienta objetivos y planes; **Business** atiende consultas en simulación privada. **Proyectos** guarda la hoja de ruta redactada por el usuario. Ventas, agenda, seguimiento, aprendizaje y apoyo administrativo son capacidades previstas; sus conectores no se anuncian como activos. Secuencia prevista: persona → intención → comprensión → objetivo → plan → agente → aprobación según riesgo → ejecución → evidencia → aprendizaje.

## Canales

- Web: chat privado del propietario activo cuando Supabase Auth y OPENAI_API_KEY estén configurados.
- Correo: Zoho Mail gestiona `info@kowi.one` como buzón, pero no existe integración de recepción en la app. Resend está preparado para salida desde el servidor; verificar dominio, remitente, token y envío de extremo a extremo antes de habilitarlo por empresa.
- WhatsApp: salida preparada con Meta Cloud API; requiere cuenta, número, token, webhook verificado, permisos y prueba real. La recepción y continuidad multicanal no están implementadas.
- Calendario: adaptador para crear eventos con token de Google, no conectado por empresa ni probado de extremo a extremo.
- CRM: interno, manual, con estado y próxima acción. Integración con CRM externo pendiente.

No guardar claves en navegador ni en base de datos. Las variables de canal en el servidor no garantizan que el proveedor acepte una operación. El estado «configurado» no equivale a «verificado».

## Operación y publicación

El proyecto de Supabase conectado `guxolvqbhfbztvnyopbs` tiene migraciones aplicadas hasta `action_approval_guard`. La instalación GitHub Codex Connector está activa; la rama nueva debe publicarse y desplegarse antes de considerar estas rutas disponibles en la web. La instalación anterior de Vercel tiene SSO para dominios `vercel.app`; comprobar el acceso público con el dominio personalizado y quitar o ajustar SSO solo después de revisión de configuración.

La referencia visual «KOWI: Ideas que se convierten en acción» no está adjunta en este repositorio. Se han conservado el orbe, paleta verde, tipografía y lenguaje visual del `main` publicado. El README histórico contiene conceptos futuros; estas páginas describen el estado actual.

## Matriz de controles para evaluación futura

| Área | Control actual | Evidencia comprobable | Pendiente |
| --- | --- | --- | --- |
| Identidades | OTP, token validado en servidor | `src/lib/server/auth.ts`, pruebas API | MFA y sesiones de alto riesgo |
| Aislamiento | RLS por propietario en tablas expuestas | migraciones y prueba de dos usuarios | equipos y tenancy múltiple |
| Acciones | aprobación explícita, transición restringida | `business_actions`, RPC y pruebas | idempotencia externa y trazas de entrega |
| Datos | validación Zod y límites de tamaño | esquemas y rutas API | exportación/borrado integral de CRM y proyectos |
| Secretos | variables solo en servidor | `.env.example`, revisión de código | rotación y auditoría de proveedores |
| Integraciones | llamadas desde servidor tras aprobación | adaptadores y estados | webhook firmado, pruebas E2E y aislamiento por canal |
| Disponibilidad | cuota de chat por usuario | `consume_chat_quota`, pruebas | alertas, copias verificadas y recuperación |
| Gobierno | documento de límites y matriz | este archivo | inventario formal, evaluación de riesgos y auditoría independiente |

Esta matriz orienta una futura evaluación ISO/IEC 27001 y 27017. No acredita certificación ni conformidad completa.
