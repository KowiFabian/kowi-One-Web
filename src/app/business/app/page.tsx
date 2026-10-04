import type {Metadata} from 'next';
import AuthGate from '@/components/AuthGate';
export const metadata:Metadata={title:'KOWI Business · Gestiona tu negocio',description:'Tu empresa, contactos, oportunidades, agenda, tareas y agente de IA en una web app instalable.',manifest:'/business/manifest.webmanifest',appleWebApp:{capable:true,title:'KOWI Business',statusBarStyle:'default'}};
export default function BusinessApp(){return <AuthGate mode="workspace"/>;}
