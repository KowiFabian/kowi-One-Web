import {z} from 'zod';
const text=z.string().trim().min(1).max(160);
const ref=z.string().uuid().nullable().optional();
export const crmSchemas={
 companies:z.object({name:text,website:z.string().url().refine(value=>value.startsWith('https://')).max(300).or(z.literal('')).default('')}).strict(),
 activities:z.object({title:text,kind:z.enum(['note','call','meeting','follow_up']).default('note'),status:z.enum(['planned','recorded']).default('planned'),details:z.string().trim().max(2000).default(''),occurred_at:z.string().datetime().nullable().optional(),contact_id:ref,opportunity_id:ref,conversation_id:ref}).strict(),
 appointments:z.object({title:text,starts_at:z.string().datetime(),ends_at:z.string().datetime(),status:z.enum(['proposed','confirmed','cancelled']).default('proposed'),notes:z.string().trim().max(2000).default(''),contact_id:ref,opportunity_id:ref}).strict(),
 contacts:z.object({name:text,company_id:ref,email:z.string().email().max(254).or(z.literal('')).default(''),phone:z.string().trim().max(40).default(''),consent:z.boolean().default(false)}).strict(),
 leads:z.object({title:text,contact_id:ref,source:z.enum(['manual','web','email','whatsapp','voice','other']).default('manual'),notes:z.string().trim().max(2000).default('')}).strict(),
 opportunities:z.object({title:text,lead_id:ref,contact_id:ref,stage_id:z.string().uuid(),value_minor:z.number().int().min(0).max(100000000000).nullable().optional(),currency:z.string().regex(/^[A-Z]{3}$/).default('EUR')}).strict(),
 tasks:z.object({title:text,opportunity_id:ref,contact_id:ref,status:z.enum(['open','done','cancelled']).default('open'),due_at:z.string().datetime().nullable().optional()}).strict()
};
export const crmEntity=z.enum(['contacts','leads','opportunities','tasks','companies','activities','appointments']);
export const crmWriteRoles=['owner','admin','configurator','operator'];
