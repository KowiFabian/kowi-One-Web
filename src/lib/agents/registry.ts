export type KowiAgent = {
  id: string; name: string; role: string; access: 'core'|'pro'; risk: 'low'|'medium'|'high';
  capabilities: string[]; requiresApproval: string[];
};

export const kowiAgents: KowiAgent[] = [
  {id:'orchestrator',name:'KOWI Orchestrator',role:'Comprende la intención y coordina agentes, herramientas y personas.',access:'core',risk:'medium',capabilities:['routing','planning','handoff'],requiresApproval:['external_action','sensitive_change']},
  {id:'business',name:'Business Agent',role:'Atención, cualificación, ventas y seguimiento comercial.',access:'pro',risk:'medium',capabilities:['customer_service','sales','lead_qualification'],requiresApproval:['external_message','booking','crm_write']},
  {id:'crm',name:'CRM Agent',role:'Organiza oportunidades, pipeline y próximas acciones.',access:'pro',risk:'medium',capabilities:['lead_management','pipeline','follow_up'],requiresApproval:['crm_write','external_message']},
  {id:'operations',name:'Operations Agent',role:'Coordina procesos, tareas, incidencias y mejora operativa.',access:'pro',risk:'medium',capabilities:['workflow','tasks','process_improvement'],requiresApproval:['system_write','external_action']},
  {id:'finance',name:'Finance Agent',role:'Analiza métricas, costes, caja y escenarios sin ejecutar movimientos.',access:'pro',risk:'high',capabilities:['analysis','forecasting','reporting'],requiresApproval:['payment','financial_commitment','external_action']},
  {id:'marketing',name:'Marketing Agent',role:'Diseña campañas, contenido, segmentación y experimentos medibles.',access:'pro',risk:'medium',capabilities:['campaigns','content','analytics'],requiresApproval:['publish','ad_spend','external_message']},
  {id:'projects',name:'Projects Agent',role:'Convierte ideas en objetivos, fases, tareas y evidencia.',access:'core',risk:'low',capabilities:['planning','tasks','progress'],requiresApproval:['external_action']},
  {id:'education',name:'School Agent',role:'Guía aprendizaje aplicado y rutas de capacitación.',access:'core',risk:'low',capabilities:['learning','assessment','guidance'],requiresApproval:[]},
  {id:'security',name:'Trust & Security Agent',role:'Evalúa riesgo, permisos, anomalías y cumplimiento antes de actuar.',access:'pro',risk:'high',capabilities:['risk_gate','permissions','audit'],requiresApproval:['permission_change','identity_change','deletion']},
  {id:'identity',name:'Identity Agent',role:'Gestiona consentimiento, credenciales e identidad/voz verificable.',access:'pro',risk:'high',capabilities:['consent','credentials','voice_identity'],requiresApproval:['identity_change','voice_use','revocation']},
];

export const agentById = (id:string) => kowiAgents.find(a=>a.id===id);
