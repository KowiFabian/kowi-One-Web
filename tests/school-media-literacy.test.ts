import test from 'node:test';
import assert from 'node:assert/strict';
import {literacyQuestions,checkLiteracyAnswer} from '../src/lib/school-media-literacy';

test('every lesson has distinct answers and a supported explanation',()=>{
 assert.equal(literacyQuestions.length,5);
 for(const q of literacyQuestions){
  assert.equal(q.options.length,3);
  assert.equal(new Set(q.options.map(x=>x.id)).size,3);
  assert.ok(q.options.some(x=>x.id===q.correct));
  assert.ok(q.explanation.length>30);
  assert.ok(q.scenario.startsWith('Ejemplo ficticio:'));
  assert.equal(checkLiteracyAnswer(q.id,q.correct)?.correct,true);
  for(const a of q.options.filter(x=>x.id!==q.correct))assert.equal(checkLiteracyAnswer(q.id,a.id)?.correct,false);
 }
});
test('unknown lesson is not graded',()=>{assert.equal(checkLiteracyAnswer('no-existe','a'),null);});
