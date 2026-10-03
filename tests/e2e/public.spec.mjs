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
 for(const [path,title] of [['/control-center','KOWI Control Center'],['/business/crm-org','CRM de tu empresa'],['/business/intelligence','KOWI Intelligence'],['/business/agents','Agentes de tu empresa']]){
  const response=await page.goto(path);
  expect(response.status()).toBe(200);
  await expect(page.getByRole('heading',{name:title,exact:true})).toBeVisible();
  await expect(page.getByRole('alert').filter({hasText:/Inicia sesión/}).first()).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1)).toBe(false);
 }
});
