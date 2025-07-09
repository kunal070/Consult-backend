import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { loginSchema, registerClientSchema, registerConsultantSchema } from '../schemas/authSchemas';
import {
  loginClientHandler,
  loginConsultantHandler,
  registerClientHandler,
  registerConsultantHandler,
} from '../controllers/authController';

// Manual validation helper
const validateBody = <T>(schema: z.ZodSchema<T>, body: unknown): T => {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw {
      statusCode: 400,
      message: 'Validation failed',
      details: result.error.errors,
    };
  }
  return result.data;
};

export default async function authRoutes(fastify: FastifyInstance) {
  
  // Client Login
  fastify.post('/login-client', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const validatedBody = validateBody(loginSchema, request.body);
      
      // Create a new request object with validated body
      const validatedRequest = {
        ...request,
        body: validatedBody,
      } as FastifyRequest<{ Body: z.infer<typeof loginSchema> }>;
      
      return await loginClientHandler(validatedRequest, reply);
    } catch (error: any) {
      if (error.statusCode) {
        reply.status(error.statusCode).send({ error: error.message, details: error.details });
      } else {
        reply.status(500).send({ error: 'Internal server error' });
      }
    }
  });

  // Consultant Login
  fastify.post('/login-consultant', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const validatedBody = validateBody(loginSchema, request.body);
      
      const validatedRequest = {
        ...request,
        body: validatedBody,
      } as FastifyRequest<{ Body: z.infer<typeof loginSchema> }>;
      
      return await loginConsultantHandler(validatedRequest, reply);
    } catch (error: any) {
      if (error.statusCode) {
        reply.status(error.statusCode).send({ error: error.message, details: error.details });
      } else {
        reply.status(500).send({ error: 'Internal server error' });
      }
    }
  });

  // Client Registration
  fastify.post('/register-client', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      console.log('📝 Raw request body:', request.body);
      
      const validatedBody = validateBody(registerClientSchema, request.body);
      console.log('✅ Validation passed:', validatedBody);
      
      const validatedRequest = {
        ...request,
        body: validatedBody,
      } as FastifyRequest<{ Body: z.infer<typeof registerClientSchema> }>;
      
      return await registerClientHandler(validatedRequest, reply);
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      if (error.statusCode) {
        reply.status(error.statusCode).send({ error: error.message, details: error.details });
      } else {
        reply.status(500).send({ error: 'Internal server error' });
      }
    }
  });

  // Consultant Registration
  fastify.post('/register-consultant', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const validatedBody = validateBody(registerConsultantSchema, request.body);
      
      const validatedRequest = {
        ...request,
        body: validatedBody,
      } as FastifyRequest<{ Body: z.infer<typeof registerConsultantSchema> }>;
      
      return await registerConsultantHandler(validatedRequest, reply);
    } catch (error: any) {
      if (error.statusCode) {
        reply.status(error.statusCode).send({ error: error.message, details: error.details });
      } else {
        reply.status(500).send({ error: 'Internal server error' });
      }
    }
  });

  // Test route
  fastify.get('/test', async (request: FastifyRequest, reply: FastifyReply) => {
    return {
      message: 'Auth routes are working!',
      timestamp: new Date().toISOString(),
      availableEndpoints: [
        'POST /api/auth/login-client',
        'POST /api/auth/login-consultant', 
        'POST /api/auth/register-client',
        'POST /api/auth/register-consultant',
      ],
    };
  });
}