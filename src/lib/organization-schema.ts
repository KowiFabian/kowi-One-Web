import {z} from 'zod';
export const organizationSchema=z.object({name:z.string().trim().min(2).max(120).refine(s=>!/[\u0000-\u001f\u007f]/.test(s),'Nombre inválido')}).strict();
export type OrganizationSummary={id:string;name:string;slug:string};
