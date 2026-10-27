import {redirect} from 'next/navigation';
export default async function BuildersShortcut({searchParams}:{searchParams:Promise<{organization_id?:string}>}){
 const {organization_id}=await searchParams;
 const valid=typeof organization_id==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(organization_id);
 redirect('/builders'+(valid?'?organization_id='+encodeURIComponent(organization_id):''));
}
