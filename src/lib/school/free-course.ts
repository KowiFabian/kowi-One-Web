/** Original KOWI teaching material. Resources are links, not copied course content. */
export const courseVersion = 'school-free-2026-10-27.1';
export type Lesson = { id:string; title:string; skill:string; prerequisite:string|null; objective:string; explanation:string[]; example:string; practice:string; rubric:string[]; question:string; options:string[]; correct:number; feedback:string; source:{title:string;url:string} };
export const lessons:Lesson[] = [
 {id:'ia-cero',title:'1. Comprende qué hace una IA',skill:'Distinguir generación y comprobación',prerequisite:null,
 objective:'Reconocer cuándo una respuesta necesita comprobación humana.',
 explanation:['Un modelo generativo produce texto a partir de patrones aprendidos y del contexto que recibe. Puede ayudarte a redactar, clasificar o explorar ideas, pero una respuesta fluida no demuestra que sea cierta.','Una automatización sigue un proceso definido; una IA generativa puede proponer contenido nuevo. Un agente combina un modelo con herramientas y decisiones: por eso necesita límites y supervisión.','Empieza con tareas reversibles y datos ficticios. Para decisiones de salud, dinero o derechos, busca fuentes primarias y la revisión de una persona cualificada.'],
 example:'Caso ficticio: pides organizar una semana de estudio. La IA propone bloques útiles, pero inventa que tienes una reunión el martes. Conservas la estructura y corriges la información con tu agenda.',
 practice:'Diseña una tarea cotidiana ficticia. Anota qué pedirías a la IA, qué dato comprobarías y qué decisión conservarías tú.',
 rubric:['La tarea es reversible.','Identifico un dato que debo verificar.','Asigno la decisión final a una persona.'],
 question:'Una IA responde con mucha seguridad sobre el horario de un centro. ¿Qué demuestra?',options:['Que consultó el horario oficial.','Solo que generó una respuesta convincente; debo comprobar el horario.','Que el horario nunca cambia.'],correct:1,
 feedback:'El tono seguro no acredita una consulta. Comprueba la web oficial o el centro antes de actuar.',source:{title:'UNESCO: inteligencia artificial en educación',url:'https://www.unesco.org/es/digital-education/artificial-intelligence'}},
 {id:'prompting',title:'2. Pide algo que puedas evaluar',skill:'Escribir instrucciones claras',prerequisite:'ia-cero',
 objective:'Construir un prompt con objetivo, contexto, límites y formato.',
 explanation:['Un prompt es la instrucción que das al modelo. “Ayúdame” deja muchas decisiones sin especificar. Explica qué necesitas y para quién; añade solo el contexto necesario.','Define límites: tiempo, extensión, datos permitidos y qué debe hacer si falta información. Pedir que reconozca lo desconocido ayuda, pero no garantiza exactitud.','Define cómo revisarás el resultado antes de enviarlo. Cambia una instrucción cada vez y compara el resultado para aprender qué mejora.'],
 example:'“Crea un plan de estudio de IA para una persona principiante, 20 minutos al día durante cinco días. Usa lenguaje sencillo. No inventes cursos ni precios. Devuelve una tabla con actividad y forma de comprobar lo aprendido.”',
 practice:'Reescribe “haz una respuesta al cliente” para una peluquería ficticia. Incluye objetivo, contexto, límites y formato. No uses teléfonos ni nombres reales.',
 rubric:['El objetivo y el público están claros.','Incluyo solo datos ficticios necesarios.','Defino límites y un criterio de revisión.'],question:'El negocio no ha confirmado el precio de un corte. ¿Qué instrucción es mejor?',options:['Inventa un precio competitivo.','Usa el precio de otra empresa.','Indica que el precio está pendiente y deriva al responsable.'],correct:2,
 feedback:'No rellenes información comercial desconocida con suposiciones. La derivación conserva la confianza del cliente.',source:{title:'OpenAI: guía de instrucciones',url:'https://developers.openai.com/api/docs/guides/prompt-engineering'}},
 {id:'ia-responsable',title:'3. Contrasta antes de compartir',skill:'Verificar fuentes y límites',prerequisite:'prompting',
 objective:'Separar afirmación, evidencia y conclusión provisional.',
 explanation:['Divide una respuesta en afirmaciones concretas. “Esta herramienta es la mejor” no es verificable sin un criterio; “tiene exportación CSV” sí se puede contrastar en documentación o una prueba.','Busca el origen: documento, autor y fecha. Varias webs que copian la misma noticia no son fuentes independientes. Un enlace puede existir y aun así no respaldar la afirmación.','Registra qué has comprobado, qué contradicciones encontraste y qué falta. Si no hay evidencia suficiente, di “no confirmado” y evita difundir la afirmación como un hecho.'],
 example:'Caso ficticio: tres blogs dicen que una aplicación es gratuita. Todos copian una nota antigua. La página actual del proveedor muestra un límite: tu conclusión debe incluir ese límite y la fecha de revisión.',
 practice:'Inventa una afirmación sobre una herramienta imaginaria. Escribe qué fuente primaria buscarías, qué prueba harías y cuándo decidirías no compartirla.',rubric:['Separo una afirmación comprobable.','Identifico fuente, fecha y contraste.','Expreso qué sigue sin confirmar.'],
 question:'Tres artículos repiten una única nota de prensa. ¿Cuántos orígenes independientes has encontrado?',options:['Uno.','Tres.','No hacen falta fuentes si lo dice la IA.'],correct:0,
 feedback:'Son tres publicaciones, pero un único origen. Busca evidencia independiente y lee el documento completo.',source:{title:'UNESCO: alfabetización mediática e informacional',url:'https://www.unesco.org/en/media-information-literacy'}},
 {id:'privacidad',title:'4. Protege datos y decisiones',skill:'Minimización y aprobación humana',prerequisite:'ia-responsable',
 objective:'Diseñar una práctica sin datos personales innecesarios ni acciones externas.',
 explanation:['Antes de pegar información, pregúntate si necesitas cada dato y si tienes autorización para utilizarlo. Sustituir un nombre no siempre anonimiza: un teléfono, una fecha o una combinación de detalles pueden identificar a alguien.','No introduzcas contraseñas, documentos de identidad, historias clínicas ni conversaciones reales de clientes en una práctica. Usa ejemplos inventados y revisa las condiciones del servicio.','Distingue preparar un borrador de enviarlo. Enviar mensajes, reservar, pagar o modificar registros necesita permisos y controles. Un modelo no puede concederse autorización a sí mismo.'],
 example:'Una peluquería ficticia quiere practicar respuestas a citas. Usamos “Cliente de prueba”, un horario inventado y ningún contacto. El asistente prepara una respuesta; una persona revisa antes de cualquier envío real.',
 practice:'Escribe un pequeño protocolo: datos permitidos, datos prohibidos, acción que puede preparar la IA y quién debe aprobarla. Usa solo situaciones ficticias.',rubric:['No incluyo datos personales reales.','Defino una acción que requiere aprobación.','Distingo borrador de ejecución.'],
 question:'Para practicar un resumen de reclamaciones, ¿qué conjunto de datos eliges?',options:['Conversaciones reales con nombres borrados pero teléfonos intactos.','Casos totalmente ficticios sin datos de clientes.','La lista completa de clientes.'],correct:1,
 feedback:'Los casos ficticios permiten practicar sin exponer a clientes. Quitar solo el nombre no elimina otros identificadores.',source:{title:'AEPD: principios de protección de datos',url:'https://www.aepd.es/derechos-y-deberes/cumple-tus-deberes/principios'}},
 {id:'capstone-free',title:'5. Demuestra una mejora pequeña',skill:'Diseñar y probar un proyecto supervisado',prerequisite:'privacidad',
 objective:'Crear una ficha de proyecto con pruebas y criterios de aceptación.',
 explanation:['Elige un problema pequeño, por ejemplo responder preguntas frecuentes de un negocio ficticio. Describe a quién ayuda y cómo se hace hoy; no prometas ahorro que no has medido.','Construye una ficha con objetivo, información autorizada, límites, responsable y pruebas. Incluye un caso normal, uno con datos que faltan y otro que deba rechazar o derivar.','Compara resultados con criterios definidos antes de probar. Guarda fallos y correcciones. Un ejercicio autoevaluado es evidencia de práctica, no una certificación ni una evaluación humana.'],
 example:'Proyecto: asistente para un salón ficticio. Caso normal: preguntar horario. Caso desconocido: pedir un precio no facilitado. Caso sensible: solicitar datos de otro cliente. Aceptación: informa solo lo confirmado y deriva o rechaza los otros casos.',
 practice:'Crea tu ficha de proyecto. Incluye problema, prompt, tres pruebas con resultado esperado, límite de privacidad y una mejora que comprobarías. No ejecutes envíos ni reservas reales.',rubric:['Defino un problema y una métrica observable.','Incluyo tres pruebas y el resultado esperado.','Registro límites y revisión humana antes de ejecutar.'],
 question:'Tu asistente responde bien un caso, pero inventa un precio en otro. ¿Qué corresponde?',options:['Declarar el proyecto terminado.','Ocultar el caso que falla.','Registrar el fallo, corregir y repetir todas las pruebas relevantes.'],correct:2,
 feedback:'Un caso correcto no demuestra fiabilidad. Conserva la evidencia del fallo y comprueba que la corrección no rompe otros casos.',source:{title:'NIST: marco de gestión del riesgo de IA',url:'https://www.nist.gov/itl/ai-risk-management-framework'}}
];
export const diagnostic = [
 {question:'Una respuesta incluye una fuente que no has leído. ¿Qué haces?',options:['La comparto como confirmada.','Abro la fuente y compruebo que respalda la afirmación.'],correct:1,lesson:'ia-responsable'},
 {question:'Necesitas practicar respuestas a clientes. ¿Qué datos usas?',options:['Casos ficticios.','Exportación del CRM real.'],correct:0,lesson:'privacidad'},
 {question:'¿Qué encargo permite evaluar mejor una respuesta?',options:['Haz algo bueno.','Propón tres tareas para 20 minutos, sin inventar información.'],correct:1,lesson:'prompting'}
];
export function recommend(answers:number[]):string[] {
 const review=diagnostic.filter((q,i)=>answers[i]!==q.correct).map(q=>q.lesson);
 return review.length ? lessons.map(l=>l.id) : ['capstone-free'];
}
export function grade(id:string,answer:number){const lesson=lessons.find(l=>l.id===id);return lesson&&Number.isInteger(answer)&&answer>=0&&answer<lesson.options.length?{correct:answer===lesson.correct,feedback:lesson.feedback}:null;}
export type RecordEntry={answer:number;practice:string;checks:boolean[];date:string};
export function isComplete(id:string,entry:RecordEntry|undefined):boolean{return !!entry&&grade(id,entry.answer)?.correct===true&&entry.practice.trim().length>=40&&entry.checks.length===3&&entry.checks.every(x=>x===true);}
export function readProgress(raw:string|null):Record<string,RecordEntry>{
 try{const parsed=JSON.parse(raw||'{}');if(parsed.version!==courseVersion||!parsed.entries||typeof parsed.entries!=='object')return {};
 return Object.fromEntries(lessons.flatMap(l=>{const e=parsed.entries[l.id];return e&&typeof e.practice==='string'&&e.practice.length<=4000&&Number.isInteger(e.answer)&&Array.isArray(e.checks)&&e.checks.length===3&&e.checks.every((v:unknown)=>typeof v==='boolean')&&typeof e.date==='string'&&Number.isFinite(Date.parse(e.date))?[[l.id,e]]:[];}));}catch{return {};}
}
