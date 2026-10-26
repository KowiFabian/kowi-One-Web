import { test, expect } from '@playwright/test';
test('Visitor reaches Business registration on desktop and mobile', async ({ page }) => {
  const response = await page.goto('/');
  expect(response.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const overflows = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(overflows, 'Landing must fit the viewport').toBe(false);
  await page.getByRole('link', { name: /Crear mi agente KOWI/ }).first().click();
  await expect(page).toHaveURL(/\/business#crear$/);
  await expect(page.getByRole('heading', { name: 'Crear cuenta o entrar' })).toBeVisible();
  await expect(page.getByLabel('Correo electrónico')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Recibir código' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'privacidad y uso de IA' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1), 'Registration must fit viewport').toBe(false);
});
test('Privacy information and mobile navigation remain reachable', async ({ page, isMobile }) => {
  await page.goto('/');
  if (isMobile) {
    await page.getByText('Menú', { exact: true }).click();
    await expect(page.getByRole('navigation', { name: 'Principal móvil' })).toBeVisible();
    await page.getByRole('navigation', { name: 'Principal móvil' }).getByRole('link', { name: 'Business', exact: true }).click();
    await expect(page).toHaveURL(/\/business$/);
  }
  const response = await page.goto('/privacidad');
  expect(response.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)).toBe(false);
});

test('Private business surfaces fit the viewport and reject unauthenticated access', async ({page})=>{
 for(const [path,title] of [['/control-center','KOWI Control Center'],['/business/crm-org','CRM de tu empresa'],['/business/intelligence','KOWI Intelligence'],['/business/agents','Agentes de tu empresa'],['/business/pipeline','Configurar pipeline'],['/business/jobs','Trabajos y evidencias del agente'],['/test-email','Prueba de correo KOWI'],['/business/director','KOWI Director']]){
  const response=await page.goto(path);
  expect(response.status()).toBe(200);
  await expect(page.getByRole('heading',{name:title,exact:true})).toBeVisible();
  await expect(page.getByRole('alert').filter({hasText:/Inicia sesión/}).first()).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1)).toBe(false);
 }
});

test('Installable workspace exposes valid icons and only caches the public offline notice',async({page,context})=>{
 await page.goto('/app');
 await expect(page.getByRole('heading',{name:'Tu espacio KOWI',exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1)).toBe(false);
 const manifestResponse=await page.request.get('/manifest.webmanifest');
 expect(manifestResponse.status()).toBe(200);
 const manifest=await manifestResponse.json();
 expect(manifest.start_url).toBe('/app');expect(manifest.display).toBe('standalone');
 for(const size of [192,512]){
 const icon=await page.request.get('/app-icon?size='+size);
 expect(icon.status()).toBe(200);expect(icon.headers()['content-type']).toContain('image/png');
 const bytes=await icon.body();expect(bytes.readUInt32BE(16)).toBe(size);expect(bytes.readUInt32BE(20)).toBe(size);
 }
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
 await page.reload();
 await page.waitForFunction(()=>Boolean(navigator.serviceWorker.controller));
 await page.goto('/business/director');
 await expect(page.getByRole('alert').filter({hasText:/Inicia sesión/}).first()).toBeVisible();
 const cached=await page.evaluate(async()=>{const cache=await caches.open('kowi-public-offline-v1');return(await cache.keys()).map(r=>new URL(r.url).pathname);});
 expect(cached).toEqual(['/offline.html']);
 let blockedWorkerRequests=0;
 await context.route('**/*',async route=>{
  if(route.request().serviceWorker()){blockedWorkerRequests++;await route.abort('internetdisconnected');}
  else await route.continue();
 });
 try{
 await page.goto('/business/agent-chat?offline_probe=controlled');
 await expect(page.getByRole('heading',{name:'Recupera la conexión para continuar.'})).toBeVisible();
 await expect(page.getByText(/Este aviso no confirma/)).toBeVisible();
 expect(blockedWorkerRequests).toBeGreaterThan(0);
 }finally{await context.unroute('**/*');}
});

test('News distinguishes official facts and editorial context on desktop and mobile',async({page})=>{
 const response=await page.goto('/news');
 expect(response.status()).toBe(200);
 await expect(page.getByRole('heading',{name:'Conoce el cambio. Compréndelo. Sé parte de él.'})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Radar tecnológico',exact:true})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Dato observado',exact:true})).toHaveCount(3);
 await expect(page.getByRole('heading',{name:'Interpretación KOWI',exact:true})).toHaveCount(3);
 const links=page.getByRole('link',{name:/Comprobar fuente:/});
 await expect(links).toHaveCount(3);
 for(const link of await links.all())expect(await link.getAttribute('href')).toMatch(/^https:\/\/github\.com\/(openai\/openai-python|NVIDIA\/OpenShell|supabase\/supabase-js)\/releases\/tag\//);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1)).toBe(false);
 await page.getByRole('link',{name:'Preparar una orden de comunicación ↗'}).click();
 await expect(page).toHaveURL(/\/business\/director\?kind=communications$/);
 await expect(page.getByRole('heading',{name:'KOWI Director',exact:true})).toBeVisible();
 await expect(page.getByRole('alert').filter({hasText:/Inicia sesión/}).first()).toBeVisible();
});

