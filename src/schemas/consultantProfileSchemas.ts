import { z } from 'zod';

// Education schema
export const educationSchema = z.object({
  degree: z.string().min(1, 'Degree is required'),
  institution: z.string().min(1, 'Institution is required'),
  year: z.string().min(1, 'Year is required')
});

// Professional experience schema
export const professionalExperienceSchema = z.object({
  role: z.string().min(1, 'Role is required'),
  company: z.string().min(1, 'Company is required'),
  years: z.string().min(1, 'Years is required')
});

// Certificate schema
export const certificateSchema = z.object({
  name: z.string().min(1, 'Certificate name is required')
});

// Main consultant profile schema
export const consultantProfileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100, 'Full name too long'),
  email: z.string().email('Invalid email format'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  location: z.string().min(1, 'Location is required'),
  preferredWorkType: z.string().optional(),
  preferredWorkMode: z.string().optional(),
  languagesSpoken: z.array(z.string()).min(1, 'At least one language is required'),
  specialization: z.string().min(1, 'Specialization is required'),
  yearsOfExperience: z.string().min(1, 'Years of experience is required'),
  education: z.array(educationSchema).optional().default([]),
  certificates: z.array(certificateSchema).optional().default([]),
  professionalExperience: z.array(professionalExperienceSchema).optional().default([]),
  primarySkills: z.array(z.string()).min(1, 'At least one skill is required'),
  availableServices: z.array(z.string()).min(1, 'At least one service is required'),
  preferredWorkingHours: z.string().optional(),
  consultingMode: z.string().optional(),
  pricingStructure: z.string().optional(),
  paymentPreferences: z.string().optional(),
  briefBio: z.string().optional(),
  profileCompletion: z.number().min(0).max(100).optional(),
  rating: z.number().min(0).max(5).optional(),
  totalProjects: z.number().min(0).optional(),
  successRate: z.number().min(0).max(100).optional()
});

// Update profile schema (all fields optional)
export const updateProfileSchema = consultantProfileSchema.partial();

// Profile response schema
export const profileResponseSchema = z.object({
  success: z.boolean(),
  profile: consultantProfileSchema.optional(),
  message: z.string().optional(),
  error: z.string().optional()
});

// Avatar upload schema
export const avatarUploadSchema = z.object({
  file: z.any() // Will be validated by multipart middleware
});

// Profile completion calculation schema
export const profileCompletionSchema = z.object({
  basicInfo: z.boolean(),
  workPreferences: z.boolean(),
  skillsServices: z.boolean(),
  education: z.boolean(),
  experience: z.boolean(),
  certificates: z.boolean(),
  bio: z.boolean()
});

// Type exports
export type ConsultantProfile = z.infer<typeof consultantProfileSchema>;
export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>;
export type ProfileResponse = z.infer<typeof profileResponseSchema>;
export type ProfileCompletion = z.infer<typeof profileCompletionSchema>;

// Validation helper function
export const validateProfileData = (data: unknown): ConsultantProfile => {
  return consultantProfileSchema.parse(data);
};

// Profile completion calculation helper
export const calculateProfileCompletion = (profile: Partial<ConsultantProfile>): number => {
  let completion = 0;
  
  // Basic info (20%)
  if (profile.fullName && profile.email && profile.phoneNumber) {
    completion += 20;
  }
  
  // Work preferences (15%)
  if (profile.preferredWorkType && profile.preferredWorkMode) {
    completion += 15;
  }
  
  // Skills & services (20%)
  if (profile.primarySkills && profile.primarySkills.length > 0 && 
      profile.availableServices && profile.availableServices.length > 0) {
    completion += 20;
  }
  
  // Education (15%)
  if (profile.education && profile.education.length > 0) {
    completion += 15;
  }
  
  // Experience (15%)
  if (profile.professionalExperience && profile.professionalExperience.length > 0) {
    completion += 15;
  }
  
  // Certificates (10%)
  if (profile.certificates && profile.certificates.length > 0) {
    completion += 10;
  }
  
  // Bio (5%)
  if (profile.briefBio && profile.briefBio.trim().length > 0) {
    completion += 5;
  }
  
  return Math.min(completion, 100);
}; 