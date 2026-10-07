# KOWI Business — WhatsApp Meta pilot

This branch is isolated from main and is **not production-ready**.

## Setup
1. Create a Meta Developers Business app, add WhatsApp, and use its test number.
2. Configure Vercel environment variables (never commit secrets):
   - META_WHATSAPP_VERIFY_TOKEN (random secret chosen by KOWI)
   - META_APP_SECRET (from Meta app settings)
   - META_WHATSAPP_ACCESS_TOKEN (Meta test token, expires)
   - META_GRAPH_API_VERSION (supported Graph API version)
3. Deploy this branch to a protected preview or staging environment with an HTTPS URL.
4. Configure Meta webhook callback at /api/integrations/whatsapp/webhook, set verify token and subscribe to messages.
5. GET verifies Meta's challenge; POST validates X-Hub-Signature-256 and acknowledges incoming text events.

## What is implemented
- GET challenge verification
- POST HMAC signature verification and minimal message parsing
- Outbound WhatsApp text transport helper

## What is NOT implemented
- Persisted event deduplication, queues, tenant and phone number mapping
- Contact registration in Supabase, consent and retention controls
- Dedicated business AI prompt and reservation availability workflow
- Automated responses, tests against Meta, deployment verification

**Do not enable automated replies before** tenant isolation, persistent idempotency,
rate limiting, observability and human handoff are tested. Never use the KOWI One
personal planning agent as the business sales assistant.
