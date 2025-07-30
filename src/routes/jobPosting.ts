import { FastifyInstance } from 'fastify';
import { JobPostingController } from '../controllers/jobPostingController';
import { validateRequest } from '../middleware/validation';
import { 
  createJobPostingSchema, 
  updateJobPostingSchema, 
  jobPostingQuerySchema,
  jobPostingIdSchema 
} from '../schemas/jobPostingSchemas';

async function jobPostingRoutes(fastify: FastifyInstance) {
  // Get job posting statistics (must be before /:id route)
  fastify.get('/stats', {
    schema: {
      description: 'Get job posting statistics',
      tags: ['Job Postings'],
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
                byExperienceLevel: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      experience_level: { type: 'string' },
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
                averageHourlyRate: { type: 'number' },
                totalProposals: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, JobPostingController.getJobPostingStats);

  // Search job postings (must be before /:id route)
  fastify.get('/search', {
    schema: {
      description: 'Search job postings',
      tags: ['Job Postings'],
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
  }, JobPostingController.searchJobPostings);

  // Create a new job posting
  fastify.post('/', {
    preHandler: validateRequest(createJobPostingSchema, 'body'),
    schema: {
      description: 'Create a new job posting',
      tags: ['Job Postings'],
      body: {
        type: 'object',
        properties: {
          job_title: { type: 'string', maxLength: 255 },
          company_name: { type: 'string', maxLength: 100 },
          company_rating: { type: 'number', minimum: 0, maximum: 5 },
          hourly_rate_min: { type: 'number', minimum: 0 },
          hourly_rate_max: { type: 'number', minimum: 0 },
          duration: { type: 'string', maxLength: 50 },
          experience_level: { type: 'string', maxLength: 50 },
          description: { type: 'string' },
          tags: { type: 'string', maxLength: 500 },
          location: { type: 'string', maxLength: 100 },
          proposals: { type: 'number', minimum: 0 },
          posted_time: { type: 'string' }
        },
        required: [
          'job_title', 'company_name', 'company_rating', 
          'hourly_rate_min', 'hourly_rate_max', 'duration', 
          'experience_level', 'description', 'location'
        ]
      }
    }
  }, async (request, reply) => {
    return JobPostingController.createJobPosting(request as any, reply);
  });

  // Get all job postings with filtering and pagination
  fastify.get('/', {
    preHandler: validateRequest(jobPostingQuerySchema, 'query'),
    schema: {
      description: 'Get all job postings with optional filtering and pagination',
      tags: ['Job Postings'],
      querystring: {
        type: 'object',
        properties: {
          company_name: { type: 'string' },
          experience_level: { type: 'string' },
          location: { type: 'string' },
          min_hourly_rate: { type: 'string' },
          max_hourly_rate: { type: 'string' },
          min_rating: { type: 'string' },
          tags: { type: 'string' },
          page: { type: 'string' },
          limit: { type: 'string' },
          sort_by: { 
            type: 'string', 
            enum: ['posted_time', 'hourly_rate_min', 'hourly_rate_max', 'company_rating', 'proposals'] 
          },
          sort_order: { type: 'string', enum: ['ASC', 'DESC'] }
        }
      }
    }
  }, async (request, reply) => {
    return JobPostingController.getJobPostings(request as any, reply);
  });

  // Get a single job posting by ID
  fastify.get('/:id', {
    preHandler: validateRequest(jobPostingIdSchema, 'params'),
    schema: {
      description: 'Get a job posting by ID',
      tags: ['Job Postings'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', pattern: '^[0-9]+$' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    return JobPostingController.getJobPostingById(request as any, reply);
  });

  // Update a job posting by ID
  fastify.put('/:id', {
    preHandler: [
      validateRequest(jobPostingIdSchema, 'params'),
      validateRequest(updateJobPostingSchema, 'body')
    ],
    schema: {
      description: 'Update a job posting by ID',
      tags: ['Job Postings'],
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
          job_title: { type: 'string', maxLength: 255 },
          company_name: { type: 'string', maxLength: 100 },
          company_rating: { type: 'number', minimum: 0, maximum: 5 },
          hourly_rate_min: { type: 'number', minimum: 0 },
          hourly_rate_max: { type: 'number', minimum: 0 },
          duration: { type: 'string', maxLength: 50 },
          experience_level: { type: 'string', maxLength: 50 },
          description: { type: 'string' },
          tags: { type: 'string', maxLength: 500 },
          location: { type: 'string', maxLength: 100 },
          proposals: { type: 'number', minimum: 0 },
          posted_time: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    return JobPostingController.updateJobPosting(request as any, reply);
  });

  // Delete a job posting by ID
  fastify.delete('/:id', {
    preHandler: validateRequest(jobPostingIdSchema, 'params'),
    schema: {
      description: 'Delete a job posting by ID',
      tags: ['Job Postings'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', pattern: '^[0-9]+$' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    return JobPostingController.deleteJobPosting(request as any, reply);
  });
}

export default jobPostingRoutes;