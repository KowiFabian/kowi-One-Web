import { z } from 'zod';
import { ApiError, apiFailure, authenticate, limitedJson } from '@/lib/server/auth';
import { buildVoiceInstructions, voiceProfiles, voiceTones } from '@/lib/voice-config';

export const runtime = 'nodejs';
export const maxDuration = 60;

const schema = z.object({
  conversationId: z.string().uuid(),
  text: z.string().min(1).max(4096),
  profile: z.enum(voiceProfiles.map(item => item.id) as ['legacy','companion']),
  tone: z.enum(voiceTones.map(item => item.id) as ['natural','warm','calm','executive','energetic','narrative']),
  locale: z.string().min(2).max(16).regex(/^(auto|[A-Za-z]{2,3}(?:-[A-Za-z]{2,4})?)$/),
  approved: z.literal(true),
});

export async function GET(request:Request){
  try {
    await authenticate(request);
    return Response.json({
      providerConfigured: Boolean(process.env.OPENAI_API_KEY),
      customVoiceConfigured: Boolean(process.env.KOWI_CUSTOM_VOICE_ID),
      disclosure: 'Voz generada por IA.',
    }, { headers:{'Cache-Control':'no-store'} });
  } catch(error){ return apiFailure(error); }
}

export async function POST(request:Request){
  try {
    const { db, user } = await authenticate(request);
    const parsed = schema.safeParse(await limitedJson(request, 10000));
    if(!parsed.success) throw new ApiError(400,'Configuración de voz no válida.');
    const { conversationId, text, profile, tone, locale } = parsed.data;

    const { data: conversation, error: conversationError } = await db.from('conversations')
      .select('id').eq('id',conversationId).eq('user_id',user.id).maybeSingle();
    if(conversationError) throw new ApiError(503,'No se pudo verificar la conversación.');
    if(!conversation) throw new ApiError(404,'Conversación no encontrada.');

    const { data: turn, error: turnError } = await db.from('turns').select('id')
      .eq('conversation_id',conversationId).eq('user_id',user.id).eq('response',text).limit(1).maybeSingle();
    if(turnError) throw new ApiError(503,'No se pudo verificar el texto autorizado.');
    if(!turn) throw new ApiError(403,'Voz ID solo reproduce respuestas autorizadas y guardadas en esta conversación.');

    if(!process.env.OPENAI_API_KEY) throw new ApiError(503,'La API de voz todavía no tiene OPENAI_API_KEY configurada.');

    const customId = process.env.KOWI_CUSTOM_VOICE_ID?.trim();
    if(profile === 'legacy' && !customId) throw new ApiError(503,'La Custom Voice del propietario todavía no tiene voice_id configurado.');

    const voice = profile === 'legacy'
      ? { id: customId! }
      : (process.env.KOWI_COMPLEMENT_VOICE?.trim() || 'coral');

    let upstream:Response;
    try {
      upstream = await fetch('https://api.openai.com/v1/audio/speech',{
        method:'POST',
        headers:{'Content-Type':'application/json',Authorization:`Bearer ${process.env.OPENAI_API_KEY}`},
        signal:AbortSignal.timeout(45000),
        body:JSON.stringify({
          model: process.env.KOWI_TTS_MODEL || 'gpt-4o-mini-tts',
          voice,
          input:text,
          instructions:buildVoiceInstructions(locale,tone),
          response_format:'mp3',
          speed:1,
        }),
      });
    } catch {
      throw new ApiError(502,'No se pudo conectar con el servicio de voz.');
    }

    if(!upstream.ok){
      const status = upstream.status;
      if(profile === 'legacy' && (status === 403 || status === 404)){
        throw new ApiError(503,'La Custom Voice no está disponible para este proyecto o voice_id.');
      }
      throw new ApiError(502,'No se pudo generar el audio.');
    }

    const audio = await upstream.arrayBuffer();
    return new Response(audio,{
      status:200,
      headers:{
        'Content-Type':'audio/mpeg',
        'Cache-Control':'private, no-store, max-age=0',
        'X-Kowi-Voice-Disclosure':'AI-generated',
      },
    });
  } catch(error){ return apiFailure(error); }
}
