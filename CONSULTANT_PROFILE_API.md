# Consultant Profile Management API

## Overview
This API provides comprehensive CRUD operations for consultant profile management with JWT authentication, data validation, and profile completion tracking.

## Base URL
```
http://localhost:5000/api/consultant/profile
```

## Authentication
All endpoints require JWT authentication with consultant role. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. GET /api/consultant/profile
**Purpose:** Fetch consultant's complete profile data

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Response (200):**
```json
{
  "success": true,
  "profile": {
    "consultantId": 1,
    "fullName": "Rutesh Zalavadiya",
    "email": "rutesh.zalavadiya@email.com",
    "phoneNumber": "+1 (555) 123-4567",
    "location": "San Francisco, CA",
    "preferredWorkType": "Remote",
    "preferredWorkMode": "Full-time",
    "languagesSpoken": ["English", "Hindi", "Gujarati"],
    "specialization": "Business Strategy & Digital Transformation",
    "yearsOfExperience": "8",
    "education": [
      {
        "degree": "Master of Business Administration",
        "institution": "Stanford University",
        "year": "2018"
      }
    ],
    "certificates": [
      {
        "name": "PMP Certification"
      },
      {
        "name": "Agile Scrum Master"
      }
    ],
    "professionalExperience": [
      {
        "role": "Senior Business Consultant",
        "company": "McKinsey & Company",
        "years": "2020-Present"
      }
    ],
    "primarySkills": ["Business Strategy", "Digital Transformation"],
    "availableServices": ["Strategic Planning", "Process Optimization"],
    "preferredWorkingHours": "9 AM - 6 PM PST",
    "consultingMode": "Hybrid",
    "pricingStructure": "$150/hour",
    "paymentPreferences": "Bank Transfer, PayPal",
    "briefBio": "Experienced business consultant with 8+ years...",
    "profileCompletion": 95,
    "rating": 4.9,
    "totalProjects": 47,
    "successRate": 98,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T14:45:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing JWT token
- `404 Not Found`: Profile not found

### 2. PUT /api/consultant/profile
**Purpose:** Update consultant's profile data

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullName": "Rutesh Zalavadiya",
  "email": "rutesh.zalavadiya@email.com",
  "phoneNumber": "+1 (555) 123-4567",
  "location": "San Francisco, CA",
  "preferredWorkType": "Remote",
  "preferredWorkMode": "Full-time",
  "languagesSpoken": ["English", "Hindi", "Gujarati"],
  "specialization": "Business Strategy & Digital Transformation",
  "yearsOfExperience": "8",
  "education": [
    {
      "degree": "Master of Business Administration",
      "institution": "Stanford University",
      "year": "2018"
    }
  ],
  "certificates": [
    {
      "name": "PMP Certification"
    },
    {
      "name": "Agile Scrum Master"
    }
  ],
  "professionalExperience": [
    {
      "role": "Senior Business Consultant",
      "company": "McKinsey & Company",
      "years": "2020-Present"
    }
  ],
  "primarySkills": ["Business Strategy", "Digital Transformation"],
  "availableServices": ["Strategic Planning", "Process Optimization"],
  "preferredWorkingHours": "9 AM - 6 PM PST",
  "consultingMode": "Hybrid",
  "pricingStructure": "$150/hour",
  "paymentPreferences": "Bank Transfer, PayPal",
  "briefBio": "Experienced business consultant with 8+ years..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "profile": {
    // Updated profile data
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Invalid or missing JWT token
- `409 Conflict`: Duplicate profile information

### 3. DELETE /api/consultant/profile
**Purpose:** Delete consultant's profile (soft delete)

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile deleted successfully"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing JWT token
- `404 Not Found`: Profile not found

### 4. GET /api/consultant/profile/completion
**Purpose:** Get profile completion percentage

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "success": true,
  "completion": 95,
  "message": "Profile is 95% complete"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing JWT token

### 5. POST /api/consultant/profile/avatar
**Purpose:** Upload profile avatar

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

**Request Body:**
```
Form data with file field containing image
```

**Response (200):**
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "avatarUrl": "/uploads/avatars/consultant-1-avatar.jpg"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid file type or size
- `401 Unauthorized`: Invalid or missing JWT token

### 6. DELETE /api/consultant/profile/avatar
**Purpose:** Remove profile avatar

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Avatar deleted successfully"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing JWT token

## Profile Completion Calculation

The system automatically calculates profile completion based on filled fields:

- **Basic Info (20%)**: Full name, email, phone number
- **Work Preferences (15%)**: Preferred work type and mode
- **Skills & Services (20%)**: Primary skills and available services
- **Education (15%)**: Education history
- **Experience (15%)**: Professional experience
- **Certificates (10%)**: Professional certificates
- **Bio (5%)**: Brief biography

## Data Validation

### Required Fields
- `fullName`: String, 1-100 characters
- `email`: Valid email format
- `phoneNumber`: String, minimum 1 character
- `location`: String, minimum 1 character
- `languagesSpoken`: Array of strings, minimum 1 item
- `specialization`: String, minimum 1 character
- `yearsOfExperience`: String, minimum 1 character
- `primarySkills`: Array of strings, minimum 1 item
- `availableServices`: Array of strings, minimum 1 item

### Optional Fields
- `preferredWorkType`: String
- `preferredWorkMode`: String
- `education`: Array of education objects
- `certificates`: Array of certificate objects
- `professionalExperience`: Array of experience objects
- `preferredWorkingHours`: String
- `consultingMode`: String
- `pricingStructure`: String
- `paymentPreferences`: String
- `briefBio`: String

### Education Object Structure
```json
{
  "degree": "string (required)",
  "institution": "string (required)",
  "year": "string (required)"
}
```

### Certificate Object Structure
```json
{
  "name": "string (required)"
}
```

### Professional Experience Object Structure
```json
{
  "role": "string (required)",
  "company": "string (required)",
  "years": "string (required)"
}
```

## Error Handling

### Validation Errors (400)
```json
{
  "success": false,
  "error": "Validation Error",
  "message": "Invalid profile data",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Authentication Errors (401)
```json
{
  "success": false,
  "error": "Authentication Error",
  "message": "Authorization header is required"
}
```

### Authorization Errors (403)
```json
{
  "success": false,
  "error": "Authorization Error",
  "message": "Access denied. Consultant role required."
}
```

### Not Found Errors (404)
```json
{
  "success": false,
  "message": "Profile not found"
}
```

### Conflict Errors (409)
```json
{
  "success": false,
  "message": "Profile with this information already exists"
}
```

## Security Features

1. **JWT Authentication**: All endpoints require valid JWT tokens
2. **Role-based Access**: Only consultants can access their own profiles
3. **Input Validation**: Comprehensive data validation using Zod schemas
4. **SQL Injection Prevention**: Parameterized queries
5. **XSS Protection**: Input sanitization
6. **File Upload Security**: File type and size validation

## Database Schema

### Main Consultants Table
```sql
CREATE TABLE Consultants (
  ConsultantID INT PRIMARY KEY IDENTITY(1,1),
  FullName NVARCHAR(100) NOT NULL,
  Email NVARCHAR(255) UNIQUE NOT NULL,
  PhoneNumber NVARCHAR(20) NOT NULL,
  Location NVARCHAR(100) NOT NULL,
  PreferredWorkType NVARCHAR(50),
  PreferredWorkMode NVARCHAR(50),
  Specialization NVARCHAR(100) NOT NULL,
  YearsOfExperience NVARCHAR(20) NOT NULL,
  PrimarySkills NVARCHAR(MAX), -- JSON array
  AvailableServices NVARCHAR(MAX), -- JSON array
  PreferredWorkingHours NVARCHAR(100),
  ConsultingMode NVARCHAR(50),
  PricingStructure NVARCHAR(100),
  PaymentPreferences NVARCHAR(255),
  BriefBio NVARCHAR(MAX),
  ProfileCompletion INT DEFAULT 0,
  Rating DECIMAL(3,2) DEFAULT 0,
  TotalProjects INT DEFAULT 0,
  SuccessRate DECIMAL(5,2) DEFAULT 0,
  IsDeleted BIT DEFAULT 0,
  CreatedAt DATETIME2 DEFAULT GETDATE(),
  UpdatedAt DATETIME2 DEFAULT GETDATE()
);
```

### Related Tables
```sql
-- Languages Spoken
CREATE TABLE LanguagesSpoken (
  ID INT PRIMARY KEY IDENTITY(1,1),
  ConsultantID INT FOREIGN KEY REFERENCES Consultants(ConsultantID),
  Language NVARCHAR(50) NOT NULL
);

-- Education
CREATE TABLE Education (
  ID INT PRIMARY KEY IDENTITY(1,1),
  ConsultantID INT FOREIGN KEY REFERENCES Consultants(ConsultantID),
  Degree NVARCHAR(100) NOT NULL,
  Institution NVARCHAR(255) NOT NULL,
  Year NVARCHAR(20) NOT NULL
);

-- Professional Experience
CREATE TABLE ProfessionalExperience (
  ID INT PRIMARY KEY IDENTITY(1,1),
  ConsultantID INT FOREIGN KEY REFERENCES Consultants(ConsultantID),
  Role NVARCHAR(100) NOT NULL,
  Company NVARCHAR(255) NOT NULL,
  Years NVARCHAR(50) NOT NULL
);

-- Certificates
CREATE TABLE Certificates (
  ID INT PRIMARY KEY IDENTITY(1,1),
  ConsultantID INT FOREIGN KEY REFERENCES Consultants(ConsultantID),
  Name NVARCHAR(255) NOT NULL
);
```

## Testing Examples

### Test Profile Data
```json
{
  "fullName": "Test Consultant",
  "email": "test.consultant@example.com",
  "phoneNumber": "+1 (555) 123-4567",
  "location": "New York, NY",
  "preferredWorkType": "Remote",
  "preferredWorkMode": "Full-time",
  "languagesSpoken": ["English", "Spanish"],
  "specialization": "Software Development",
  "yearsOfExperience": "5",
  "education": [
    {
      "degree": "Bachelor of Science in Computer Science",
      "institution": "MIT",
      "year": "2019"
    }
  ],
  "certificates": [
    {
      "name": "AWS Certified Developer"
    }
  ],
  "professionalExperience": [
    {
      "role": "Senior Software Engineer",
      "company": "Google",
      "years": "2020-Present"
    }
  ],
  "primarySkills": ["JavaScript", "React", "Node.js"],
  "availableServices": ["Web Development", "Mobile Development"],
  "preferredWorkingHours": "9 AM - 6 PM EST",
  "consultingMode": "Project-based",
  "pricingStructure": "$100/hour",
  "paymentPreferences": "Bank Transfer",
  "briefBio": "Experienced software developer with 5+ years..."
}
```

## Performance Considerations

1. **Database Indexes**: Index on ConsultantID for fast lookups
2. **Caching**: Profile data can be cached for frequently accessed profiles
3. **Pagination**: For large datasets, implement pagination
4. **Optimized Queries**: Use JOINs for related data retrieval
5. **Connection Pooling**: Efficient database connection management

## Rate Limiting

Consider implementing rate limiting for:
- Profile updates: 10 requests per minute
- Avatar uploads: 5 requests per minute
- Profile retrievals: 100 requests per minute

## Monitoring and Logging

- Log all profile operations with consultant ID
- Track profile completion trends
- Monitor API response times
- Alert on validation errors and authentication failures 