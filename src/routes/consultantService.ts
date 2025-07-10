import { FastifyInstance } from 'fastify';
import { ConsultantServiceController } from '../controllers/consultantServiceController';
import { validateRequest } from '../middleware/validation';
import { 
  createConsultantServiceSchema, 
  updateConsultantServiceSchema, 
  consultantServiceQuerySchema,
  consultantServiceIdSchema 
} from '../schemas/consultantServiceSchemas';

async function consultantServiceRoutes(fastify: FastifyInstance) {
  // Get consultant service statistics (must be before /:id route)
  fastify.get('/stats', {
    schema: {
      description: 'Get consultant service statistics',
      tags: ['Consultant Services'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                byServiceType: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      service_type: { type: 'string' },
                      count: { type: 'number' }
                    }
                  }
                },
                byLocation: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      location: { type: 'string' },
                      count: { type: 'number' }
                    }
                  }
                },
                byRemote: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      remote: { type: 'boolean' },
                      count: { type: 'number' }
                    }
                  }
                },
                averageHourlyRate: { type: 'number' },
                averageProjectRate: { type: 'number' },
                averageExperienceYears: { type: 'number' },
                totalConsultants: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, ConsultantServiceController.getConsultantServiceStats);

  // Search consultant services (must be before /:id route)
  fastify.get('/search', {
    schema: {
      description: 'Search consultant services',
      tags: ['Consultant Services'],
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string', minLength: 1 },
          page: { type: 'number', minimum: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100 }
        },
        required: ['q']
      }
    }
  }, ConsultantServiceController.searchConsultantServices);

  // Create a new consultant service
  fastify.post('/', {
    preHandler: validateRequest(createConsultantServiceSchema, 'body'),
    schema: {
      description: 'Create a new consultant service',
      tags: ['Consultant Services'],
      body: {
        type: 'object',
        properties: {
          consultant_id: { type: 'number', minimum: 1 },
          title: { type: 'string', maxLength: 255 },
          description: { type: 'string' },
          service_type: { type: 'string', maxLength: 100 },
          expertise: { type: 'string' },
          hourly_rate: { type: 'number', minimum: 0 },
          project_rate: { type: 'number', minimum: 0 },
          availability: { type: 'string', maxLength: 50 },
          duration: { type: 'string', maxLength: 50 },
          experience_years: { type: 'number', minimum: 0 },
          location: { type: 'string', maxLength: 100 },
          remote: { type: 'boolean' },
          languages: { type: 'string' },
          certifications: { type: 'string' },
          portfolio: { type: 'string', maxLength: 255 },
          linkedin: { type: 'string', maxLength: 255 },
          website: { type: 'string', maxLength: 255 },
          response_time: { type: 'string', maxLength: 50 },
          min_project_budget: { type: 'number', minimum: 0 },
          created_at: { type: 'string' }
        },
        required: [
          'consultant_id', 'title', 'description', 'service_type', 
          'hourly_rate', 'availability'
        ]
      }
    }
  }, async (request, reply) => {
    return ConsultantServiceController.createConsultantService(request as any, reply);
  });

  // Get all consultant services with filtering and pagination
  fastify.get('/', {
    preHandler: validateRequest(consultantServiceQuerySchema, 'query'),
    schema: {
      description: 'Get all consultant services with optional filtering and pagination',
      tags: ['Consultant Services'],
      querystring: {
        type: 'object',
        properties: {
          consultant_id: { type: 'string' },
          service_type: { type: 'string' },
          location: { type: 'string' },
          min_hourly_rate: { type: 'string' },
          max_hourly_rate: { type: 'string' },
          min_project_rate: { type: 'string' },
          max_project_rate: { type: 'string' },
          min_experience_years: { type: 'string' },
          max_experience_years: { type: 'string' },
          remote: { type: 'string' },
          availability: { type: 'string' },
          expertise: { type: 'string' },
          languages: { type: 'string' },
          certifications: { type: 'string' },
          min_project_budget: { type: 'string' },
          max_project_budget: { type: 'string' },
          page: { type: 'string' },
          limit: { type: 'string' },
          sort_by: { 
            type: 'string', 
            enum: ['created_at', 'hourly_rate', 'project_rate', 'experience_years', 'title', 'min_project_budget'] 
          },
          sort_order: { type: 'string', enum: ['ASC', 'DESC'] }
        }
      }
    }
  }, async (request, reply) => {
    return ConsultantServiceController.getConsultantServices(request as any, reply);
  });

  // Get a single consultant service by ID
  fastify.get('/:id', {
    preHandler: validateRequest(consultantServiceIdSchema, 'params'),
    schema: {
      description: 'Get a consultant service by ID',
      tags: ['Consultant Services'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', pattern: '^[0-9]+$' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    return ConsultantServiceController.getConsultantServiceById(request as any, reply);
  });

  // Update a consultant service by ID
  fastify.put('/:id', {
    preHandler: [
      validateRequest(consultantServiceIdSchema, 'params'),
      validateRequest(updateConsultantServiceSchema, 'body')
    ],
    schema: {
      description: 'Update a consultant service by ID',
      tags: ['Consultant Services'],
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
          consultant_id: { type: 'number', minimum: 1 },
          title: { type: 'string', maxLength: 255 },
          description: { type: 'string' },
          service_type: { type: 'string', maxLength: 100 },
          expertise: { type: 'string' },
          hourly_rate: { type: 'number', minimum: 0 },
          project_rate: { type: 'number', minimum: 0 },
          availability: { type: 'string', maxLength: 50 },
          duration: { type: 'string', maxLength: 50 },
          experience_years: { type: 'number', minimum: 0 },
          location: { type: 'string', maxLength: 100 },
          remote: { type: 'boolean' },
          languages: { type: 'string' },
          certifications: { type: 'string' },
          portfolio: { type: 'string', maxLength: 255 },
          linkedin: { type: 'string', maxLength: 255 },
          website: { type: 'string', maxLength: 255 },
          response_time: { type: 'string', maxLength: 50 },
          min_project_budget: { type: 'number', minimum: 0 },
          created_at: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    return ConsultantServiceController.updateConsultantService(request as any, reply);
  });

  // Delete a consultant service by ID
  fastify.delete('/:id', {
    preHandler: validateRequest(consultantServiceIdSchema, 'params'),
    schema: {
      description: 'Delete a consultant service by ID',
      tags: ['Consultant Services'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', pattern: '^[0-9]+$' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    return ConsultantServiceController.deleteConsultantService(request as any, reply);
  });
}

export default consultantServiceRoutes;