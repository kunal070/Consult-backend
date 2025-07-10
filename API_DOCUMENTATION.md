# Job Postings API Documentation

This document describes the API endpoints for managing job postings in the ConsultMatch backend.

## Base URL
```
http://localhost:3000/api/jobs
```

## Authentication
Currently, the job posting endpoints do not require authentication. You may want to add authentication middleware later based on your requirements.

## Endpoints

### 1. Create Job Posting
**POST** `/api/jobs`

Creates a new job posting.

**Request Body:**
```json
{
  "job_title": "Senior Full Stack Developer",
  "company_name": "TechCorp Inc",
  "company_rating": 4.5,
  "hourly_rate_min": 50.00,
  "hourly_rate_max": 80.00,
  "duration": "3-6 months",
  "experience_level": "Senior",
  "description": "We are looking for an experienced full stack developer...",
  "tags": "JavaScript, React, Node.js, TypeScript",
  "location": "Remote",
  "proposals": 0,
  "posted_time": "2025-01-09T21:47:00.000Z"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Job posting created successfully",
  "data": {
    "id": 1,
    "job_title": "Senior Full Stack Developer",
    "company_name": "TechCorp Inc",
    "company_rating": 4.5,
    "hourly_rate_min": 50.00,
    "hourly_rate_max": 80.00,
    "duration": "3-6 months",
    "experience_level": "Senior",
    "description": "We are looking for an experienced full stack developer...",
    "tags": "JavaScript, React, Node.js, TypeScript",
    "location": "Remote",
    "proposals": 0,
    "posted_time": "2025-01-09T21:47:00.000Z"
  }
}
```

### 2. Get All Job Postings
**GET** `/api/jobs`

Retrieves all job postings with optional filtering and pagination.

**Query Parameters:**
- `company_name` (string, optional): Filter by company name (partial match)
- `experience_level` (string, optional): Filter by experience level (exact match)
- `location` (string, optional): Filter by location (partial match)
- `min_hourly_rate` (number, optional): Minimum hourly rate filter
- `max_hourly_rate` (number, optional): Maximum hourly rate filter
- `min_rating` (number, optional): Minimum company rating filter
- `tags` (string, optional): Filter by tags (partial match)
- `page` (number, optional, default: 1): Page number for pagination
- `limit` (number, optional, default: 10, max: 100): Number of items per page
- `sort_by` (string, optional, default: 'posted_time'): Sort field (posted_time, hourly_rate_min, hourly_rate_max, company_rating, proposals)
- `sort_order` (string, optional, default: 'DESC'): Sort order (ASC, DESC)

**Example Request:**
```
GET /api/jobs?experience_level=Senior&location=Remote&page=1&limit=10&sort_by=posted_time&sort_order=DESC
```

**Response (200):**
```json
{
  "success": true,
  "message": "Job postings retrieved successfully",
  "data": [
    {
      "id": 1,
      "job_title": "Senior Full Stack Developer",
      "company_name": "TechCorp Inc",
      "company_rating": 4.5,
      "hourly_rate_min": 50.00,
      "hourly_rate_max": 80.00,
      "duration": "3-6 months",
      "experience_level": "Senior",
      "description": "We are looking for an experienced full stack developer...",
      "tags": "JavaScript, React, Node.js, TypeScript",
      "location": "Remote",
      "proposals": 5,
      "posted_time": "2025-01-09T21:47:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### 3. Get Job Posting by ID
**GET** `/api/jobs/:id`

Retrieves a specific job posting by its ID.

**Path Parameters:**
- `id` (number, required): Job posting ID

**Example Request:**
```
GET /api/jobs/1
```

**Response (200):**
```json
{
  "success": true,
  "message": "Job posting retrieved successfully",
  "data": {
    "id": 1,
    "job_title": "Senior Full Stack Developer",
    "company_name": "TechCorp Inc",
    "company_rating": 4.5,
    "hourly_rate_min": 50.00,
    "hourly_rate_max": 80.00,
    "duration": "3-6 months",
    "experience_level": "Senior",
    "description": "We are looking for an experienced full stack developer...",
    "tags": "JavaScript, React, Node.js, TypeScript",
    "location": "Remote",
    "proposals": 5,
    "posted_time": "2025-01-09T21:47:00.000Z"
  }
}
```

**Response (404):**
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Job posting not found"
}
```

### 4. Update Job Posting
**PUT** `/api/jobs/:id`

Updates an existing job posting. Only provided fields will be updated.

**Path Parameters:**
- `id` (number, required): Job posting ID

**Request Body (all fields optional):**
```json
{
  "job_title": "Updated Job Title",
  "company_rating": 4.8,
  "hourly_rate_min": 60.00,
  "proposals": 10
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Job posting updated successfully",
  "data": {
    "id": 1,
    "job_title": "Updated Job Title",
    "company_name": "TechCorp Inc",
    "company_rating": 4.8,
    "hourly_rate_min": 60.00,
    "hourly_rate_max": 80.00,
    "duration": "3-6 months",
    "experience_level": "Senior",
    "description": "We are looking for an experienced full stack developer...",
    "tags": "JavaScript, React, Node.js, TypeScript",
    "location": "Remote",
    "proposals": 10,
    "posted_time": "2025-01-09T21:47:00.000Z"
  }
}
```

