import { z } from 'zod';

export const chatRequestSchema = z.object({
  userMessage: z.string().trim().min(1).max(2000),
  conversationId: z.string().uuid(),
  requestId: z.string().uuid(),
}).strict();
export const goalSchema = z.object({
  intent: z.string().min(1).max(2000),
  goal: z.string().min(1).max(2000),
  plan: z.array(z.string().min(1).max(2000)).length(4),
  first_action: z.string().min(1).max(2000),
}).strict();
export const modelResponseSchema = z.object({
  response: z.string().min(1).max(6000),
  goal: goalSchema.nullable(),
}).strict();
export const responseFormat = {
  type: 'json_schema',
  json_schema: {
    name: 'kowi_response', strict: true,
    schema: {
      type: 'object', additionalProperties: false, required: ['response', 'goal'],
      properties: {
        response: { type: 'string' },
        goal: { anyOf: [{ type: 'null' }, {
          type: 'object', additionalProperties: false,
          required: ['intent', 'goal', 'plan', 'first_action'],
          properties: {
            intent: { type: 'string' }, goal: { type: 'string' },
            plan: { type: 'array', items: { type: 'string' } },
            first_action: { type: 'string' },
          },
        }] },
      },
    },
  },
};
