import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerClientSchema = z.object({
  fullName: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  companyName: z.string(),
  companyWebsite: z.string().optional(),
  industry: z.string(),
  companySize: z.string(),
  location: z.string(),
  role: z.string(),
  useCase: z.string(),
  phoneNumber: z.string().optional(),
  hearAboutUs: z.string().optional(),
  acceptTerms: z.boolean(),
});

export const registerConsultantSchema = z.object({
  fullName: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  phoneNumber: z.string(),
  location: z.string(),
  preferredWorkType: z.string(),
  preferredWorkMode: z.string(),
  specialization: z.string(),
  yearsOfExperience: z.number(),
  primarySkills: z.string(),
  availableServices: z.string(),
  preferredWorkingHours: z.string(),
  consultingMode: z.string(),
  pricingStructure: z.string(),
  paymentPreferences: z.string(),
  briefBio: z.string(),
  languagesSpoken: z.array(z.string()),
  education: z.array(z.object({
    Degree: z.string(),
    Institution: z.string(),
    Year: z.string(),
  })),
  professionalExperience: z.array(z.object({
    Role: z.string(),
    Company: z.string(),
    Years: z.string(),
  })),
  certificates: z.array(z.object({
    Name: z.string(),
  })),
});
