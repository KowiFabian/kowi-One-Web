export type PricingRegion = {
  id: string;
  label: string;
  countries: string[];
  monthly: string;
  annual: string;
  currency: string;
  positioning: string;
};

export const pricingRegions: PricingRegion[] = [
  { id:'eu-west', label:'España y Europa Occidental', countries:['ES','FR','DE','IT','NL','BE','PT','IE','AT','FI','SE','DK'], monthly:'99', annual:'990', currency:'EUR', positioning:'Precio de referencia KOWI Business Basic.' },
  { id:'uk', label:'Reino Unido', countries:['GB'], monthly:'89', annual:'890', currency:'GBP', positioning:'Precio local competitivo frente a software B2B omnicanal.' },
  { id:'north-america', label:'Estados Unidos', countries:['US'], monthly:'109', annual:'1090', currency:'USD', positioning:'Mayor capacidad de pago y costes comerciales superiores.' },
  { id:'canada', label:'Canadá', countries:['CA'], monthly:'149', annual:'1490', currency:'CAD', positioning:'Equivalente regional aproximado.' },
  { id:'latam', label:'Latinoamérica', countries:['MX','CO','CL','PE','AR','EC','UY','CR','PA','DO'], monthly:'59', annual:'590', currency:'USD', positioning:'Precio de crecimiento regional; facturación localizable por país.' },
  { id:'brazil', label:'Brasil', countries:['BR'], monthly:'349', annual:'3490', currency:'BRL', positioning:'Precio localizado para pymes y autónomos.' },
  { id:'india', label:'India', countries:['IN'], monthly:'3999', annual:'39990', currency:'INR', positioning:'Precio de acceso para mercado de alto volumen.' },
  { id:'sea-africa', label:'Sudeste Asiático y África seleccionada', countries:['ID','PH','VN','TH','MY','ZA','NG','KE'], monthly:'49', annual:'490', currency:'USD', positioning:'Precio de acceso condicionado a costes de canal por país.' },
  { id:'gulf', label:'Golfo', countries:['AE','SA','QA','KW','BH','OM'], monthly:'109', annual:'1090', currency:'USD', positioning:'Precio B2B premium regional.' },
];

export const basePlanIncludes = [
  'Agente IA personalizado',
  'Widget web',
  'WhatsApp Business',
  'Email',
  'Google Business Profile / Maps como fuente y acceso',
  'Google Calendar y reservas',
  'Servicios, precios, FAQ e imágenes',
  'Mini CRM',
  'Clientes, conversaciones, leads y seguimiento',
];

export const commercialGuardrails = [
  'Los canales externos se activan solo después de verificación por empresa.',
  'Las tarifas extraordinarias de proveedores y campañas masivas pueden facturarse por consumo.',
  'No se promete uso ilimitado.',
  'Google Business Profile / Maps no se presenta como canal de chat.',
];
