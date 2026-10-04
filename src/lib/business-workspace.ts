import {businessConfigSchema} from '@/lib/business-schema';
export type WorkspaceOrganization={id:string;name:string};
export function chooseOrganization(rows:WorkspaceOrganization[],requested:string|null,preferred:string|null){
 return rows.find(row=>row.id===requested)?.id||rows.find(row=>row.id===preferred)?.id||rows[0]?.id||'';
}
export function businessUrl(path:string,organizationId:string,entity?:string){
 const query=new URLSearchParams({organization_id:organizationId});
 if(entity)query.set('entity',entity);
 return path+'?'+query.toString();
}
export function agentWorkspaceState(agent:{status:string;config:unknown;last_verified_at:string|null},now=new Date()){
 const config=agent.config&&typeof agent.config==='object'?agent.config as Record<string,unknown>:{};
 const synthetic=config.synthetic===true||config.synthetic==='true';
 const configured=!synthetic&&businessConfigSchema.safeParse(config).success;
 const checked=agent.last_verified_at?Date.parse(agent.last_verified_at):NaN;
 const verified=configured&&Number.isFinite(checked)&&checked<=now.getTime()&&checked>=now.getTime()-7*86400000;
 return {synthetic,configured,verified,active:verified&&agent.status==='active'};
}
export const businessTools=[
 {title:'Contactos',description:'Nombre, correo, teléfono y consentimiento.',path:'/business/crm-org',entity:'contacts'},
 {title:'Leads',description:'Consultas, origen y cualificación.',path:'/business/crm-org',entity:'leads'},
 {title:'Oportunidades',description:'Pipeline y próximos pasos comerciales.',path:'/business/crm-org',entity:'opportunities'},
 {title:'Agenda',description:'Citas propuestas y confirmaciones locales.',path:'/business/crm-org',entity:'appointments'},
 {title:'Tareas',description:'Trabajo pendiente y seguimiento.',path:'/business/crm-org',entity:'tasks'},
 {title:'Conversación IA',description:'Conversación privada, historial y captura en CRM.',path:'/business/agent-chat'},
 {title:'Agentes',description:'Información confirmada, configuración y verificación.',path:'/business/agents'},
 {title:'Director',description:'Órdenes, aval del propietario y evidencias.',path:'/business/director'},
 {title:'Intelligence',description:'Datos observados y recomendaciones.',path:'/business/intelligence'},
 {title:'Evidencias',description:'Trabajos, resultados técnicos y límites.',path:'/business/jobs'},
 {title:'Pipeline',description:'Etapas comerciales de tu empresa.',path:'/business/pipeline'}
] as const;
