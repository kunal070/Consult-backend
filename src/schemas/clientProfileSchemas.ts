import { z } from 'zod';

// Main client profile schema
export const clientProfileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100, 'Full name too long'),
  email: z.string().email('Invalid email format'),
  companyName: z.string().min(1, 'Company name is required').max(100, 'Company name too long'),
  companyWebsite: z.string().url('Invalid website URL').optional(),
  industry: z.string().min(1, 'Industry is required'),
  companySize: z.string().min(1, 'Company size is required'),
  location: z.string().min(1, 'Location is required'),
  role: z.string().min(1, 'Role is required'),
  useCase: z.string().min(1, 'Use case is required'),
  phoneNumber: z.string().optional(),
  hearAboutUs: z.string().optional(),
});

// Update profile schema (all fields optional for PATCH operations)
export const updateClientProfileSchema = clientProfileSchema.partial();

// Profile response schema
export const clientProfileResponseSchema = z.object({
  success: z.boolean(),
  profile: clientProfileSchema.extend({
    clientId: z.number(),
    acceptTerms: z.boolean(),
    createdAt: z.date(),
  }).optional(),
  message: z.string().optional(),
  error: z.string().optional()
});

// Type exports
export type ClientProfile = z.infer<typeof clientProfileSchema>;
export type UpdateClientProfileRequest = z.infer<typeof updateClientProfileSchema>;
export type ClientProfileResponse = z.infer<typeof clientProfileResponseSchema>;

// Validation helper function
export const validateClientProfileData = (data: unknown): Partial<ClientProfile> => {
  return updateClientProfileSchema.parse(data);
};