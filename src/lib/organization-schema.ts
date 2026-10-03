import {z} from 'zod';
export const organizationSchema=z.object({name:z.string().trim().min(2).max(120).refine(s=>!/[\u0000-\u001f\u007f]/.test(s),'Nombre inválido')}).strict();
export type OrganizationSummary={id:string;name:string;slug:string};

export function organizationSlug(name:string,nonce:string){
 const prefix=name.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,26).replace(/-$/,'')||'empresa';
 return prefix+'-'+nonce;
}
