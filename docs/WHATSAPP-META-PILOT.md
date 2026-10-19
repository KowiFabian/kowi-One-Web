# KOWI IA — WhatsApp Meta pilot (not production-ready)

This test branch is based on the current main rather than the stale feature/whatsapp-meta-pilot branch.

## What is ready in code
- GET webhook verification with a private verify token.
- POST webhook HMAC-SHA256 validation on raw body and a 256 KiB limit.
- Parse text messages only; ignore statuses/unsupported messages.
- Persist authenticated incoming text in the private Supabase inbox with a unique Meta message ID; duplicate delivery is ignored.
- Enforce a **single explicitly bound test organization** and exact Meta test phone number.
- Authenticated owner/admin can read test messages and explicitly approve ONE outgoing reply per incoming message. A unique outbox row prevents automatic retries if delivery is uncertain.
- Server-side send to Meta returns and stores the provider message ID.

## Not verified and not switched on
This branch is NOT merged into main and no database migration or Meta token changes have been applied.
No AI auto-replies, confirmed calendar reservations, billing, or background processing. Do not label WhatsApp ACTIVE until real provider E2E passes.

## Owner configuration (only in approved test/preview)
1. In Meta Developers > KOWI > WhatsApp > API setup locate test Phone Number ID and a temporary access token. Add YOUR WhatsApp as an allowed test recipient only if you consent. Do not migrate any personal or customer number.
2. In Vercel **Preview** configure the variables below. Secrets must not enter GitHub or chat. No NEXT_PUBLIC prefix.
3. After reviewing/applying `20261020000000_whatsapp_meta_test_pilot.sql` to a disposable/approved database, bind the test number to an existing verified KOWI organization using a privileged DB admin:
`insert into private.whatsapp_pilot_bindings(phone_number_id,organization_id,enabled) values ('<META_TEST_PHONE_NUMBER_ID>','<VERIFIED_KOWI_ORG_UUID>',true) on conflict(phone_number_id) do update set organization_id=excluded.organization_id,enabled=true;`
4. Deploy preview and configure Meta Webhook Callback URL:
`https://<preview-host>/api/integrations/whatsapp/webhook`
Use the EXACT `META_WHATSAPP_VERIFY_TOKEN` value and subscribe to **messages**. Never use the custom protected preview hostname unless Meta can reach it publicly over HTTPS.
5. From your WhatsApp send a test message to the Meta **test sender**; GET `/api/integrations/whatsapp/pilot?organization_id=<org>` as logged-in owner/admin, see stored inbound, explicitly approve reply, and verify delivered WhatsApp message and provider ID.

## Vercel variables
- `META_WHATSAPP_VERIFY_TOKEN`: chosen random secret for GET verification.
- `META_APP_SECRET`: KOWI Meta app secret for POST signatures.
- `META_WHATSAPP_ACCESS_TOKEN`: Meta-issued test token, expires.
- `META_WHATSAPP_TEST_PHONE_NUMBER_ID`: Meta test phone Number ID, digits only.
- `KOWI_WHATSAPP_TEST_ORGANIZATION_ID`: existing verified KOWI test organization UUID.
- `META_GRAPH_API_VERSION`: pinned supported API version (e.g. v26.0).
- `META_WHATSAPP_PILOT_ENABLED=true` **only** when credentials, binding, storage and review are confirmed.
- Existing `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are required.

## Safety
Do not enable on the production domain for real customers. Test data retention is seven days by policy; the `expires_at` column **does not delete data automatically**. Schedule secure deletion/retention cleanup before external users. Only owner/admin can approve sends, no unattended auto-replies. If outbox says `uncertain`, inspect Meta before any new attempt to avoid duplicate messages.
