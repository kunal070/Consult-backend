export interface ConsultantService {
  id: number;
  consultant_id: number;
  title: string;
  description: string;
  service_type: string;
  expertise: string;
  hourly_rate: number;
  project_rate: number | null;
  availability: string;
  duration: string | null;
  experience_years: number | null;
  location: string | null;
  remote: boolean;
  languages: string;
  certifications: string;
  portfolio: string | null;
  linkedin: string | null;
  website: string | null;
  response_time: string | null;
  min_project_budget: number | null;
  created_at: string;
}

export interface CreateConsultantServiceRequest {
  consultant_id: number;
  title: string;
  description: string;
  service_type: string;
  expertise?: string;
  hourly_rate: number;
  project_rate?: number;
  availability: string;
  duration?: string;
  experience_years?: number;
  location?: string;
  remote?: boolean;
  languages?: string;
  certifications?: string;
  portfolio?: string;
  linkedin?: string;
  website?: string;
  response_time?: string;
  min_project_budget?: number;
  created_at?: string;
}

export interface UpdateConsultantServiceRequest {
  consultant_id?: number;
  title?: string;
  description?: string;
  service_type?: string;
  expertise?: string;
  hourly_rate?: number;
  project_rate?: number;
  availability?: string;
  duration?: string;
  experience_years?: number;
  location?: string;
  remote?: boolean;
  languages?: string;
  certifications?: string;
  portfolio?: string;
  linkedin?: string;
  website?: string;
  response_time?: string;
  min_project_budget?: number;
  created_at?: string;
}

export interface ConsultantServiceFilters {
  consultant_id?: number;
  service_type?: string;
  location?: string;
  min_hourly_rate?: number;
  max_hourly_rate?: number;
  min_project_rate?: number;
  max_project_rate?: number;
  min_experience_years?: number;
  max_experience_years?: number;
  remote?: boolean;
  availability?: string;
  expertise?: string;
  languages?: string;
  certifications?: string;
  min_project_budget?: number;
  max_project_budget?: number;
  page?: number;
  limit?: number;
  sort_by?: 'created_at' | 'hourly_rate' | 'project_rate' | 'experience_years' | 'title' | 'min_project_budget';
  sort_order?: 'ASC' | 'DESC';
}