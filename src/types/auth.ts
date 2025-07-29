export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterClientRequest {
  fullName: string;
  email: string;
  password: string;
  companyName: string;
  companyWebsite?: string;
  industry: string;
  companySize: string;
  location: string;
  role: string;
  useCase: string;
  phoneNumber?: string;
  hearAboutUs?: string;
  acceptTerms: boolean;
}

export interface RegisterConsultantRequest {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  location: string;
  preferredWorkType: string;
  preferredWorkMode: string;
  specialization: string;
  yearsOfExperience: number;
  primarySkills: string[]; // ✅ Changed from string to string[]
  availableServices: string;
  preferredWorkingHours: string;
  consultingMode: string;
  pricingStructure: string;
  paymentPreferences: string;
  briefBio: string;
  languagesSpoken: string[];
  education: Array<{ Degree: string; Institution: string; Year: string }>;
  professionalExperience: Array<{ Role: string; Company: string; Years: string }>;
  certificates: Array<{ Name: string }>;
}
