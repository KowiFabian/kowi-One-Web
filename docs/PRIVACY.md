# KOWI Privacy Engineering Baseline

This document is an engineering baseline for EU operation; it is not legal certification.

## Principles
- Data minimization and purpose limitation.
- Explicit permission for microphone, camera, precise location, contacts and connected accounts.
- Browser language / Accept-Language may be used to localize UI without requesting precise geolocation.
- Do not use precise location merely to choose language.
- Human Approval is separate from microphone/voice consent.
- Users need visibility into active permissions, agent usage, activity history and revocation.
- Provide export, correction and deletion workflows.
- Define retention periods by data class.
- Keep processors/subprocessors and international transfers documented.
- Never train or repurpose customer business data outside the declared purpose without an appropriate lawful basis and notice.

## Data boundaries
User memory, business memory, project memory and conversation memory should be separable. Organization-scoped records must carry tenant/organization ownership and be protected with RLS.

## Localization
Default locale selection order:
1. explicit user preference;
2. authenticated profile preference;
3. browser/server Accept-Language;
4. Spanish fallback.
Automatic localization does not require camera, microphone or precise-location permission.

## Voice identity
Custom branded voice requires explicit recorded consent from the voice owner and a separate reference sample when the selected provider requires it. Store provider voice IDs rather than exposing source recordings to the browser.
