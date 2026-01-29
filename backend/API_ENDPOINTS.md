# MediLink API Endpoints Reference

Complete list of all API endpoints with request/response examples.

## Base URL
```
http://localhost:5000/api
```

## Authentication Endpoints

### POST `/auth/signup`
Common signup for all roles (Step 1).

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "PATIENT"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email with OTP.",
  "data": {
    "userId": "uuid",
    "email": "john@example.com",
    "role": "PATIENT",
    "nextStep": "complete-patient-profile"
  }
}
```

---

### POST `/auth/verify-email`
Verify email with OTP.

**Request:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "userId": "uuid",
    "email": "john@example.com",
    "role": "PATIENT",
    "emailVerified": true
  }
}
```

---

### POST `/auth/resend-otp`
Resend OTP for email verification.

**Request:**
```json
{
  "email": "john@example.com"
}
```

---

### POST `/auth/login`
Login user.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "PATIENT",
      "verified": true,
      "status": "APPROVED"
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "jwt_refresh_token"
    },
    "pendingVerification": false
  }
}
```

---

### POST `/auth/logout`
Logout user (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### GET `/auth/me`
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "PATIENT",
      "email_verified": true,
      "status": "APPROVED",
      "roleDetails": {
        "age": 30,
        "gender": "MALE",
        "blood_group": "O+"
      }
    }
  }
}
```

---

## Registration Endpoints (Step 2)

### POST `/registration/doctor`
Complete doctor registration (requires authentication + email verification).

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `specialization`: string (required)
- `licenseNumber`: string (required)
- `yearsOfExperience`: number (required)
- `medicalCouncilRegistration`: string (required)
- `governmentIdType`: "AADHAR" | "PAN" | "PASSPORT" (required)
- `certificate`: file (PDF/Image, required)
- `governmentId`: file (PDF/Image, required)

**Response:**
```json
{
  "success": true,
  "message": "Doctor registration completed. Waiting for admin verification.",
  "data": {
    "doctorId": "uuid",
    "licenseVerification": {
      "verified": false,
      "message": "License verification service unavailable. Requires manual verification.",
      "requiresManualVerification": true
    }
  }
}
```

---

### POST `/registration/pharmacy`
Complete pharmacy registration (requires authentication + email verification).

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `pharmacyName`: string (required)
- `ownerName`: string (required)
- `address`: string (required)
- `city`: string (optional)
- `state`: string (optional)
- `pinCode`: string (optional)
- `pharmacyRegistrationNumber`: string (required)
- `gstNumber`: string (optional)
- `drugLicenseCertificate`: file (PDF/Image, required)

**Response:**
```json
{
  "success": true,
  "message": "Pharmacy registration completed. Waiting for admin verification.",
  "data": {
    "pharmacyId": "uuid",
    "licenseVerification": {
      "verified": false,
      "message": "Pharmacy verification service unavailable. Requires manual verification.",
      "requiresManualVerification": true
    }
  }
}
```

---

### POST `/registration/patient`
Complete patient registration (requires authentication + email verification).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "age": 30,
  "gender": "MALE",
  "bloodGroup": "O+",
  "medicalHistory": "None",
  "emergencyContactName": "Jane Doe",
  "emergencyContactPhone": "+1234567890",
  "address": "123 Main St",
  "city": "City",
  "state": "State",
  "pinCode": "12345"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Patient registration completed successfully",
  "data": {
    "patientId": "uuid",
    "verified": true,
    "status": "APPROVED"
  }
}
```

---

## Admin Endpoints

All admin endpoints require authentication and admin role.

### GET `/admin/pending-doctors`
Get all pending doctor verifications.

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "doctors": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "specialization": "Cardiology",
        "license_number": "DOC123456",
        "years_of_experience": 10,
        "medical_council_registration": "MCR789012",
        "certificate_url": "https://cloudinary.com/...",
        "government_id_url": "https://cloudinary.com/...",
        "name": "Dr. John Doe",
        "email": "doctor@example.com"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  }
}
```

---

### GET `/admin/pending-pharmacies`
Get all pending pharmacy verifications.

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 20)

---

