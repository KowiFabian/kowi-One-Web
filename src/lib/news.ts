export const newsSources=[
 {repo:'openai/openai-python',label:'OpenAI · SDK Python',topic:'Interfaces para aplicaciones de IA'},
 {repo:'NVIDIA/OpenShell',label:'NVIDIA · OpenShell',topic:'Aislamiento y políticas para agentes'},
 {repo:'supabase/supabase-js',label:'Supabase · JavaScript',topic:'Datos, autenticación e integración'}
] as const;
export type NewsRelease={source:string;topic:string;title:string;version:string;publishedAt:string;url:string};
export function verifiedReleases(value:unknown,source:typeof newsSources[number],now=new Date()):NewsRelease[]{
 if(!Array.isArray(value))return [];
 const cutoff=now.getTime()-90*86400000;
 return value.flatMap(item=>{
  if(!item||typeof item!=='object'||item.draft!==false||item.prerelease!==false||typeof item.tag_name!=='string'||!/^v?\d+\.\d+/.test(item.tag_name)||typeof item.html_url!=='string'||typeof item.published_at!=='string')return [];
  const time=Date.parse(item.published_at);
  if(!Number.isFinite(time)||time<cutoff||time>now.getTime())return [];
  try{const url=new URL(item.html_url);if(url.origin!=='https://github.com'||url.username||url.password||!url.pathname.startsWith('/'+source.repo+'/releases/tag/'))return [];}catch{return [];}
  return [{source:source.label,topic:source.topic,title:typeof item.name==='string'&&item.name?item.name.slice(0,160):item.tag_name.slice(0,160),version:item.tag_name.slice(0,100),publishedAt:new Date(time).toISOString(),url:item.html_url}];
 }).sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt)).slice(0,3);
}
export const newsBriefings=[
 {id:'voice-and-agents',title:'Voz y agentes: más posibilidades, más responsabilidad sobre la identidad',publishedAt:'2026-10-02',source:'OpenAI · SDK Python 3.24.0',url:'https://github.com/openai/openai-python/releases/tag/v3.24.0',
 observed:'El registro oficial del SDK 3.24.0 anuncia interfaces de creación de voz personalizada y eventos de sesiones de agentes.',
 interpretation:'Estas interfaces permiten preparar nuevas experiencias de comunicación. Su presencia en un SDK no confirma acceso para todas las cuentas ni una integración activa en KOWI.',
 recommendation:'Antes de probar una voz, verificar disponibilidad, autorización de la persona, finalidad, coste y una forma clara de identificar que interviene IA.'},
 {id:'agent-isolation',title:'El siguiente paso de los agentes necesita límites verificables',publishedAt:'2026-09-28',source:'NVIDIA · OpenShell 0.1.2',url:'https://github.com/NVIDIA/OpenShell/releases/tag/v0.1.2',
 observed:'OpenShell publicó la versión 0.1.2. Su registro incluye cambios en red del supervisor, documentación de políticas y limpieza de procesos; el proyecto describe aislamiento y permisos para agentes.',
 interpretation:'Dar herramientas a un agente exige controlar qué archivos, procesos y destinos puede utilizar. La capacidad de actuar aumenta el valor de comprobar los límites.',
 recommendation:'Evaluar compatibilidad en un entorno aislado, usar acceso denegado por defecto y conservar evidencias. Esta noticia no afirma que KOWI haya desplegado OpenShell.'},
 {id:'session-continuity',title:'Una experiencia agradable también depende de sesiones fiables',publishedAt:'2026-09-23',source:'Supabase · JavaScript 2.117.1',url:'https://github.com/supabase/supabase-js/releases/tag/v2.117.1',
 observed:'La versión 2.117.1 registra una corrección de autenticación para recuperar la sesión almacenada cuando otra pestaña completa antes su renovación.',
 interpretation:'Los detalles de sesión influyen en la continuidad entre herramientas, pestañas y dispositivos. Un anuncio de corrección necesita pruebas en cada aplicación.',
 recommendation:'Comprobar sesión expirada, varias pestañas y aislamiento empresarial antes de actualizar una dependencia en producción.'}
] as const;
