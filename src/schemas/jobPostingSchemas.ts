import { z } from 'zod';

// Schema for creating a new job posting
export const createJobPostingSchema = z.object({
  job_title: z.string().min(1, 'Job title is required').max(255, 'Job title too long'),
  company_name: z.string().min(1, 'Company name is required').max(100, 'Company name too long'),
  company_rating: z.number().min(0, 'Rating must be at least 0').max(5, 'Rating cannot exceed 5'),
  hourly_rate_min: z.number().min(0, 'Minimum hourly rate must be positive'),
  hourly_rate_max: z.number().min(0, 'Maximum hourly rate must be positive'),
  duration: z.string().min(1, 'Duration is required').max(50, 'Duration too long'),
  // experience_level: z.string().min(1, 'Experience level is required').max(50, 'Experience level too long'),
  description: z.string().min(1, 'Description is required'),
  tags: z.string().max(500, 'Tags too long').optional().default(''),
  location: z.string().min(1, 'Location is required').max(100, 'Location too long'),
  proposals: z.number().min(0, 'Proposals must be non-negative').optional().default(0),
  posted_time: z.string().optional()
}).refine(data => data.hourly_rate_max >= data.hourly_rate_min, {
  message: 'Maximum hourly rate must be greater than or equal to minimum hourly rate',
  path: ['hourly_rate_max']
});

// Schema for updating a job posting
export const updateJobPostingSchema = z.object({
  job_title: z.string().min(1, 'Job title is required').max(255, 'Job title too long').optional(),
  company_name: z.string().min(1, 'Company name is required').max(100, 'Company name too long').optional(),
  company_rating: z.number().min(0, 'Rating must be at least 0').max(5, 'Rating cannot exceed 5').optional(),
  hourly_rate_min: z.number().min(0, 'Minimum hourly rate must be positive').optional(),
  hourly_rate_max: z.number().min(0, 'Maximum hourly rate must be positive').optional(),
  duration: z.string().min(1, 'Duration is required').max(50, 'Duration too long').optional(),
  // experience_level: z.string().min(1, 'Experience level is required').max(50, 'Experience level too long').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  tags: z.string().max(500, 'Tags too long').optional(),
  location: z.string().min(1, 'Location is required').max(100, 'Location too long').optional(),
  proposals: z.number().min(0, 'Proposals must be non-negative').optional(),
  posted_time: z.string().optional()
}).refine(data => {
  if (data.hourly_rate_max !== undefined && data.hourly_rate_min !== undefined) {
    return data.hourly_rate_max >= data.hourly_rate_min;
  }
  return true;
}, {
  message: 'Maximum hourly rate must be greater than or equal to minimum hourly rate',
  path: ['hourly_rate_max']
});

// Schema for query parameters (filtering and pagination)
export const jobPostingQuerySchema = z.object({
  company_name: z.string().optional(),
  // experience_level: z.string().optional(),
  location: z.string().optional(),
  min_hourly_rate: z.string().transform(val => val ? parseFloat(val) : undefined).optional(),
  max_hourly_rate: z.string().transform(val => val ? parseFloat(val) : undefined).optional(),
  min_rating: z.string().transform(val => val ? parseFloat(val) : undefined).optional(),
  tags: z.string().optional(),
  page: z.string().transform(val => val ? parseInt(val) : 1).optional(),
  limit: z.string().transform(val => val ? parseInt(val) : 10).optional(),
  sort_by: z.enum(['posted_time', 'hourly_rate_min', 'hourly_rate_max', 'company_rating', 'proposals']).optional(),
  sort_order: z.enum(['ASC', 'DESC']).optional().default('DESC')
});

// Schema for job posting ID parameter
export const jobPostingIdSchema = z.object({
  id: z.string().transform(val => parseInt(val))
});