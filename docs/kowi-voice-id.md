# KOWI Enterprise · Voz ID
El propietario definió Voz ID como un nuevo servicio propio de KOWI. La ruta /voz-id presenta su alcance y diferencia las funciones actuales de los componentes pendientes.

## Implementación actual
KOWI One usa SpeechRecognition/webkitSpeechRecognition y speechSynthesis del navegador. El primer dictado de cada sesión del componente requiere confirmación informada; el texto se incorpora al borrador, nunca autoriza ni ejecuta acciones externas. Hay botón para detener y limpieza al desmontar el componente, incluido logout. No se almacena audio ni biometría por este código. El proveedor del navegador puede procesar audio; no se afirma procesamiento local.

## Próximo contrato de delegación (no implementado)
Identidad vinculada a cuenta autenticada y verificada; grant_id, owner_id, agente, objetivo, herramientas, destinatarios, presupuesto, vigencia, límites y revocación. Verificar la delegación en backend en cada ejecución, vincular aprobación al contenido concreto, registrar evidencia y revocar trabajos pendientes sin borrar resultados legítimos. Una transcripción o voz nunca constituye autenticación.

Las llamadas y las herramientas de correo/calendario personales requieren integración oficial, consentimiento y verificación independientes. No se conceden privilegios Enterprise por user_metadata. No hay llamadas reales ni clonación de voz ni aprobación biométrica en este cambio.
