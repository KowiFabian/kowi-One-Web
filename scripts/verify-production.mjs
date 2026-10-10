#!/usr/bin/env node
// Non-destructive production smoke test. No credentials or customer data.
const base = (process.env.KOWI_BASE_URL || 'https://kowi.one').replace(/\/$/, '');
const paths = ['/', '/business', '/business/app'];
let failed = 0;
for (const path of paths) {
  const url = base + path;
  try {
    const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(12000) });
    const location = response.headers.get('location') || '';
    const protectedRoute = path === '/business/app';
    const ok = response.status === 200 || (protectedRoute && [301, 302, 303, 307, 308, 401, 403].includes(response.status));
    console.log(JSON.stringify({ path, status: response.status, redirect: location ? new URL(location, url).pathname : null, result: ok ? 'PASS' : 'FAIL' }));
    if (!ok) failed++;
  } catch (error) {
    console.log(JSON.stringify({ path, result: 'FAIL', error: error instanceof Error ? error.message : 'request failed' }));
    failed++;
  }
}
if (failed) {
  console.error('Smoke test failed:', failed, 'route(s). Investigate before production approval.');
  process.exitCode = 1;
} else {
  console.log('Basic HTTP smoke checks passed. This does NOT validate authentication, CRM, AI, booking or payments.');
}
