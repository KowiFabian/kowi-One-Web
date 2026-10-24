# KOWI IA · Modelo operativo, tecnológico y comercial (24-10-2026)

**Estado:** plan de ejecución y diseño; diferencia siempre «implementado», «en revisión», «propuesto», «no disponible». No es una oferta contractual ni prueba de usuarios, ingresos o funcionalidades en producción.

## 1. Propósito y cadena de valor

KOWI IA ayuda a que personas y organizaciones conviertan conocimiento fiable e intención en aprendizaje, proyectos y resultados verificables. La IA amplía capacidad; las personas conservan consentimiento, decisión y responsabilidad.

**Ciclo común:** noticia contrastada → explicación accesible → aprendizaje práctico → necesidad detectada → idea → prototipo → validación humana → producto/servicio → medición de impacto → mejora.

**Identidad editorial:** «HOLA SOY TU IA», firma `kowi.one`. No es publicidad encubierta ni asegura veracidad absoluta.

## 2. Líneas de producto, público, entrada y resultado

| Unidad | Público | Servicio inicial | Puerta de entrada | Evidencia del resultado | Estado al 24-10 |
| --- | --- | --- | --- | --- | --- |
| Hola Soy Tu IA | público y comunidad | titulares explicados, fuentes y aprendizaje | web/social → /news | ficha de fuentes, fechas, corrección | radar de lanzamientos ya existente; informativo general aún no automatizado |
| KOWI Verifica | lector/editor/formador | prechequeo de trazabilidad, dossier y revisión humana | /news/verificar | fuentes, rastreo del origen, decisiones editoriales | prototipo en PR #92; no comprueba páginas por sí solo |
| KOWI School | personas y empresas | rutas gratuitas, microlecciones, ejercicios y proyectos | /school | progreso local, entregable de aprendizaje | rutas gratuitas existen; microcurso de verificación en este PR; tutor/mentores acreditados no activos |
| KOWI One | personas con metas | intención → plan → primera acción | /kowi | objetivo, tareas y avances | flujo existente; capacidad real depende de prueba E2E |
| KOWI Business | pymes/autónomos | asistente supervisado de atención, CRM y agenda | /business | demostración con datos de prueba y métricas | módulos presentes; no declarar WhatsApp ni autonomía operativa sin prueba real |
| KOWI Partners | comerciales/implementadores | formación, demos, captación y despliegue aprobado | /partners-builders | cliente firmado y servicio entregado | concepto público; comisiones todavía no activas |
| KOWI Builders | desarrolladores | aplicaciones especializadas y futuro marketplace | /partners-builders | app validada, auditoría, cliente y soporte | concepto público; marketplace aún no operativo |
| Fundación/Comunidad | alumnos, organizaciones y proyectos | educación abierta, colaboración e impacto | /fundacion | beneficiarios reales, resultados y proyectos | principios y rutas publicados, sin inventar resultados |

### Ruta comunitaria transversal

**Aprendemos → Compartimos conocimientos → Descubrimos necesidades → Creamos una idea juntos → Construimos y comprobamos → Compartimos resultados.**

La dimensión comercial financia operación, soporte, formación y —si se formaliza y cuantifica— aportaciones al impacto social, nunca condiciona que una noticia sea aprobada.

## 3. Arquitectura objetivo y límites de confianza

```text
Web/PWA/social/WhatsApp (solo con autorización)
           |
Next.js (UI, API, rate limits, validación)
           |
Identidad y roles — Supabase Auth + RLS
           |
Orquestador de tareas (intención + límites + coste)
     |             |               |
KOWI Verifica  School/Tutor     Business/CRM
     |             |               |
Fuentes públicas  Lecciones      Canales autorizados
     |             |               |
Evidencias       Progreso        Agenda/leads
     +-------------+---------------+
                   |
     Human Approval + Action Ledger
                   |
Auditoría, seguimiento, incidentes y métricas
```

**Stack actual del repositorio:** Next.js 15 + TypeScript + React + Supabase JS, integración de modelo remoto mediante API OpenAI, despliegue Vercel. WhatsApp Cloud API, voz y demás conectores precisan permisos y credenciales en entorno seguro y pruebas de extremo a extremo antes de prometer funcionamiento.

### Reglas no negociables

