/** Educational scenarios are fictional, and are never presented as real news. */
export type LiteracyAnswer = 'a'|'b'|'c';
export type LiteracyQuestion = {
 id:string; title:string; scenario:string; options:{id:LiteracyAnswer;label:string}[];
 correct:LiteracyAnswer; explanation:string; practice:string;
};
export const literacyQuestions:LiteracyQuestion[]=[
 {id:'source',title:'Busca el origen',scenario:'Ejemplo ficticio: una imagen viral asegura que se ha descubierto una cura definitiva, pero no indica quién realizó el estudio.',
  options:[{id:'a',label:'Compartirla, porque es una buena noticia.'},{id:'b',label:'Buscar el estudio original, autores y fecha.'},{id:'c',label:'Pedir a una IA que confirme sin consultar documentos.'}],
  correct:'b',explanation:'Una afirmación científica requiere evidencia primaria, fecha, metodología y evaluación independiente. Una captura no lo demuestra.',practice:'Identifica el documento original y qué hecho concreto puede respaldar.'},
 {id:'independence',title:'No confundas repeticiones con contraste',scenario:'Ejemplo ficticio: tres webs publican el mismo texto sobre una empresa; las tres citan una única nota de prensa.',
  options:[{id:'a',label:'Hay tres confirmaciones independientes.'},{id:'b',label:'La noticia está verificada porque la firman tres webs.'},{id:'c',label:'Hay una sola fuente de origen: debemos buscar contraste independiente.'}],
  correct:'c',explanation:'Tres republicaciones pueden depender de un único anuncio. La independencia se investiga, no se cuenta por número de enlaces.',practice:'Busca una investigación, documento o testimonio original ajeno al comunicado.'},
 {id:'announcements',title:'Distingue una promesa de un resultado',scenario:'Ejemplo ficticio: una startup anuncia que su robot podrá realizar 100 tareas dentro de dos años.',
  options:[{id:'a',label:'Presentarlo como un proyecto anunciado, no como capacidad demostrada.'},{id:'b',label:'Decir que ya realiza 100 tareas.'},{id:'c',label:'Omitir la fecha y afirmar que la revolución ha llegado.'}],
  correct:'a',explanation:'Los planes futuros no equivalen a pruebas independientes del funcionamiento presente.',practice:'Separa en dos frases qué anunció la empresa y qué está probado hoy.'},
 {id:'media',title:'Verifica imágenes, vídeos y testimonios',scenario:'Ejemplo ficticio: recibes un audio con una voz muy convincente que atribuye una declaración a una persona.',
  options:[{id:'a',label:'Confirmar su identidad por el parecido de la voz.'},{id:'b',label:'Localizar el audio original, verificar contexto y buscar confirmación directa.'},{id:'c',label:'Compartirlo si contiene una fecha visible.'}],
  correct:'b',explanation:'Una voz verosímil puede estar sintetizada o editada. Sin procedencia y contexto no se debe atribuir la declaración.',practice:'Comprueba origen, fecha, versión completa y confirmación sin difundir datos privados.'},
 {id:'publication',title:'Decide responsablemente',scenario:'Ejemplo ficticio: tienes una fuente primaria y una entrevista independiente, pero aún no has leído los documentos completos.',
  options:[{id:'a',label:'Publicarlo como completamente confirmado.'},{id:'b',label:'Decir que una IA ya lo ha verificado.'},{id:'c',label:'Revisar la evidencia, contradicciones y autorizar humanamente el texto final.'}],
  correct:'c',explanation:'Los enlaces y las etiquetas no sustituyen la lectura crítica. El responsable editorial debe validar cada afirmación.',practice:'Prepara un dossier de evidencias y anota qué sigue sin verificarse.'}
];
export function checkLiteracyAnswer(id:string,answer:LiteracyAnswer):{correct:boolean;explanation:string}|null{
 const question=literacyQuestions.find(q=>q.id===id);
 return question?{correct:question.correct===answer,explanation:question.explanation}:null;
}
