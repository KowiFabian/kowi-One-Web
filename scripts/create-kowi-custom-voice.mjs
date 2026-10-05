#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';

const [consentPath,samplePath] = process.argv.slice(2);
if(!process.env.OPENAI_API_KEY){
  console.error('Falta OPENAI_API_KEY.');
  process.exit(1);
}
if(!consentPath || !samplePath){
  console.error('Uso: node scripts/create-kowi-custom-voice.mjs <consent.wav|m4a> <sample.wav|m4a>');
  process.exit(1);
}

async function uploadConsent(){
  const bytes=await readFile(consentPath);
  const form=new FormData();
  form.set('name','KOWI Fabian consent');
  form.set('language','es');
  form.set('recording',new Blob([bytes],{type: consentPath.endsWith('.wav')?'audio/wav':'audio/mp4'}),basename(consentPath));
  const response=await fetch('https://api.openai.com/v1/audio/voice_consents',{
    method:'POST',headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`},body:form,
  });
  const body=await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(`Consentimiento rechazado (${response.status}): ${body?.error?.message || 'sin detalle'}`);
  return body.id;
}

async function createVoice(consent){
  const bytes=await readFile(samplePath);
  const form=new FormData();
  form.set('type','audio_sample');
  form.set('name','KOWI · Fabian');
  form.set('consent',consent);
  form.set('audio_sample',new Blob([bytes],{type: samplePath.endsWith('.wav')?'audio/wav':'audio/mp4'}),basename(samplePath));
  const response=await fetch('https://api.openai.com/v1/audio/voices',{
    method:'POST',headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`},body:form,
  });
  const body=await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(`Voz rechazada (${response.status}): ${body?.error?.message || 'sin detalle'}`);
  return body.id;
}

try{
  const consent=await uploadConsent();
  const voice=await createVoice(consent);
  console.log(JSON.stringify({consent_id:consent,voice_id:voice},null,2));
  console.log('Guarda voice_id como KOWI_CUSTOM_VOICE_ID en el servidor. No lo expongas en el navegador.');
}catch(error){
  console.error(error instanceof Error?error.message:String(error));
  process.exit(1);
}
