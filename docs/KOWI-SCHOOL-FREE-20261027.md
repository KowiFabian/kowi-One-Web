# School Free — incremento verificable, no lanzamiento integral

Base: `5e772037586bd1ef73329849161731112e258240`. Rama: `feat/school-free-20261027`.

## Integración selectiva

PR #92, #95 y #100 ya fusionadas. Se conserva `/school`, su guía local y `/school/verificar`. PR #26 abierta y con conflictos (head `004518f`). Se aprovechan su secuencia pedagógica, vocabulario y distinción entre práctica y evidencia; no se fusiona automáticamente.

Revisión de #26: sus unidades se generan con frases de plantilla; el diagnóstico usa número de palabras para asignar niveles. Ambos se sustituyen en el nuevo recorrido por cinco lecciones originales y preguntas con criterios explícitos. La migración concede UPDATE general sobre `school_profiles` (incluido plan), `student_skills` (incluido VERIFIED) y `evidence` (incluido verification_status): ownership por sí solo no protege esos campos. También hay políticas de lectura de recursos/módulos que no comprueban publicación del curso padre. No aplicar esa migración sin corregir privilegios y probar casos negativos.

## Correspondencia curricular

| Aula Free | PR #26 | Evidencia |
| --- | --- | --- |
| ia-cero | 2 IA desde cero; 3 vida cotidiana | tarea reversible y dato a verificar |
| prompting | 5 Prompting | instrucción con contexto y límites |
| ia-responsable | 6 IA responsable | afirmación, fuente y límite |
| privacidad | 1 competencia digital; 17/18 seguridad (introducción) | protocolo de datos ficticios |
| capstone-free | 24 Capstone (solo introducción) | proyecto y tres pruebas |

Diagnóstico corresponde a 0, pero no concede dominio. Las restantes unidades de #26 siguen como propuesta, no cursos terminados. La especificación histórica completa de 18 niveles no se encontró en los documentos inspeccionados: no inventar una correspondencia numérica. Esta tabla preserva IDs y habilidades de la propuesta de 25 niveles sin afirmar equivalencia con un currículo de 18 no recuperado.

## Datos y límites de publicación

`/school/aprender` no llama a APIs ni envía ejercicios. Memoria temporal por defecto; guardado local opcional, sin casilla premarcada. Desactivar guardado elimina la copia de esta aula en ese navegador. Exportación JSON privada, editable y no certificada. No se toca el almacenamiento de la guía anterior. No hay sincronización, tutor activo, matrícula, comunidad pública, evaluación humana ni pagos. No confundir respuestas correctas de opción múltiple con competencia formal.

Supabase remoto consultado: no hay tablas con nombres school/learning/lesson/education en public y no figura la migración School AI. No se modificó producción. Falta validar un modelo revisado en entorno aislado, flujo autenticado con dos usuarios y recuperación tras logout. Variables Vercel inspeccionadas solo por nombre/entorno: no se observó OPENAI_API_KEY en el listado de variables del proyecto; esto no demuestra ausencia en otros orígenes. Ningún secreto leído o cambiado.

Contenido separado en `src/lib/school/free-course.ts`, versión explícita, fuentes enlazadas sin copiar material externo. Edición por PR y revisión editorial; CMS con borradores/publicación y gestión sin código aún pendiente. No hay licencia pública de reutilización de terceros implícita.

## Privacidad y lanzamiento

La página existente `/privacidad` declara pendientes responsable, bases jurídicas, conservación, transferencias y derechos completos. Por ello no habilitar datos educativos remotos, comunidad o tutor para público hasta completar revisión del titular. La revisión de código no equivale a dictamen jurídico.

Fuentes oficiales consultadas 27-10-2026:
- LOPDGDD, art. 7: https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673
- AEPD menores: https://www.aepd.es/preguntas-frecuentes/10-menores-y-educacion/FAQ-1002-se-puede-recabar-y-tratar-datos-personales-de-menores
- LSSI-CE: https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758
- Alfabetización IA: https://digital-strategy.ec.europa.eu/en/faqs/ai-literacy-questions-answers
- WCAG 2.2: https://www.w3.org/TR/WCAG22/

Cuando la base sea consentimiento y el alumno tenga menos de 14 años, se requiere consentimiento de padre/madre/tutor conforme a las condiciones legales aplicables; una casilla de edad no lo resuelve. Información de privacidad, contrato y consentimiento opcional son cosas distintas. No inferir cumplimiento integral de RGPD, AI Act, accesibilidad, consumo o propiedad intelectual: revisión y adecuación completas pendientes. EUR-Lex bloqueó lectura automática en esta revisión; no afirmar comprobación completa del texto vigente ni de plazos de todas las obligaciones.

## Prueba reproducible

School → Comenzar a aprender → Diagnóstico → tres respuestas → ruta recomendada → Aula → escribir práctica ficticia → revisar rúbrica → responder cuestionario → Evaluar y registrar → Progreso → exportar. Activar guardado local y recargar para comprobar recuperación; desactivarlo y recargar para comprobar retirada. Pruebas Playwright cubren este recorrido y almacenamiento bloqueado, escritorio/móvil. No prueban proveedores externos ni RLS remoto. Revisión con lector de pantalla y auditoría WCAG completa pendientes.

## Go/no-go

Preview del aula local solamente. No declarar School integral terminada. Bloquean lanzamiento integral: esquema/RLS corregido y probado, identidad/transparencia legal del titular, tutor con cuota y prueba real, currículo restante, CMS y comunidad moderada. Planes de pago sin activar. Próximo paso: validar el aula Free y preparar persistencia segura en entorno aislado antes de matricular alumnos.
