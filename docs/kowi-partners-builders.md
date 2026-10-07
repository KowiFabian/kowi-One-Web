# KOWI Partners & Builders — Product Specification

Status: approved concept; implementation pending.

## Mission
Allow individuals, agencies, and developers to learn, demonstrate, sell, implement, and distribute KOWI Business and approved AI applications. Never promise earnings.

## Programs
- Partners: referral, commercial sales, and implementation roles.
- Builders: create and submit sector-specific applications for review.
- School: free entry training, assessments, demonstration practice, and competency verification.
- Marketplace (later): curated applications, trials, licensing, payouts, and support ownership.

## Proposed commission policy (not active)
- Ambassador: 20% of eligible subscription revenue for up to 12 months.
- Sales Partner: 30% for up to 12 months.
- Implementer: 20% recurring plus 60% of eligible setup fees.
- Builder: 70% of eligible net application revenue.
All percentages require financial/legal approval. Exclude VAT, refunds, chargebacks, pass-through API/messaging charges. No recruiting-based or multi-level rewards. Pay only after verified collection and refund windows.

## Minimum functional scope
1. Partner enrollment, role, approval status, and consent.
2. Unique referral codes with server-side attribution and anti-fraud controls.
3. CRM leads and opportunities with tenant isolation and explicit consent.
4. Demo catalog: salon booking agent first; then real estate and other verticals.
5. Commission ledger with earned, pending, reversed, paid states; never calculate payout from client-side data.
6. Partner dashboard with attributable customers and paid commissions.
7. Builder submissions, permissions, code/security review, versioning and marketplace moderation.
8. School training with competency-based assessments.
9. Audit log, human approval for sensitive actions, RLS and privacy controls.

## Data design (proposed)
partner_profiles(id, user_id, role, status, region, terms_version, created_at)
partner_referrals(id, partner_id, referral_code, customer_tenant_id, attributed_at, attribution_source)
partner_leads(id, partner_id, tenant_id, status, consent_recorded_at)
commission_events(id, partner_id, invoice_id, eligible_amount, rate, amount, status, event_type, created_at)
builder_apps(id, builder_id, slug, version, status, security_review_status, support_policy)
app_installations(id, app_id, tenant_id, status, approved_by, created_at)
partner_training(id, partner_id, course_id, assessment_status)

## Acceptance criteria
- No partner can access another tenant's data.
- Referrals and commissions cannot be forged or self-awarded.
- Refunds and cancellations reconcile the ledger.
- Partner enrollment is free; commissions only on real sales.
- Builders cannot publish executable integrations without review.
- UI clearly labels proposed commission rates until approved.
- All payments, tax and contractor classifications require jurisdictional review.

## Phased delivery
A. Salon agent demonstration and measurable pilot.
B. Partner enrollment, attribution, dashboard and controlled commissions.
C. School certification and implementer workflow.
D. Builder SDK, submission reviews and curated marketplace.

Do not expose or copy credentials. Do not deploy or enable payments until tests, legal review and approval.
