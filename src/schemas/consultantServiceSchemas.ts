import { z } from 'zod';

// Schema for creating a new consultant service
export const createConsultantServiceSchema = z.object({
  consultant_id: z.number().int().positive('Consultant ID must be a positive integer'),
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().min(1, 'Description is required'),
  service_type: z.string().min(1, 'Service type is required').max(100, 'Service type too long'),
  expertise: z.string().max(1000, 'Expertise too long').optional().default(''),
  hourly_rate: z.number().min(0, 'Hourly rate must be positive'),
  project_rate: z.number().min(0, 'Project rate must be positive').optional(),
  availability: z.string().min(1, 'Availability is required').max(50, 'Availability too long'),
  duration: z.string().max(50, 'Duration too long').optional(),
  experience_years: z.number().int().min(0, 'Experience years must be non-negative').optional(),
  location: z.string().max(100, 'Location too long').optional(),
  remote: z.boolean().optional().default(true),
  languages: z.string().max(500, 'Languages too long').optional().default(''),
  certifications: z.string().max(500, 'Certifications too long').optional().default(''),
  portfolio: z.string().max(255, 'Portfolio URL too long').optional(),
  linkedin: z.string().max(255, 'LinkedIn URL too long').optional(),
  website: z.string().max(255, 'Website URL too long').optional(),
  response_time: z.string().max(50, 'Response time too long').optional(),
  min_project_budget: z.number().min(0, 'Minimum project budget must be positive').optional(),
  created_at: z.string().optional()
});

// Schema for updating a consultant service
export const updateConsultantServiceSchema = z.object({
  consultant_id: z.number().int().positive('Consultant ID must be a positive integer').optional(),
  title: z.string().min(1, 'Title is required').max(255, 'Title too long').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  service_type: z.string().min(1, 'Service type is required').max(100, 'Service type too long').optional(),
  expertise: z.string().max(1000, 'Expertise too long').optional(),
  hourly_rate: z.number().min(0, 'Hourly rate must be positive').optional(),
  project_rate: z.number().min(0, 'Project rate must be positive').optional(),
  availability: z.string().min(1, 'Availability is required').max(50, 'Availability too long').optional(),
  duration: z.string().max(50, 'Duration too long').optional(),
  experience_years: z.number().int().min(0, 'Experience years must be non-negative').optional(),
  location: z.string().max(100, 'Location too long').optional(),
  remote: z.boolean().optional(),
  languages: z.string().max(500, 'Languages too long').optional(),
  certifications: z.string().max(500, 'Certifications too long').optional(),
  portfolio: z.string().max(255, 'Portfolio URL too long').optional(),
  linkedin: z.string().max(255, 'LinkedIn URL too long').optional(),
  website: z.string().max(255, 'Website URL too long').optional(),
  response_time: z.string().max(50, 'Response time too long').optional(),
  min_project_budget: z.number().min(0, 'Minimum project budget must be positive').optional(),
  created_at: z.string().optional()
});

// Schema for query parameters (filtering and pagination)
export const consultantServiceQuerySchema = z.object({
  consultant_id: z.string().transform(val => val ? parseInt(val) : undefined).optional(),
  service_type: z.string().optional(),
  location: z.string().optional(),
  min_hourly_rate: z.string().transform(val => val ? parseFloat(val) : undefined).optional(),
  max_hourly_rate: z.string().transform(val => val ? parseFloat(val) : undefined).optional(),
  min_project_rate: z.string().transform(val => val ? parseFloat(val) : undefined).optional(),
  max_project_rate: z.string().transform(val => val ? parseFloat(val) : undefined).optional(),
  min_experience_years: z.string().transform(val => val ? parseInt(val) : undefined).optional(),
  max_experience_years: z.string().transform(val => val ? parseInt(val) : undefined).optional(),
  remote: z.string().transform(val => val === 'true' ? true : val === 'false' ? false : undefined).optional(),
  availability: z.string().optional(),
  expertise: z.string().optional(),
  languages: z.string().optional(),
  certifications: z.string().optional(),
  min_project_budget: z.string().transform(val => val ? parseFloat(val) : undefined).optional(),
  max_project_budget: z.string().transform(val => val ? parseFloat(val) : undefined).optional(),
  page: z.string().transform(val => val ? parseInt(val) : 1).optional(),
  limit: z.string().transform(val => val ? parseInt(val) : 10).optional(),
  sort_by: z.enum(['created_at', 'hourly_rate', 'project_rate', 'experience_years', 'title', 'min_project_budget']).optional(),
  sort_order: z.enum(['ASC', 'DESC']).optional().default('DESC')
});

// Schema for consultant service ID parameter
export const consultantServiceIdSchema = z.object({
  id: z.string().transform(val => parseInt(val))
});