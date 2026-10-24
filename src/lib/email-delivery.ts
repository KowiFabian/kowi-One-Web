/** Resend acceptance, delivery and complaints are distinct evidence states.
 * A missing signed webhook is unknown, not proof of non-delivery.
 */
export type EmailEventKind='accepted'|'delivered'|'bounced'|'complained'|'suppressed';
export type EmailObservation={event_type:string;created_at?:string|null};
export type EmailDeliveryState='unknown'|'accepted'|'delivered'|'bounced'|'complained'|'suppressed';

const known:ReadonlySet<string>=new Set(['accepted','delivered','bounced','complained','suppressed']);
export function emailDeliveryState(events:EmailObservation[]|null|undefined,hasProviderReceipt=false):EmailDeliveryState{
 const relevant=(events||[]).filter(e=>known.has(e.event_type));
 // The database timestamp describes receipt, not necessarily the provider's event time.
 // We never infer delivery from the result of an HTTP send alone.
 const terminal=relevant.filter(e=>e.event_type!=='accepted').sort((a,b)=>{
  const da=Date.parse(a.created_at||'')||0,db=Date.parse(b.created_at||'')||0;
  return db-da;
 });
 if(terminal.length)return terminal[0].event_type as EmailDeliveryState;
 if(relevant.some(e=>e.event_type==='accepted')||hasProviderReceipt)return 'accepted';
 return 'unknown';
}
export const emailDeliveryLabels:Record<EmailDeliveryState,string>={
 unknown:'Sin evidencia suficiente: revisar proveedor y webhook',
 accepted:'Aceptado por Resend; entrega no confirmada',
 delivered:'Entregado según webhook firmado de Resend',
 bounced:'Rebotado según webhook firmado de Resend',
 complained:'Marcado como reclamación de spam según Resend',
 suppressed:'Suprimido por Resend; no se enviará a ese destinatario'
};
