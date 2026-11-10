/**
 * KOWI Recepcionista IA — booking guardrails for the isolated hair salon pilot.
 * This module never sends WhatsApp messages and never confirms a booking
 * without a successful, idempotent persistence operation.
 */
export type SalonService = { id: string; name: string; durationMinutes: number; priceCents: number };
export type SalonSlot = { id: string; stylistId: string; startsAt: string; endsAt: string };
export type BookingRequest = {
  organizationId: string;
  customerPhone: string;
  customerName: string;
  serviceId: string;
  slotId: string;
  inboundMessageId: string;
};
export type BookingResult =
  | { status: 'confirmed'; bookingId: string; startsAt: string }
  | { status: 'unavailable' }
  | { status: 'needs_human'; reason: string };

export interface SalonBookingStore {
  listServices(organizationId: string): Promise<SalonService[]>;
  listAvailableSlots(organizationId: string, serviceId: string, from: string, to: string): Promise<SalonSlot[]>;
  /** Atomic unique slot allocation + inboundMessageId idempotency in persistent storage. */
  reserveIfAvailable(request: BookingRequest): Promise<BookingResult>;
}

export function normalizePilotPhone(value: string): string | null {
  const digits = value.replace(/^\+/, '');
  return /^[1-9][0-9]{5,15}$/.test(digits) ? digits : null;
}

export function assertAuthorizedPilotSender(sender: string, allowlist: string): void {
  const normalized = normalizePilotPhone(sender);
  const allowed = allowlist.split(',').map(v => normalizePilotPhone(v.trim())).filter(Boolean);
  if (!normalized || !allowed.includes(normalized)) throw new Error('PILOT_SENDER_NOT_AUTHORIZED');
}

export function formatServices(services: SalonService[]): string {
  if (!services.length) return 'Todavía no tengo servicios configurados. Te pondré en contacto con la peluquería.';
  return services.map(s => `${s.name}: ${(s.priceCents / 100).toFixed(2)} € (${s.durationMinutes} min)`).join('\n');
}

export function formatAvailableSlots(slots: SalonSlot[]): string {
  if (!slots.length) return 'No encuentro citas disponibles en ese horario. ¿Quieres probar otro día?';
  return slots.map(s => `${s.id}: ${s.startsAt}`).join('\n');
}

export function formatBookingResult(result: BookingResult): string {
  if (result.status === 'confirmed') return `¡Reserva confirmada! Tu cita es el ${result.startsAt}. Referencia: ${result.bookingId}.`;
  if (result.status === 'unavailable') return 'Ese horario ya no está disponible. Voy a consultar otras opciones.';
  return 'Necesito que una persona de la peluquería revise esta solicitud antes de confirmarla.';
}

/** Do not let the language model invent availability or assert success. */
export const SALON_AGENT_RULES = [
  'Eres KOWI, recepcionista virtual de una peluquería piloto. Habla en español claro y amable.',
  'Nunca inventes precios, profesionales, horarios, disponibilidad ni reservas.',
  'Para informar precios consulta listServices; para proponer horas consulta listAvailableSlots.',
  'Para confirmar una cita solicita nombre, servicio y horario y ejecuta reserveIfAvailable.',
  'Confirma exclusivamente cuando reserveIfAvailable devuelva status confirmed.',
  'Si no hay disponibilidad, ofrece alternativas reales; ante dudas, deriva a una persona.',
  'No solicites datos sensibles ni prometas servicios no configurados.',
].join(' ');
