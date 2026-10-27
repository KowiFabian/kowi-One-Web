import test from 'node:test';
import assert from 'node:assert/strict';
import {courseVersion,diagnostic,grade,isComplete,lessons,readProgress,recommend} from '../src/lib/school/free-course';
test('Free curriculum has complete original lessons, stable IDs and acyclic prerequisites',()=>{
 const seen=new Set<string>();
 for(const l of lessons){assert.ok(!seen.has(l.id));assert.ok(l.prerequisite===null||seen.has(l.prerequisite));seen.add(l.id);assert.ok(l.explanation.join(' ').length>300);assert.ok(l.practice.length>40);assert.equal(l.rubric.length,3);assert.equal(l.options.length,3);assert.equal(new URL(l.source.url).protocol,'https:');assert.equal(grade(l.id,l.correct)?.correct,true);}
});
test('diagnosis never grants competencies, and invalid/incomplete answers recommend foundations',()=>{assert.deepEqual(recommend([]),lessons.map(l=>l.id));assert.deepEqual(recommend(diagnostic.map(q=>q.correct)),['capstone-free']);});
test('completion distinguishes correct quiz from declared practical evidence',()=>{
 const l=lessons[0],entry={answer:l.correct,practice:'Un proyecto ficticio con datos inventados y revisión humana.',checks:[true,true,true],date:new Date().toISOString()};
 assert.equal(isComplete(l.id,entry),true);assert.equal(isComplete(l.id,{...entry,practice:''}),false);assert.equal(isComplete(l.id,{...entry,checks:[true,false,true]}),false);assert.equal(isComplete(l.id,{...entry,answer:0}),false);assert.equal(grade('unknown',1),null);assert.equal(grade(l.id,NaN),null);
});
test('corrupt, foreign-version and forged storage cannot crash or complete a lesson',()=>{
 for(const raw of ['{','null','[]','{"entries":{}}'])assert.deepEqual(readProgress(raw),{});
 assert.deepEqual(readProgress(JSON.stringify({version:courseVersion,entries:{'ia-cero':{answer:1,practice:'x',checks:['true',true,true],date:'bad'}}})),{});
});
