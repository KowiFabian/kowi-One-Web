'use client';
import {useEffect,useState} from 'react';
type InstallEvent=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:string}>};
export default function InstallKowi(){
 const [prompt,setPrompt]=useState<InstallEvent|null>(null),[status,setStatus]=useState(''),[standalone,setStandalone]=useState(false);
 useEffect(()=>{
 setStandalone(window.matchMedia('(display-mode: standalone)').matches);
 const offer=(e:Event)=>{e.preventDefault();setPrompt(e as InstallEvent);};
 const installed=()=>{setStandalone(true);setPrompt(null);setStatus('KOWI está instalada en este dispositivo.');};
 window.addEventListener('beforeinstallprompt',offer);window.addEventListener('appinstalled',installed);
 if('serviceWorker' in navigator)navigator.serviceWorker.register('/kowi-sw.js').catch(()=>setStatus('La instalación no pudo prepararse; puedes seguir usando la web.'));
 return()=>{window.removeEventListener('beforeinstallprompt',offer);window.removeEventListener('appinstalled',installed);};
 },[]);
 async function install(){if(!prompt)return;try{await prompt.prompt();const choice=await prompt.userChoice;setStatus(choice.outcome==='accepted'?'Instalación solicitada al navegador.':'Puedes instalar KOWI más adelante.');setPrompt(null);}catch{setStatus('Usa el menú de instalación de tu navegador.');}}
 return <section className="rounded-2xl border border-[#e8b37b]/40 p-5"><h2 className="text-xl font-semibold">{standalone?'KOWI en tu dispositivo':'Lleva KOWI contigo'}</h2><p className="mt-3">Instala esta web para abrir tu espacio desde la pantalla de inicio. La IA, tu agenda y los datos privados necesitan conexión.</p>{prompt&&<button onClick={()=>void install()} className="mt-4 rounded-xl bg-[#e8b37b] px-5 py-3 font-semibold text-black">Instalar KOWI</button>}{!standalone&&<details className="mt-4"><summary className="cursor-pointer">Cómo instalar en móvil u ordenador</summary><p className="mt-3">iPhone/iPad: abre KOWI en Safari → Compartir → Añadir a pantalla de inicio. Android: abre el menú de Chrome → Instalar aplicación o Añadir a pantalla de inicio. Ordenador: utiliza el icono de instalación o el menú de tu navegador, cuando esté disponible.</p></details>}{status&&<p role="status" className="mt-3">{status}</p>}</section>;
}
