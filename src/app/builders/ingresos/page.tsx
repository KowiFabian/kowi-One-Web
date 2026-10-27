import type {Metadata} from 'next';
import BuildersEconomics from '@/components/BuildersEconomics';
export const metadata:Metadata={
  title:'KOWI Builders · Cómo funciona y modelo de ingresos',
  description:'Modelo comercial ilustrativo para KOWI Business, Partners y Builders, con calculadora transparente de suscripciones, comisiones y costes.',
};
export default function BuilderIncomePage(){return <BuildersEconomics/>;}
