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
  for (const path of ['/', '/kowi', '/business/agent', '/privacidad', '/control-center', '/business/crm-org', '/business/intelligence', '/business/agents', '/business/pipeline', '/business/agent-chat', '/business/jobs','/test-email','/business/director','/app']) await check(path);
  for (const path of ['/api/director?organization_id=11111111-1111-4111-8111-111111111111','/api/test-email','/api/business/overview', '/api/business/profile', '/api/conversations', '/api/projects', '/api/organizations', '/api/control-center', '/api/control-center/platform', '/api/control-center/security-reports', '/api/organization-agents?organization_id=11111111-1111-4111-8111-111111111111', '/api/intelligence?organization_id=11111111-1111-4111-8111-111111111111', '/api/organization-chat?organization_id=11111111-1111-4111-8111-111111111111&agent_id=22222222-2222-4222-8222-222222222222', '/api/crm/contacts?organization_id=11111111-1111-4111-8111-111111111111', '/api/agent-jobs?organization_id=11111111-1111-4111-8111-111111111111', '/api/crm-stages?organization_id=11111111-1111-4111-8111-111111111111']) await check(path, {}, 401);
  for (const path of ['/api/director?organization_id=11111111-1111-4111-8111-111111111111','/api/test-email','/api/business/leads', '/api/business/actions', '/api/organization-chat?organization_id=11111111-1111-4111-8111-111111111111', '/api/organization-chat/capture?organization_id=11111111-1111-4111-8111-111111111111']) await check(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }, 401);
  await check('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }, 401);
  await check('/api/business/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: '{}' }, 401);
  await check('/api/conversations', { headers: { Authorization: 'Bearer invalid-smoke-token' } }, 401);
  const healthResponse = await fetch(base+'/api/health',{signal:AbortSignal.timeout(20000)});
  assert.equal(healthResponse.status,200);
  assert.match(healthResponse.headers.get('cache-control')||'',/no-store/);
  const health=await healthResponse.json();
  assert.deepEqual(Object.keys(health).sort(),['status','authenticationConfigured','tenantPersistenceConfigured','aiConfigured','commit','observedAt','scope'].sort());
  for(const key of ['authenticationConfigured','tenantPersistenceConfigured','aiConfigured']) assert.equal(typeof health[key],'boolean');
  assert.equal(health.status,health.authenticationConfigured&&health.tenantPersistenceConfigured&&health.aiConfigured?'CONFIGURED':'PARTIALLY_CONFIGURED');
  assert.ok(health.commit===null||/^[a-f0-9]{40}$/.test(health.commit));
  assert.ok(Number.isFinite(Date.parse(health.observedAt)));
  assert.match(health.scope,/not verified/);
  checks.push({path:'/api/health',expected:200,passed:true,configuration:health});
  console.log(JSON.stringify({ observed_at: new Date().toISOString(), base, status: 'VERIFIED', scope: 'Public HTTP and authentication rejection only; authenticated E2E and mobile not tested', checks }, null, 2));
} catch (error) {
  console.log(JSON.stringify({ observed_at: new Date().toISOString(), base, status: 'FAILED', checks, error: error.message }, null, 2));
  process.exitCode = 1;
}
