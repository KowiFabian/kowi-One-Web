export const voiceProfiles = [
  { id: 'legacy', label: 'Voz KOWI · Fabián', description: 'Custom Voice del propietario, cuando el proyecto tenga un voice_id aprobado.' },
  { id: 'companion', label: 'Voz KOWI · Complementaria', description: 'Voz sintética alternativa de OpenAI para contraste y accesibilidad.' },
] as const;

export const voiceTones = [
  { id: 'natural', label: 'Natural' },
  { id: 'warm', label: 'Cálida' },
  { id: 'calm', label: 'Serena' },
  { id: 'executive', label: 'Ejecutiva' },
  { id: 'energetic', label: 'Enérgica' },
  { id: 'narrative', label: 'Narrativa' },
] as const;

export const voiceLocales = [
  ['auto','Automático'],['es-ES','Español · España'],['es-CO','Español · Colombia'],['es-MX','Español · México'],
  ['en-US','English · US'],['en-GB','English · UK'],['en-IE','English · Ireland'],['fr-FR','Français · France'],
  ['de-DE','Deutsch · Deutschland'],['it-IT','Italiano · Italia'],['pt-PT','Português · Portugal'],['pt-BR','Português · Brasil'],
  ['ca-ES','Català'],['nl-NL','Nederlands'],['pl-PL','Polski'],['cs-CZ','Čeština'],['ro-RO','Română'],
  ['sv-SE','Svenska'],['da-DK','Dansk'],['fi-FI','Suomi'],['no-NO','Norsk'],['el-GR','Ελληνικά'],
  ['tr-TR','Türkçe'],['ru-RU','Русский'],['uk-UA','Українська'],['ar-SA','العربية'],['he-IL','עברית'],
  ['hi-IN','हिन्दी'],['zh-CN','中文'],['ja-JP','日本語'],['ko-KR','한국어'],['vi-VN','Tiếng Việt'],
  ['th-TH','ไทย'],['id-ID','Bahasa Indonesia'],['ms-MY','Bahasa Melayu'],['sw-KE','Kiswahili'],
] as const;

export type VoiceProfile = typeof voiceProfiles[number]['id'];
export type VoiceTone = typeof voiceTones[number]['id'];

const toneInstructions: Record<VoiceTone,string> = {
  natural: 'Use a natural, conversational delivery with realistic pauses and restrained expression.',
  warm: 'Use a warm, welcoming delivery with gentle empathy, without sounding theatrical.',
  calm: 'Use a calm, steady delivery with measured pacing and clear articulation.',
  executive: 'Use a confident, concise, professional delivery with controlled pacing.',
  energetic: 'Use an upbeat and energetic delivery while staying credible and natural.',
  narrative: 'Use a polished narrative delivery with expressive but believable pacing.',
};

const localeHints: Record<string,string> = {
  'es-ES':'Use natural Spanish from Spain.',
  'es-CO':'Use natural Colombian Spanish while preserving the speaker identity; avoid caricature.',
  'es-MX':'Use natural Mexican Spanish while preserving the speaker identity; avoid caricature.',
  'en-US':'Use natural US English.',
  'en-GB':'Use natural British English.',
  'en-IE':'Use natural Irish English.',
  'pt-BR':'Use natural Brazilian Portuguese.',
  'pt-PT':'Use natural European Portuguese.',
};

export function buildVoiceInstructions(locale:string, tone:VoiceTone){
  const localeInstruction = locale === 'auto'
    ? 'Speak in the same language as the provided text.'
    : (localeHints[locale] ?? `Use the requested locale/accent preference: ${locale}. Keep it natural and intelligible.`);
  return [
    'Preserve the selected voice identity. Do not imitate another identifiable person.',
    localeInstruction,
    toneInstructions[tone],
    'Pronounce names carefully. Do not add words, disclaimers, sound effects, laughter, or content that is not present in the input text.',
  ].join(' ');
}
