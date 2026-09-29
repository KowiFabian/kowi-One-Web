# Instalar la demo de Kowi Business en otra web

Esta integración abre la **demo pública** de Kowi Business en una ventana flotante. Funciona en sitios HTML, WordPress y constructores que permiten insertar JavaScript. No requiere instalar Next.js ni compartir credenciales con el sitio anfitrión.

Pega el siguiente código una vez, antes de `</body>` o en el bloque de scripts globales del sitio:

```html
<script defer src="https://kowi.one/kowi-business-embed.js" data-kowi-label="Hablar con Kowi"></script>
```

El botón abre `https://kowi.one/business/embed` dentro de un iframe. También puedes enlazar a `https://kowi.one/business/demo` si la plataforma anfitriona no permite scripts o marcos. El código no necesita claves de API: el navegador carga la demo desde Kowi.

## Requisitos del sitio anfitrión

- Publicar el sitio por HTTPS.
- Si hay Content Security Policy propia, añadir `https://kowi.one` a `script-src` y `frame-src` (y a `connect-src` únicamente si una versión futura hace llamadas directas a Kowi desde el sitio anfitrión).
- Si el constructor bloquea iframes, usar el enlace directo a la demo.
- Comprobar en móvil que el botón flotante no tape elementos esenciales de navegación o consentimiento.

## Alcance actual

La demo utiliza respuestas de ejemplo y no transmite las consultas a un negocio, no registra leads ni reserva citas. Para ofrecer atención real en el sitio de un cliente se necesita una ficha del negocio aprobada, autorización de tratamiento de datos, controles de uso por dominio/negocio, un endpoint aislado por cliente, reglas de consentimiento, derivación humana y métricas. No convertir la demo en producción cambiando solo el texto del widget. El panel privado `/business` requiere autenticación y no está autorizado para iframe externo.

Para un piloto real, el negocio puede comenzar con su cuenta en [Kowi Business](https://kowi.one/business); la activación de canales y acciones se coordina caso por caso. Consulta [producto y fases de entrega](KOWI-BUSINESS.md).