test('Business has a direct installable entry and protected overview',async({page})=>{
 const response=await page.goto('/business/app');
 expect(response.status()).toBe(200);
 await expect(page.getByRole('heading',{name:'Tu empresa. Tu agente. Tu control.'})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Crear cuenta o entrar',exact:true})).toBeVisible();
 await expect(page.getByLabel('Correo electrónico')).toBeVisible();
 await expect(page.getByRole('heading',{name:'Lleva KOWI Business contigo'})).toBeVisible();
 const manifestLink=await page.locator('link[rel="manifest"]').getAttribute('href');
 expect(manifestLink).toBe('/business/manifest.webmanifest');
 const manifest=await (await page.request.get(manifestLink)).json();
 expect(manifest.start_url).toBe('/business/app');expect(manifest.id).toBe('/business/app');expect(manifest.display).toBe('standalone');
 const unauthorized=await page.request.get('/api/business/workspace?organization_id=11111111-1111-4111-8111-111111111111');
 expect(unauthorized.status()).toBe(401);
 expect(unauthorized.headers()['cache-control']).toContain('no-store');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1)).toBe(false);
});

test('LOCAL UI FIXTURE: Business selection and agenda preserve tenant context',async({page,context,baseURL})=>{
 test.skip(!baseURL.startsWith('http://127.0.0.1:'),'UI fixture runs locally only; not evidence of production authentication.');
 const a='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',b='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
 await page.addInitScript(()=>{
  const expires=Math.floor(Date.now()/1000)+3600;
  const payload=btoa(JSON.stringify({sub:'11111111-1111-4111-8111-111111111111',exp:expires,aud:'authenticated'})).replace(/=/g,'');
  const user={id:'11111111-1111-4111-8111-111111111111',email:'ui-fixture@example.test',email_confirmed_at:new Date().toISOString(),aud:'authenticated',app_metadata:{},user_metadata:{},created_at:new Date().toISOString()};
  localStorage.setItem('sb-browser-fixture-auth-token',JSON.stringify({access_token:'eyJhbGciOiJIUzI1NiJ9.'+payload+'.fixture-not-a-signature',refresh_token:'fixture-not-a-credential',expires_in:3600,expires_at:expires,token_type:'bearer',user}));
 });
 await context.route('**/api/organizations',route=>route.fulfill({json:[{id:a,name:'UI Fixture A'},{id:b,name:'UI Fixture B'}]}));
 await context.route('**/api/business/workspace?**',route=>{
  const org=new URL(route.request().url()).searchParams.get('organization_id');
  return route.fulfill({json:{organization:{id:org,name:org===b?'UI Fixture B':'UI Fixture A'},role:'owner',verifiedAccount:true,counts:{contacts:0,leads:0,opportunities:0,tasks:0,appointments:0,conversations:0},agents:[],tasks:[],appointments:[],observedAt:new Date().toISOString()}});
 });
 await context.route('**/api/crm/**',route=>route.fulfill({json:{items:[],role:'viewer'}}));
 await context.route('**/api/crm-stages?**',route=>route.fulfill({json:{items:[],role:'viewer'}}));
 await page.goto('/business/app');
 await expect(page.getByRole('heading',{name:'Gestiona tu negocio con KOWI',exact:true})).toBeVisible();
 await page.getByLabel('Empresa',{exact:true}).selectOption(b);
 await expect(page.getByRole('heading',{name:'UI Fixture B',exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1)).toBe(false);
 await page.getByRole('navigation',{name:'Accesos rápidos del negocio'}).getByRole('link',{name:'Agenda',exact:true}).click();
 await expect(page).toHaveURL(new RegExp('organization_id='+b+'&entity=appointments'));
 await expect(page.getByRole('heading',{name:'CRM de tu empresa',exact:true})).toBeVisible();
 await expect(page.getByText('Acceso de consulta.',{exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'Citas propuestas',exact:true})).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('main [role="alert"]')).toHaveCount(0);
});

