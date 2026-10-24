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
