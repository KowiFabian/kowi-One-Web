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
 for(const [path,title] of [['/control-center','KOWI Control Center'],['/business/crm-org','CRM de tu empresa'],['/business/intelligence','KOWI Intelligence'],['/business/agents','Agentes de tu empresa'],['/business/pipeline','Configurar pipeline'],['/business/agent-chat','Conversación empresarial con IA'],['/business/jobs','Trabajos y evidencias del agente'],['/test-email','Prueba de correo KOWI'],['/business/director','KOWI Director']]){
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
 await expect(page.getByRole('heading',{name:'El futuro se comprende. Después se construye.'})).toBeVisible();
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
