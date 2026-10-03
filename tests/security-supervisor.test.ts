import {test} from 'node:test';
import assert from 'node:assert/strict';
import {authorizeAttempt,canTransition,type Attempt,type Policy,type RuntimeAdapter} from '../src/lib/agents/security-supervisor';
const p:Policy={tools:['crm.read'],allowMediumRisk:false,maxSteps:5,maxCost:10,timeoutMs:1000,maxConcurrency:2,maxDelegationDepth:1};
const a:Attempt={jobId:'job',organizationId:'org',agentId:'agent',lifecycle:'ACTIVE',tool:'crm.read',risk:'LOW',actionDigest:'digest',startedAt:500,stepsUsed:0,costUsed:0,estimatedCost:1,activeJobs:0,delegationDepth:0};
const r:RuntimeAdapter={id:'test-adapter',verification:{verifiedAt:500,expiresAt:2000,evidenceId:'test-evidence'}};
test('Supervisor permits bounded low-risk work with verified adapter',()=>assert.equal(authorizeAttempt(a,p,r,1000).allowed,true));
test('Inactive and terminated agents cannot run or reactivate',()=>{
 for(const lifecycle of ['DRAFT','PAUSED','REVOKED','TERMINATED'] as const)assert.equal(authorizeAttempt({...a,lifecycle},p,r,1000).allowed,false);
 assert.equal(canTransition('TERMINATED','ACTIVE'),false);assert.equal(canTransition('ACTIVE','PAUSED'),true);
});
test('Supervisor fails closed on invalid state, tools, limits and medium risk',()=>{
 for(const change of [{organizationId:''},{tool:'production.delete'},{stepsUsed:5},{costUsed:10},{estimatedCost:NaN},{activeJobs:2},{delegationDepth:2},{startedAt:0},{risk:'MEDIUM' as const}])assert.equal(authorizeAttempt({...a,...change},p,r,1000).allowed,false);
 assert.equal(authorizeAttempt(a,{...p,maxCost:NaN},r,1000).allowed,false);
});
test('High risk requires exact unrevoked human approval',()=>{
 const approval={jobId:a.jobId,organizationId:a.organizationId,agentId:a.agentId,tool:a.tool,actionDigest:a.actionDigest,approvedBy:'human',expiresAt:2000,revoked:false};
 assert.equal(authorizeAttempt({...a,risk:'HIGH',approval},p,r,1000).allowed,true);
 for(const change of [{organizationId:'other'},{tool:'other'},{actionDigest:'other'},{jobId:'other'},{agentId:'other'},{approvedBy:''},{expiresAt:1000},{revoked:true}])assert.equal(authorizeAttempt({...a,risk:'HIGH',approval:{...approval,...change}},p,r,1000).allowed,false);
});
test('Missing, expired, future or invalid runtime evidence blocks execution',()=>{
 assert.equal(authorizeAttempt(a,p,undefined,1000).allowed,false);
 for(const change of [{verifiedAt:-1},{verifiedAt:1001},{expiresAt:1000},{evidenceId:''}])assert.equal(authorizeAttempt(a,p,{...r,verification:{...r.verification,...change}},1000).allowed,false);
});
