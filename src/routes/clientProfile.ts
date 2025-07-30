import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  getClientProfileHandler,
  updateClientProfileByIdHandler,
  deleteClientProfileHandler,
} from '../controllers/clientProfileController';

export default async function clientProfileRoutes(fastify: FastifyInstance) {
  console.log('🛣️ Registering client profile routes...');

  // Test route for client profile endpoints
  fastify.get('/test', async (request: FastifyRequest, reply: FastifyReply) => {
    console.log('📍 Client profile test route called');
    return {
      message: 'Client profile routes are working!',
      timestamp: new Date().toISOString(),
      availableEndpoints: [
        'GET /api/client/profile/:id - Get client profile by ID',
        'PUT /api/client/profile/:id - Update client profile by ID',
        'DELETE /api/client/profile/:id - Delete client profile by ID',
      ],
    };
  });
  console.log('✅ Client profile test route registered');

  // GET /api/client/profile/:id - Get client profile by ID
  fastify.get('/:id', {
    schema: {
      description: 'Get client profile by ID',
      tags: ['Client Profile'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', pattern: '^[0-9]+$' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            profile: { type: 'object' }
          }
        },
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, getClientProfileHandler);
  console.log('✅ Get client profile route registered');

  // PUT /api/client/profile/:id - Update client profile by ID
  fastify.put('/:id', {
    schema: {
      description: 'Update client profile by ID (partial update supported)',
      tags: ['Client Profile'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', pattern: '^[0-9]+$' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          fullName: { type: 'string', minLength: 1, maxLength: 100 },
          email: { type: 'string', format: 'email' },
          companyName: { type: 'string', minLength: 1, maxLength: 100 },
          companyWebsite: { type: 'string' },
          industry: { type: 'string' },
          companySize: { type: 'string' },
          location: { type: 'string' },
          role: { type: 'string' },
          useCase: { type: 'string' },
          phoneNumber: { type: 'string' },
          hearAboutUs: { type: 'string' }
        },
        additionalProperties: false
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            profile: { type: 'object' },
            updatedFields: { type: 'array', items: { type: 'string' } },
            emailUpdated: { type: 'boolean' }
          }
        }
      }
    }
  }, updateClientProfileByIdHandler);
  console.log('✅ Update client profile route registered');

  // DELETE /api/client/profile/:id - Delete client profile by ID
  fastify.delete('/:id', {
    schema: {
      description: 'Delete client profile by ID (soft delete)',
      tags: ['Client Profile'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', pattern: '^[0-9]+$' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, deleteClientProfileHandler);
  console.log('✅ Delete client profile route registered');

  console.log('✅ All client profile routes registered successfully');
}