# KOWI execution board
Observed checkpoint: 2026-10-03 UTC. Status is scoped to the evidence below, not a commercial-readiness declaration.

| Work | Status | Evidence / limit |
| --- | --- | --- |
| Organization RLS recursion repair | VERIFIED | PR27; Postgres tenant tests |
| Universal CRM and pipeline | VERIFIED | PR30, PR40, PR46; companies/activities/local appointment proposals; no external calendar availability |
| Private organization AI and CRM capture | BLOCKED BY OWNER | PR42 deployed; production health reports tenantPersistenceConfigured=false. Provider and OTP E2E not performed |
| Bounded AI jobs and timeout observer | VERIFIED | PR44; database concurrency/retry/lifecycle tests; actual pg_cron reaper succeeded |
| Platform authority bootstrap | BLOCKED BY OWNER | PR31; verified founder account identity not established; no Platform Owner assigned |
| Control Center and Intelligence | DONE | Tenant-scoped routes deployed; observed counts separated from interpretation; no customer E2E yet |
| Database daily security report | VERIFIED | Manual stored report 6de32e78-37a6-4cc9-89e3-5eb334f55859: ATTENTION, zero tables without RLS, no missing target tables. Daily 07:45 UTC scheduled; first scheduled run not yet observed |
| Production HTTP + public mobile/browser checks | VERIFIED | PR47 workflows 37096039112/37096039099; unauthenticated scope, six Desktop/Pixel browser cases |
| Production dependency audit | VERIFIED | PR46 verify run 37095981025; 33 tests passed, lint/type/build passed, production npm audit zero |
| Full development dependency findings | IN PROGRESS | Seven high findings in braces dependency chain; no upstream patched version found at previous audit. Not resolved by production-only audit |
| Legacy action execution authority | IN PROGRESS | Draft PR14; completion RPC still needs coordinated backend hardening and E2E |
| Agent authorized product/FAQ configuration | IN PROGRESS | PR48; pending CI and merge |
| NVIDIA OpenShell runtime | BLOCKED EXTERNAL | Official v0.1.2 researched; Vercel function compatibility not verified. Guard abstraction exists, actual isolated code runtime not installed |
| Google Calendar / Email / WhatsApp / Voice | BLOCKED EXTERNAL | No end-to-end provider verification; do not declare ACTIVE |
| KOWI as first real customer | BLOCKED BY OWNER | No organization or agent installation exists at this checkpoint; fictitious legacy pilot remains disabled |

## Owner configuration step
Supabase Kowi One > Settings > API Keys / Legacy API Keys: copy the server service_role key directly into Vercel kowi-One-Web > Settings > Environment Variables > Add SUPABASE_SERVICE_ROLE_KEY, Production; save and redeploy main. Never prefix it NEXT_PUBLIC, commit it, or paste it into chat. Health configuration presence does not verify key validity.

Founder must authenticate and verify email at https://kowi.one/business#crear. OTP stays on the website. Only the nonsecret account email identifier is needed to bind the founder explicitly; never infer founder from the oldest account or editable user metadata.

## Verified production references
PR46 merge fae9a1992c86d208ca00bb4fc63e87487a3c37b8 was live in /api/health at 04:19:11 UTC.
PR47 merge 2aafd8416432c91237f8a3053b3810137aac4f7e advances verification only; deployment status must be rechecked.
No production-ready claim, customer, sale, AI cost, actual provider response or external booking is inferred from synthetic database fixtures.
