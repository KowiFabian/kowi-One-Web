import 'server-only';
import {newsSources,verifiedReleases} from '@/lib/news';
export async function loadNewsRadar(){
 const results=await Promise.all(newsSources.map(async source=>{
  try{
   const response=await fetch('https://api.github.com/repos/'+source.repo+'/releases?per_page=12',{headers:{Accept:'application/vnd.github+json'},next:{revalidate:3600},signal:AbortSignal.timeout(8000)});
   if(!response.ok)throw new Error('Source unavailable');
   return {source:source.label,releases:verifiedReleases(await response.json(),source),available:true};
  }catch{return {source:source.label,releases:[],available:false};}
 }));
 return {releases:results.flatMap(r=>r.releases).sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt)),unavailable:results.filter(r=>!r.available).map(r=>r.source),checkedAt:new Date().toISOString()};
}
