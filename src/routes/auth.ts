import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const registerClientSchema = z.object({
  fullName: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
});

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register-client', {
    schema: {
      body: registerClientSchema,
    },
  }, async (req, reply) => {
    const body = req.body as z.infer<typeof registerClientSchema>;
    return reply.send({ message: `Hello ${body.fullName}, registered successfully.` });
  });
}
