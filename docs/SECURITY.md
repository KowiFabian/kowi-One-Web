# KOWI Security Baseline — 2026-10-01

Status: engineering verification, **not an ISO certification**.

## Verified database controls
- Supabase project: Kowi One (EU region, active/healthy).
- RLS is enabled on every currently listed public application table.
- Tenant/member policies use authenticated user ownership or organization membership predicates.
- Sensitive business actions use a pending-approval state and an explicit transition function.
- Agent activity has an `agent_ledger` table.
- Secrets must remain server-side. Service-role, OpenAI, Meta, Resend and OAuth secrets must never use `NEXT_PUBLIC_`.

## Supabase advisor findings observed 2026-10-01
Security:
1. `chat_quotas`, `business_embed_usage`, and `business_embed_global_usage` have RLS enabled with no direct policies. This currently acts as deny-by-default for Data API callers; access should remain server/RPC controlled unless a reviewed policy is added.
2. Three SECURITY DEFINER functions are callable by authenticated users: `consume_chat_quota`, `save_chat_turn`, `transition_business_action`. Their current definitions explicitly check `auth.uid()`; keep them narrowly scoped and retest after every change.
3. Leaked-password protection is disabled in Supabase Auth and should be enabled before commercial launch if available for the project tier.

Performance:
- Ten foreign-key covering indexes were added to the live Supabase project on 2026-10-01; a re-run of the advisor no longer reports unindexed foreign keys.
- Multiple permissive SELECT policies remain on `agent_installations` and `organization_members`; this is a performance cleanup item, not proof of data exposure.

## Required pre-launch controls
- Verify authenticated routes use server-validated identity, not untrusted client metadata.
- Verify every write endpoint validates payloads and tenant ownership.
- Add rate limits for chat, auth-sensitive endpoints, embeds and public webhooks.
- Redact secrets/PII from logs.
- Test cross-tenant access attempts.
- Enable backup/recovery procedures and document retention.
- Run Supabase security/performance advisors after schema changes.
- Keep external messages, bookings, public posts, payments, permission changes and financial commitments behind Human Approval.

## Voice
A voice sample is biometric/personal data in practical privacy terms and must be processed only with explicit consent, a stated purpose, retention controls and deletion/revocation handling. Voice must never be treated as implicit authorization for a sensitive action.

## Status language
Use only:
- VERIFIED: code + configuration + deployment + test succeeded.
- IMPLEMENTED / EXTERNAL ACTION REQUIRED.
- PENDING.
