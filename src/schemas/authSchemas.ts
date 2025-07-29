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
  // Required fields - make sure they're not empty
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  location: z.string().min(1, "Location is required"),
  
  // Make these optional or provide defaults since they might be empty
  preferredWorkType: z.string().optional().default(""),
  preferredWorkMode: z.string().optional().default(""),
  specialization: z.string().optional().default(""),
  consultingMode: z.string().optional().default(""),
  pricingStructure: z.string().optional().default(""),
  paymentPreferences: z.string().optional().default(""),
  availableServices: z.string().optional().default(""),
  preferredWorkingHours: z.string().optional().default(""),
  briefBio: z.string().optional().default(""),
  
  // Fix the data type mismatch - frontend sends number
  yearsOfExperience: z.number().min(0, "Years of experience must be 0 or greater").default(0),
  
  // Frontend sends array, not string
  primarySkills: z.array(z.string()).min(1, "At least one skill is required"),
  
  // This should remain as array
  languagesSpoken: z.array(z.string()).min(1, "At least one language is required"),
  
  // Make nested objects optional and filter empty ones
  education: z.array(z.object({
    Degree: z.string().optional().default(""),
    Institution: z.string().optional().default(""),
    Year: z.string().optional().default(""),
  })).optional().default([]),
  
  professionalExperience: z.array(z.object({
    Role: z.string().optional().default(""),
    Company: z.string().optional().default(""),
    Years: z.string().optional().default(""),
  })).optional().default([]),
  
  certificates: z.array(z.object({
    Name: z.string().optional().default(""),
  })).optional().default([]),
});

// Alternative schema with transform to handle data cleaning
export const registerConsultantSchemaWithTransform = z.object({
  fullName: z.string().min(1, "Full name is required").transform(val => val.trim()),
  email: z.string().email("Please enter a valid email address").transform(val => val.trim().toLowerCase()),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phoneNumber: z.string().min(1, "Phone number is required").transform(val => val.trim()),
  location: z.string().min(1, "Location is required").transform(val => val.trim()),
  
  preferredWorkType: z.string().default(""),
  preferredWorkMode: z.string().default(""),
  specialization: z.string().default("").transform(val => val.trim()),
  consultingMode: z.string().default(""),
  pricingStructure: z.string().default("").transform(val => val.trim()),
  paymentPreferences: z.string().default(""),
  availableServices: z.string().default("").transform(val => val.trim()),
  preferredWorkingHours: z.string().default("").transform(val => val.trim()),
  briefBio: z.string().default("").transform(val => val.trim()),
  
  yearsOfExperience: z.number().min(0).default(0),
  primarySkills: z.array(z.string()).min(1, "At least one skill is required"),
  languagesSpoken: z.array(z.string()).min(1, "At least one language is required"),
  
  education: z.array(z.object({
    Degree: z.string().default(""),
    Institution: z.string().default(""),
    Year: z.string().default(""),
  })).default([]).transform(arr => 
    arr.filter(item => item.Degree.trim() || item.Institution.trim() || item.Year.trim())
  ),
  
  professionalExperience: z.array(z.object({
    Role: z.string().default(""),
    Company: z.string().default(""),
    Years: z.string().default(""),
  })).default([]).transform(arr => 
    arr.filter(item => item.Role.trim() || item.Company.trim() || item.Years.trim())
  ),
  
  certificates: z.array(z.object({
    Name: z.string().default(""),
  })).default([]).transform(arr => 
    arr.filter(item => item.Name.trim())
  ),
});

// Replace the validateConsultantRegistration function in authSchemas.ts with this:

export const validateConsultantRegistration = (data: unknown) => {
  try {
    const validatedData = registerConsultantSchema.parse(data);
    return { success: true, data: validatedData };
  } catch (error: any) {
    return { 
      success: false, 
      errors: error.errors.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message
      }))
    };
  }
};