# Kowi Business Agent · producto y fases de entrega

Estado del código: **piloto privado**. La ruta `/business` permite entrar con cuenta, configurar un negocio, simular conversaciones y registrar oportunidades en un CRM propio. No están conectados WhatsApp, email, llamadas, calendarios ni CRMs externos; el agente no envía mensajes ni reserva citas. El producto comercial multicanal descrito abajo es una hoja de ruta, no una función ya entregada.

## Promesa y flujo

Una pyme define su información confirmada y su forma de atender. Kowi ayuda a responder consultas, cualificar necesidades, recomendar servicios confirmados y preparar seguimiento. El propietario controla las reglas y autoriza las acciones que afectan a otras personas o datos. Los primeros sectores son belleza, inmobiliaria, consultas, talleres, restauración, comercio, profesionales y pymes. La configuración es reutilizable; las plantillas por sector cambian preguntas, métricas y casos de prueba, sin crear productos distintos.

**Roles del agente:** atención y recepción; secretaría comercial y administrativa; ventas y cualificación; agenda; CRM y seguimiento; ayuda al propietario. Cada capacidad debe tener una acción verificable, fuente de datos y permiso concreto. La versión actual proporciona una demo de atención, ficha del negocio y CRM manual. Ofertas, presupuestos y citas son borradores o propuestas hasta conectar sistemas y autorizar la acción.

| Capacidad | Piloto disponible | Para operación real |
| --- | --- | --- |
| Configurar negocio | Formulario, validación y guardado privado | Edición por roles, versiones y revisión de reglas |
| Atención y ventas | Simulación privada con base de conocimiento de la ficha | Widget web, controles de calidad y transferencia humana |
| CRM | Oportunidades y estado editados por el propietario | Identidad del cliente, consentimiento, deduplicación, historial de eventos |
| Agenda | Propuestas de cita en conversación | Conector autorizado, disponibilidad, bloqueo y confirmación |
| WhatsApp y email | Sin conexión | Proveedores oficiales, alta del canal, consentimiento, webhooks y plantillas |
| Llamadas | Sin conexión | Telefonía, aviso y reglas de grabación, transcripción y transferencia |
| Analítica/aprendizaje | Etiquetas de observación en respuestas | Evidencias, métricas, revisión y aprobación de nuevas reglas |

## Arquitectura de continuidad entre canales

Cuando existan conectores, cada evento tendrá `business_id`, `channel`, `external_event_id`, `contact_id`, `conversation_id`, hora de recepción, dirección, consentimiento aplicable y estado de procesamiento. El identificador externo sirve para procesar reintentos sin duplicar mensajes. La identidad de una persona entre canales solo se unirá mediante un dato verificado o confirmación explícita; un nombre parecido no basta. El contexto común tendrá historial mínimo necesario, ficha aprobada del negocio y siguiente acción pendiente. El cliente verá tono y políticas coherentes, mientras la interfaz indicará cuándo habla con IA y cómo contactar a una persona.

| Canal | Evento de entrada | Acción de salida | Control previo |
| --- | --- | --- | --- |
| Web | Widget y sesión/consentimiento | Respuesta en la misma sesión | Ficha aprobada y derivación |
| WhatsApp | Webhook oficial | Mensaje según reglas y plantillas | Cuenta empresarial, permisos y política del canal |
| Email | Buzón conectado con alcance acotado | Borrador y envío tras aprobación | Dominio, destinatario y revisión humana |
| Teléfono | Número empresarial | Voz y transferencia | Identificación, privacidad y límites del guion |
| Agenda | Calendario con OAuth | Crear/cambiar/cancelar evento | Disponibilidad confirmada y aprobación para cambios |
| CRM externo | API con permisos mínimos | Alta/actualización de ficha | Identidad, deduplicación y autorización |

La documentación de [WhatsApp Business Platform](https://developers.facebook.com/docs/whatsapp/cloud-api/), [Google Calendar](https://developers.google.com/workspace/calendar/api/v3/reference/events/insert) y [Microsoft Graph](https://learn.microsoft.com/en-us/graph/api/user-sendmail) debe verificarse al implementar cada conexión; ninguna integración se presupone contratada.

## Permisos, human approval y registro

La ficha del negocio permite seleccionar solo tres comportamientos conversacionales de bajo riesgo: responder a FAQ aprobadas, recomendar servicios aprobados y preguntar para cualificar. Incluso en la demo estas respuestas no salen a canales externos. Para producción, asignar permisos por negocio, agente, acción y canal con fecha de caducidad y revocación.

| Riesgo | Ejemplos | Regla prevista |
| --- | --- | --- |
| Bajo | Buscar información aprobada; clasificar una consulta; preparar borrador | Automático en su ámbito, con trazabilidad |
| Medio | Proponer horario, precio o presupuesto; sugerir cambio de CRM | Revisión de datos y aprobación del propietario antes de cambiar registros |
| Alto | Enviar email/WhatsApp, confirmar o cancelar cita, cobrar, cambiar permisos, borrar, tratar identidad o voz | Autorización explícita vinculada a destinatario, contenido, importe y acción concreta |

Para cada acción futura, guardar `proposed → approved/rejected → executed/failed`, identidad del agente y aprobador, alcance, fuente, datos mínimos, marca temporal, idempotency key y resultado. Nunca confundir una propuesta del modelo con ejecución real. El propietario podrá revocar permisos; no se activan por inferencias del agente ni por instrucciones recibidas en mensajes de clientes.

## Aprendizaje controlado

| Clase | Significado | Ejemplo y consecuencia |
| --- | --- | --- |
| **HECHO** | Información confirmada por el propietario o sistema autorizado | «Cerramos los lunes»; puede alimentar respuestas tras validación |
| **PATRÓN** | Conducta repetida observada con fuente y periodo | «Varias consultas piden cita el sábado»; no cambia el horario |
| **HIPÓTESIS** | Explicación posible sin verificación suficiente | «Puede haber demanda de horario ampliado»; se investiga |
| **RECOMENDACIÓN** | Mejora concreta propuesta al propietario | «Probar apertura el sábado con dos turnos»; necesita aprobación |

El circuito es observar → citar evidencia → clasificar → proponer → aprobar → versionar la ficha → medir resultado. No se entrenará el modelo ni se alterarán políticas automáticamente con datos de clientes. Evitar datos de salud y categorías especiales en el piloto; clínicas necesitarán análisis y controles específicos antes de procesarlos.

## Lanzamiento por cortes

1. **Demo verificable:** probar dos negocios sintéticos de sectores distintos, comparar respuestas con la ficha aprobada, registrar 10 consultas frecuentes y anotar errores de precio, horario y derivación. Mantener el CRM con entrada manual.
2. **Primer piloto real:** consentimiento y textos legales revisados, widget web con transferencia humana, base de conocimiento versionada, métricas de respuesta y propietario que aprueba mensajes salientes. Probar con una peluquería o comercio antes de clínicas.
3. **Canales y automatización:** conectar un canal por vez, identidad de clientes y eventos idempotentes, agenda autorizada, solicitudes de aprobación y registro de acciones. Añadir WhatsApp, email y llamadas solo tras verificar costes, cuentas y condiciones de cada proveedor.

**Métrica de valor:** consultas atendidas correctamente, tiempo hasta primera respuesta, reservas realmente confirmadas, oportunidades cualificadas, seguimientos aprobados y satisfacción. Evitar afirmar aumentos de ventas sin datos comparables de cada piloto.
