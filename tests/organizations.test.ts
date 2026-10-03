import {test} from 'node:test';
import assert from 'node:assert/strict';
import {organizationSchema} from '../src/lib/organization-schema';
test('Organization input rejects ownership and role injection and invalid names',()=>{
 for(const value of [{name:''},{name:'a'},{name:'a'.repeat(121)},{name:'Empresa\u0000'},{name:'Empresa',owner_id:'forged'},{name:'Empresa',role:'owner'}])assert.equal(organizationSchema.safeParse(value).success,false);
 assert.deepEqual(organizationSchema.parse({name:'  Empresa real  '}),{name:'Empresa real'});
 assert.equal(organizationSchema.safeParse({name:'日本企業'}).success,true);
});
