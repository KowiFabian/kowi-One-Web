import { writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const audit = spawnSync('npm', ['audit', '--json'], { encoding: 'utf8', timeout: 60000 });
let parsed;
try { parsed = JSON.parse(audit.stdout); } catch { parsed = null; }
const usable = !audit.error && parsed?.metadata?.vulnerabilities && !parsed.error;
const vulnerabilities = usable ? parsed.metadata.vulnerabilities : null;
const critical = vulnerabilities?.critical || 0;
const high = vulnerabilities?.high || 0;
const status = !usable ? 'ATTENTION' : critical > 0 ? 'CRITICAL' : Object.values(vulnerabilities).some(Number) ? 'ATTENTION' : 'OK';
const findings = usable ? Object.entries(parsed.vulnerabilities || {}).map(([name, item]) => ({
  name, severity: item.severity, direct: item.isDirect, fix_available: item.fixAvailable,
  advisories: item.via.filter(value => typeof value === 'object').map(value => ({ title: value.title, url: value.url, range: value.range })),
})) : [];
const unknown = [
  'Incidentes críticos', 'Intentos bloqueados', 'Accesos anómalos', 'Cambios de permisos',
  'Posibles exposiciones de secretos', 'Errores relevantes', 'Estado Supabase/RLS', 'Estado APIs',
  'Actividad anómala de agentes', 'Acceso/exportación de información', 'Acciones pendientes de aprobación',
  'Cambios de código sensibles'
].map(category => ({ category, coverage: 'UNOBSERVED', observation: null, interpretation: 'Este job no tiene acceso autorizado a la fuente necesaria.' }));
const report = {
  title: 'KOWI DAILY SECURITY REPORT', schema_version: 1, observed_at: new Date().toISOString(),
  status: critical > 0 ? 'CRITICAL' : 'ATTENTION', dependency_status: status, scope: 'Repository dependency audit including development dependencies. Overall KOWI security is not certified by this report.',
  repository: 'KowiFabian/kowi-One-Web', commit: process.env.GITHUB_SHA || null,
  observed_data: { dependency_audit: { coverage: usable ? 'OBSERVED' : 'FAILED', counts: vulnerabilities, findings } },
  interpretation: usable ? 'Avisos del registro npm sobre dependencias instaladas; no acreditan explotación ni fuga de información.' : 'No se pudo obtener una auditoría válida; no se puede afirmar ausencia de vulnerabilidades.',
  confirmed_incidents: null, indicators: findings.length, unobserved: unknown,
  automatic_actions: ['Dependency audit; evidence artifact only'],
  pending_approvals: null,
  recommendations: [
    ...(critical || high ? ['Revisar dependencias afectadas y validar cambios en una rama antes de actualizar.'] : []),
    'Completar cobertura con fuentes autorizadas de infraestructura, RLS, autenticación y operaciones de agentes.'
  ],
  evidence: { workflow_run: process.env.GITHUB_RUN_ID ? 'https://github.com/KowiFabian/kowi-One-Web/actions/runs/' + process.env.GITHUB_RUN_ID : null, command: 'npm audit --json', source: 'npm registry', exit_status: audit.status },
};
writeFileSync('daily-security-report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (!usable || critical > 0 || high > 0) process.exitCode = 1;