1. **Prohibido inventar fuentes:** las URLs generadas por modelos no cuentan como evidencia. Toda afirmación pública rastrea un documento o medio real examinado.
2. **No confiar en texto externo:** cualquier página, transcripción, RSS, archivo o nota de prensa se trata como datos no privilegiados. Protección frente a prompt injection.
3. **Separación multi-tenant:** identidad del agente, permisos mínimos, RLS, límites por organización, cuotas y aislamiento de memoria.
4. **Control humano proporcional:** consultar datos públicos puede automatizarse; pagos, publicación editorial, mensajes externos y cambios sensibles requieren permisos y aprobación vinculada al contenido exacto.
5. **Evidencia auditable:** registro de modelo, petición, acciones, resultados, revisión, autor y versiones, evitando guardar secretos y datos innecesarios.
6. **Datos y voz:** consentimiento, base legítima, minimización, plazos, derecho de supresión, revisión de transferencias internacionales; nunca afirmar una clonación autorizada y operativa sin verificar disponibilidad y consentimiento.
7. **Cambios técnicos:** PR, pruebas automáticas, análisis de dependencias, despliegue de previsualización, revisión humana, despliegue controlado y comprobación posterior.

### KOWI Verifica — diseño objetivo

- Ingestión de noticias mediante fuente oficial, RSS autorizado y búsqueda/consultas explícitas; verificar autor, fecha de hecho, fecha de publicación, material original y retractaciones.
- Descomposición de titulares en afirmaciones comprobables. Agrupar republicaciones por fuente original: **dos enlaces no son necesariamente dos investigaciones independientes**.
- Un comparador de afirmación–evidencia que cita fragmento y contexto, clasifica: respaldada, parcialmente respaldada, contradicha, no comprobable o pendiente.
- Testimonio audiovisual: procedencia, consentimiento, primera publicación, contexto; metadatos C2PA **no son prueba de verdad**.
- Dossier firmado por editor: quién revisó, cuándo, qué texto exacto aprobó; bloqueador de publicación por defecto.
- Protocolo de rectificación versionada y visible. Evitar porcentajes de certeza inventados.
- **Distinción:** prechequeo determinista actual ≠ fact-check completo. Faltan conectores de investigación, motor de evidencia y publicación aprobada en servidor.

### Datos mínimos propuestos (sin desplegar en este PR)

`editorial_stories` (título, fecha, estado); `editorial_claims` (hecho, contexto, estado); `editorial_evidence` (URL canónica, autor, fecha, extracto, origen compartido, comprobador); `editorial_reviews` (revisor, versión del texto, decisión, instante, comentarios); `editorial_corrections` (versión, motivo, publicación).

Control de acceso por rol, RLS por organización, append-only para revisiones, políticas de retención y revisión RGPD antes de almacenar testimonios.

## 4. Oferta comercial: hipótesis, no precios vigentes

| Oferta candidata | Cliente | Hipótesis orientativa | Lo que NO se debe prometer |
| --- | --- | --- | --- |
| School Free | cualquier persona | gratuito; recursos y prácticas autocontenidas | tutor ilimitado, acreditación oficial ni mentoría incluida |
| School Individual | persona | 9,90 €/mes, **por validar** | tutor personal sin límites |
| School Pro/Builders | profesional | 24,90 €/mes, **por validar** | marketplace activo ni ingresos garantizados |
| Taller especializado | persona o pyme | 29–79 € por unidad, **por validar** | créditos oficiales o FUNDAE sin revisión |
| Business Basic | autónomo/pyme | desde 99 €/mes, **por validar** | WhatsApp, agenda y email operativos sin integración E2E |
| Business Pro | pyme | presupuesto basado en canales, operaciones, coste de IA y soporte | acciones sensibles sin autorización |
| Setup empresarial | negocio con datos/procesos | precio por alcance, **por presupuestar** | integraciones ilimitadas |
| Partners | implementador | comisión por venta validada, porcentaje pendiente | comisión sin contrato, cobro o cliente activo |
| Builders | desarrollador | participación en ventas, tarifa y responsabilidad por definir | publicar apps sin revisión de seguridad |
| Patrocinio/alianzas | entidades | contratos y objetivos concretos | subvenciones obtenidas o impacto no medido |

Estas cifras son **hipótesis internas** heredadas del trabajo previo y deben contrastarse con costes, impuestos, soporte, riesgo, condiciones legales y entrevistas a clientes; la web no debe anunciar una oferta inexistente.

**Economía unitaria mínima:**
```text
Ingresos netos por cliente (sin IVA)
− coste de API/modelo/voz y mensajería
− infraestructura y almacenamiento atribuibles
− soporte y atención
− comisión Partner o coste de captación amortizado
− provisión por reembolsos y fallos
= margen de contribución por cliente
```

