/**
 * Commercial planning only. These percentages are examples, NOT approved
 * contracts, referral entitlements, payouts or customer payment data.
 * All amounts are excluding VAT and client counts assume paid active clients.
 */
export const BUILDER_ECONOMICS = {
  monthlyFee: 99,
  partnerShare: 0.15,
  builderShare: 0.20,
  cardEEAFeeRate: 0.015,
  cardEEAFixedFee: 0.25,
  commissionDurationMonths: 12,
} as const;

export type BuilderEconomicsInput = {
  clients: number;
  hasPartner: boolean;
  hasBuilder: boolean;
  assumedVariableCostPerClient: number;
};

export type BuilderEconomicsResult = {
  billed: number;
  partner: number;
  builder: number;
  platformBeforeCosts: number;
  cardProcessingEstimate: number;
  operatingCostAssumption: number;
  platformContributionBeforeFixedCostsAndTaxes: number;
  partner12Months: number;
  builder12Months: number;
  platform12MonthsBeforeFixedCostsAndTaxes: number;
};

export function calculateBuilderEconomics(input:BuilderEconomicsInput):BuilderEconomicsResult{
  const clients=Math.min(1000,Math.max(0,Math.floor(Number.isFinite(input.clients)?input.clients:0)));
  const cost=Math.min(99,Math.max(0,Number.isFinite(input.assumedVariableCostPerClient)?input.assumedVariableCostPerClient:0));
  const billed=clients*BUILDER_ECONOMICS.monthlyFee;
  const partner=input.hasPartner?billed*BUILDER_ECONOMICS.partnerShare:0;
  const builder=input.hasBuilder?billed*BUILDER_ECONOMICS.builderShare:0;
  const platformBeforeCosts=billed-partner-builder;
  const cardProcessingEstimate=clients*(BUILDER_ECONOMICS.monthlyFee*BUILDER_ECONOMICS.cardEEAFeeRate+BUILDER_ECONOMICS.cardEEAFixedFee);
  const operatingCostAssumption=clients*cost;
  const platformContributionBeforeFixedCostsAndTaxes=platformBeforeCosts-cardProcessingEstimate-operatingCostAssumption;
  const n=BUILDER_ECONOMICS.commissionDurationMonths;
  return {
    billed,partner,builder,platformBeforeCosts,cardProcessingEstimate,
    operatingCostAssumption,platformContributionBeforeFixedCostsAndTaxes,
    partner12Months:partner*n,builder12Months:builder*n,
    platform12MonthsBeforeFixedCostsAndTaxes:platformContributionBeforeFixedCostsAndTaxes*n,
  };
}
