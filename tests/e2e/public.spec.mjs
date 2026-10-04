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
 try{
 await context.setOffline(true);await page.goto('/business/agent-chat');
 await expect(page.getByRole('heading',{name:'Recupera la conexión para continuar.'})).toBeVisible();
 await expect(page.getByText(/Este aviso no confirma/)).toBeVisible();
 }finally{await context.setOffline(false);}
});
