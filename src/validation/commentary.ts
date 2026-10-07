import { unknown, z, ZodAny } from "zod";

export const listCommentsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const createCommentSchema = z.object({
  matchId: z.coerce.number().int().positive().max(100),
  minute: z.coerce.number().int().positive(),
  sequence: z.coerce.number().int().optional(),
  period: z.string().optional(),
  eventType: z.string().optional(),
  actor: z.string().optional(),
  team: z.string().optional(),
  message: z.string().min(1),
  metadata: z.record(z.string(), z.any()).optional(),
  tags: z.array(z.string()).optional(),
});
