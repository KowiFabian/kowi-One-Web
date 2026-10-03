import 'server-only';
export type Lifecycle='DRAFT'|'ACTIVE'|'PAUSED'|'REVOKED'|'TERMINATED';
export type Risk='LOW'|'MEDIUM'|'HIGH';
type Identity={jobId:string;organizationId:string;agentId:string};
export type Approval=Identity & {tool:string;actionDigest:string;approvedBy:string;expiresAt:number;revoked:boolean};
export type Policy={tools:readonly string[];allowMediumRisk:boolean;maxSteps:number;maxCost:number;timeoutMs:number;maxConcurrency:number;maxDelegationDepth:number};
export type Attempt=Identity & {lifecycle:Lifecycle;tool:string;risk:Risk;actionDigest:string;startedAt:number;stepsUsed:number;costUsed:number;estimatedCost:number;activeJobs:number;delegationDepth:number;approval?:Approval};
export type RuntimeAdapter={id:string;verification:{verifiedAt:number;expiresAt:number;evidenceId:string}};
const nonempty=(s:unknown):s is string=>typeof s==='string'&&s.trim().length>0;
const nonnegative=(n:number)=>Number.isFinite(n)&&n>=0;
const integer=(n:number)=>Number.isSafeInteger(n)&&n>=0;
// Counters, policies and approvals must come from trusted backend state.
// The executor must atomically reserve capacity and recheck revocation before using a tool.
// This pure check does not implement a sandbox or persistent quotas.
export function authorizeAttempt(a:Attempt,p:Policy,r:RuntimeAdapter|undefined,now=Date.now()):{allowed:boolean;reason?:string}{
 const deny=(reason:string)=>({allowed:false,reason});
 if(![a.jobId,a.organizationId,a.agentId,a.tool,a.actionDigest].every(nonempty))return deny('INVALID_IDENTITY');
 if(a.lifecycle!=='ACTIVE')return deny('INACTIVE');
 if(!['LOW','MEDIUM','HIGH'].includes(a.risk))return deny('INVALID_RISK');
 if(!nonnegative(now)||!nonnegative(a.startedAt)||a.startedAt>now)return deny('INVALID_TIME');
 if(!integer(p.maxSteps)||p.maxSteps===0||!integer(p.maxConcurrency)||p.maxConcurrency===0||!integer(p.maxDelegationDepth)||!nonnegative(p.maxCost)||!Number.isFinite(p.timeoutMs)||p.timeoutMs<=0||!Array.isArray(p.tools)||typeof p.allowMediumRisk!=='boolean')return deny('INVALID_POLICY');
 if(![a.stepsUsed,a.activeJobs,a.delegationDepth].every(integer)||![a.costUsed,a.estimatedCost].every(nonnegative))return deny('INVALID_USAGE');
 if(!p.tools.includes(a.tool))return deny('TOOL_DENIED');
 if(a.stepsUsed>=p.maxSteps||a.costUsed+a.estimatedCost>p.maxCost||now-a.startedAt>=p.timeoutMs||a.activeJobs>=p.maxConcurrency||a.delegationDepth>p.maxDelegationDepth)return deny('LIMIT_EXCEEDED');
 if(a.risk==='MEDIUM'&&!p.allowMediumRisk)return deny('POLICY_APPROVAL_REQUIRED');
 if(a.risk==='HIGH'){
 const approval=a.approval;
 if(!approval||approval.revoked!==false||!nonempty(approval.approvedBy)||!Number.isFinite(approval.expiresAt)||approval.expiresAt<=now||approval.jobId!==a.jobId||approval.organizationId!==a.organizationId||approval.agentId!==a.agentId||approval.tool!==a.tool||approval.actionDigest!==a.actionDigest)return deny('HUMAN_APPROVAL_REQUIRED');
 }
 if(!r||!nonempty(r.id)||!r.verification||!nonempty(r.verification.evidenceId)||!nonnegative(r.verification.verifiedAt)||r.verification.verifiedAt>now||!Number.isFinite(r.verification.expiresAt)||r.verification.expiresAt<=now)return deny('RUNTIME_UNVERIFIED');
 return {allowed:true};
}
const transitions:Record<Lifecycle,readonly Lifecycle[]>={
 DRAFT:['ACTIVE','REVOKED','TERMINATED'],ACTIVE:['PAUSED','REVOKED','TERMINATED'],
 PAUSED:['ACTIVE','REVOKED','TERMINATED'],REVOKED:['TERMINATED'],TERMINATED:[]
};
export function canTransition(from:Lifecycle,to:Lifecycle){return transitions[from]?.includes(to)??false;}
