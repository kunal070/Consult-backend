import { FastifyRequest, FastifyReply } from 'fastify';
import {
  loginClient,
  loginConsultant,
  registerClient,
  registerConsultant,
} from '../services/authService';
import {
  LoginRequest,
  RegisterClientRequest,
  RegisterConsultantRequest,
} from '../types/auth';

export const loginClientHandler = async (req: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply) => {
  try {
    const result = await loginClient(req.body);
    reply.status(200).send(result);
  } catch (error: any) {
    reply.status(error.statusCode || 500).send({ error: error.message || 'Internal server error' });
  }
};

export const loginConsultantHandler = async (req: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply) => {
  try {
    const result = await loginConsultant(req.body);
    reply.status(200).send(result);
  } catch (error: any) {
    reply.status(error.statusCode || 500).send({ error: error.message || 'Internal server error' });
  }
};

export const registerClientHandler = async (req: FastifyRequest<{ Body: RegisterClientRequest }>, reply: FastifyReply) => {
  try {
    const result = await registerClient(req.body);
    reply.status(201).send(result);
  } catch (error: any) {
    reply.status(error.statusCode || 500).send({ error: error.message || 'Internal server error' });
  }
};

export const registerConsultantHandler = async (req: FastifyRequest<{ Body: RegisterConsultantRequest }>, reply: FastifyReply) => {
  try {
    const result = await registerConsultant(req.body);
    reply.status(201).send(result);
  } catch (error: any) {
    reply.status(error.statusCode || 500).send({ error: error.message || 'Internal server error' });
  }
};
