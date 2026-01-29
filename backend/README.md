# MediLink Backend API

Complete authentication and authorization system for the MediLink healthcare platform.

## 🏗️ Architecture

- **Primary Database**: PostgreSQL (users, doctors, pharmacies, patients, appointments, prescriptions)
- **Secondary Database**: Redis (OTPs, sessions, caches, rate limiting, temporary tokens)
- **Framework**: Express.js
- **Authentication**: JWT (Access + Refresh tokens)
- **Password Hashing**: BCrypt (10 salt rounds)
- **File Storage**: Cloudinary (for document uploads)

## 📋 Features

### 1. User Roles
- **Patient**: Auto-verified, can access immediately after email verification
- **Doctor**: Requires admin verification after registration
- **Pharmacy**: Requires admin verification after registration
- **Admin**: System administrator for verification

### 2. Two-Step Registration Flow

#### Step 1: Common Signup
- Name, Email, Password, Role selection
- Email verification with OTP (stored in Redis, expires in 5 minutes)
- User status: `PENDING`

#### Step 2: Role-Specific Registration

**Doctor:**
- Specialization
- License number
- Years of experience
- Medical council registration number
- Certificate upload (PDF/Image)
- Government ID upload (Aadhar/PAN)
- License verification via external API
- Status: `PENDING` (awaiting admin approval)

**Pharmacy:**
- Pharmacy name, Owner name, Address
- Pharmacy registration number
- GST number
- Drug license certificate upload
- License verification via external API
- Status: `PENDING` (awaiting admin approval)

**Patient:**
- Age, Gender, Blood group (optional)
- Medical history (optional)
- Emergency contact
- Status: `APPROVED` (auto-verified)

### 3. Email Verification
- 6-digit OTP generated and stored in Redis
- OTP expires in 5 minutes
- Email sent via Nodemailer
- Resend OTP functionality

### 4. Login Flow
- Email and password authentication
- JWT access token (15 minutes expiry)
- JWT refresh token (7 days expiry)
- Session stored in Redis (24 hours)
- Role-based access control
- Verification status check

### 5. Admin Verification Dashboard
- View pending doctors and pharmacies
- View uploaded documents
- Approve/Reject with notes
- Action logging
- Email notifications on status change

### 6. Security Features
- Password hashing with BCrypt (10 rounds)
- JWT token authentication
- Rate limiting (Redis-based)
- CORS configuration
- Helmet.js security headers
- Input validation
- Session management
- Password reset via email

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v12+)
- Redis (v6+)
- Cloudinary account (for file uploads)

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Database Setup

#### PostgreSQL
```bash
# Create database
createdb medilink

# Run schema
psql -U postgres -d medilink -f database/schema.sql
```

#### Redis
```bash
# Start Redis server
redis-server
```

### 3. Environment Configuration

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- `JWT_SECRET`, `JWT_ACCESS_EXPIRY`, `JWT_REFRESH_EXPIRY`
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `LICENSE_VERIFICATION_API_URL`, `LICENSE_VERIFICATION_API_KEY`
- `FRONTEND_URL`

### 4. Run Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server will start on `http://localhost:5000`

## 📡 API Endpoints

### Authentication

#### POST `/api/auth/signup`
Common signup for all roles.

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

#### POST `/api/auth/verify-email`
Verify email with OTP.

**Request:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

