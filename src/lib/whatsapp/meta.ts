import 'server-only';

export type MetaMessage = { from: string; id: string; text: string; phoneNumberId: string };

export function parseMetaMessages(payload: unknown): MetaMessage[] {
  if (!payload || typeof payload !== 'object') return [];
  const root = payload as { entry?: Array<{ changes?: Array<{ value?: { metadata?: { phone_number_id?: string }; messages?: Array<{ from?: string; id?: string; type?: string; text?: { body?: string } }> } }> }> };
  const output: MetaMessage[] = [];
  for (const entry of root.entry ?? []) for (const change of entry.changes ?? []) {
    const value = change.value;
    for (const message of value?.messages ?? []) {
      if (message.type === 'text' && message.from && message.id && message.text?.body && value?.metadata?.phone_number_id) {
        output.push({ from: message.from, id: message.id, text: message.text.body, phoneNumberId: value.metadata.phone_number_id });
      }
    }
  }
  return output;
}

export async function sendMetaText(to: string, body: string, phoneNumberId: string): Promise<void> {
  const token = process.env.META_WHATSAPP_ACCESS_TOKEN;
  if (!token) throw new Error('META_WHATSAPP_ACCESS_TOKEN missing');
  const version = process.env.META_GRAPH_API_VERSION || 'v23.0';
  const response = await fetch(`https://graph.facebook.com/${version}/${encodeURIComponent(phoneNumberId)}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body } }),
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(`Meta send failed: ${response.status}`);
}
