# Kowi One: activar el piloto

## Configuración
1. Crear o seleccionar un proyecto Supabase (preferiblemente región UE tras evaluar proveedores).
2. Aplicar supabase/migrations/202609250001_core.sql con el sistema de migraciones de Supabase. No se ha aplicado a ningún proyecto remoto desde esta tarea.
3. Habilitar Email en Supabase Auth. Configurar SMTP propio y la plantilla Magic Link para mostrar el código {{ .Token }}: la interfaz verifica OTP, no depende de redirecciones. Revisar límites de envío, caducidad y protección contra abuso en Auth.
4. Configurar NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en el entorno de build y ejecución. La clave pública no sustituye a RLS. No se requiere service_role.
5. Configurar OPENAI_API_KEY exclusivamente en el servidor. OPENAI_MODEL usa gpt-4o-mini por defecto y requiere soporte de JSON Schema. No pegar claves en Git ni en el navegador.
6. npm ci, npm test, npm run type-check, npm run lint, npm run build. Node 22 o superior.
7. En un entorno de prueba, verificar con dos cuentas reales: OTP, crear/chat/recargar, aislamiento entre cuentas, exportar, eliminar y cerrar sesión. Confirmar límites 5/minuto y 100/24 horas. Son ventanas que empiezan con la primera llamada, compartidas por todas las instancias.
8. Publicar solo tras completar la revisión de privacidad y las pruebas reales. No se ha desplegado ni fusionado a main.

## Comportamiento y límites
- / es la landing Kowi Business; /kowi contiene acceso y chat; /privacidad informa del estado piloto.
- Cada endpoint valida el token con Supabase Auth; las consultas y RLS restringen por user_id. Authorization Bearer no utiliza cookies implícitas del navegador.
- La sesión se guarda mediante el cliente Supabase en el navegador. Revisar política de sesiones, equipos compartidos, CSP estricta con nonces y MFA según el riesgo antes de producción.
- El chat recupera los últimos 10 turnos y el último plan no nulo de la misma conversación y usuario, aunque ese plan esté fuera de la ventana de diálogo. La consulta del plan se limita a la revisión leída y su estructura se valida antes de llamar al modelo. El plan se envía como datos de usuario, nunca como instrucciones privilegiadas. Cada turno guarda mensaje, respuesta y plan cuando lo hay. Máximo 100 turnos por conversación; listado de las 100 conversaciones más recientes. Los avances se registran en el chat.
- Si no se puede recuperar un plan válido, o la conversación llegó al máximo de turnos, se rechaza la petición antes de consumir cuota o llamar a OpenAI. Los fallos de red y las respuestas inválidas del proveedor devuelven un error 502 sin detalles internos y no se guardan como turnos.
- Una petición repetida ya guardada devuelve su resultado sin volver a llamar a OpenAI. Solicitudes simultáneas pueden gastar cuota antes de que una sea rechazada por conflicto: no hay garantía de una sola llamada de facturación durante concurrencia.
- No se registran mensajes, tokens ni respuestas del proveedor en consola. Errores genéricos al cliente. OPENAI_API_KEY solo se referencia en el endpoint del servidor.
- store:false evita solicitar almacenamiento del chat en OpenAI; no equivale a retención cero por parte de proveedores.
- La cuota falla cerrada si no está disponible la base de datos. Activar presupuesto del proyecto OpenAI y límites del proveedor; una cuota por usuario no evita abusos con muchas cuentas.
- Las funciones SQL permiten a cada usuario guardar su propio contenido; nunca conceden acceso a otras cuentas. No usar el historial como registro de auditoría confiable ni como instrucciones para herramientas privilegiadas.
- Borrado de conversación elimina turnos en cascada. La eliminación de auth.users elimina todos los datos asociados; la eliminación de cuenta requiere un proceso administrativo todavía pendiente.
- La actualización a Next 15.5.26 mantiene la migración acotada; PostCSS interno se fija en 8.5.28 para corregir avisos. Revisar el override en futuras actualizaciones.

## Verificación local
Las pruebas del endpoint simulan las respuestas de Supabase y OpenAI. Las pruebas SQL ejecutan la migración real en PGlite (PostgreSQL embebido) con roles y auth.uid() de prueba. No sustituyen una prueba contra Supabase remoto ni una generación real de OpenAI.
