export type SkillLevel='NOT STARTED'|'FOUNDATIONAL'|'OPERATIONAL'|'COMPETENT'|'ADVANCED'|'VERIFIED';
export type SchoolLevel={id:number;slug:string;title:string;outcome:string;unit:{discover:string;learn:string;tryIt:string;build:string;breakIt:string;fix:string;execute:string;explain:string;prove:string;evidence:string;next:string}};
const raw=[
['diagnostico','Diagnóstico y Skill Graph','Mapear lo que ya sabes sin inflar credenciales.','Resolver un microcaso y explicar tu decisión.'],
['competencia-digital','Competencia digital','Trabajar con archivos, navegador, identidad y datos con criterio.','Organizar un proyecto digital y detectar un riesgo de privacidad.'],
['ia-cero','Inteligencia artificial desde cero','Distinguir IA, automatización y modelos generativos.','Clasificar cinco casos y justificar cuándo usar IA.'],
['ia-vida','IA para la vida cotidiana','Usar IA para aprender, comparar y organizar sin delegar decisiones críticas.','Crear un flujo personal con verificación de fuentes.'],
['ia-trabajo','IA para el trabajo','Mejorar una tarea laboral con supervisión humana.','Medir antes/después de un proceso asistido por IA.'],
['prompting','Prompting','Dar objetivo, contexto, restricciones y criterio de calidad.','Diseñar y probar tres versiones de un prompt.'],
['ia-responsable','IA responsable y verificación','Detectar alucinaciones, sesgos, privacidad y límites.','Auditar una respuesta y construir un checklist de verificación.'],
['llm','Fundamentos de LLM','Entender tokens, contexto, inferencia y límites prácticos.','Explicar por qué un modelo puede responder con seguridad aparente y estar equivocado.'],
['context-engineering','Context Engineering','Diseñar contexto útil, mínimo y trazable.','Construir un paquete de contexto con fuentes y reglas.'],
['agents','AI Agents','Diseñar objetivo, herramientas, memoria, límites y aprobaciones.','Especificar un agente con cinco casos de prueba.'],
['api-json-webhooks','APIs, JSON y Webhooks','Intercambiar datos entre sistemas de forma estructurada.','Diseñar una petición JSON y validar una respuesta de API simulada.'],
['mcp-tools','MCP y herramientas','Entender herramientas conectadas, permisos y contratos.','Diseñar un servidor/herramienta conceptual con permisos mínimos.'],
['sql-data','SQL y datos','Consultar y modificar datos con modelos relacionales básicos.','Escribir consultas para clientes, citas y ventas sobre un esquema de práctica.'],
['supabase','Supabase','Combinar Postgres, Auth y RLS de forma segura.','Diseñar una tabla multiusuario y políticas de aislamiento.'],
['git-github','Git y GitHub','Trabajar con ramas, commits, revisión y recuperación.','Resolver un cambio en rama y explicar cómo evitar pisar trabajo ajeno.'],
['web-next','Web, TypeScript y Next.js','Construir una interfaz tipada con rutas y APIs.','Crear una pequeña feature full-stack con validación.'],
['cloud-vercel','Cloud y Vercel','Desplegar, observar y separar preview de producción.','Publicar una preview y verificar build y errores.'],
['cyber-ai','Ciberseguridad de IA','Aplicar secretos, amenazas, validación y defensa en profundidad.','Hacer threat model de una función de IA.'],
['agent-security','Agent Security','Aplicar least privilege, deny-by-default y Human Approval.','Diseñar una matriz de permisos y bloquear una acción sensible.'],
['multi-agent','Multi-Agent Systems','Coordinar agentes con contratos, handoffs y trazabilidad.','Diseñar un flujo multiagente con límites de responsabilidad.'],
['crm-automation','CRM y automatización','Convertir señales comerciales en pipeline y seguimiento.','Modelar lead → oportunidad → próxima acción con aprobación.'],
['ai-economics','AI Economics','Medir coste, valor, latencia y retorno de automatización.','Calcular coste por tarea y punto de equilibrio de un caso.'],
['saas','SaaS y emprendimiento','Convertir problema validado en producto y modelo de ingresos.','Diseñar hipótesis, oferta, métrica y experimento de pago.'],
['sales-ops-leadership','Ventas, operaciones y liderazgo','Conectar tecnología con personas, procesos y resultados.','Resolver un caso de adopción con responsables y métricas.'],
['capstone','Capstone Project','Integrar habilidades en un resultado demostrable.','Construir, probar, documentar y defender un proyecto real seguro.'],
] as const;
export const schoolLevels:SchoolLevel[]=raw.map(([slug,title,outcome,challenge],id)=>({id,slug,title,outcome,unit:{
 discover:`Problema: ${challenge}`,learn:`Conceptos esenciales de ${title} aplicados a un resultado observable.`,tryIt:`Prueba guiada: ${challenge}`,
 build:`Construye un entregable pequeño relacionado con: ${outcome}`,breakIt:'Introduce un dato incompleto, una restricción o un fallo deliberado y observa qué cambia.',
 fix:'Diagnostica la causa, corrige una sola variable y vuelve a probar.',execute:`Obtén un resultado reproducible: ${outcome}`,
 explain:'Explica con tus palabras qué decisión tomaste, qué descartaste y por qué.',prove:`Reto sin guía: ${challenge}`,
 evidence:'Guarda resultado, prueba, explicación y fecha. VERIFIED requiere revisión suficiente de esa evidencia.',next:id===24?'Publica tu portfolio y decide tu siguiente proyecto.':'Continúa cuando puedas explicar y reproducir el resultado.'
}}));
export const skillNames=['Competencia digital','IA','LLM','Prompting','Agentes','Programación','APIs','Datos','SQL','Cloud','Ciberseguridad','Negocio','Operaciones','Liderazgo','Idiomas'] as const;
export const pathFor=(goal:string)=>{const g=goal.toLowerCase();const base=[0,2,5,6];if(/agente|agent/.test(g))base.push(7,8,9,10,11,17,18,19);if(/program|web|api|software/.test(g))base.push(10,12,13,14,15,16);if(/negocio|empresa|ventas|crm/.test(g))base.push(4,9,20,21,22,23);if(/trabajo|empleo|operaciones/.test(g))base.push(4,20,23);base.push(24);return [...new Set(base)].sort((a,b)=>a-b);};
