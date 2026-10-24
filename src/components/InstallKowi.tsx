'use client';
import {useEffect,useState} from 'react';
type InstallEvent=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:string}>};
export default function InstallKowi({business=false}:{business?:boolean}={}){
 const [prompt,setPrompt]=useState<InstallEvent|null>(null);
 const [status,setStatus]=useState('');
 const [standalone,setStandalone]=useState(false);
 const [ios,setIos]=useState(false);
 const [showHelp,setShowHelp]=useState(false);
 useEffect(()=>{
  const installedMode=window.matchMedia('(display-mode: standalone)').matches || ('standalone' in navigator && (navigator as Navigator & {standalone?:boolean}).standalone===true);
  setStandalone(installedMode);
  setIos(/iPad|iPhone|iPod/.test(navigator.userAgent)||(/Macintosh/.test(navigator.userAgent)&&navigator.maxTouchPoints>1));
  const offer=(e:Event)=>{e.preventDefault();setPrompt(e as InstallEvent);};
  const installed=()=>{setStandalone(true);setPrompt(null);setStatus('KOWI ya está instalada en este dispositivo.');};
  window.addEventListener('beforeinstallprompt',offer);
  window.addEventListener('appinstalled',installed);
  if('serviceWorker' in navigator)navigator.serviceWorker.register('/kowi-sw.js').catch(()=>setStatus('No se pudo preparar la instalación automática. Puedes seguir usando la web.'));
  return()=>{window.removeEventListener('beforeinstallprompt',offer);window.removeEventListener('appinstalled',installed);};
 },[]);
 async function install(){
  if(standalone)return;
  if(!prompt){setShowHelp(true);return;}
  try{
   await prompt.prompt();
   const choice=await prompt.userChoice;
   setStatus(choice.outcome==='accepted'?'Solicitud aceptada. Comprueba el icono en tu pantalla de inicio.':'Instalación cancelada. Puedes volver a intentarlo.');
   setPrompt(null);
   if(choice.outcome!=='accepted')setShowHelp(true);
  }catch{setShowHelp(true);setStatus('Tu navegador requiere instalación manual.');}
 }
 return <section className="rounded-2xl border border-[#e8b37b]/40 bg-[#0d241d] p-5 text-[#eef8ef]" aria-label="Instalar KOWI">
  <h2 className="text-xl font-semibold text-white">{standalone?'KOWI ya está en tu móvil':business?'Instala KOWI Business en tu móvil':'Instala KOWI en tu móvil'}</h2>
  <p className="mt-2 text-sm leading-relaxed text-[#d1e2d5]">Accede desde un icono en la pantalla de inicio. La instalación requiere tu confirmación y no concede permisos de cámara, micrófono o ubicación.</p>
  {!standalone&&<button type="button" onClick={()=>void install()} className="mt-4 w-full rounded-xl bg-[#e8b37b] px-5 py-3.5 font-semibold text-[#17121a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto">Instalar KOWI en mi móvil</button>}
  {!standalone&&(showHelp||ios)&&<div className="mt-4 rounded-xl border border-white/20 bg-white/5 p-4 text-sm text-[#edf4ee]">
   {ios?<><p className="font-semibold">En iPhone o iPad</p><p className="mt-2">Abre KOWI en Safari, pulsa Compartir y elige «Añadir a pantalla de inicio». Confirma «Añadir». Apple no permite iniciar esta acción automáticamente desde una web.</p></>:<><p className="font-semibold">Instalación desde el navegador</p><p className="mt-2">Si no aparece la confirmación automática, abre el menú de Chrome o de tu navegador y elige «Instalar aplicación» o «Añadir a pantalla de inicio».</p></>}
  </div>}
  {status&&<p role="status" className="mt-3 text-sm text-[#f1caa2]">{status}</p>}
 </section>;
}
