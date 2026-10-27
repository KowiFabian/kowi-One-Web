import {businessConfigSchema, type BusinessConfig} from '@/lib/business-schema';

export type BuilderTemplate = {
  id:string;
  label:string;
  description:string;
  agentName:string;
  companyName:string;
  icon:string;
  prompts:string[];
  config:BusinessConfig;
};
const base:Pick<BusinessConfig,'contact'|'team'|'tone'|'automaticActions'>={
  contact:'',team:'',tone:'Cercano, claro y profesional',
  automaticActions:['answer_faq','qualify'],
};
export const builderTemplates:BuilderTemplate[]=[
  {
    id:'belleza',label:'Peluquería',description:'Atención, servicios y solicitudes de cita',icon:'✂',
    agentName:'KOWI Recepción',companyName:'Aurora Peluquería (DEMO)',
    prompts:['¿Cuánto cuesta un corte?','¿Cuál es vuestro horario?','Quiero reservar un corte.'],
    config:{...base,name:'Aurora Peluquería (DEMO)',sector:'belleza',
      description:'Peluquería de barrio que atiende consultas sobre cortes, color y reservas.',
      hours:'Lunes a viernes, 10:00 a 19:00 (ejemplo).',
      services:[{name:'Corte',price:'18 € (ejemplo)'},{name:'Color',price:'Consultar presupuesto'}],
      faq:[{question:'¿Puedo reservar un corte?',answer:'Podemos recoger tu solicitud; el equipo debe comprobar la disponibilidad y confirmar la cita.'}],
      policies:'No confirmar citas sin consultar disponibilidad real. No inventar precios.',
      escalation:'Trasladar las solicitudes de reserva al equipo de recepción.'},
  },
  {
    id:'taller',label:'Taller',description:'Averías, presupuestos y seguimiento',icon:'⚙',
    agentName:'KOWI Taller',companyName:'Motor Norte (DEMO)',
    prompts:['¿Hacéis cambio de aceite?','¿Cuál es vuestro horario?','Mi coche hace un ruido, ¿qué hago?'],
    config:{...base,name:'Motor Norte (DEMO)',sector:'taller',
      description:'Taller de mantenimiento y diagnóstico general de vehículos.',
      hours:'Lunes a viernes, 09:00 a 18:00 (ejemplo).',
      services:[{name:'Cambio de aceite',price:'Presupuesto tras revisar vehículo'},{name:'Revisión de frenos',price:'Consultar al taller'}],
      faq:[{question:'¿Podéis darme un presupuesto?',answer:'El taller necesita los detalles del vehículo y debe validar el presupuesto antes de confirmarlo.'}],
      policies:'No garantizar reparaciones ni dar instrucciones sobre seguridad mecánica sin revisión profesional.',
      escalation:'Derivar fallos de seguridad y presupuestos definitivos a un técnico cualificado.'},
  },
  {
    id:'inmobiliaria',label:'Inmobiliaria',description:'Interesados, inmuebles y visitas',icon:'⌂',
    agentName:'KOWI Viviendas',companyName:'Vivienda Norte (DEMO)',
    prompts:['¿Puedo visitar un piso?','¿Qué inmuebles tenéis?','¿Cuál es vuestro horario?'],
    config:{...base,name:'Vivienda Norte (DEMO)',sector:'inmobiliaria',
      description:'Asesoría inmobiliaria que organiza consultas de compra, venta y alquiler.',
      hours:'Lunes a viernes, 09:00 a 18:00 (ejemplo).',
      services:[{name:'Información sobre viviendas',price:'Sin importe confirmado'},{name:'Solicitud de visita',price:'Sin importe confirmado'}],
      faq:[{question:'¿Puedo visitar un piso?',answer:'Puedes indicar zona y horario preferidos. Un asesor verificará disponibilidad y confirmará la visita.'}],
      policies:'No inventar listados, características, disponibilidad, precios ni condiciones contractuales.',
      escalation:'Derivar ofertas, disponibilidad y visitas al asesor asignado.'},
  },
  {
    id:'restauracion',label:'Restaurante',description:'Menú, información y solicitudes de mesa',icon:'♜',
    agentName:'KOWI Restaurante',companyName:'Sabor de Barrio (DEMO)',
    prompts:['¿Tenéis opciones vegetarianas?','¿Cuál es vuestro horario?','Quiero reservar una mesa.'],
    config:{...base,name:'Sabor de Barrio (DEMO)',sector:'restauracion',
      description:'Restaurante local con servicio en sala y recogida.',
      hours:'Martes a domingo, 13:00 a 16:00 y 20:00 a 23:00 (ejemplo).',
      services:[{name:'Menú del día',price:'Precio no confirmado'},{name:'Recogida en local',price:'Según pedido'}],
      faq:[{question:'¿Tenéis opciones vegetarianas?',answer:'El equipo debe confirmar los platos y alérgenos disponibles antes de hacer una recomendación.'}],
      policies:'No confirmar mesas, alérgenos ni pedidos sin sistemas y personal verificados.',
      escalation:'Trasladar reservas y consultas de alérgenos al equipo del restaurante.'},
  },
  {
    id:'comercio',label:'Comercio',description:'Catálogo, consultas y atención posventa',icon:'▣',
    agentName:'KOWI Ventas',companyName:'Tienda Local (DEMO)',
    prompts:['¿Qué vendéis?','¿Tenéis devoluciones?','¿Cuál es vuestro horario?'],
    config:{...base,name:'Tienda Local (DEMO)',sector:'comercio',
      description:'Comercio de proximidad con atención al cliente.',
      hours:'Lunes a sábado, 10:00 a 20:00 (ejemplo).',
      services:[{name:'Asesoramiento de compra',price:'Sin coste confirmado'}],
      faq:[{question:'¿Tenéis devoluciones?',answer:'La política de devolución debe confirmarse con la tienda antes de aplicarse.'}],
      policies:'No prometer existencias, descuentos o devoluciones no verificados.',
      escalation:'Derivar pagos, devoluciones y problemas de pedido al responsable del negocio.'},
  },
  {
    id:'profesional',label:'Profesional',description:'Servicios, primeras consultas y seguimiento',icon:'◇',
    agentName:'KOWI Asistente',companyName:'Estudio Profesional (DEMO)',
    prompts:['¿Qué servicios ofrecéis?','¿Cómo puedo solicitar una consulta?','¿Cuál es vuestro horario?'],
    config:{...base,name:'Estudio Profesional (DEMO)',sector:'profesional',
      description:'Profesional independiente que atiende nuevas consultas.',
      hours:'Con cita previa (ejemplo).',
      services:[{name:'Consulta inicial',price:'Presupuesto personalizado'}],
      faq:[{question:'¿Cómo puedo solicitar una consulta?',answer:'Indica el servicio que necesitas; el profesional revisará la solicitud y confirmará los siguientes pasos.'}],
      policies:'No sustituir consejos jurídicos, sanitarios o financieros profesionales.',
      escalation:'Derivar propuestas y decisiones especializadas al profesional.'},
  },
];
export function templateById(id:string){return builderTemplates.find(t=>t.id===id)||builderTemplates[0];}
export function validateBuilderConfig(config:unknown){return businessConfigSchema.safeParse(config);}

