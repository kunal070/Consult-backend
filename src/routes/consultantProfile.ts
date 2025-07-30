import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authenticateJWT } from '../middleware/auth';
import {
  getProfileHandler,
  updateProfileHandler,
  deleteProfileHandler,
  getProfileCompletionHandler,
  uploadAvatarHandler,
  deleteAvatarHandler
} from '../controllers/consultantProfileController';

export default async function consultantProfileRoutes(fastify: FastifyInstance) {
  console.log('🛣️ Registering consultant profile routes...');

  // Test route for profile endpoints
  fastify.get('/test', async (request: FastifyRequest, reply: FastifyReply) => {
    console.log('📍 Consultant profile test route called');
    return {
      message: 'Consultant profile routes are working!',
      timestamp: new Date().toISOString(),
      availableEndpoints: [
        'GET /api/consultant/profile - Get consultant profile',
        'PUT /api/consultant/profile - Update consultant profile',
        'DELETE /api/consultant/profile - Delete consultant profile',
        'GET /api/consultant/profile/completion - Get profile completion',
        'POST /api/consultant/profile/avatar - Upload avatar',
        'DELETE /api/consultant/profile/avatar - Remove avatar',
      ],
    };
  });
  console.log('✅ Consultant profile test route registered');

  // GET /api/consultant/profile - Get consultant's complete profile
  fastify.get('/', {
    schema: {
      description: 'Get consultant profile',
      tags: ['Consultant Profile'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            profile: {
              type: 'object',
              properties: {
                consultantId: { type: 'number' },
                fullName: { type: 'string' },
                email: { type: 'string' },
                phoneNumber: { type: 'string' },
                location: { type: 'string' },
                preferredWorkType: { type: 'string' },
                preferredWorkMode: { type: 'string' },
                languagesSpoken: { type: 'array', items: { type: 'string' } },
                specialization: { type: 'string' },
                yearsOfExperience: { type: 'string' },
                education: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      degree: { type: 'string' },
                      institution: { type: 'string' },
                      year: { type: 'string' }
                    }
                  }
                },
                certificates: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' }
                    }
                  }
                },
                professionalExperience: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      role: { type: 'string' },
                      company: { type: 'string' },
                      years: { type: 'string' }
                    }
                  }
                },
                primarySkills: { type: 'array', items: { type: 'string' } },
                availableServices: { type: 'array', items: { type: 'string' } },
                preferredWorkingHours: { type: 'string' },
                consultingMode: { type: 'string' },
                pricingStructure: { type: 'string' },
                paymentPreferences: { type: 'string' },
                briefBio: { type: 'string' },
                profileCompletion: { type: 'number' },
                rating: { type: 'number' },
                totalProjects: { type: 'number' },
                successRate: { type: 'number' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' }
              }
            }
          }
        },
        401: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            message: { type: 'string' }
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
  }, getProfileHandler);
  console.log('✅ Get consultant profile route registered');

  // PUT /api/consultant/profile - Update consultant's profile
  fastify.put('/', {
    schema: {
      description: 'Update consultant profile',
      tags: ['Consultant Profile'],
      body: {
        type: 'object',
        properties: {
          fullName: { type: 'string', minLength: 1, maxLength: 100 },
          email: { type: 'string', format: 'email' },
          phoneNumber: { type: 'string', minLength: 1 },
          location: { type: 'string', minLength: 1 },
          preferredWorkType: { type: 'string' },
          preferredWorkMode: { type: 'string' },
          languagesSpoken: { type: 'array', items: { type: 'string' }, minItems: 1 },
          specialization: { type: 'string', minLength: 1 },
          yearsOfExperience: { type: 'string', minLength: 1 },
          education: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                degree: { type: 'string', minLength: 1 },
                institution: { type: 'string', minLength: 1 },
                year: { type: 'string', minLength: 1 }
              },
              required: ['degree', 'institution', 'year']
            }
          },
          certificates: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', minLength: 1 }
              },
              required: ['name']
            }
          },
          professionalExperience: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                role: { type: 'string', minLength: 1 },
                company: { type: 'string', minLength: 1 },
                years: { type: 'string', minLength: 1 }
              },
              required: ['role', 'company', 'years']
            }
          },
          primarySkills: { type: 'array', items: { type: 'string' }, minItems: 1 },
          availableServices: { type: 'array', items: { type: 'string' }, minItems: 1 },
          preferredWorkingHours: { type: 'string' },
          consultingMode: { type: 'string' },
          pricingStructure: { type: 'string' },
          paymentPreferences: { type: 'string' },
          briefBio: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            profile: { type: 'object' }
          }
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            message: { type: 'string' },
            details: { type: 'array' }
          }
        },
        401: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, updateProfileHandler);
  console.log('✅ Update consultant profile route registered');

  // DELETE /api/consultant/profile - Delete consultant's profile (soft delete)
  fastify.delete('/', {
    schema: {
      description: 'Delete consultant profile (soft delete)',
      tags: ['Consultant Profile'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        },
        401: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            message: { type: 'string' }
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
  }, deleteProfileHandler);
  console.log('✅ Delete consultant profile route registered');

  // GET /api/consultant/profile/completion - Get profile completion percentage
  fastify.get('/completion', {
    schema: {
      description: 'Get profile completion percentage',
      tags: ['Consultant Profile'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            completion: { type: 'number' },
            message: { type: 'string' }
          }
        },
        401: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, getProfileCompletionHandler);
  console.log('✅ Get profile completion route registered');

  // POST /api/consultant/profile/avatar - Upload profile avatar
  fastify.post('/avatar', {
    schema: {
      description: 'Upload profile avatar',
      tags: ['Consultant Profile'],
      consumes: ['multipart/form-data'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            avatarUrl: { type: 'string' }
          }
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            message: { type: 'string' }
          }
        },
        401: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, uploadAvatarHandler);
  console.log('✅ Upload avatar route registered');

  // DELETE /api/consultant/profile/avatar - Remove profile avatar
  fastify.delete('/avatar', {
    schema: {
      description: 'Remove profile avatar',
      tags: ['Consultant Profile'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        },
        401: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, deleteAvatarHandler);
  console.log('✅ Delete avatar route registered');

  console.log('✅ All consultant profile routes registered successfully');
} 