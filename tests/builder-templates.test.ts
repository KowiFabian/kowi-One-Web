import assert from 'node:assert/strict';
import test from 'node:test';
import {builderTemplates,previewBuilderReply,templateById,validateBuilderConfig} from '../src/lib/builder-templates';

test('each KOWI Builder template has a valid business configuration',()=>{
 for(const item of builderTemplates.filter(template=>template.id!=='personalizado')){
  assert.ok(validateBuilderConfig(item.config).success,item.label);
  assert.ok(item.prompts.length>=2);
  assert.ok(item.config.escalation.length>10);
  assert.ok(item.config.policies.length>10);
 }
});

test('builder preview never claims that an appointment was confirmed',()=>{
 const config=templateById('inmobiliaria').config;
 const response=previewBuilderReply(config,'Quiero reservar una visita');
 assert.match(response,/asesor|confirmar|disponibilidad/i);
 assert.doesNotMatch(response,/visita confirmada|reserva confirmada/i);
});

test('builder preview uses verified template hours and prices',()=>{
 const config=templateById('belleza').config;
 assert.match(previewBuilderReply(config,'¿Cuál es vuestro horario?'),/Lunes a viernes/);
 assert.match(previewBuilderReply(config,'¿Cuánto cuesta un Corte?'),/18 €/);
});

test('unknown information is escalated, not fabricated',()=>{
 const config=templateById('taller').config;
 const result=previewBuilderReply(config,'¿Me reparáis un coche sin verlo?');
 assert.match(result,/equipo|técnico|revis/i);
});

test('a custom blank template requires configuration and a disabled FAQ capability escalates',()=>{
 assert.equal(validateBuilderConfig(templateById('personalizado').config).success,false);
 const config={...templateById('belleza').config,automaticActions:[]};
 assert.doesNotMatch(previewBuilderReply(config,'¿Cuánto cuesta un corte?'),/18 €/);
 assert.match(previewBuilderReply(config,'¿Cuánto cuesta un corte?'),/revisión/);
});
