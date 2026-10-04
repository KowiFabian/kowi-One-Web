import {ImageResponse} from 'next/og';
export const runtime='edge';
export function GET(request:Request){
 const size=new URL(request.url).searchParams.get('size')==='192'?192:512;
 return new ImageResponse(<div style={{display:'flex',height:'100%',width:'100%',alignItems:'center',justifyContent:'center',background:'#071612',color:'#e8b37b',fontSize:size*.19,fontWeight:700,borderRadius:size*.18}}>KOWI</div>,{width:size,height:size,headers:{'Cache-Control':'public, max-age=86400'}});
}
