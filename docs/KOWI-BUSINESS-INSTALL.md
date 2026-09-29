# Instalar la demo de Kowi Business en otra web

Esta integración abre Kowi Business en una ventana flotante. Funciona en sitios HTML, WordPress y constructores que permiten insertar JavaScript. No requiere instalar Next.js ni compartir credenciales con el sitio anfitrión.

Pega el siguiente código una vez, antes de `</body>` o en el bloque de scripts globales del sitio:

```html
<script defer src="https://kowi.one/embed/kowi.js" data-kowi-label="Hablar con Kowi"></script>
```

El botón abre `https://kowi.one/business/embed` dentro de un iframe. También puedes enlazar a `https://kowi.one/business/demo` si la plataforma anfitriona no permite scripts o marcos. El código no necesita claves de API: el navegador carga la demo desde Kowi.

## Agente configurado para un negocio

Tras guardar la ficha de empresa y activar el acceso web en Kowi Business, el propietario obtiene un identificador público en `/business/instalar`. Entonces copia el código personalizado:

```html
<script defer src="https://kowi.one/embed/kowi.js" data-agent="IDENTIFICADOR_PUBLICO" data-kowi-label="Hablar con nosotros"></script>
```

El identificador público selecciona la ficha aprobada del negocio; **no es una credencial**. El script comunica al iframe el origen de la web anfitriona, y el iframe solicita a Kowi una respuesta para esa ficha mediante `POST /api/business/embed/chat`, con `businessId`, `message`, `sessionId` y `x-kowi-site-origin`. Cada negocio debe activarse expresamente y autorizar de uno a cinco orígenes HTTPS; el servidor aplica límites por negocio y sesión. La declaración de origen del navegador es una comprobación básica y puede ser falsificada por clientes HTTP fuera del navegador, por lo que la cuota y los controles de abuso son necesarios. El propietario conserva el control de la ficha y las solicitudes de cita o contacto requieren consentimiento y confirmación humana. Si el identificador falta, se muestra únicamente la simulación genérica.

## Requisitos del sitio anfitrión

- Publicar el sitio por HTTPS.
- Si hay Content Security Policy propia, añadir `https://kowi.one` a `script-src` y `frame-src` (y a `connect-src` únicamente si una versión futura hace llamadas directas a Kowi desde el sitio anfitrión).
- Si el constructor bloquea iframes, usar el enlace directo a la demo.
- Comprobar en móvil que el botón flotante no tape elementos esenciales de navegación o consentimiento.

## Alcance actual

La demo sin identificador utiliza respuestas de ejemplo y no transmite las consultas a un negocio, no registra leads ni reserva citas. El agente con identificador responde según la ficha configurada y permanece sujeto a los límites de uso y a los permisos implementados en el servidor. Una respuesta de chat no confirma una cita, disponibilidad, precio o envío externo. Los canales como WhatsApp y agenda requieren sus propias conexiones y pruebas. El panel privado `/business` requiere autenticación y no está autorizado para iframe externo.

Para un piloto real, el negocio puede comenzar con su cuenta en [Kowi Business](https://kowi.one/business); la activación de canales y acciones se coordina caso por caso. Consulta [producto y fases de entrega](KOWI-BUSINESS.md).
