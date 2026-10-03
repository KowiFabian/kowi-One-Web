# KOWI School AI — implementation front

Branch: `feat/kowi-school-ai`

Principle: **STUDY → BUILD → TEST → EXECUTE → PROVE**

## Implemented in this branch
- Mobile-first light School entry with conversational goal → adaptive route.
- Evidence-aware diagnostic and provisional Skill Graph. It never self-awards VERIFIED.
- 25 curriculum levels, each with Discover/Learn/Try/Build/Break/Fix/Execute/Explain/Prove/Evidence/Next.
- Skip by Proof entry point.
- KOWI Labs text sandbox: prompts, JSON, API simulation, SQL, agents, workflows, security, business.
- Skills Passport and evidence portfolio.
- Contextual Tutor KOWI server route using the OpenAI Responses API with `store:false`, existing authentication and quota RPC.
- 20 School agents with explicit permissions, risk, budget and lifecycle state.
- Database migration for School CMS, learning data, assessments, evidence, credentials, portfolios, events, agents and links to shared KOWI Projects.
- RLS test for cross-user isolation and PENDING evidence.
- Free / Professional / Business plan architecture without fake billing.

## Content model
Curriculum content is seeded into database tables so later edits do not require code deployment. The TypeScript curriculum is the preview-safe bootstrap until the School migration is approved/applied to the connected database.

## Video curriculum package
The Video Curriculum Agent must output, per lesson: title, objective, script, storyboard, narration, scenes, demonstrations, on-screen text, complementary material, post-quiz, accessibility transcript/captions. A package is **READY FOR PRODUCTION**, never “video produced”, until a renderer actually returns a media artifact.

## Resource curator
Resources store source, author, URL, language, level, usage/license status, last check and availability. Initial links are official/public destinations only; KOWI does not copy third-party course material.

## Security
Deny by default. Students never receive production access. Publishing credentials, sharing private data, external messages, production access and permission changes require Human Approval. School agent configuration is not exposed to browser roles. Student tables use owner RLS. Public curriculum tables are read-only.

## Integration boundaries
This branch deliberately does not edit the central agent registry, root navigation, production Supabase schema or billing. Those are integration points after preview review. Existing `public.projects` is reused instead of creating a conflicting School projects table.

## i18n/accessibility
New School UI uses semantic labels, keyboard-native controls, focusable links/buttons and high contrast. Content model carries locale/language fields. Spanish is implemented first; English copy is the next content pass. Video resources require captions/transcripts before publication.

## Verification gates
Required before merge: CI test, type-check, lint, build; preview HTTP/browser verification; RLS test. Full authenticated E2E (diagnostic → route → lesson → evidence → portfolio) requires the migration on an isolated or approved database environment.