#### POST `/api/auth/login`
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
    }
  }
}
```

#### POST `/api/auth/logout`
Logout user (requires authentication).

#### GET `/api/auth/me`
Get current user profile (requires authentication).

### Registration

#### POST `/api/registration/doctor`
Complete doctor registration (requires authentication + email verification).

**Request:**
- Form data with fields:
  - `specialization`: string
  - `licenseNumber`: string
  - `yearsOfExperience`: number
  - `medicalCouncilRegistration`: string
  - `governmentIdType`: "AADHAR" | "PAN" | "PASSPORT"
  - `certificate`: file (PDF/Image)
  - `governmentId`: file (PDF/Image)

**Headers:**
```
Authorization: Bearer <access_token>
```

#### POST `/api/registration/pharmacy`
Complete pharmacy registration (requires authentication + email verification).

**Request:**
- Form data with fields:
  - `pharmacyName`: string
  - `ownerName`: string
  - `address`: string
  - `city`: string (optional)
  - `state`: string (optional)
  - `pinCode`: string (optional)
  - `pharmacyRegistrationNumber`: string
  - `gstNumber`: string (optional)
  - `drugLicenseCertificate`: file (PDF/Image)

#### POST `/api/registration/patient`
Complete patient registration (requires authentication + email verification).

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

### Admin

#### GET `/api/admin/pending-doctors`
Get all pending doctor verifications (Admin only).

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 20)

#### GET `/api/admin/pending-pharmacies`
Get all pending pharmacy verifications (Admin only).

#### GET `/api/admin/doctor/:id`
Get doctor details by ID (Admin only).

#### GET `/api/admin/pharmacy/:id`
Get pharmacy details by ID (Admin only).

#### POST `/api/admin/approve-doctor/:id`
Approve doctor verification (Admin only).

**Request:**
```json
{
  "notes": "All documents verified. License is valid."
}
```

#### POST `/api/admin/reject-doctor/:id`
Reject doctor verification (Admin only).

**Request:**
```json
{
  "notes": "License number does not match records."
}
```

#### POST `/api/admin/approve-pharmacy/:id`
Approve pharmacy verification (Admin only).

#### POST `/api/admin/reject-pharmacy/:id`
Reject pharmacy verification (Admin only).

#### GET `/api/admin/actions`
Get admin action logs (Admin only).

### Password Reset

#### POST `/api/password-reset/request`
Request password reset (sends reset token via email).

**Request:**
```json
{
  "email": "john@example.com"
}
```

#### POST `/api/password-reset/reset`
Reset password with token.

**Request:**
```json
{
  "email": "john@example.com",
  "token": "reset_token",
  "newPassword": "NewSecurePass123"
}
```

## 🔐 License Verification System (Hybrid Validation Model)

MediLink uses a **hybrid validation model** that combines automated format validation with document-based verification and admin review. This is the same process used by hospitals and telemedicine companies in India, where public APIs for license verification are not available.

### Validation Process (3-Step System)

#### 1. Format Validation (Automated Check)

Before accepting a license, MediLink validates the license number format using regex patterns:

**Doctor License Format:**
- Pattern: `StateCode/Year/Number`
- Examples: `MH/2019/12345`, `DL/2020/67890`
- Regex: `/^[A-Z]{2}\/\d{4}\/\d{3,5}$/`

**Pharmacy License Format:**
- Pattern: Various formats (5-15 alphanumeric characters)
- Examples: `PD/12345`, `DL-67890`, `20-XXXXX`
- Regex: `/^[A-Z0-9\-\/]{5,15}$/`

If the format is invalid, the system rejects the registration with an error message.

#### 2. Document-Based Verification (Primary Method)

Since India does not publish a public API for verifying medical or pharmacy licenses, MediLink uses **document-based verification**:

**Doctor Documents:**
- Medical Council registration certificate (PDF/Image)
- License number
- Government ID (Aadhar/PAN/Passport)
- Years of experience
- Specialization

**Pharmacy Documents:**
- Drug License certificate (PDF/Image)
- Pharmacy registration number
- GST number (optional)
- Owner name and address

Documents are uploaded to Cloudinary, and URLs are stored in the database for admin review.

#### 3. Admin Review & Manual Approval

Admins can view all submitted documents and details:
- License number
- Registration certificate
- Government ID
- All other submitted fields

**Admin Endpoints:**
- `POST /api/admin/approve-doctor/:id` - Approve doctor verification
- `POST /api/admin/reject-doctor/:id` - Reject doctor verification
- `POST /api/admin/approve-pharmacy/:id` - Approve pharmacy verification
- `POST /api/admin/reject-pharmacy/:id` - Reject pharmacy verification

**After Approval:**
- `verified: true`
- `status: "APPROVED"`
- Email notification sent to user

**After Rejection:**
- `verified: false`
- `status: "REJECTED"`
- Notes provided for rejection reason
- Email notification sent to user
- Admin action logged for auditing

### Optional External API Integration

If an external license verification API becomes available, it can be configured in `.env`:

```
LICENSE_VERIFICATION_API_URL=https://api.medicalcouncil.gov.in/verify
LICENSE_VERIFICATION_API_KEY=your_api_key
```

The system will attempt to verify licenses via API, but if unavailable, it falls back to document-based verification with admin review.

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

If the API is unavailable or returns an error, the system automatically falls back to document-based verification with admin review.

## 🛡️ Security Best Practices

1. **HTTPS**: Always use HTTPS in production
2. **JWT Expiry**: Access tokens expire in 15 minutes, refresh tokens in 7 days
3. **Rate Limiting**: Authentication endpoints limited to 5 requests per 15 minutes
4. **Password Requirements**: Minimum 8 characters with uppercase, lowercase, and number
5. **Input Validation**: All inputs validated using express-validator
6. **File Upload Limits**: Maximum 10MB per file
7. **Session Management**: Sessions stored in Redis with 24-hour expiry
8. **CORS**: Configured for specific frontend origin
9. **Security Headers**: Helmet.js for security headers

## 📝 Database Schema

See `database/schema.sql` for complete schema.

### Key Tables:
- `users`: Common user table for all roles
- `doctors`: Doctor-specific details
- `pharmacies`: Pharmacy-specific details
- `patients`: Patient-specific details
- `admin_actions`: Admin action logs
- `appointments`: Patient appointments
- `prescriptions`: Doctor prescriptions
- `medical_history`: Patient medical history

## 🧪 Testing

### Default Admin Account

After running the schema, a default admin account is created:
- Email: `admin@medilink.in`
- Password: Change after first login (currently hashed placeholder)

### Development Mode

In development mode, OTPs are logged to console for testing:
```
[DEV] OTP for user@example.com: 123456
```

## 📦 Dependencies

- `express`: Web framework
- `pg`: PostgreSQL client
- `redis`: Redis client
- `jsonwebtoken`: JWT token generation
- `bcrypt`: Password hashing
- `nodemailer`: Email sending
- `multer`: File upload handling
- `cloudinary`: File storage
- `express-validator`: Input validation
- `helmet`: Security headers
- `cors`: CORS middleware

## 🚨 Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (development only)"
}
```

## 📞 Support

For issues or questions, please contact the development team.

---

**MediLink Backend API** - Secure Healthcare Platform Authentication System