### GET `/admin/doctor/:id`
Get doctor details by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "specialization": "Cardiology",
    "license_number": "DOC123456",
    "certificate_url": "https://cloudinary.com/...",
    "name": "Dr. John Doe",
    "email": "doctor@example.com"
  }
}
```

---

### GET `/admin/pharmacy/:id`
Get pharmacy details by ID.

---

### POST `/admin/approve-doctor/:id`
Approve doctor verification.

**Request:**
```json
{
  "notes": "All documents verified. License is valid."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Doctor approved successfully"
}
```

---

### POST `/admin/reject-doctor/:id`
Reject doctor verification.

**Request:**
```json
{
  "notes": "License number does not match records."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Doctor rejected successfully"
}
```

---

### POST `/admin/approve-pharmacy/:id`
Approve pharmacy verification.

**Request:**
```json
{
  "notes": "All documents verified. Registration is valid."
}
```

---

### POST `/admin/reject-pharmacy/:id`
Reject pharmacy verification.

**Request:**
```json
{
  "notes": "Registration number does not match records."
}
```

---

### GET `/admin/actions`
Get admin action logs.

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 50)
- `actionType`: string (optional, e.g., "APPROVE_DOCTOR")
- `targetType`: string (optional, "DOCTOR" | "PHARMACY" | "USER")

**Response:**
```json
{
  "success": true,
  "data": {
    "actions": [
      {
        "id": "uuid",
        "admin_id": "uuid",
        "admin_name": "Admin User",
        "action_type": "APPROVE_DOCTOR",
        "target_type": "DOCTOR",
        "target_id": "uuid",
        "previous_status": "PENDING",
        "new_status": "APPROVED",
        "notes": "All documents verified.",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 50,
      "totalPages": 2
    }
  }
}
```

---

## Password Reset Endpoints

### POST `/password-reset/request`
Request password reset (sends reset token via email).

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If the email exists, a password reset link has been sent."
}
```

---

### POST `/password-reset/reset`
Reset password with token.

**Request:**
```json
{
  "email": "john@example.com",
  "token": "reset_token_uuid",
  "newPassword": "NewSecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### POST `/password-reset/verify-token`
Verify password reset token validity.

**Request:**
```json
{
  "email": "john@example.com",
  "token": "reset_token_uuid"
}
```

**Response:**
```json
{
  "success": true,
  "valid": true,
  "message": "Token is valid"
}
```

---

## Health Check

### GET `/health`
Check server health and database connection.

**Response:**
```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "connected"
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (development only)"
}
```

### Common HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error
- `503`: Service Unavailable (database connection issues)

---

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Token Structure:
```json
{
  "id": "user_uuid",
  "role": "PATIENT" | "DOCTOR" | "PHARMACY" | "ADMIN",
  "verified": true | false
}
```

### Token Expiry:
- **Access Token**: 15 minutes
- **Refresh Token**: 7 days
- **Session**: 24 hours (stored in Redis)

---

## Rate Limiting

- **Authentication endpoints**: 5 requests per 15 minutes
- **Standard endpoints**: 100 requests per 15 minutes

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset time (ISO string)

---

## File Uploads

File uploads are limited to:
- **Maximum size**: 10MB
- **Allowed types**: JPEG, PNG, PDF

Files are uploaded to Cloudinary and URLs are stored in the database.

---

## License Verification System (Hybrid Validation Model)

MediLink uses a **hybrid validation model** with three steps:

### 1. Format Validation (Automated Check)

The system first validates license number formats using regex patterns:

**Doctor License Format:**
- Pattern: `StateCode/Year/Number`
- Examples: `MH/2019/12345`, `DL/2020/67890`
- Regex: `/^[A-Z]{2}\/\d{4}\/\d{3,5}$/`

**Pharmacy License Format:**
- Pattern: 5-15 alphanumeric characters with hyphens/slashes
- Examples: `PD/12345`, `DL-67890`, `20-XXXXX`
- Regex: `/^[A-Z0-9\-\/]{5,15}$/`

**Error Response (Invalid Format):**
```json
{
  "success": false,
  "message": "Invalid license number format. Expected format: StateCode/Year/Number (e.g., MH/2019/12345)",
  "formatError": true,
  "expectedFormat": "XX/YYYY/XXXXX",
  "example": "MH/2019/12345 or DL/2020/67890"
}
```

### 2. Document-Based Verification (Primary Method)

Since India does not publish public APIs for verifying medical/pharmacy licenses, MediLink uses **document-based verification** (same as hospitals and telemedicine companies).

**Doctor Documents:**
- Medical Council registration certificate
- License number
- Government ID (Aadhar/PAN)
- Years of experience
- Specialization

**Pharmacy Documents:**
- Drug License certificate
- Registration number
- GST number
- Owner name and address

Documents are uploaded to Cloudinary, and URLs are stored for admin review.

**Success Response (Format Valid, Pending Admin Review):**
```json
{
  "success": true,
  "message": "Doctor registration completed. License format validated. Waiting for admin verification based on submitted documents.",
  "data": {
    "doctorId": "uuid",
    "licenseVerification": {
      "formatValid": true,
      "verified": false,
      "message": "License format is valid. Pending admin verification based on submitted documents.",
      "requiresManualVerification": true,
      "verificationMethod": "document-based"
    }
  }
}
```

### 3. Admin Review & Manual Approval

Admins review documents and approve/reject via admin endpoints:

**Approve Doctor:**
```
POST /api/admin/approve-doctor/:id
```

**Reject Doctor:**
```
POST /api/admin/reject-doctor/:id
```

**Approve Pharmacy:**
```
POST /api/admin/approve-pharmacy/:id
```

**Reject Pharmacy:**
```
POST /api/admin/reject-pharmacy/:id
```

**After Approval:**
- `verified: true`
- `status: "APPROVED"`
- Email notification sent

**After Rejection:**
- `verified: false`
- `status: "REJECTED"`
- Notes provided
- Email notification sent
- Admin action logged

### Optional External API Integration

If an external license verification API becomes available, configure in `.env`:

```
LICENSE_VERIFICATION_API_URL=https://api.medicalcouncil.gov.in/verify
LICENSE_VERIFICATION_API_KEY=your_api_key
```

**Expected API Endpoints:**

#### POST `/doctor/verify`
**Request:**
```json
{
  "licenseNumber": "MH/2019/12345",
  "medicalCouncilRegistration": "MCR789012"
}
```

**Response:**
```json
{
  "valid": true,
  "verified": true,
  "message": "License verified successfully",
  "details": {
    "status": "ACTIVE",
    "expiryDate": "2025-12-31"
  }
}
```

#### POST `/pharmacy/verify`
**Request:**
```json
{
  "registrationNumber": "PD/12345",
  "gstNumber": "29ABCDE1234F1Z5"
}
```

**Response:**
```json
{
  "valid": true,
  "verified": true,
  "message": "Pharmacy registration verified successfully",
  "details": {
    "status": "ACTIVE"
  }
}
```

If the API is unavailable, the system automatically falls back to document-based verification with admin review.

