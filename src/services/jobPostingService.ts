import { getConnection } from '../config/database';
import { JobPosting, CreateJobPostingRequest, UpdateJobPostingRequest, JobPostingFilters } from '../types/jobPosting';
import sql from 'mssql';

export class JobPostingService {
  /**
   * Create a new job posting
   */
  static async createJobPosting(data: CreateJobPostingRequest): Promise<JobPosting> {
    const pool = await getConnection();
    
    // Set posted_time to current timestamp if not provided
    const postedTime = data.posted_time || new Date().toISOString();
    
    const result = await pool.request()
      .input('job_title', sql.NVarChar(255), data.job_title)
      .input('company_name', sql.NVarChar(100), data.company_name)
      .input('company_rating', sql.Decimal(2, 1), data.company_rating)
      .input('hourly_rate_min', sql.Decimal(6, 2), data.hourly_rate_min)
      .input('hourly_rate_max', sql.Decimal(6, 2), data.hourly_rate_max)
      .input('duration', sql.NVarChar(50), data.duration)
      .input('experience_level', sql.NVarChar(50), data.experience_level)
      .input('description', sql.NVarChar(sql.MAX), data.description)
      .input('tags', sql.NVarChar(500), data.tags || '')
      .input('location', sql.NVarChar(100), data.location)
      .input('proposals', sql.Int, data.proposals || 0)
      .input('posted_time', sql.NVarChar(50), postedTime)
      .query(`
        INSERT INTO JobPostings (
          job_title, company_name, company_rating, hourly_rate_min, hourly_rate_max,
          duration, experience_level, description, tags, location, proposals, posted_time
        )
        OUTPUT INSERTED.*
        VALUES (
          @job_title, @company_name, @company_rating, @hourly_rate_min, @hourly_rate_max,
          @duration, @experience_level, @description, @tags, @location, @proposals, @posted_time
        )
      `);

    return result.recordset[0] as JobPosting;
  }

