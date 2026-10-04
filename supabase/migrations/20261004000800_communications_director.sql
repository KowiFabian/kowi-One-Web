begin;
alter table public.director_orders drop constraint director_orders_kind_check;
alter table public.director_orders add constraint director_orders_kind_check check(kind in ('operations','commercial','foundation','communications'));
create or replace function public.propose_director_order(p_org uuid,p_agent uuid,p_request uuid,p_kind text,p_objective text,p_markets text[],p_timezone text) returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid;steps jsonb;existing public.director_orders;begin
 actor:=private.require_director_owner(p_org);
 if p_request is null or p_kind is null or p_kind not in ('operations','commercial','foundation','communications') or p_objective is null or length(btrim(p_objective)) not between 5 and 1000 or p_markets is null or cardinality(p_markets)>8 or exists(select 1 from unnest(p_markets) m where m is null or m not in ('national','europe','asia','africa','north_america','south_america','indonesia','oceania')) or p_timezone is null or not exists(select 1 from pg_catalog.pg_timezone_names where name=p_timezone) then raise invalid_parameter_value;end if;
 perform 1 from public.organizations where id=p_org for update;
 if not exists(select 1 from public.agent_installations where id=p_agent and organization_id=p_org and status='active' and last_verified_at>=now()-interval '7 days' and coalesce(config->>'synthetic','false')<>'true' and exists(select 1 from public.agent_metrics metric where metric.agent_id=public.agent_installations.id and metric.organization_id=p_org and metric.created_at>=now()-interval '7 days')) then raise exception 'Verified active agent required' using errcode='42501';end if;
 select * into existing from public.director_orders where id=p_request;
 if found then
 if existing.organization_id<>p_org or existing.agent_id<>p_agent or existing.requester_id<>actor or existing.kind<>p_kind or existing.objective<>btrim(p_objective) or existing.markets<>p_markets then raise invalid_parameter_value;end if;
 return p_request;end if;
 if (select count(*) from public.director_orders where organization_id=p_org and created_at>now()-interval '24 hours')>=10 then raise exception 'Daily order quota reached' using errcode='54000';end if;
 steps:=case p_kind
 when 'communications' then '[{"type":"task","title":"Contrastar fuentes primarias, fecha y alcance de cada noticia"},{"type":"task","title":"Preparar mensaje Human-First y audiencia de la comunicación"},{"type":"task","title":"Separar hechos, interpretación y recomendaciones editoriales"},{"type":"task","title":"Revisar marca, accesibilidad, privacidad y consentimiento"},{"type":"task","title":"Solicitar aval del contenido exacto y canal antes de publicar"},{"type":"task","title":"Medir atención y utilidad sin inventar métricas"}]'::jsonb
 when 'commercial' then '[{"type":"task","title":"Validar mercados, idiomas, moneda y propuesta comercial"},{"type":"task","title":"Revisar contactos autorizados y consentimiento por finalidad"},{"type":"task","title":"Preparar propuesta y contenido localizado para revisión humana"},{"type":"task","title":"Solicitar aprobación de destinatarios y comunicación exacta"},{"type":"task","title":"Medir respuesta, oportunidad y siguiente paso en CRM"}]'::jsonb
 when 'foundation' then '[{"type":"group","title":"IA Human-First · investigación y verificación"},{"type":"group","title":"Educación y acceso al conocimiento"},{"type":"group","title":"Proyectos de bienestar e impacto comunitario"},{"type":"task","title":"Definir responsables humanos, propósito y criterios de evidencia"},{"type":"task","title":"Preparar invitación voluntaria y aviso de privacidad para aprobación"}]'::jsonb
 else '[{"type":"task","title":"Delimitar alcance, responsable y resultado verificable"},{"type":"task","title":"Revisar agenda, contactos y datos estrictamente necesarios"},{"type":"task","title":"Preparar acciones y aprobaciones específicas"},{"type":"task","title":"Verificar resultado y registrar evidencia"}]'::jsonb end;
 insert into public.director_orders(id,organization_id,agent_id,requester_id,kind,objective,markets,plan,expires_at)
 values(p_request,p_org,p_agent,actor,p_kind,btrim(p_objective),p_markets,jsonb_build_object('version',1,'execution_scope','internal_tasks_and_groups_only','max_steps',6,'steps',steps),now()+interval '7 days');
 insert into public.director_report_preferences(organization_id,timezone) values(p_org,p_timezone) on conflict(organization_id) do nothing;
 insert into public.director_events(organization_id,order_id,event,actor_id,evidence) values(p_org,p_request,'proposed',actor,jsonb_build_object('plan_version',1,'external_execution',false));
 return p_request;
end$$;

commit;