### 5. Delete Job Posting
**DELETE** `/api/jobs/:id`

Deletes a job posting by its ID.

**Path Parameters:**
- `id` (number, required): Job posting ID

**Example Request:**
```
DELETE /api/jobs/1
```

**Response (200):**
```json
{
  "success": true,
  "message": "Job posting deleted successfully"
}
```

**Response (404):**
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Job posting not found"
}
```

### 6. Get Job Posting Statistics
**GET** `/api/jobs/stats`

Retrieves statistics about job postings.

**Response (200):**
```json
{
  "success": true,
  "message": "Job posting statistics retrieved successfully",
  "data": {
    "total": 150,
    "byExperienceLevel": [
      {
        "experience_level": "Senior",
        "count": 75
      },
      {
        "experience_level": "Mid-level",
        "count": 50
      },
      {
        "experience_level": "Junior",
        "count": 25
      }
    ],
    "byLocation": [
      {
        "location": "Remote",
        "count": 80
      },
      {
        "location": "New York",
        "count": 30
      },
      {
        "location": "San Francisco",
        "count": 25
      }
    ],
    "averageHourlyRate": 65.50,
    "totalProposals": 1250
  }
}
```

### 7. Search Job Postings
**GET** `/api/jobs/search`

Searches job postings by tags (can be extended to search in title and description).

**Query Parameters:**
- `q` (string, required): Search query
- `page` (number, optional, default: 1): Page number
- `limit` (number, optional, default: 10, max: 100): Items per page

**Example Request:**
```
GET /api/jobs/search?q=JavaScript&page=1&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "message": "Search results retrieved successfully",
  "data": [
    {
      "id": 1,
      "job_title": "Senior Full Stack Developer",
      "company_name": "TechCorp Inc",
      "company_rating": 4.5,
      "hourly_rate_min": 50.00,
      "hourly_rate_max": 80.00,
      "duration": "3-6 months",
      "experience_level": "Senior",
      "description": "We are looking for an experienced full stack developer...",
      "tags": "JavaScript, React, Node.js, TypeScript",
      "location": "Remote",
      "proposals": 5,
      "posted_time": "2025-01-09T21:47:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  },
  "searchQuery": "JavaScript"
}
```

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "error": "Validation Error",
  "message": "Invalid request data",
  "details": [
    {
      "field": "job_title",
      "message": "Job title is required",
      "code": "invalid_type"
    }
  ]
}
```

### Internal Server Error (500)
```json
{
  "success": false,
  "error": "Internal Server Error",
  "message": "Failed to create job posting"
}
```

## Database Schema

The JobPostings table structure:
```sql
CREATE TABLE JobPostings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    job_title NVARCHAR(255),
    company_name NVARCHAR(100),
    company_rating DECIMAL(2,1),
    hourly_rate_min DECIMAL(6,2),
    hourly_rate_max DECIMAL(6,2),
    duration NVARCHAR(50),
    experience_level NVARCHAR(50),
    description NVARCHAR(MAX),
    tags NVARCHAR(500),
    location NVARCHAR(100),
    proposals INT,
    posted_time NVARCHAR(50)
);
```

## Testing the API

You can test the API using tools like:
- **Postman**: Import the endpoints and test them
- **curl**: Command line testing
- **Thunder Client** (VS Code extension): Test directly in VS Code

### Example curl commands:

1. **Create a job posting:**
```bash
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "job_title": "Senior Full Stack Developer",
    "company_name": "TechCorp Inc",
    "company_rating": 4.5,
    "hourly_rate_min": 50.00,
    "hourly_rate_max": 80.00,
    "duration": "3-6 months",
    "experience_level": "Senior",
    "description": "We are looking for an experienced full stack developer...",
    "tags": "JavaScript, React, Node.js, TypeScript",
    "location": "Remote"
  }'
```

2. **Get all job postings:**
```bash
curl http://localhost:3000/api/jobs
```

3. **Get job posting by ID:**
```bash
curl http://localhost:3000/api/jobs/1
```

4. **Search job postings:**
```bash
curl "http://localhost:3000/api/jobs/search?q=JavaScript"
```

## Next Steps

1. **Authentication**: Add authentication middleware to protect certain endpoints
2. **Authorization**: Implement role-based access control
3. **Full-text Search**: Implement proper full-text search in title and description
4. **File Uploads**: Add support for company logos or job attachments
5. **Email Notifications**: Send notifications when new jobs are posted
6. **Rate Limiting**: Add rate limiting to prevent abuse
7. **Caching**: Implement caching for frequently accessed data
8. **API Versioning**: Add versioning support for future API changes