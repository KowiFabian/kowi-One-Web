export type SchoolAgentStatus='DRAFT'|'ACTIVE'|'PAUSED'|'REVOKED'|'TERMINATED';
export type SchoolAgent={agent_id:string;role:string;permissions:string[];tools:string[];risk_level:'low'|'medium'|'high';budget:{max_calls_per_session:number};status:SchoolAgentStatus};
const make=(agent_id:string,role:string,permissions:string[],risk_level:SchoolAgent['risk_level']='low'):SchoolAgent=>({agent_id,role,permissions,tools:[],risk_level,budget:{max_calls_per_session:20},status:'ACTIVE'});
export const schoolAgents:SchoolAgent[]=[
make('school-orchestrator','Education Orchestrator',['route_learning','read_authorized_progress'],'medium'),
make('school-diagnostic','Diagnostic Agent',['score_diagnostic','read_authorized_evidence']),
make('school-learning-architect','Learning Architect',['build_learning_path','read_authorized_progress']),
make('school-tutor','Tutor Agent',['explain','generate_examples']),
make('school-socratic','Socratic Tutor',['ask_questions','coach_reasoning']),
make('school-resource-curator','Resource Curator',['propose_resources']),
make('school-content','Content Agent',['draft_content'],'medium'),
make('school-video','Video Curriculum Agent',['draft_video_package']),
make('school-practice','Practice Agent',['generate_practice']),
make('school-lab','Lab Agent',['generate_isolated_lab'],'medium'),
make('school-project','Project Agent',['draft_project'],'medium'),
make('school-code-mentor','Code Mentor',['review_code','explain_code'],'medium'),
make('school-business-mentor','Business Mentor',['business_case_feedback']),
make('school-security-mentor','Security Mentor',['security_feedback'],'medium'),
make('school-evaluator','Evaluator',['score_attempt'],'medium'),
make('school-evidence-verifier','Evidence Verifier',['verify_evidence'],'high'),
make('school-portfolio','Portfolio Agent',['compose_portfolio']),
make('school-career','Career Agent',['map_skills_to_roles']),
make('school-quality','Quality Agent',['audit_content']),
make('school-security','School Security Agent',['audit_permissions','pause_agent'],'high'),
];
export const schoolSafety={default:'deny',humanApproval:['publish_credential','share_private_data','external_message','production_access','change_permissions'],studentProductionAccess:false};