function normalized(value:string){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
export function previewBuilderReply(config:BusinessConfig,question:string):string{
  const q=normalized(question.trim());
  if(!q)return 'Escribe una consulta para comprobar la configuración del agente.';
  if(/\b(horario|hora|abri|cerr|cuando)\b/.test(q)){
    return config.hours? 'Según la información proporcionada por el negocio: '+config.hours :
      'Aún no tengo un horario confirmado. '+(config.escalation||'Lo consultaré con el responsable.');
  }
  if(/\b(contacto|telefono|correo|email|direccion)\b/.test(q)){
    return config.contact?'Contacto publicado por el negocio: '+config.contact:
      'No hay un contacto público confirmado. '+(config.escalation||'Te derivaremos al equipo.');
  }
  if(/\b(precio|cuanto|cuesta|coste|costar|valor)\b/.test(q)){
    const priced=config.services.find(s=>normalized(s.name).length>=4&&q.includes(normalized(s.name)));
    if(priced)return priced.price
      ? priced.name+': '+priced.price+'. Confirma cualquier condición con el equipo.'
      : 'No tengo un precio confirmado de '+priced.name+'. '+config.escalation;
    return 'No tengo una tarifa confirmada para esa consulta. '+config.escalation;
  }
  for(const item of config.faq){
    const words=normalized(item.question).split(/[^\p{L}\p{N}]+/u).filter(w=>w.length>=5 && !['puedo','tienen','teneis','vuestra','vuestro','hacer','sobre','quiero'].includes(w));
    if(words.some(w=>q.includes(w)))return item.answer;
  }
  for(const service of config.services){
    const name=normalized(service.name);
    if(name.length>=4 && q.includes(name)){
      return service.price?service.name+': '+service.price+'. Confirma disponibilidad y condiciones con el equipo.':
        'Ofrecemos '+service.name+', pero su precio no está confirmado. '+config.escalation;
    }
  }
  if(/\b(reserva|reservar|cita|visita|mesa|presupuesto)\b/.test(q)){
    return 'Puedo recoger tu solicitud para que el equipo la revise. No puedo confirmar disponibilidad, citas ni precios definitivos. '+(config.escalation||'Un responsable deberá confirmar el siguiente paso.');
  }
  const serviceNames=config.services.map(s=>s.name).join(', ');
  return 'Soy '+config.name+'. '+(serviceNames?'Puedo ayudarte con: '+serviceNames+'. ':'')+
    'Para información no confirmada, consultaré con el equipo. '+(config.escalation||'');
}
