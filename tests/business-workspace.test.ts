import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chooseOrganization,businessUrl,agentWorkspaceState,businessTools} from '../src/lib/business-workspace';
import {businessManifest} from '../src/lib/business-manifest';
test('Business workspace validates saved tenant against membership and preserves tenant/entity links',()=>{
 const rows=[{id:'a',name:'Fixture A'},{id:'b',name:'Fixture B'}];
 assert.equal(chooseOrganization(rows,'outsider','b'),'b');
 assert.equal(chooseOrganization(rows,'a','b'),'a');
 assert.equal(chooseOrganization(rows,null,'outsider'),'a');
 assert.equal(chooseOrganization([],null,'a'),'');
 const url=new URL(businessUrl('/business/crm-org','b','appointments'),'https://kowi.one');
 assert.equal(url.searchParams.get('organization_id'),'b');assert.equal(url.searchParams.get('entity'),'appointments');
 assert.ok(businessTools.every(t=>t.path.startsWith('/business/')));
 assert.equal(businessManifest.start_url,'/business/app');assert.equal(businessManifest.id,'/business/app');
});
test('Business readiness distinguishes configuration, recent verification and synthetic installations',()=>{
 const now=new Date('2026-10-04T12:00:00Z');
 const config={name:'SQL/UI fixture',sector:'otro',services:[],hours:'',team:'',faq:[],policies:'',tone:'',automaticActions:[]};
 assert.deepEqual(agentWorkspaceState({status:'active',config:{synthetic:true},last_verified_at:now.toISOString()},now),{synthetic:true,configured:false,verified:false,active:false});
 assert.equal(agentWorkspaceState({status:'active',config,last_verified_at:'2026-10-05T12:00:00Z'},now).active,false);
 assert.equal(agentWorkspaceState({status:'active',config,last_verified_at:'2026-09-01T12:00:00Z'},now).active,false);
 assert.equal(agentWorkspaceState({status:'active',config,last_verified_at:now.toISOString()},now).active,true);
 assert.equal(agentWorkspaceState({status:'paused',config,last_verified_at:now.toISOString()},now).active,false);
});
