export type KowiAgent = {
  id: string; name: string; role: string; access: 'core'|'pro'; risk: 'low'|'medium'|'high';
  capabilities: string[]; requiresApproval: string[]; availability?: 'proposed';
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
  {id:'foundation-infrastructure',name:'Foundation Infrastructure Agent',role:'Prepara escenarios de inversión, fases, hitos y evidencias para proyectos educativos y sanitarios. Solo propone; no contrata, invierte ni opera.',access:'pro',risk:'high',availability:'proposed',capabilities:['needs_assessment','scenario_planning','milestone_planning','evidence_review'],requiresApproval:['investment','contract','construction','operation','public_transfer','external_message']},
  {id:'foundation-formation',name:'Foundation Formation Agent',role:'Organiza requisitos de constitución, consulta fuentes oficiales sobre ayudas y prepara expedientes y métricas para revisión humana. No presenta solicitudes ni capta fondos.',access:'pro',risk:'high',availability:'proposed',capabilities:['official_source_monitoring','formation_checklist','grant_screening','community_consensus_record','impact_reporting'],requiresApproval:['legal_filing','external_message','grant_application','fundraising','financial_commitment','permission_change']},
  {id:'security',name:'Trust & Security Agent',role:'Evalúa riesgo, permisos, anomalías y cumplimiento antes de actuar.',access:'pro',risk:'high',capabilities:['risk_gate','permissions','audit'],requiresApproval:['permission_change','identity_change','deletion']},
  {id:'identity',name:'Identity Agent',role:'Gestiona consentimiento, credenciales e identidad/voz verificable.',access:'pro',risk:'high',capabilities:['consent','credentials','voice_identity'],requiresApproval:['identity_change','voice_use','revocation']},
];

export const agentById = (id:string) => kowiAgents.find(a=>a.id===id);
