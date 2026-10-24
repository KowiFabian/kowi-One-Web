import test from 'node:test';
import assert from 'node:assert/strict';
import {assessEvidence,makeEvidenceDossier,type EvidenceReview} from '../src/lib/news-verifier';

const good:EvidenceReview={claim:'La compañía anunció una nueva plataforma el 22 de octubre de 2026.',sources:[
 {url:'https://example.org/press/launch',kind:'primary',excerpt:'Comunicado oficial, fechado y firmado, sobre el lanzamiento.',originalLocated:true},
 {url:'https://news.example.net/report',kind:'independent_report',excerpt:'Reportaje original con verificación y entrevistas propias.',originalLocated:true},
]};
test('two traced sources still require human review; never authorize publication',()=>{
 const x=assessEvidence(good,new Date('2026-10-24'));
 assert.equal(x.readiness,'human_review_required'); assert.equal(x.publicationAuthorized,false);
});
test('one source and copied coverage are blocked',()=>{
 assert.equal(assessEvidence({...good,sources:good.sources.slice(0,1)}).readiness,'blocked');
 assert.equal(assessEvidence({...good,sources:[good.sources[0],{...good.sources[1],derivedFrom:'example.org'}]}).readiness,'blocked');
});
test('unsafe links and missing originals are blocked',()=>{
 const x=assessEvidence({...good,sources:[{...good.sources[0],url:'http://127.0.0.1/internal'},{...good.sources[1],excerpt:'',originalLocated:false}]});
 assert.equal(x.readiness,'blocked'); assert.equal(x.validSourceCount,0);
});
test('testimony needs actual human verification',()=>{
 const x=assessEvidence({...good,sources:[{...good.sources[0],kind:'eyewitness'},good.sources[1]]});
 assert.equal(x.readiness,'blocked'); assert.match(x.reasons.join(' '),/testimonios/);
});
test('future date and URL shortener are blocked',()=>{
 const x=assessEvidence({...good,claimDate:'2030-01-01',sources:[{...good.sources[0],url:'https://bit.ly/abc'},good.sources[1]]},new Date('2026-10-24'));
 assert.equal(x.readiness,'blocked');
});

test('exported dossier explicitly denies verification or permission to publish',()=>{
 const dossier=makeEvidenceDossier(good,new Date('2026-10-24T00:00:00Z'));
 assert.match(dossier,/DOSSIER NO CONFIRMADO/);
 assert.match(dossier,/Publicacion autorizada: NO/);
 assert.match(dossier,/Revisar manualmente/);
 assert.match(dossier,/Fuente 1:/);
 assert.ok(dossier.split(String.fromCharCode(10)).length>15);
});
