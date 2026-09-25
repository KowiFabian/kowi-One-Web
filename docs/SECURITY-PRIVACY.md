# Revisión de seguridad y privacidad del piloto

Fecha: 2026-09-25. Revisión de código y pruebas locales, no auditoría de certificación ni dictamen jurídico.

## Implementado
- Autenticación verificada en servidor, autorización por propietario y RLS sobre conversaciones y turnos.
- Sin clave de servicio de Supabase. OPENAI_API_KEY solo en servidor, ejemplos sin secretos y archivos de entorno ignorados.
- Límite de tamaño del cuerpo y validación estricta de mensajes, identificadores y salida del modelo.
- Cuotas atómicas por usuario en PostgreSQL; respuesta 429 y fallo cerrado si no se pueden comprobar.
- Escritura atómica del turno, detección de conflictos, recuperación de conversaciones, exportación y borrado.
- Cabeceras contra framing y MIME sniffing; restricciones de objetos, base y formularios. CSP parcial: aún no es una política completa con nonces.
- Sin analítica, publicidad ni logs de contenido añadidos.

## Pendiente antes del lanzamiento comercial
| Área | Acción y responsable |
| --- | --- |
| Responsable y transparencia | Titular de Kowi: identidad, contacto, finalidades y base jurídica por tratamiento; completar aviso y canal de derechos. |
| Conservación | Titular: fijar plazos; operador: implementar depuración programada y documentar backups/proveedores. No existe borrado automático por antigüedad todavía. |
| Proveedores y transferencias | Titular: contratos de encargo, subencargados, regiones efectivas y evaluación de transferencias para hosting, Supabase y OpenAI. |
| Derechos | Operador: proceso completo de acceso, rectificación, portabilidad y supresión de cuenta; conversación exportable/borrable no cubre todos los derechos. |
| Seguridad operativa | Operador: MFA de administradores, mínimo privilegio, rotación de secretos, presupuesto, protección de Auth y perímetro, monitoreo sin contenido sensible. |
| Incidentes y continuidad | Operador: responsable de incidentes, registro, evaluación de notificaciones, recuperación y pruebas de restauración. |
| Evaluación de riesgo | Titular: registro de tratamientos, análisis de riesgos y evaluación de necesidad de EIPD según uso y datos. |
| Validación real | Operador: probar dos cuentas, RLS, cuotas, OTP, generación, exportación y eliminación en Supabase remoto antes de abrir el servicio. |

ISO/IEC 27001 se usa como referencia de gestión de riesgos y mejora continua; ISO/IEC 27017 como referencia para responsabilidades compartidas y controles cloud. No se afirma certificación, conformidad integral, ni implantación de un SGSI. Esta revisión no ha evaluado todos los controles de las normas.

Referencias oficiales:
- RGPD, en particular artículos 5, 13, 17, 20, 25, 28, 32 y 33: https://eur-lex.europa.eu/eli/reg/2016/679/oj
- ISO/IEC 27001: https://www.iso.org/standard/27001
- ISO/IEC 27017: https://www.iso.org/standard/27017
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- OpenAI Structured Outputs: https://developers.openai.com/api/docs/guides/structured-outputs