  /**
   * Get all job postings with optional filtering and pagination
   */
  static async getJobPostings(filters: JobPostingFilters = {}): Promise<{
    data: JobPosting[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const pool = await getConnection();
    
    // Set default values
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 10, 100); // Max 100 items per page
    const offset = (page - 1) * limit;
    const sortBy = filters.sort_by || 'posted_time';
    const sortOrder = filters.sort_order || 'DESC';

    // Build WHERE clause
    let whereConditions: string[] = [];
    const request = pool.request();

    if (filters.company_name) {
      whereConditions.push('company_name LIKE @company_name');
      request.input('company_name', sql.NVarChar, `%${filters.company_name}%`);
    }

    if (filters.experience_level) {
      whereConditions.push('experience_level = @experience_level');
      request.input('experience_level', sql.NVarChar(50), filters.experience_level);
    }

    if (filters.location) {
      whereConditions.push('location LIKE @location');
      request.input('location', sql.NVarChar, `%${filters.location}%`);
    }

    if (filters.min_hourly_rate !== undefined) {
      whereConditions.push('hourly_rate_min >= @min_hourly_rate');
      request.input('min_hourly_rate', sql.Decimal(6, 2), filters.min_hourly_rate);
    }

    if (filters.max_hourly_rate !== undefined) {
      whereConditions.push('hourly_rate_max <= @max_hourly_rate');
      request.input('max_hourly_rate', sql.Decimal(6, 2), filters.max_hourly_rate);
    }

    if (filters.min_rating !== undefined) {
      whereConditions.push('company_rating >= @min_rating');
      request.input('min_rating', sql.Decimal(2, 1), filters.min_rating);
    }

    if (filters.tags) {
      whereConditions.push('tags LIKE @tags');
      request.input('tags', sql.NVarChar, `%${filters.tags}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count for pagination
    const countResult = await request.query(`
      SELECT COUNT(*) as total FROM JobPostings ${whereClause}
    `);
    const total = countResult.recordset[0].total;

    // Get paginated results
    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, limit);

    const dataResult = await request.query(`
      SELECT * FROM JobPostings 
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `);

    return {
      data: dataResult.recordset as JobPosting[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get a single job posting by ID
   */
  static async getJobPostingById(id: number): Promise<JobPosting | null> {
    const pool = await getConnection();
    
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM JobPostings WHERE id = @id');

    return result.recordset.length > 0 ? result.recordset[0] as JobPosting : null;
  }

  /**
   * Update a job posting by ID
   */
  static async updateJobPosting(id: number, data: UpdateJobPostingRequest): Promise<JobPosting | null> {
    const pool = await getConnection();
    
    // Build SET clause dynamically based on provided fields
    const setFields: string[] = [];
    const request = pool.request().input('id', sql.Int, id);

    if (data.job_title !== undefined) {
      setFields.push('job_title = @job_title');
      request.input('job_title', sql.NVarChar(255), data.job_title);
    }

    if (data.company_name !== undefined) {
      setFields.push('company_name = @company_name');
      request.input('company_name', sql.NVarChar(100), data.company_name);
    }

    if (data.company_rating !== undefined) {
      setFields.push('company_rating = @company_rating');
      request.input('company_rating', sql.Decimal(2, 1), data.company_rating);
    }

    if (data.hourly_rate_min !== undefined) {
      setFields.push('hourly_rate_min = @hourly_rate_min');
      request.input('hourly_rate_min', sql.Decimal(6, 2), data.hourly_rate_min);
    }

    if (data.hourly_rate_max !== undefined) {
      setFields.push('hourly_rate_max = @hourly_rate_max');
      request.input('hourly_rate_max', sql.Decimal(6, 2), data.hourly_rate_max);
    }

    if (data.duration !== undefined) {
      setFields.push('duration = @duration');
      request.input('duration', sql.NVarChar(50), data.duration);
    }

    if (data.experience_level !== undefined) {
      setFields.push('experience_level = @experience_level');
      request.input('experience_level', sql.NVarChar(50), data.experience_level);
    }

    if (data.description !== undefined) {
      setFields.push('description = @description');
      request.input('description', sql.NVarChar(sql.MAX), data.description);
    }

    if (data.tags !== undefined) {
      setFields.push('tags = @tags');
      request.input('tags', sql.NVarChar(500), data.tags);
    }

    if (data.location !== undefined) {
      setFields.push('location = @location');
      request.input('location', sql.NVarChar(100), data.location);
    }

    if (data.proposals !== undefined) {
      setFields.push('proposals = @proposals');
      request.input('proposals', sql.Int, data.proposals);
    }

    if (data.posted_time !== undefined) {
      setFields.push('posted_time = @posted_time');
      request.input('posted_time', sql.NVarChar(50), data.posted_time);
    }

    if (setFields.length === 0) {
      // No fields to update, return current record
      return this.getJobPostingById(id);
    }

    const result = await request.query(`
      UPDATE JobPostings 
      SET ${setFields.join(', ')}
      OUTPUT INSERTED.*
      WHERE id = @id
    `);

    return result.recordset.length > 0 ? result.recordset[0] as JobPosting : null;
  }

  /**
   * Delete a job posting by ID
   */
  static async deleteJobPosting(id: number): Promise<boolean> {
    const pool = await getConnection();
    
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM JobPostings WHERE id = @id');

    return result.rowsAffected[0] > 0;
  }

  /**
   * Get job posting statistics
   */
  static async getJobPostingStats(): Promise<{
    total: number;
    byExperienceLevel: Array<{ experience_level: string; count: number }>;
    byLocation: Array<{ location: string; count: number }>;
    averageHourlyRate: number;
    totalProposals: number;
  }> {
    const pool = await getConnection();

    // Get total count
    const totalResult = await pool.request().query('SELECT COUNT(*) as total FROM JobPostings');
    const total = totalResult.recordset[0].total;

    // Get stats by experience level
    const experienceResult = await pool.request().query(`
      SELECT experience_level, COUNT(*) as count 
      FROM JobPostings 
      GROUP BY experience_level 
      ORDER BY count DESC
    `);

    // Get stats by location
    const locationResult = await pool.request().query(`
      SELECT location, COUNT(*) as count 
      FROM JobPostings 
      GROUP BY location 
      ORDER BY count DESC
    `);

    // Get average hourly rate and total proposals
    const avgResult = await pool.request().query(`
      SELECT 
        AVG((hourly_rate_min + hourly_rate_max) / 2) as avg_rate,
        SUM(proposals) as total_proposals
      FROM JobPostings
    `);

    return {
      total,
      byExperienceLevel: experienceResult.recordset,
      byLocation: locationResult.recordset,
      averageHourlyRate: avgResult.recordset[0].avg_rate || 0,
      totalProposals: avgResult.recordset[0].total_proposals || 0
    };
  }
}