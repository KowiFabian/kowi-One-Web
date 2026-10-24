import 'server-only';

/**
 * Bounded OpenAI transport shared by KOWI's personal and business agents.
 * Never retries rejected 4xx requests, invalid model output or ambiguous
 * network timeouts; a timeout could mean an unseen charge or completed reply.
 */
export type ProviderFailureKind='authentication'|'rate_limit'|'temporary'|'rejected'|'timeout'|'invalid_response';
export class OpenAITransportError extends Error{
 constructor(public kind:ProviderFailureKind,public status:number,public retryAfterSeconds:number|null=null){
  super(kind);this.name='OpenAITransportError';
 }
}

type Dependencies={
 fetcher?:typeof fetch;
 pause?:(ms:number)=>Promise<void>;
 timeoutMs?:number;
 maxAttempts?:number;
};
const retriable=new Set([429,500,502,503,504]);
const delay=(ms:number)=>new Promise<void>(resolve=>setTimeout(resolve,ms));

export function retryAfterSeconds(header:string|null,now=Date.now()):number|null{
 if(!header)return null;
 const trimmed=header.trim();
 const numeric=Number(trimmed);
 if(trimmed!==''&&Number.isFinite(numeric)&&numeric>=0)return Math.min(3600,Math.ceil(numeric));
 const stamp=Date.parse(trimmed);
 return Number.isFinite(stamp)?Math.min(3600,Math.max(0,Math.ceil((stamp-now)/1000))):null;
}

export function providerHttpError(status:number,retryAfter:string|null=null):OpenAITransportError{
 const kind:ProviderFailureKind=status===401||status===403?'authentication':status===429?'rate_limit':retriable.has(status)?'temporary':'rejected';
 return new OpenAITransportError(kind,status,retryAfterSeconds(retryAfter));
}

export async function requestOpenAIJson(endpoint:'chat/completions'|'responses',body:unknown,apiKey:string,deps:Dependencies={}):Promise<unknown>{
 if(!apiKey.trim())throw new OpenAITransportError('authentication',503);
 const fetcher=deps.fetcher??fetch;
 const pause=deps.pause??delay;
 const attempts=Math.min(3,Math.max(1,deps.maxAttempts??2));
 const timeoutMs=Math.min(24000,Math.max(2000,deps.timeoutMs??20000));
 for(let attempt=0;attempt<attempts;attempt++){
  let response:Response;
  try{
   response=await fetcher('https://api.openai.com/v1/'+endpoint,{
    method:'POST',
    headers:{'Content-Type':'application/json',Authorization:'Bearer '+apiKey},
    body:JSON.stringify(body),
    signal:AbortSignal.timeout(timeoutMs)
   });
  }catch{
   // The provider may have completed an interrupted request. A retry could
   // duplicate tokens, charges or effects; require the user to review state.
   throw new OpenAITransportError('timeout',502);
  }
  if(response.ok){
   try{return await response.json();}
   catch{throw new OpenAITransportError('invalid_response',502);}
  }
  const issue=providerHttpError(response.status,response.headers.get('retry-after'));
  if(!retriable.has(response.status)||attempt===attempts-1)throw issue;
  const waitMs=issue.retryAfterSeconds===null?700*(attempt+1):issue.retryAfterSeconds*1000;
  // Avoid sleeping through a long provider quota cooldown inside an HTTP request.
  if(waitMs>3000)throw issue;
  await pause(waitMs);
 }
 throw new OpenAITransportError('temporary',502);
}

export function openAIErrorResponse(error:OpenAITransportError):Response{
 const message:Record<ProviderFailureKind,string>={
  authentication:'La configuración de IA necesita revisión. No se ha enviado una respuesta.',
  rate_limit:'El proveedor de IA ha alcanzado su límite. Inténtalo más tarde.',
  temporary:'El proveedor de IA no está disponible temporalmente. Inténtalo más tarde.',
  rejected:'La solicitud no pudo ser procesada por el proveedor de IA. Revisa la configuración.',
  timeout:'No se pudo confirmar la respuesta de IA. Revisa el historial antes de repetir.',
  invalid_response:'La respuesta de IA no tuvo un formato válido. No se ha guardado como completada.'
 };
 const status=error.kind==='rate_limit'?429:error.kind==='authentication'?503:502;
 const headers:Record<string,string>={'Cache-Control':'no-store'};
 if(error.kind==='rate_limit'&&error.retryAfterSeconds!==null)headers['Retry-After']=String(error.retryAfterSeconds);
 return Response.json({error:message[error.kind],provider_status:error.kind},{status,headers});
}
