import {z} from 'zod';
export const CONTROLLED_EMAIL_SUBJECT='Prueba controlada KOWI';
export const CONTROLLED_EMAIL_BODY='Este es un mensaje de prueba autorizado de KOWI para verificar aprobación humana, envío y evidencia. No requiere ninguna acción.';
export const controlledEmailTestSchema=z.object({
 to:z.string().email().max(254),subject:z.literal(CONTROLLED_EMAIL_SUBJECT),body:z.literal(CONTROLLED_EMAIL_BODY),
 controlled_test:z.literal(true),test_version:z.literal(1),organization_id:z.string().uuid(),conversation_id:z.string().uuid()
}).strict();
export function validControlledEmailTest(payload:unknown,verifiedRecipient:string){
 const parsed=controlledEmailTestSchema.safeParse(payload);
 return parsed.success&&parsed.data.to.toLowerCase()===verifiedRecipient.toLowerCase();
}
