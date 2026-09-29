import { z } from 'zod';

const list = (max: number) => z.array(z.string().trim().min(1).max(500)).max(max)
  // Postgres adds separators when rendering jsonb::text; reserve room below its 10 KB CHECK.
  .refine(items => Buffer.byteLength(JSON.stringify(items), 'utf8') < 9800, 'La lista supera el tamaño permitido.');

export const projectFields = z.object({
  idea: z.string().trim().min(5).max(2000),
  objective: z.string().trim().min(3).max(1000),
  phases: list(12),
  tasks: list(30),
  next_action: z.string().trim().min(3).max(500),
  details: z.object({
    responsibles: list(20),
    agents: list(20),
    professionals: list(20),
    budget_eur: z.number().finite().nonnegative().max(1_000_000_000).nullable(),
    milestones: list(30),
    evidence: list(30),
    progress_note: z.string().trim().max(2000),
    completed_tasks: z.array(z.number().int().nonnegative().max(29)).max(30),
  }).strict().refine(value => Buffer.byteLength(JSON.stringify(value), 'utf8') < 30000, 'El seguimiento supera el tamaño permitido.').optional(),
});
