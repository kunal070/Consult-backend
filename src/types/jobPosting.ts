export interface JobPosting {
  id: number;
  job_title: string;
  company_name: string;
  company_rating: number;
  hourly_rate_min: number;
  hourly_rate_max: number;
  duration: string;
  experience_level: string;
  description: string;
  tags: string;
  location: string;
  proposals: number;
  posted_time: string;
}

export interface CreateJobPostingRequest {
  job_title: string;
  company_name: string;
  company_rating: number;
  hourly_rate_min: number;
  hourly_rate_max: number;
  duration: string;
  experience_level: string;
  description: string;
  tags: string;
  location: string;
  proposals?: number;
  posted_time?: string;
}

export interface UpdateJobPostingRequest {
  job_title?: string;
  company_name?: string;
  company_rating?: number;
  hourly_rate_min?: number;
  hourly_rate_max?: number;
  duration?: string;
  experience_level?: string;
  description?: string;
  tags?: string;
  location?: string;
  proposals?: number;
  posted_time?: string;
}

export interface JobPostingFilters {
  company_name?: string;
  experience_level?: string;
  location?: string;
  min_hourly_rate?: number;
  max_hourly_rate?: number;
  min_rating?: number;
  tags?: string;
  page?: number;
  limit?: number;
  sort_by?: 'posted_time' | 'hourly_rate_min' | 'hourly_rate_max' | 'company_rating' | 'proposals';
  sort_order?: 'ASC' | 'DESC';
}