import { z } from 'zod';

const short = z.string().trim().max(120);
export const businessConfigSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1200).default(''),
  contact: z.string().trim().max(300).default(''),
  escalation: z.string().trim().max(700).default(''),
  sector: z.enum(['belleza', 'inmobiliaria', 'salud', 'taller', 'restauracion', 'comercio', 'profesional', 'pyme', 'otro']),
  services: z.array(z.object({ name: z.string().trim().min(1).max(100), price: short }).strict()).max(30),
  hours: z.string().trim().max(700),
  team: z.string().trim().max(700),
  faq: z.array(z.object({ question: z.string().trim().min(1).max(200), answer: z.string().trim().min(1).max(600) }).strict()).max(25),
  policies: z.string().trim().max(1500),
  tone: z.string().trim().max(300),
  automaticActions: z.array(z.enum(['answer_faq', 'recommend', 'qualify'])).max(3),
}).strict();
export type BusinessConfig = z.infer<typeof businessConfigSchema>;

export const leadSchema = z.object({
  name: z.string().trim().min(1).max(100),
  contact: z.string().trim().max(120),
  status: z.enum(['nuevo', 'contactado', 'propuesta', 'ganado', 'perdido']),
  next_action: z.string().trim().max(500),
  notes: z.string().trim().max(1000),
}).strict();