Registrar coste máximo por organización (hard cap), alertas, ratio de mensajes resueltos, tiempo ahorrado medido y tasa de derivación humana.

## 5. Comercialización y embudo humano

1. **Atracción:** noticias mundiales honestas y breves, con enlaces y notas de rectificación, sin hacer propaganda encubierta.
2. **Aprendizaje:** curso gratuito y retos prácticos, sin registro obligatorio para la primera experiencia.
3. **Comunidad:** invitación voluntaria a proponer una necesidad, facilitar un testimonio consentido o compartir una solución.
4. **Activación:** demo KOWI One o Business con objetivos y datos ficticios; no exigir contacto personal para consultar noticias.
5. **Conversión:** diagnóstico del problema empresarial, demo E2E, propuesta y costes transparentes, onboarding legal.
6. **Retención:** éxito medido del cliente, supervisión humana, corrección de errores y soporte.
7. **Red Partners/Builders:** venta atribuida, implementación supervisada, evaluación de seguridad, comisión después de cobro válido.

**Mensajes de marca:** «Hola Soy Tu IA» informa; «KOWI School» enseña; «KOWI Business» ayuda a implementar; «KOWI IA» es la organización que responde de la calidad de la experiencia.

## 6. Etapas con criterios de salida (sin prometer calendarios)

### P0 — Seguridad y confianza (antes de exposición pública nueva)
- Actualizar dependencias con vulnerabilidades críticas/altas y lograr CI + npm audit sin fallos.
- Revisar PR #92 y probar /news/verificar y /school/verificar en móvil y escritorio.
- Confirmar que no existen conectores editoriales con capacidad de publicación automática.
- Publicar un pie editorial y canal de correcciones.

### P1 — Experiencia educativa y pruebas (MVP)
- 5 microlecciones gratuitas de alfabetización, metodología comunitaria y prueba con usuarios reales consentidos.
- Dossier exportable de evidencias y prueba con titulares verdaderos/falsos usando fuente documentada.
- 5 pruebas de usuarios no relacionadas con el equipo (sin afirmar resultados hasta realizarlas).
- Piloto WhatsApp con número de prueba Meta sin tocar número personal, y validación E2E segregada.

### P2 — Investigación y aprobación editorial
- Ingestión por conectores seguros; comprobación documental contra afirmaciones y republicaciones.
- CMS editorial autenticado, base de evidencias, control de permisos, versiones y aprobación previa a publicación.
- Métricas: proporción de artículos con evidencia primaria, correcciones y tiempo de revisión.

### P3 — Comercialización controlada
- 5 entrevistas a pymes, 2 demostraciones reproducibles, 1 piloto con acuerdo y precio verificable.
- Política de soporte, términos, facturación, tratamiento de datos, coste de IA por cliente y comisión.
- Abrir Partners/Builders **solo** cuando producto, acuerdos y trazabilidad funcionen.

## 7. Indicadores y gobierno

| Área | KPI y origen | Criterio para ampliar |
| --- | --- | --- |
| Información | % afirmaciones con evidencia original, nº rectificaciones, fecha fuente | trazabilidad comprobable por cada noticia |
| Educación | inicio→finalización del reto, comprensión antes/después, satisfacción | mejoras observadas sin inventar certificados |
| Comunidad | problemas documentados, proyectos validados, aportaciones consentidas | consentimiento y caso concreto |
| Business | tiempo/errores antes-después, % resuelto, margen contribución, incidencias | demo y caso E2E verificados |
| Seguridad | incidentes críticos abiertos, controles RLS, auditoría y coste | ningún crítico abierto antes de despliegue |
| Impacto | beneficiarios demostrados y resultados por proyecto | metodología pública |

**Responsables de decisión:** fundador/propietario para prioridades y gasto; editor humano para veracidad; responsable de privacidad para tratamientos de datos; desarrollador/revisor para PR y seguridad; mentor humano para evaluaciones educativas. Los agentes pueden asistir, pero nunca certificar sus propios resultados sin revisión externa.

## 8. Próxima revisión

Consolidar primero P0 y P1. No gastar en una infraestructura de medios o LMS compleja antes de demostrar que el curso, el dossier y las noticias útiles atraen y ayudan a personas reales.

**No incluido en el MVP:** noticias verificadas automáticamente, deepfake detection concluyente, títulos oficiales, publicación autónoma, financiación adjudicada, tienda o marketplace operativo, cobros activados, WhatsApp Business en producción y voz clonada funcional.
