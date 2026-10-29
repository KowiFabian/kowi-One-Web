import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('Business company creation verifies a fresh authenticated list before success',async()=>{
 const source=await readFile('src/components/BusinessWorkspace.tsx','utf8');
 assert.match(source,/const row=await api<WorkspaceOrganization>\('\/api\/organizations',\{method:'POST'/);
 assert.match(source,/const fresh=await api<WorkspaceOrganization\[]>\('\/api\/organizations'\)/);
 assert.match(source,/fresh\.some\(item=>item\.id===row\.id\)/);
 assert.match(source,/setOrgs\(fresh\);setOrg\(row\.id\)/);
 assert.match(source,/Actualiza la página antes de intentar crearla de nuevo/);
});
test('Company creation errors appear next to the input, in red and accessible',async()=>{
 const source=await readFile('src/components/BusinessWorkspace.tsx','utf8');
 assert.match(source,/id="organization-create-error" role="alert" aria-live="assertive"/);
 assert.match(source,/aria-invalid=\{!!createError\}/);
 assert.match(source,/aria-describedby=\{createError\?'organization-create-error':undefined\}/);
 assert.match(source,/bg-red-950\/80/);
 assert.match(source,/Comprobando registro…/);
});

test('Second business organization form also verifies persistence and shows inline errors',async()=>{
 const source=await readFile('src/components/OrganizationSetup.tsx','utf8');
 assert.match(source,/const fresh=await api<OrganizationSummary\[]>\('\/api\/organizations'\)/);
 assert.match(source,/fresh\.some\(item=>item\.id===row\.id\)/);
 assert.match(source,/id="setup-create-error" role="alert" aria-live="assertive"/);
 assert.match(source,/bg-red-950\/80/);
});

test('Business login and OTP failures are red alerts, not success notices',async()=>{
 const source=await readFile('src/components/AuthGate.tsx','utf8');
 assert.match(source,/const \[noticeError,setNoticeError\] = useState\(false\)/);
 assert.match(source,/role=\{noticeError\?'alert':'status'\}/);
 assert.match(source,/bg-red-950\/80/);
 assert.match(source,/catch \(error\) \{ setNoticeError\(true\)/);
});
