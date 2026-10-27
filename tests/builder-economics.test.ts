import assert from 'node:assert/strict';
import test from 'node:test';
import {BUILDER_ECONOMICS,calculateBuilderEconomics} from '../src/lib/builder-economics';

const make=(clients:number,hasPartner=true,hasBuilder=true,assumedVariableCostPerClient=15)=>
 calculateBuilderEconomics({clients,hasPartner,hasBuilder,assumedVariableCostPerClient});

test('full KOWI revenue scenario distributes 99€ net of VAT at 65/15/20',()=>{
 const r=make(10);
 assert.equal(r.billed,990);
 assert.equal(r.partner,148.5);
 assert.equal(r.builder,198);
 assert.equal(r.platformBeforeCosts,643.5);
 assert.equal(Number(r.cardProcessingEstimate.toFixed(2)),20.47);
 assert.equal(Number(r.platformContributionBeforeFixedCostsAndTaxes.toFixed(2)),473.03);
});
test('fees are not charged for absent partners or builders',()=>{
 const r=make(2,false,false,0);
 assert.equal(r.partner,0);
 assert.equal(r.builder,0);
 assert.equal(r.platformBeforeCosts,198);
 assert.ok(r.cardProcessingEstimate>0);
});
test('zero customers never creates commissions or platform revenue',()=>{
 const r=make(0);
 assert.deepEqual([r.billed,r.partner,r.builder,r.platformBeforeCosts,r.platformContributionBeforeFixedCostsAndTaxes],[0,0,0,0,0]);
});
test('malformed and out-of-range inputs are bounded, without negative customers',()=>{
 assert.equal(make(-100).billed,0);
 assert.equal(make(50000).billed,99000);
 assert.equal(make(Number.NaN).billed,0);
 assert.ok(Number.isFinite(make(1,true,true,Number.POSITIVE_INFINITY).platformContributionBeforeFixedCostsAndTaxes));
});
test('commission period 12 months is illustrative, not contractual',()=>{
 const r=make(1);
 assert.equal(r.partner12Months,r.partner*BUILDER_ECONOMICS.commissionDurationMonths);
 assert.equal(r.builder12Months,r.builder*BUILDER_ECONOMICS.commissionDurationMonths);
});
