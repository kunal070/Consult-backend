import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { loginSchema, registerClientSchema, registerConsultantSchema } from '../schemas/authSchemas';
import {
  loginClientHandler,
  loginConsultantHandler,
  registerClientHandler,
  registerConsultantHandler,
} from '../controllers/authController';

// Updated type definitions to match the schema
type LoginRequest = z.infer<typeof loginSchema>;
type RegisterClientRequest = z.infer<typeof registerClientSchema>;
type RegisterConsultantRequest = z.infer<typeof registerConsultantSchema>;

// Manual validation helper with better error handling
const validateBody = <T>(schema: z.ZodSchema<T>, body: unknown): T => {
  const result = schema.safeParse(body);
  if (!result.success) {
    const formattedErrors = result.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }));
    
    throw {
      statusCode: 400,
      message: 'Validation failed',
      details: formattedErrors,
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
      } as FastifyRequest<{ Body: LoginRequest }>;
      
      return await loginClientHandler(validatedRequest, reply);
    } catch (error: any) {
      console.error('❌ Client login error:', error);
      if (error.statusCode) {
        reply.status(error.statusCode).send({ 
          error: error.message, 
          details: error.details 
        });
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
      } as FastifyRequest<{ Body: LoginRequest }>;
      
      return await loginConsultantHandler(validatedRequest, reply);
    } catch (error: any) {
      console.error('❌ Consultant login error:', error);
      if (error.statusCode) {
        reply.status(error.statusCode).send({ 
          error: error.message, 
          details: error.details 
        });
      } else {
        reply.status(500).send({ error: 'Internal server error' });
      }
    }
  });

  // Client Registration
  fastify.post('/register-client', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      console.log('📝 Raw client registration request body:', request.body);
      
      const validatedBody = validateBody(registerClientSchema, request.body);
      console.log('✅ Client validation passed:', validatedBody);
      
      const validatedRequest = {
        ...request,
        body: validatedBody,
      } as FastifyRequest<{ Body: RegisterClientRequest }>;
      
      return await registerClientHandler(validatedRequest, reply);
    } catch (error: any) {
      console.error('❌ Client registration error:', error);
      if (error.statusCode) {
        reply.status(error.statusCode).send({ 
          error: error.message, 
          details: error.details 
        });
      } else {
        reply.status(500).send({ error: 'Internal server error' });
      }
    }
  });

  // Consultant Registration - FIXED
  fastify.post('/register-consultant', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      console.log('📝 Raw consultant registration request body:', request.body);
      
      const validatedBody = validateBody(registerConsultantSchema, request.body);
      console.log('✅ Consultant validation passed:', validatedBody);
      
      const validatedRequest = {
        ...request,
        body: validatedBody,
      } as FastifyRequest<{ Body: RegisterConsultantRequest }>;
      
      return await registerConsultantHandler(validatedRequest, reply);
    } catch (error: any) {
      console.error('❌ Consultant registration error:', error);
      if (error.statusCode) {
        reply.status(error.statusCode).send({ 
          error: error.message, 
          details: error.details 
        });
      } else {
        console.error('❌ Unexpected error:', error);
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

// Export the types for use in controllers
export type { LoginRequest, RegisterClientRequest, RegisterConsultantRequest };