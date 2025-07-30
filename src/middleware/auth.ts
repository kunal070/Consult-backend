import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';

// JWT token interface
interface JWTPayload {
  consultantId: number;
  email: string;
  role: 'consultant' | 'client';
  iat: number;
  exp: number;
}

// Extend FastifyRequest to include user information
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      consultantId: number;
      email: string;
      role: string;
    };
  }
}

// JWT Authentication Middleware
export const authenticateJWT = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const authHeader = request.headers.authorization;
    
    if (!authHeader) {
      reply.status(401).send({
        success: false,
        error: 'Authentication Error',
        message: 'Authorization header is required'
      });
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      reply.status(401).send({
        success: false,
        error: 'Authentication Error',
        message: 'Token is required'
      });
      return;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
    
    // Check if token is for consultant
    if (decoded.role !== 'consultant') {
      reply.status(403).send({
        success: false,
        error: 'Authorization Error',
        message: 'Access denied. Consultant role required.'
      });
      return;
    }

    // Attach user info to request
    request.user = {
      consultantId: decoded.consultantId,
      email: decoded.email,
      role: decoded.role
    };

  } catch (error: any) {
    console.error('❌ JWT Authentication error:', error);
    
    if (error.name === 'TokenExpiredError') {
      reply.status(401).send({
        success: false,
        error: 'Authentication Error',
        message: 'Token has expired'
      });
    } else if (error.name === 'JsonWebTokenError') {
      reply.status(401).send({
        success: false,
        error: 'Authentication Error',
        message: 'Invalid token'
      });
    } else {
      reply.status(500).send({
        success: false,
        error: 'Authentication Error',
        message: 'Token verification failed'
      });
    }
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const authHeader = request.headers.authorization;
    
    if (!authHeader) {
      return; // Continue without user info
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return; // Continue without user info
    }

    // Verify JWT token
    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
    
    // Attach user info to request
    request.user = {
      consultantId: decoded.consultantId,
      email: decoded.email,
      role: decoded.role
    };

  } catch (error: any) {
    // Don't fail the request, just continue without user info
    console.warn('⚠️ Optional auth failed:', error.message);
  }
};