test('Voz ID identifies current voice tools and pending delegation honestly',async({page})=>{
 const response=await page.goto('/voz-id');expect(response.status()).toBe(200);
 await expect(page.getByRole('heading',{name:'Voz ID: tu propósito, tu voz, tu control.'})).toBeVisible();
 await expect(page.getByText(/todavía no están activas/)).toBeVisible();
 await expect(page.getByText(/no acreditan identidad ni autorización/)).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1)).toBe(false);
 await page.getByRole('link',{name:'Abrir mi asistente personal ↗'}).click();
 await expect(page).toHaveURL(/kowi$/);
 await expect(page.getByRole('heading',{name:'Entrar a Kowi',exact:true})).toBeVisible();
});

test('KOWI Verifica blocks weak evidence and discloses limits',async({page})=>{
 const response=await page.goto('/news/verificar');expect(response.status()).toBe(200);
 await expect(page.getByRole('heading',{name:'KOWI Verifica',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Comprobar requisitos'}).click();
 await expect(page.getByRole('heading',{name:'Bloqueado: evidencia insuficiente'})).toBeVisible();
 await expect(page.getByText('Publicación autorizada: NO.')).toBeVisible();
 await expect(page.getByRole('button',{name:'Descargar dossier NO CONFIRMADO'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1)).toBe(false);
});

test('KOWI School offers a real free media-literacy exercise',async({page})=>{
 const response=await page.goto('/school/verificar');expect(response.status()).toBe(200);
 await expect(page.getByRole('heading',{name:'Aprende a detectar información engañosa'})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Busca el origen'})).toBeVisible();
 await page.getByRole('radio').nth(1).check();
 await expect(page.getByText('Respuesta adecuada')).toBeVisible();
 await page.getByRole('button',{name:'Siguiente lección →'}).click();
 await expect(page.getByRole('heading',{name:'No confundas repeticiones con contraste'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1)).toBe(false);
});

test('Public ecosystem is honest about product availability',async({page})=>{
 const response=await page.goto('/ecosistema');expect(response.status()).toBe(200);
 await expect(page.getByRole('heading',{name:'Informar, aprender, construir y transformar.'})).toBeVisible();
 await expect(page.getByText(/No acredita funcionalidades no desplegadas/)).toBeVisible();
 await expect(page.getByRole('link',{name:'Abrir KOWI Verifica ↗'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1)).toBe(false);
});

test('Business chat keeps accessible UI and shows unauthenticated error without revealing private data',async({page})=>{
 const response=await page.goto('/business/agent-chat');expect(response.status()).toBe(200);
 await expect(page.getByRole('heading',{name:'KOWI · Business',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'Abrir menú de KOWI'})).toBeVisible();
 await expect(page.getByRole('log',{name:'Conversación empresarial'})).toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1)).toBe(false);
});

// Local fixtures exercise UI failures only; they do not prove provider connectivity.
test('Business chat exposes initialization failure outside the closed menu',async({page})=>{
 await page.goto('/business/agent-chat');
 await expect(page.locator('main').getByRole('alert').filter({hasText:/Inicia sesión/})).toBeVisible();
 await expect(page.getByRole('button',{name:'Abrir menú de KOWI'})).toHaveAttribute('aria-expanded','false');
});

test('LOCAL UI FIXTURE: agent validation is explicit and duplicate registration stays unique',async({page,context,baseURL})=>{
 test.skip(!baseURL.startsWith('http://127.0.0.1:'),'Local fixture only; not production evidence.');
 const org='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
 await page.addInitScript(()=>{
  const expires=Math.floor(Date.now()/1000)+3600;
  const user={id:'11111111-1111-4111-8111-111111111111',email:'ui-fixture@example.test',aud:'authenticated',app_metadata:{},user_metadata:{},created_at:new Date().toISOString()};
  localStorage.setItem('sb-browser-fixture-auth-token',JSON.stringify({access_token:'eyJhbGciOiJIUzI1NiJ9.'+btoa(JSON.stringify({sub:user.id,exp:expires,aud:'authenticated'}))+'.fixture',refresh_token:'fixture',expires_at:expires,expires_in:3600,token_type:'bearer',user}));
 });
 await context.route('**/api/organizations',route=>route.fulfill({json:[{id:org,name:'Fixture'}]}));
 let posts=0;
 await context.route('**/api/organization-agents?**',route=>{
  if(route.request().method()==='POST'){posts++;return route.fulfill({json:{id,name:'KOWI Comercial',status:'draft'}});}
  return route.fulfill({json:{items:[],role:'owner'}});
 });
 await page.goto('/business/agents');
 const submit=page.getByRole('button',{name:'Registrar agente en DRAFT',exact:true});
 await expect(submit).toBeVisible();
 await page.getByLabel('Nombre del agente').fill(' ');await submit.click();
 await expect(page.locator('main').getByRole('alert')).toContainText('Falta el nombre del agente');expect(posts).toBe(0);
 await page.getByLabel('Nombre del agente').fill('KOWI Comercial');
 await page.getByRole('button',{name:'Añadir producto o servicio',exact:true}).click();await submit.click();
 await expect(page.locator('main').getByRole('alert')).toContainText('Falta el nombre del producto o servicio 1');expect(posts).toBe(0);
 await page.getByRole('button',{name:'Retirar producto 1',exact:true}).click();
 await submit.click();await expect(page.getByRole('status')).toContainText('registrado correctamente');
 await submit.click();await expect.poll(()=>posts).toBe(2);
 await expect(page.getByRole('heading',{name:'KOWI Comercial',exact:true})).toHaveCount(1);
});

test('LOCAL UI FIXTURE: saved chat remains successful when agent refresh fails',async({page,context,baseURL})=>{
 test.skip(!baseURL.startsWith('http://127.0.0.1:'),'Local UI fixture only.');
 const org='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',agent='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',conversation='cccccccc-cccc-4ccc-8ccc-cccccccccccc';
 await page.addInitScript(()=>{
  const expires=Math.floor(Date.now()/1000)+3600;
  const user={id:'11111111-1111-4111-8111-111111111111',email:'ui-fixture@example.test',aud:'authenticated',app_metadata:{},user_metadata:{},created_at:new Date().toISOString()};
  localStorage.setItem('sb-browser-fixture-auth-token',JSON.stringify({access_token:'eyJhbGciOiJIUzI1NiJ9.'+btoa(JSON.stringify({sub:user.id,exp:expires,aud:'authenticated'}))+'.fixture',refresh_token:'fixture',expires_at:expires,expires_in:3600,token_type:'bearer',user}));
 });
 await context.route('**/api/organizations',route=>route.fulfill({json:[{id:org,name:'Fixture'}]}));
 let reads=0,posts=0;
 const config={name:'Fixture',sector:'otro',services:[],hours:'',team:'',faq:[],policies:'',tone:'',automaticActions:[]};
 await context.route('**/api/organization-agents?**',route=>++reads===1?route.fulfill({json:{items:[{id:agent,name:'Fixture Agent',status:'draft',config}],role:'owner'}}):route.fulfill({status:503,json:{error:'Refresh unavailable'}}));
 await context.route('**/api/organization-chat?**',route=>{
  if(route.request().method()==='POST'){posts++;return route.fulfill({json:{conversationId:conversation,response:'Respuesta de prueba guardada'}});}
  return route.fulfill({json:{items:[]}});
 });
 await page.goto('/business/agent-chat');
 await page.getByLabel('Mensaje',{exact:true}).fill('Consulta de prueba');
 await page.getByRole('button',{name:'Enviar mensaje a KOWI'}).click();
 await expect(page.getByRole('log')).toContainText('Respuesta de prueba guardada');
 await expect(page.getByRole('status')).toContainText('Respuesta y evidencia guardadas. No se pudo actualizar');
 await expect(page.locator('main').getByRole('alert')).toHaveCount(0);
 await expect(page.getByLabel('Mensaje',{exact:true})).toHaveValue('');expect(posts).toBe(1);
});
