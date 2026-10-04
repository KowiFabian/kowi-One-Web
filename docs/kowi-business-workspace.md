# KOWI Business: entrada directa e instalación
La ruta pública y de entrada es https://kowi.one/business/app. Su manifiesto propio inicia en /business/app y permite instalación como PWA desde navegadores compatibles, sin distribución nativa ni tienda de aplicaciones.

## Recorrido
1. Abrir /business/app; entrar con correo y código o enlace recibido por el usuario.
2. Crear una empresa con su nombre real o seleccionar una empresa autorizada.
3. Consultar registros persistentes del CRM: contactos, leads, oportunidades, citas locales, tareas y conversaciones privadas.
4. Configurar el agente, probar una conversación IA real y activarlo solo después de la verificación.
5. Abrir Director para órdenes internas con aval del propietario y evidencias. La prueba de correo controlada sigue en /test-email.

## Controles
El resumen usa requireOrganization, autenticación validada en servidor, cliente Supabase del usuario y RLS; todas las consultas llevan organization_id. Las cifras son conteos exactos; un error impide mostrar métricas estimadas. No se devuelve la configuración del agente en el resumen. Las instalaciones sintéticas se excluyen de la disponibilidad operativa.

La preferencia de empresa guarda solamente un identificador y se valida contra las organizaciones autorizadas antes de reutilizarlo. Se elimina al cerrar sesión. Los enlaces de gestión preservan la empresa y, para el CRM, la sección elegida.

El service worker existente almacena solamente el aviso público offline. Las respuestas privadas no se guardan en su caché; requieren conexión. Instalar la PWA no concede permisos ni habilita canales externos.

## Verificación y límites
Las pruebas de navegador cubren la entrada pública, manifiestos, iconos, móvil, denegación de acceso sin sesión y aviso offline. Una prueba identificada LOCAL UI FIXTURE comprueba selección de empresa y enlace a agenda con respuestas interceptadas, solo en CI local: no acredita autenticación ni persistencia de producción.

El recorrido autenticado con OTP, respuesta IA persistente, aprobación humana y entrega del correo requiere una sesión real del propietario. No debe declararse completado a partir de flags de configuración ni fixtures.

Google Calendar, lectura de correo, WhatsApp y voz necesitan autorización de cada proveedor y prueba independiente; una cita local no acredita una reserva externa. No se añaden clientes reales ni ingresos de ejemplo. Este cambio no modifica datos ni permisos SQL.
