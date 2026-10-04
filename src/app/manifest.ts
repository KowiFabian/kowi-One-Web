import type {MetadataRoute} from 'next';
export default function manifest():MetadataRoute.Manifest{return {
 id:'/app',name:'KOWI · Human-First AI',short_name:'KOWI',description:'Tu espacio para conversación, dirección, contactos, agenda y ejecución controlada.',
 start_url:'/app',scope:'/',display:'standalone',background_color:'#071612',theme_color:'#071612',lang:'es',
 icons:[{src:'/app-icon?size=192',sizes:'192x192',type:'image/png',purpose:'any'},{src:'/app-icon?size=512',sizes:'512x512',type:'image/png',purpose:'any'}],
 shortcuts:[{name:'KOWI Director',url:'/business/director'},{name:'Conversación empresarial',url:'/business/agent-chat'},{name:'Contactos y agenda',url:'/business/crm-org'}]
};}
