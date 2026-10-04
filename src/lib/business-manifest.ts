export const businessManifest={
 id:'/business/app',name:'KOWI Business · Tu negocio, tu control',short_name:'KOWI Business',
 description:'Gestiona tu empresa, contactos, oportunidades, agenda, tareas y agente con control humano.',
 start_url:'/business/app',scope:'/',display:'standalone',lang:'es',background_color:'#071612',theme_color:'#071612',
 icons:[{src:'/app-icon?size=192',sizes:'192x192',type:'image/png',purpose:'any'},{src:'/app-icon?size=512',sizes:'512x512',type:'image/png',purpose:'any'}],
 shortcuts:[{name:'Mi negocio',url:'/business/app'},{name:'Contactos y agenda',url:'/business/crm-org'},{name:'Conversación IA',url:'/business/agent-chat'}]
};
