import { defineConfig, devices } from '@playwright/test';
// Playwright 1.56 requires this flag to intercept service-worker-owned requests.
process.env.PW_EXPERIMENTAL_SERVICE_WORKER_NETWORK_EVENTS='1';
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
