// src/schemas/connectionSchemas.ts

import { z } from 'zod';

export const createConnectionSchema = z.object({
  receiverId: z.number().int().positive('Receiver ID must be a positive integer'),
  receiverType: z.enum(['consultant', 'client'])
});

export const updateConnectionSchema = z.object({
  status: z.enum(['accepted', 'rejected', 'removed'])
});

export const connectionQuerySchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected', 'removed']).optional(),
  requesterType: z.enum(['consultant', 'client']).optional(),
  receiverType: z.enum(['consultant', 'client']).optional(),
  page: z.string().transform(val => val ? parseInt(val) : 1).optional(),
  limit: z.string().transform(val => val ? Math.min(parseInt(val), 100) : 10).optional(),
  sort_by: z.enum(['requestDate', 'responseDate', 'status']).optional().default('requestDate'),
  sort_order: z.enum(['ASC', 'DESC']).optional().default('DESC')
});

export const connectionIdSchema = z.object({
  id: z.string().transform(val => parseInt(val))
});

export type CreateConnectionRequest = z.infer<typeof createConnectionSchema>;
export type UpdateConnectionRequest = z.infer<typeof updateConnectionSchema>;
export type ConnectionQueryParams = z.infer<typeof connectionQuerySchema>;
export type ConnectionIdParams = z.infer<typeof connectionIdSchema>;