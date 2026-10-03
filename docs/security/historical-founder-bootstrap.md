# Founder identity in migration history

Production migration 20260929071935 (kowi_first_party_installation) attempted to associate KOWI with the oldest auth account. It is intentionally excluded from the executable reconstruction: account age does not prove founder identity. The production inspection found zero organizations, so no historical owner is inferred or recreated.

The two preceding missing DDL migrations were retrieved from Supabase's migration history and restored unchanged. The current bootstrap requires an explicitly configured and verified founder identity; its configuration remains empty. New October migrations use fourteen-digit versions and place CRM helpers before dependent lifecycle/report/chat components.

Fresh-schema regression executes application migrations in order without auth accounts and verifies that no founder, organization or agent is fabricated. pg_cron scheduling is verified in Supabase separately because the test database does not provide that extension.
