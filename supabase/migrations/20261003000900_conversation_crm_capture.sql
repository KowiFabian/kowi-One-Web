begin;
alter table public.contacts add column conversation_id uuid;
alter table public.contacts add constraint contacts_conversation_tenant foreign key(conversation_id,organization_id) references public.conversations(id,organization_id);
alter table public.leads add column conversation_id uuid;
alter table public.leads add constraint leads_conversation_tenant foreign key(conversation_id,organization_id) references public.conversations(id,organization_id);
create table private.conversation_capture_requests(
 organization_id uuid not null references public.organizations(id),request_id uuid not null,
 conversation_id uuid not null,contact_id uuid not null,lead_id uuid not null,opportunity_id uuid not null,fingerprint text not null,
 created_at timestamptz not null default now(),primary key(organization_id,request_id),
 foreign key(conversation_id,organization_id) references public.conversations(id,organization_id),
 foreign key(contact_id,organization_id) references public.contacts(id,organization_id),
 foreign key(lead_id,organization_id) references public.leads(id,organization_id),
 foreign key(opportunity_id,organization_id) references public.opportunities(id,organization_id)
);
alter table private.conversation_capture_requests enable row level security;
revoke all on private.conversation_capture_requests from public,anon,authenticated,service_role;
create function public.capture_organization_conversation(p_org uuid,p_actor uuid,p_conversation uuid,p_request uuid,p_name text,p_email text,p_phone text,p_consent boolean,p_title text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare contact uuid;lead uuid;opportunity uuid;stage uuid;fingerprint text;prior private.conversation_capture_requests;
begin
 if coalesce(private.organization_actor_role(p_org,p_actor),'') not in ('owner','admin','configurator','operator') then raise insufficient_privilege;end if;
 if p_name is null or char_length(trim(p_name)) not between 1 and 160 or p_email is null or char_length(p_email)>254 or p_phone is null or char_length(p_phone)>40 or p_consent is null or p_title is null or char_length(trim(p_title)) not between 1 and 160 then raise invalid_parameter_value;end if;
 if not exists(select 1 from public.conversations c where c.id=p_conversation and c.organization_id=p_org) or not exists(select 1 from public.messages m where m.conversation_id=p_conversation and m.organization_id=p_org and m.role='assistant') then raise exception 'Verified organization conversation unavailable';end if;
 fingerprint:=md5(jsonb_build_array(p_conversation,p_name,p_email,p_phone,p_consent,p_title)::text);
 select * into prior from private.conversation_capture_requests where organization_id=p_org and request_id=p_request;
 if found then
 if prior.fingerprint<>fingerprint then raise exception 'Capture request reused' using errcode='40001';end if;
 return jsonb_build_object('contactId',prior.contact_id,'leadId',prior.lead_id,'opportunityId',prior.opportunity_id);
 end if;
 select id into stage from public.crm_stages where organization_id=p_org and position=0;
 if not found then raise exception 'Initial pipeline stage unavailable';end if;
 insert into public.contacts(organization_id,name,email,phone,consent,conversation_id) values(p_org,trim(p_name),p_email,p_phone,p_consent,p_conversation) returning id into contact;
 insert into public.leads(organization_id,title,contact_id,source,conversation_id) values(p_org,trim(p_title),contact,'web',p_conversation) returning id into lead;
 insert into public.opportunities(organization_id,title,contact_id,lead_id,stage_id) values(p_org,trim(p_title),contact,lead,stage) returning id into opportunity;
 insert into private.conversation_capture_requests(organization_id,request_id,conversation_id,contact_id,lead_id,opportunity_id,fingerprint) values(p_org,p_request,p_conversation,contact,lead,opportunity,fingerprint);
 insert into public.agent_ledger(user_id,actor_id,organization_id,agent,action,permission,result,evidence) values(p_actor,p_actor,p_org,'business','conversation_captured','human_capture','completed',jsonb_build_object('conversation_id',p_conversation,'contact_id',contact,'lead_id',lead,'opportunity_id',opportunity));
 return jsonb_build_object('contactId',contact,'leadId',lead,'opportunityId',opportunity);
end$$;
revoke all on function public.capture_organization_conversation(uuid,uuid,uuid,uuid,text,text,text,boolean,text) from public,anon,authenticated;
grant execute on function public.capture_organization_conversation(uuid,uuid,uuid,uuid,text,text,text,boolean,text) to service_role;
commit;
