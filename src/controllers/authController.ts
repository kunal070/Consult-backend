import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import {
  loginClient,
  loginConsultant,
  registerClient,
  registerConsultant,
} from '../services/authService';

// Import schemas to generate correct types
import { 
  loginSchema, 
  registerClientSchema, 
  registerConsultantSchema 
} from '../schemas/authSchemas';

// Generate types directly from schemas to ensure they match
type LoginRequest = z.infer<typeof loginSchema>;
type RegisterClientRequest = z.infer<typeof registerClientSchema>;
type RegisterConsultantRequest = z.infer<typeof registerConsultantSchema>;

export const loginClientHandler = async (
  req: FastifyRequest<{ Body: LoginRequest }>, 
  reply: FastifyReply
) => {
  try {
    console.log('🔐 Client login attempt:', { email: req.body.email });
    const result = await loginClient(req.body);
    reply.status(200).send(result);
  } catch (error: any) {
    console.error('❌ Client login error:', error);
    reply.status(error.statusCode || 500).send({ 
      error: error.message || 'Internal server error' 
    });
  }
};

export const loginConsultantHandler = async (
  req: FastifyRequest<{ Body: LoginRequest }>, 
  reply: FastifyReply
) => {
  try {
    console.log('🔐 Consultant login attempt:', { email: req.body.email });
    const result = await loginConsultant(req.body);
    reply.status(200).send(result);
  } catch (error: any) {
    console.error('❌ Consultant login error:', error);
    reply.status(error.statusCode || 500).send({ 
      error: error.message || 'Internal server error' 
    });
  }
};

export const registerClientHandler = async (
  req: FastifyRequest<{ Body: RegisterClientRequest }>, 
  reply: FastifyReply
) => {
  try {
    console.log('📝 Client registration attempt:', { 
      email: req.body.email, 
      companyName: req.body.companyName 
    });
    const result = await registerClient(req.body);
    reply.status(201).send(result);
  } catch (error: any) {
    console.error('❌ Client registration error:', error);
    reply.status(error.statusCode || 500).send({ 
      error: error.message || 'Internal server error' 
    });
  }
};

export const registerConsultantHandler = async (
  req: FastifyRequest<{ Body: RegisterConsultantRequest }>, 
  reply: FastifyReply
) => {
  try {
    console.log('📝 Consultant registration attempt:', { 
      email: req.body.email, 
      fullName: req.body.fullName,
      primarySkills: req.body.primarySkills, // Now correctly typed as string[]
      languagesSpoken: req.body.languagesSpoken // Also string[]
    });
    
    const result = await registerConsultant(req.body);
    reply.status(201).send(result);
  } catch (error: any) {
    console.error('❌ Consultant registration error:', error);
    reply.status(error.statusCode || 500).send({ 
      error: error.message || 'Internal server error' 
    });
  }
};

// Export the types for use in other files
export type { LoginRequest, RegisterClientRequest, RegisterConsultantRequest };