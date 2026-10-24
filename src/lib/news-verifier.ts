/** KOWI Verifica: deterministic evidence triage. A link alone never proves a claim. */
export type EvidenceKind = 'primary' | 'independent_report' | 'eyewitness' | 'fact_check';
export type EditorialEvidence = {
  url: string;
  kind: EvidenceKind;
  excerpt: string;
  originalLocated: boolean;
  /** A reprint should identify its original newsroom or publisher. */
  derivedFrom?: string;
};
export type EvidenceReview = { claim: string; sources: EditorialEvidence[]; claimDate?: string };
export type EvidenceAssessment = {
  readiness: 'blocked' | 'human_review_required';
  publicationAuthorized: false;
  reasons: string[];
  validSourceCount: number;
  independentSourceCount: number;
};

const shorteners = new Set(['bit.ly', 'tinyurl.com', 't.co', 'ow.ly', 'goo.gl', 'is.gd']);
function parseEvidenceUrl(value: string): { host: string } | null {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port ||
        !url.hostname.includes('.') || url.hostname === 'localhost' ||
        url.hostname.endsWith('.local') || shorteners.has(url.hostname) ||
        /^\d+\.\d+\.\d+\.\d+$/.test(url.hostname) || url.hostname.includes('..')) return null;
    return { host: url.hostname.replace(/^www\./, '').toLowerCase() };
  } catch { return null; }
}

/** A reported origin group is merely an editorial clue, not independent verification. */
function sourceGroup(source: EditorialEvidence): string | null {
  if (source.derivedFrom?.trim()) return source.derivedFrom.trim().toLowerCase();
  return parseEvidenceUrl(source.url)?.host ?? null;
}
export function assessEvidence(input: EvidenceReview, now = new Date()): EvidenceAssessment {
  const reasons: string[] = [];
  if (input.claim.trim().length < 20 || input.claim.trim().length > 1000)
    reasons.push('Describe un hecho concreto en 20-1000 caracteres.');
  if (input.claimDate) {
    const date = new Date(input.claimDate);
    if (!Number.isFinite(date.getTime()) || date.getTime() > now.getTime())
      reasons.push('La fecha del hecho es inválida o futura.');
  }
  const valid = input.sources.filter((source, index) => {
    let accepted = true;
    if (!parseEvidenceUrl(source.url)) {
      reasons.push('Fuente ' + (index + 1) + ': falta un enlace HTTPS directo válido.'); accepted = false;
    }
    if (source.excerpt.trim().length < 20) {
      reasons.push('Fuente ' + (index + 1) + ': indica el dato exacto que respalda la afirmación.'); accepted = false;
    }
    if (!source.originalLocated) {
      reasons.push('Fuente ' + (index + 1) + ': falta localizar el material original.'); accepted = false;
    }
    return accepted;
  });
  if (input.sources.length < 2) reasons.push('Se necesitan al menos dos evidencias contrastables.');
  const unique = new Set(valid.map(sourceGroup).filter((x): x is string => Boolean(x)));
  if (unique.size < 2) reasons.push('No hay dos orígenes independientes declarados. Dos reimpresiones no cuentan como dos fuentes.');
  if (!valid.some(source => source.kind === 'primary' || source.kind === 'eyewitness' || source.kind === 'fact_check'))
    reasons.push('Falta una fuente primaria, testimonio original o verificación independiente.');
  if (input.sources.some(source => source.kind === 'eyewitness'))
    reasons.push('Los testimonios exigen además comprobar identidad, consentimiento, fecha, lugar, edición y contexto fuera de esta herramienta.');
  return { readiness: reasons.length ? 'blocked' : 'human_review_required', publicationAuthorized: false,
    reasons, validSourceCount: valid.length, independentSourceCount: unique.size };
}


/** Downloadable human investigation checklist; never a verification certificate. */
export function makeEvidenceDossier(input:EvidenceReview, now=new Date()):string{
 const outcome=assessEvidence(input,now);
 const checkedAt=now.toISOString();
 const lines=[
  'KOWI VERIFICA — DOSSIER NO CONFIRMADO',
  'HOLA SOY TU IA · kowi.one',
  'Generado: '+checkedAt,
  'Estado: '+(outcome.readiness==='blocked'?'BLOQUEADO':'PENDIENTE DE REVISION HUMANA'),
  'Publicacion autorizada: NO',
  '',
  'AFIRMACION EN REVISION',
  input.claim.trim(),
  'Fecha declarada del hecho: '+(input.claimDate||'NO INDICADA'),
  '',
  'EVIDENCIAS DECLARADAS (NO COMPROBADAS POR LA APLICACION)',
  ...input.sources.flatMap((source,i)=>[
   'Fuente '+(i+1)+': '+source.url,
   'Tipo declarado: '+source.kind,
   'Texto/observacion aportada: '+source.excerpt,
   'Original localizado (declarado): '+(source.originalLocated?'SI':'NO'),
   'Origen compartido/reimpresion (declarado): '+(source.derivedFrom||'NO INDICADO'),''
  ]),
  'REQUISITOS PENDIENTES',
  ...(outcome.reasons.length?outcome.reasons:['Revisar manualmente que las fuentes sean reales, pertinentes e independientes.']),
  '',
  'COMPROBACIONES HUMANAS OBLIGATORIAS',
  '1. Abrir cada fuente, autor, fechas y contenido original; buscar correcciones y contradicciones.',
  '2. Comprobar que cada fragmento respalda la afirmacion literal y que los medios no copian el mismo origen.',
  '3. Para testimonios y material audiovisual: procedencia, contexto, identidad/consentimiento y edicion.',
  '4. Documentar decision del editor, version exacta aprobada y responsabilidad.',
  '5. Nunca publicar la afirmacion como confirmada basandose solo en este dossier.',
  'Editor responsable: PENDIENTE',
  'Revision humana: PENDIENTE',
  ''
 ];
 return lines.join(String.fromCharCode(10));
}
