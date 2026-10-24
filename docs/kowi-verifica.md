# KOWI Verifica — Seguridad informativa para «Hola Soy Tu IA»

**Estado:** primera fase propuesta en PR. No es un investigador autónomo ni un detector fiable de deepfakes. No usa buscadores ni lee las fuentes externas; no certifica la verdad automáticamente. No está desplegado hasta la aprobación y el merge.

## Regla editorial

Nunca declarar una noticia confirmada solo porque el modelo la diga, la URL abra o varios sitios repitan el mismo comunicado. Ante evidencia insuficiente: **NO CONFIRMADO**. La versión final requiere revisión humana. Separar fecha del acontecimiento de fecha de publicación y distinguir hechos de anuncios, estimaciones, planes y opiniones.

## Flujo exigido para la versión completa

1. Descomponer cada artículo en afirmaciones comprobables: quién, qué, cuándo, dónde, cantidades y estado real de los hechos.
2. Localizar fuente original: documento, declaración, estudio, publicación firmada o testimonio. Guardar URL canónica, título, fecha, autor, cita y fecha de acceso. Contrastar si la fuente realmente apoya el titular.
3. Contrastar con investigación independiente, no reimpresiones del mismo teletipo; buscar pruebas contradictorias, rectificaciones y retractaciones. Registrar dependencia entre medios.
4. Comprobar identidad del testigo y su relación con el hecho mediante métodos apropiados, contexto, hora, lugar, contenido original y consentimiento; no atribuir identidad a un rostro o voz sin pruebas.
5. Verificar imágenes y vídeos con búsqueda inversa, primera publicación, secuencia original, metadatos y análisis editorial. C2PA indica procedencia firmada cuando está disponible, **no** asegura que lo mostrado sea real o verdadero.
6. Documentar estado por afirmación: confirmado con evidencias, parcialmente respaldado, contradicho, no confirmado o no verificable. Nunca otorgar el estado confirmado a partir de un mero enlace o autoevaluación del modelo.
7. Un editor autenticado revisa la evidencia y el contenido exacto, registra decisión, fecha y versión. No hay publicación ni envío autónomo; corregir públicamente cualquier dato demostrado falso.

## Implementado en fase 1

- `src/lib/news-verifier.ts`: prechequeo determinista de evidencia declarada, URL HTTPS, fragmento, original y diversidad de orígenes.
- `/news/verificar`: formulario sin consulta remota, sin almacenamiento ni publicación.
- `tests/news-verifier.test.ts`: pruebas para una sola fuente, republicaciones, URL insegura, material no original, testimonio y fecha futura.
- Vínculo desde `/news`.

El estado favorable es exclusivamente `human_review_required`; `publicationAuthorized` es siempre `false`. Ni los tipos de fuente declarados ni la validación sintáctica prueban que una fuente exista, sea independiente o apoye una afirmación.

## Pendiente para un agente autónomo fiable

Conector de búsqueda y lectura segura de fuentes, verificación de contenido real contra cita, detección de republicaciones, consulta de verificadores profesionales, revisión humana de multimedia, editor autenticado, base de evidencias versionada, control de publicación en servidor y pruebas con falsos positivos/negativos. Las fuentes web deben tratarse como datos no confiables para evitar inyecciones de instrucciones. No se recopilarán datos privados de testigos sin finalidad legítima y medidas de privacidad.

## Referencias metodológicas

- Reuters: https://reutersagency.com/about/standards-values/
- Reuters Fact Check: https://www.reuters.com/fact-check/about/
- UK Parliament Library: https://commonslibrary.parliament.uk/research-briefings/cbp-10820/
- Comprobación de imágenes: https://commonslibrary.parliament.uk/research-briefings/cbp-10816/
- C2PA y sus límites: https://c2pa.org/specifications/specifications/2.2/explainer/Explainer.html

**Identidad editorial:** «HOLA SOY TU IA», firmado `kowi.one`. Declarar siempre que el contenido procede de KOWI.
