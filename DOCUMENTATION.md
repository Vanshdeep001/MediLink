# MediLink - Complete Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Technology Stack](#technology-stack)
5. [Project Structure](#project-structure)
6. [Setup & Installation](#setup--installation)
7. [Configuration](#configuration)
8. [Frontend Documentation](#frontend-documentation)
9. [Backend Documentation](#backend-documentation)
10. [API Documentation](#api-documentation)
11. [Database Schema](#database-schema)
12. [Authentication & Authorization](#authentication--authorization)
13. [AI Integration](#ai-integration)
14. [Real-time Features](#real-time-features)
15. [Payment Integration](#payment-integration)
16. [Deployment](#deployment)
17. [Development Guide](#development-guide)
18. [Security](#security)
19. [Testing](#testing)
20. [Troubleshooting](#troubleshooting)
21. [Contributing](#contributing)

---

## Project Overview

**MediLink** is a comprehensive healthcare platform designed to bridge the gap between patients, doctors, and pharmacies in rural and urban areas. The platform provides AI-powered symptom analysis, real-time video consultations, digital health records, medicine ordering, emergency services, and more.

### Key Objectives

- **Accessibility**: Make quality healthcare accessible to everyone, especially in rural areas
- **Efficiency**: Streamline the healthcare process from symptom checking to medicine delivery
- **Security**: Ensure patient data privacy and secure medical records
- **Real-time Communication**: Enable instant communication between patients and healthcare providers
- **AI-Powered**: Leverage AI for preliminary symptom analysis and health insights

### Target Users

- **Patients**: Access healthcare services, book consultations, order medicines
- **Doctors**: Manage consultations, view patient history, provide prescriptions
- **Pharmacies**: Manage orders, track inventory, handle deliveries
- **Admins**: Verify and manage healthcare providers

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Patient    │  │    Doctor    │  │   Pharmacy   │      │
│  │   Portal     │  │    Portal    │  │    Portal    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Real-time Services (WebSocket/SSE)            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         AI Services (Genkit, OpenAI, Gemini)         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend API (Express.js)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Auth API   │  │  Payment API │  │  Admin API    │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ PostgreSQL   │    │    Redis     │    │  Cloudinary  │
│  (Primary)   │    │  (Cache/OTP) │    │  (Storage)   │
└──────────────┘    └──────────────┘    └──────────────┘
```

### Technology Stack

#### Frontend
- **Framework**: Next.js 15.3.3 (React 18.3.1)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **State Management**: React Context API
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Real-time**: WebSocket, Server-Sent Events (SSE)
- **Video**: WebRTC, Jitsi Meet
- **Notifications**: Firebase Cloud Messaging
- **Payments**: Stripe
- **AI**: Google Genkit, OpenAI, Google Gemini, Llama 3

#### Backend
- **Framework**: Express.js
- **Language**: JavaScript (ES Modules)
- **Database**: PostgreSQL
- **Cache/Sessions**: Redis
- **Authentication**: JWT (Access + Refresh tokens)
- **Password Hashing**: BCrypt
- **File Storage**: Cloudinary
- **Email**: Nodemailer
- **Validation**: Express Validator
- **Security**: Helmet.js, CORS

#### Infrastructure
- **Deployment**: Vercel (Frontend), Custom Server (Backend)
- **Database Hosting**: PostgreSQL (Vercel Postgres, Supabase, or custom)
- **Cache**: Redis (Vercel KV or custom)
- **CDN**: Vercel Edge Network
- **Monitoring**: Vercel Analytics

---

## Features

### 1. AI-Powered Symptom Checker
- Multi-AI provider support (Llama 3, OpenAI, Google Gemini)
- Intelligent symptom analysis with confidence scores
- Disease prediction with recommendations
- Fallback to local symptom database when AI unavailable
- Medical history integration

**Location**: `src/app/patient/symptom-checker`, `src/lib/ai-service.ts`

### 2. Real-time Video Consultations
- WebRTC-based video calls
- Jitsi Meet fallback
- Screen sharing capabilities
- Audio/video controls
- Call quality monitoring
- Multi-participant support

**Location**: `src/lib/webrtc-service.ts`, `src/components/webrtc-video-call.tsx`

### 3. ChatDoc - AI Doctor Assistant
- Real-time chat interface
- AI-powered medical advice
- Conversation history
- Integration with video consultations

**Location**: `src/app/patient/chatdoc`, `src/components/chatdoc/`

### 4. Digital Health ID
- Secure digital health records
- Medical history management
- Prescription storage
- Report uploads and analytics

**Location**: `src/app/patient/digital-health-id`, `src/app/patient/medical-history`

### 5. Medicine Ordering System
- Check medicine availability
- Order from local pharmacies
- Pickup or home delivery options
- Order tracking
- Alternative medicine suggestions

**Location**: `src/components/patient/order-medicines.tsx`, `src/lib/order-service.ts`

### 6. Pharmacy Management
- Order management dashboard
- Inventory tracking
- Delivery status updates
- Prescription verification

**Location**: `src/app/pharmacy`, `src/components/pharmacy/`

### 7. Emergency SOS
- One-tap emergency alert
- Location-based ambulance dispatch
- Emergency status tracking
- Real-time notifications

**Location**: `src/components/emergency/`, `src/lib/emergency-service.ts`

### 8. Voice Assistant
- Voice-activated commands
- Hands-free navigation
- Voice-to-text for forms
- Accessibility features

**Location**: `src/components/voice-assistant/`, `src/hooks/use-voice-assistant.ts`

### 9. Payment Integration
- Stripe payment processing
- Multiple payment methods
- Payment history
- Refund processing
- Secure checkout

**Location**: `src/lib/payment-service.ts`, `src/app/api/payments/`

### 10. Multi-language Support
- English, Hindi, Punjabi
- Context-based translations
- Dynamic language switching

**Location**: `src/locales/`, `src/context/language-context.tsx`

### 11. Offline Support
- SQLite local database (Dexie)
- Offline data sync
- Background sync when online
- Conflict resolution

**Location**: `src/lib/sqlite-service.ts`

### 12. Push Notifications
- Appointment reminders
- Call notifications
- Emergency alerts
- Order updates
- Background message handling

**Location**: `src/lib/firebase/messaging.ts`

---

## Project Structure

```
MediLink/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/                # API routes
│   │   │   ├── payments/       # Payment endpoints
│   │   │   ├── sse/            # Server-Sent Events
│   │   │   └── ws/             # WebSocket endpoint
│   │   ├── auth/               # Authentication pages
│   │   ├── patient/            # Patient portal
│   │   ├── doctor/             # Doctor portal
│   │   ├── pharmacy/           # Pharmacy portal
│   │   └── role-selection/     # Role selection page
│   ├── components/             # React components
│   │   ├── auth/               # Authentication components
│   │   ├── chatdoc/            # Chat interface components
│   │   ├── emergency/          # Emergency features
│   │   ├── landing/            # Landing page components
│   │   ├── patient/            # Patient-specific components
│   │   ├── doctor/             # Doctor-specific components
│   │   ├── pharmacy/           # Pharmacy components
│   │   ├── ui/                 # Reusable UI components
│   │   └── voice-assistant/    # Voice assistant
│   ├── lib/                    # Utility libraries
│   │   ├── ai-service.ts       # AI integration
│   │   ├── payment-service.ts  # Stripe integration
│   │   ├── webrtc-service.ts   # WebRTC video calls
│   │   ├── websocket-service.ts # WebSocket communication
│   │   ├── firebase/           # Firebase services
│   │   └── types.ts             # TypeScript types
│   ├── context/                # React contexts
│   ├── hooks/                   # Custom React hooks
│   └── locales/                 # Translation files
├── backend/                     # Express.js backend
│   ├── src/
│   │   ├── config/             # Configuration files
│   │   ├── middleware/         # Express middleware
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   └── database/           # Database migrations
│   ├── database/
│   │   └── schema.sql          # Database schema
│   └── package.json
├── public/                      # Static assets
├── docs/                        # Documentation
├── package.json                 # Frontend dependencies
├── next.config.js              # Next.js configuration
├── tailwind.config.ts          # Tailwind configuration
└── tsconfig.json               # TypeScript configuration
```

---

## Setup & Installation

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL**: v12.0 or higher
- **Redis**: v6.0 or higher
- **Git**: Latest version

### Frontend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MediLink
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   # AI Services
   NEXT_PUBLIC_LLAMA_API_URL=https://api.together.xyz/v1/chat/completions
   NEXT_PUBLIC_LLAMA_API_KEY=your_key_here
   NEXT_PUBLIC_OPENAI_API_KEY=your_key_here
   NEXT_PUBLIC_GEMINI_API_KEY=your_key_here
   
   # Firebase
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FCM_VAPID_KEY=your_vapid_key
   
   # Stripe
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8080/ws
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:3000`

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb medilink
   
   # Run schema
   psql -U postgres -d medilink -f database/schema.sql
   ```

4. **Set up Redis**
   ```bash
   # Start Redis server
   redis-server
   ```

5. **Configure environment variables**
   
   Create `.env` file in `backend/`:
   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=medilink
   DB_USER=postgres
   DB_PASSWORD=your_password
   
   # Redis
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=
   
   # JWT
   JWT_SECRET=your_jwt_secret_key
   JWT_ACCESS_EXPIRY=15m
   JWT_REFRESH_EXPIRY=7d
   
   # Email
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # License Verification (Optional)
   LICENSE_VERIFICATION_API_URL=
   LICENSE_VERIFICATION_API_KEY=
   
   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   ```

6. **Run database migrations**
   ```bash
   npm run migrate
   ```

7. **Start backend server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```
   
   The API will be available at `http://localhost:5000`

### Running Both Services

For development, you'll need both servers running:

**Terminal 1 (Frontend):**
```bash
npm run dev
```

**Terminal 2 (Backend):**
```bash
cd backend
npm run dev
```

---

## Configuration

### Next.js Configuration

The `next.config.js` file includes:
- React strict mode
- CSS optimization
- Webpack configuration for client-side only modules
- Server external packages for Vercel KV

### Tailwind Configuration

The `tailwind.config.ts` includes:
- Custom color scheme
- Custom fonts (Poppins, Dancing Script, Playfair Display)
- Custom animations
- Dark mode support

### TypeScript Configuration

The `tsconfig.json` includes:
- Strict type checking
- Path aliases (`@/*` for `src/*`)
- Next.js plugin integration

---

## Frontend Documentation

### Pages

#### Landing Page (`/`)
- Hero section with animated elements
- Features showcase
- How it works section
- Problem-solution section
- FAQ section

#### Authentication (`/auth`)
- Role-based authentication
- Email verification with OTP
- Login/Signup forms

#### Patient Portal (`/patient`)
- Symptom checker
- Video consultation booking
- ChatDoc interface
- Medical history
- Digital Health ID
- Medicine ordering

#### Doctor Portal (`/doctor`)
- Video call interface
- Patient management
- Prescription creation
- ChatDoc interface

#### Pharmacy Portal (`/pharmacy`)
- Order management
- Inventory tracking
- Delivery status updates

### Components

#### UI Components (`src/components/ui/`)
Reusable components built with Radix UI:
- Buttons, Cards, Dialogs
- Forms, Inputs, Selects
- Tables, Tabs, Accordions
- Toast notifications
- Theme provider

#### Feature Components
- **ChatDoc**: Real-time chat interface
- **Emergency**: SOS button and emergency manager
- **Video Call**: WebRTC video call interface
- **Voice Assistant**: Voice-activated features
- **Symptom Checker**: AI-powered symptom analysis

### Hooks

- `use-voice-assistant.ts`: Voice assistant functionality
- `use-mobile.tsx`: Mobile device detection
- `use-toast.ts`: Toast notifications
- `use-video-call-fallback.ts`: Video call fallback handling

### Services

- **AI Service**: Multi-provider AI integration
- **Payment Service**: Stripe payment processing
- **WebRTC Service**: Video call functionality
- **WebSocket Service**: Real-time communication
- **Emergency Service**: Emergency alert system
- **Order Service**: Medicine ordering
- **Chat Service**: Chat functionality

---

## Backend Documentation

### Architecture

The backend follows a modular architecture:

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.js  # PostgreSQL connection
│   │   ├── jwt.js       # JWT configuration
│   │   └── redis.js     # Redis connection
│   ├── middleware/      # Express middleware
│   │   ├── auth.middleware.js      # JWT authentication
│   │   ├── rate-limit.middleware.js # Rate limiting
│   │   └── validation.middleware.js # Input validation
│   ├── routes/          # API routes
│   │   ├── auth.routes.js           # Authentication
│   │   ├── registration.routes.js   # Registration
│   │   ├── admin.routes.js          # Admin operations
│   │   └── password-reset.routes.js  # Password reset
│   ├── services/        # Business logic
│   │   ├── email.service.js          # Email sending
│   │   ├── otp.service.js            # OTP generation
│   │   ├── license-verification.service.js # License verification
│   │   └── upload.service.js         # File uploads
│   └── server.js        # Express app entry point
```

### Routes

#### Authentication Routes (`/api/auth`)
- `POST /signup` - User registration
- `POST /verify-email` - Email verification with OTP
- `POST /resend-otp` - Resend OTP
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /me` - Get current user

#### Registration Routes (`/api/registration`)
- `POST /doctor` - Complete doctor registration
- `POST /pharmacy` - Complete pharmacy registration
- `POST /patient` - Complete patient registration

#### Admin Routes (`/api/admin`)
- `GET /pending-doctors` - Get pending doctors
- `GET /pending-pharmacies` - Get pending pharmacies
- `GET /doctor/:id` - Get doctor details
- `GET /pharmacy/:id` - Get pharmacy details
- `POST /approve-doctor/:id` - Approve doctor
- `POST /reject-doctor/:id` - Reject doctor
- `POST /approve-pharmacy/:id` - Approve pharmacy
- `POST /reject-pharmacy/:id` - Reject pharmacy
- `GET /actions` - Get admin action logs

#### Password Reset Routes (`/api/password-reset`)
- `POST /request` - Request password reset
- `POST /reset` - Reset password
- `POST /verify-token` - Verify reset token

### Middleware

#### Authentication Middleware
Validates JWT tokens and extracts user information.

#### Rate Limiting Middleware
Implements Redis-based rate limiting:
- Authentication endpoints: 5 requests per 15 minutes
- Standard endpoints: 100 requests per 15 minutes

#### Validation Middleware
Validates request data using express-validator.

### Services

#### Email Service
Sends emails via Nodemailer:
- OTP emails
- Password reset emails
- Verification status emails

#### OTP Service
Generates and validates OTPs:
- 6-digit OTP
- 5-minute expiry
- Stored in Redis

#### License Verification Service
Validates medical licenses:
- Format validation
- Optional external API integration
- Document-based verification fallback

#### Upload Service
Handles file uploads to Cloudinary:
- Image and PDF support
- Maximum 10MB per file
- Secure URL generation

---

## API Documentation

### Base URL
```
Development: http://localhost:5000/api
Production: https://api.medilink.com/api
```

### Authentication

Most endpoints require authentication via JWT token:

```
Authorization: Bearer <access_token>
```

### Response Format

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (development only)"
}
```

### Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error
- `503` - Service Unavailable

For detailed API endpoint documentation, see:
- `backend/API_ENDPOINTS.md` - Complete API reference
- `backend/README.md` - Backend overview

---

## Database Schema

### Tables

#### `users`
Common user table for all roles.

**Columns:**
- `id` (UUID, Primary Key)
- `name` (VARCHAR)
- `email` (VARCHAR, Unique)
- `password` (VARCHAR, Hashed)
- `role` (VARCHAR: PATIENT, DOCTOR, PHARMACY, ADMIN)
- `email_verified` (BOOLEAN)
- `status` (VARCHAR: PENDING, APPROVED, REJECTED, SUSPENDED)
- `verified` (BOOLEAN)
- `created_at`, `updated_at`, `last_login` (TIMESTAMP)
- `phone` (VARCHAR)
- `profile_image_url` (TEXT)

#### `doctors`
Doctor-specific information.

**Columns:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id)
- `specialization` (VARCHAR)
- `license_number` (VARCHAR, Unique)
- `years_of_experience` (INTEGER)
- `medical_council_registration` (VARCHAR, Unique)
- `certificate_url` (TEXT)
- `government_id_url` (TEXT)
- `government_id_type` (VARCHAR: AADHAR, PAN, PASSPORT)
- `verified`, `status`, `verification_notes`
- `verified_by`, `verified_at`
- `created_at`, `updated_at`

#### `pharmacies`
Pharmacy-specific information.

**Columns:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id)
- `pharmacy_name`, `owner_name` (VARCHAR)
- `address`, `city`, `state`, `pin_code` (TEXT/VARCHAR)
- `pharmacy_registration_number` (VARCHAR, Unique)
- `gst_number` (VARCHAR, Unique)
- `drug_license_certificate_url` (TEXT)
- `verified`, `status`, `verification_notes`
- `verified_by`, `verified_at`
- `created_at`, `updated_at`

#### `patients`
Patient-specific information.

**Columns:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id)
- `age` (INTEGER)
- `gender` (VARCHAR: MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY)
- `blood_group` (VARCHAR)
- `medical_history` (TEXT)
- `emergency_contact_name`, `emergency_contact_phone` (VARCHAR)
- `address`, `city`, `state`, `pin_code` (TEXT/VARCHAR)
- `verified`, `status`
- `created_at`, `updated_at`

#### `admin_actions`
Log of all admin actions.

**Columns:**
- `id` (UUID, Primary Key)
- `admin_id` (UUID, Foreign Key → users.id)
- `action_type` (VARCHAR)
- `target_type` (VARCHAR: DOCTOR, PHARMACY, USER)
- `target_id` (UUID)
- `previous_status`, `new_status` (VARCHAR)
- `notes` (TEXT)
- `created_at` (TIMESTAMP)

### Indexes

Indexes are created on:
- `users.email`, `users.role`, `users.status`
- `doctors.user_id`, `doctors.license_number`, `doctors.status`
- `pharmacies.user_id`, `pharmacies.registration_number`, `pharmacies.status`
- `patients.user_id`

For complete schema, see `backend/database/schema.sql`.

---

## Authentication & Authorization

### Registration Flow

#### Step 1: Common Signup
1. User provides: name, email, password, role
2. System creates user with status `PENDING`
3. OTP sent to email (stored in Redis, 5-minute expiry)
4. User verifies email with OTP

#### Step 2: Role-Specific Registration

**Doctor:**
- Specialization, license number, experience
- Medical council registration
- Certificate and government ID upload
- Status: `PENDING` (awaiting admin approval)

**Pharmacy:**
- Pharmacy details, registration number
- GST number (optional)
- Drug license certificate upload
- Status: `PENDING` (awaiting admin approval)

**Patient:**
- Age, gender, blood group
- Medical history (optional)
- Emergency contact
- Status: `APPROVED` (auto-verified)

### Login Flow

1. User provides email and password
2. System validates credentials
3. JWT access token generated (15-minute expiry)
4. JWT refresh token generated (7-day expiry)
5. Session stored in Redis (24-hour expiry)
6. User role and verification status checked

### Token Structure

```json
{
  "id": "user_uuid",
  "role": "PATIENT" | "DOCTOR" | "PHARMACY" | "ADMIN",
  "verified": true | false
}
```

### Role-Based Access Control

- **Patient**: Access to patient portal, symptom checker, consultations
- **Doctor**: Access to doctor portal, patient management, prescriptions
- **Pharmacy**: Access to pharmacy portal, order management
- **Admin**: Access to admin dashboard, verification management

### Password Reset

1. User requests password reset
2. Reset token generated and sent via email
3. Token stored in Redis (1-hour expiry)
4. User resets password with token
5. Token invalidated after use

---

## AI Integration

### Supported AI Providers

1. **Llama 3** (via Together.ai) - Recommended
2. **OpenAI GPT-3.5/4**
3. **Google Gemini**

### Configuration

Add API keys to `.env.local`:

```env
NEXT_PUBLIC_LLAMA_API_URL=https://api.together.xyz/v1/chat/completions
NEXT_PUBLIC_LLAMA_API_KEY=your_key
NEXT_PUBLIC_OPENAI_API_KEY=your_key
NEXT_PUBLIC_GEMINI_API_KEY=your_key
```

### AI Service Priority

The system tries providers in order:
1. Llama 3
2. OpenAI
3. Google Gemini
4. Local fallback database

### Usage

```typescript
import { aiService } from '@/lib/ai-service';

const analysis = await aiService.analyzeSymptoms({
  symptoms: ['fever', 'cough', 'headache'],
  age: 30,
  gender: 'male',
  severity: 'moderate',
  duration: 3,
  medicalHistory: ['diabetes']
});
```

### Response Format

```typescript
{
  conditions: string[];        // Possible conditions
  recommendation: string;       // General recommendations
  seekHelp: string;            // When to seek medical help
  advice: string;              // Health advice
  confidence: number;         // 0.0 to 1.0
  aiModel: string;             // AI model used
}
```

### Fallback Mode

If no API keys are provided, the system uses a local symptom database for basic analysis.

For detailed AI integration guide, see `AI_INTEGRATION.md`.

---

## Real-time Features

### WebSocket Communication

**Location**: `src/lib/websocket-service.ts`, `src/app/api/ws/route.ts`

**Features:**
- Real-time chat messaging
- Live notifications
- User presence (online/offline)
- Typing indicators
- Message read receipts
- Automatic reconnection
- Message queuing for offline scenarios

**Message Types:**
- `chat_message` - Real-time chat
- `call_notification` - Video call alerts
- `appointment_reminder` - Appointment notifications
- `emergency_alert` - Emergency notifications
- `user_online/offline` - Presence updates
- `typing_start/stop` - Typing indicators

### Server-Sent Events (SSE)

For Vercel deployment, SSE is used instead of WebSockets:

**Location**: `src/lib/vercel-websocket-service.ts`, `src/app/api/sse/route.ts`

### WebRTC Video Calls

**Location**: `src/lib/webrtc-service.ts`

**Features:**
- Secure, low-latency video calls
- Screen sharing
- Audio/video controls
- Connection quality monitoring
- Automatic reconnection
- Multi-participant support

**Fallback**: Jitsi Meet integration for compatibility

### Push Notifications

**Location**: `src/lib/firebase/messaging.ts`

**Features:**
- Appointment reminders
- Call notifications
- Emergency alerts
- Chat message notifications
- Background message handling

---

## Payment Integration

### Stripe Integration

**Location**: `src/lib/payment-service.ts`, `src/app/api/payments/`

**Features:**
- Secure payment processing
- Multiple payment methods
- Customer management
- Payment history
- Refund processing
- Webhook verification

### API Endpoints

- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/customers` - Create customer
- `GET /api/payments/methods` - Get payment methods
- `POST /api/payments/refund` - Process refund
- `GET /api/payments/history` - Get payment history

### Configuration

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Usage

```typescript
import { paymentService } from '@/lib/payment-service';

const paymentIntent = await paymentService.createPaymentIntent(
  amount,
  currency,
  metadata
);
```

---

## Deployment

### Vercel Deployment (Frontend)

**Why Vercel:**
- Native Next.js support
- Automatic deployments
- Edge network CDN
- Serverless functions
- Environment variable management

**Steps:**

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Set Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   # Add all other environment variables
   ```

**Or use GitHub Integration:**
1. Push code to GitHub
2. Import repository in Vercel dashboard
3. Configure environment variables
4. Deploy automatically

### Backend Deployment

**Options:**
- **VPS**: Deploy on DigitalOcean, AWS EC2, etc.
- **Platform as a Service**: Railway, Render, Heroku
- **Container**: Docker deployment

**Requirements:**
- Node.js 18+
- PostgreSQL database
- Redis instance
- Environment variables configured

### Database Setup

**Options:**
- Vercel Postgres
- Supabase
- AWS RDS
- Custom PostgreSQL server

### Redis Setup

**Options:**
- Vercel KV
- Redis Cloud
- AWS ElastiCache
- Custom Redis server

For detailed deployment guide, see `VERCEL_DEPLOYMENT.md`.

---

## Development Guide

### Running in Development

1. **Start Frontend**
   ```bash
   npm run dev
   ```

2. **Start Backend**
   ```bash
   cd backend
   npm run dev
   ```

3. **Start Redis** (if not running as service)
   ```bash
   redis-server
   ```

### Available Scripts

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - TypeScript type checking
- `npm run genkit:dev` - Start Genkit AI dev server
- `npm run genkit:watch` - Start Genkit with watch mode

**Backend:**
- `npm run dev` - Start with nodemon (auto-reload)
- `npm start` - Start production server
- `npm run migrate` - Run database migrations

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for Next.js
- **Prettier**: Recommended for code formatting
- **Components**: Functional components with hooks
- **Naming**: PascalCase for components, camelCase for functions

### Git Workflow

1. Create feature branch
2. Make changes
3. Test locally
4. Commit with descriptive messages
5. Push and create pull request

### Testing

Currently, manual testing is recommended. Future additions:
- Unit tests (Jest)
- Integration tests
- E2E tests (Playwright)

---

## Security

### Authentication Security

- **Password Hashing**: BCrypt with 10 salt rounds
- **JWT Tokens**: Short-lived access tokens (15 minutes)
- **Refresh Tokens**: Longer-lived (7 days) with rotation
- **Session Management**: Redis-based with 24-hour expiry

### API Security

- **Rate Limiting**: Redis-based rate limiting
- **CORS**: Configured for specific origins
- **Helmet.js**: Security headers
- **Input Validation**: Express Validator
- **SQL Injection Prevention**: Parameterized queries

### Data Security

- **Encryption**: HTTPS/TLS for all communications
- **File Uploads**: Validated file types and sizes
- **Cloudinary**: Secure file storage
- **Environment Variables**: Never commit secrets

### Best Practices

1. Always use HTTPS in production
2. Keep dependencies updated
3. Regular security audits
4. Monitor for suspicious activity
5. Implement proper error handling
6. Log security events

---

## Testing

### Manual Testing Checklist

#### Authentication
- [ ] User registration
- [ ] Email verification
- [ ] Login/Logout
- [ ] Password reset
- [ ] Token refresh

#### Patient Features
- [ ] Symptom checker
- [ ] Video consultation booking
- [ ] ChatDoc interface
- [ ] Medical history
- [ ] Medicine ordering

#### Doctor Features
- [ ] Video call interface
- [ ] Patient management
- [ ] Prescription creation

#### Pharmacy Features
- [ ] Order management
- [ ] Inventory tracking

#### Admin Features
- [ ] Doctor verification
- [ ] Pharmacy verification
- [ ] Action logs

### Testing Tools

- **Postman/Insomnia**: API testing
- **Browser DevTools**: Frontend debugging
- **Redis CLI**: Cache inspection
- **PostgreSQL CLI**: Database inspection

---

## Troubleshooting

### Common Issues

#### Frontend Issues

**Port 3000 already in use**
```bash
# Kill process on port 3000
npx kill-port 3000
# Or use different port
npm run dev -- -p 3001
```

**Module not found errors**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

**Environment variables not working**
- Ensure `.env.local` exists
- Restart dev server after changes
- Check variable names (must start with `NEXT_PUBLIC_` for client-side)

#### Backend Issues

**Database connection failed**
- Check PostgreSQL is running
- Verify connection credentials in `.env`
- Ensure database exists

**Redis connection failed**
- Check Redis is running
- Verify Redis credentials
- Test connection: `redis-cli ping`

**JWT token errors**
- Check `JWT_SECRET` is set
- Verify token expiry settings
- Check token format in requests

#### AI Service Issues

**AI analysis not working**
- Check API keys in `.env.local`
- Verify API quota/limits
- Check network connectivity
- System will fallback to local database

#### Video Call Issues

**WebRTC connection failed**
- Check ICE server configuration
- Verify signaling server URL
- Check firewall/network settings
- Try Jitsi Meet fallback

### Debug Commands

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check PostgreSQL connection
psql -U postgres -d medilink -c "SELECT version();"

# Check Redis connection
redis-cli ping

# View backend logs
cd backend
npm run dev

# View frontend logs
npm run dev
```

### Getting Help

1. Check existing documentation
2. Review error messages carefully
3. Check browser console for frontend errors
4. Check server logs for backend errors
5. Verify environment variables
6. Ensure all services are running

---

## Contributing

### How to Contribute

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Contribution Guidelines

- Follow existing code style
- Write clear commit messages
- Update documentation as needed
- Test your changes
- Ensure no breaking changes

### Code Review Process

1. Pull request submitted
2. Automated checks run
3. Code review by maintainers
4. Address feedback
5. Merge after approval

---

## Additional Resources

### Documentation Files

- `README.md` - Project overview
- `backend/README.md` - Backend documentation
- `backend/API_ENDPOINTS.md` - Complete API reference
- `backend/SETUP.md` - Backend setup guide
- `AI_INTEGRATION.md` - AI integration guide
- `VERCEL_DEPLOYMENT.md` - Deployment guide
- `BACKEND_FEATURES.md` - Backend features documentation
- `docs/blueprint.md` - Design blueprint

### External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Redis Documentation](https://redis.io/docs)

---

## License

[Add your license information here]

---

## Contact & Support

For issues, questions, or contributions:
- **GitHub Issues**: [Repository Issues]
- **Email**: [Support Email]
- **Documentation**: This file and related docs

---

**Last Updated**: [Current Date]
**Version**: 1.0.0

---

*This documentation is maintained by the MediLink development team. For the most up-to-date information, please refer to the codebase and related documentation files.*

