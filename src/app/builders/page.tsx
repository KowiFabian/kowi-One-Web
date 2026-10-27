import type {Metadata} from 'next';
import BuildersStudio from '@/components/BuildersStudio';
export const metadata:Metadata={
  title:'KOWI Builders · Constructor de agentes IA',
  description:'Elige una plantilla, configura servicios y preguntas frecuentes, prueba respuestas y registra un borrador de agente supervisado en KOWI Business.',
};
export default function Page(){return <BuildersStudio/>;}
