import assert from 'node:assert/strict';
const base = 'https://kowi.one';
const checks = [];
async function check(path, options = {}, expected = 200) {
  const response = await fetch(base + path, { ...options, redirect: 'manual', signal: AbortSignal.timeout(20000) });
  assert.equal(response.status, expected, path + ' returned unexpected status');
  if (expected === 401) {
    assert.match(response.headers.get('cache-control') || '', /no-store/);
    const payload = await response.json();
    assert.equal(typeof payload.error, 'string');
    assert.ok(Object.keys(payload).every(key => key === 'error'), 'Authentication failure exposed additional fields');
  } else {
    assert.match(response.headers.get('content-type') || '', /text\/html/);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(response.headers.get('x-frame-options'), 'DENY');
  }
  checks.push({ path, method: options.method || 'GET', expected, passed: true });
}
try {
  for (const path of ['/', '/kowi', '/business/agent', '/privacidad']) await check(path);
  for (const path of ['/api/business/overview', '/api/business/profile', '/api/business/leads', '/api/business/actions', '/api/conversations', '/api/projects']) await check(path, {}, 401);
  await check('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }, 401);
  await check('/api/business/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: '{}' }, 401);
  await check('/api/conversations', { headers: { Authorization: 'Bearer invalid-smoke-token' } }, 401);
  console.log(JSON.stringify({ observed_at: new Date().toISOString(), base, status: 'VERIFIED', scope: 'Public HTTP and authentication rejection only; authenticated E2E and mobile not tested', checks }, null, 2));
} catch (error) {
  console.log(JSON.stringify({ observed_at: new Date().toISOString(), base, status: 'FAILED', checks, error: error.message }, null, 2));
  process.exitCode = 1;
}
