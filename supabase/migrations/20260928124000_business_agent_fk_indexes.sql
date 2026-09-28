create index if not exists business_actions_lead_idx on public.business_actions(lead_id);
create index if not exists business_appointments_lead_idx on public.business_appointments(lead_id);
create index if not exists business_lead_events_lead_idx on public.business_lead_events(lead_id);
create index if not exists business_messages_lead_idx on public.business_messages(lead_id);
