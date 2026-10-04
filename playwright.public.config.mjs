import { defineConfig, devices } from '@playwright/test';
const baseURL=process.env.KOWI_PUBLIC_TEST_BASE_URL||'https://kowi.one';
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'public.spec.mjs',
  timeout: 45000,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'public-browser-report' }]],
  use: { baseURL, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: baseURL.startsWith('http://127.0.0.1:') ? {command:'npm run build && npm run start',url:baseURL,timeout:240000,reuseExistingServer:false} : undefined,
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
  ],
});
