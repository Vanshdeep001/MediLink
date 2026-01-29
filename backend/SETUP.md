# Backend Setup Guide

## Quick Start

### Prerequisites
1. **PostgreSQL** - Install and start PostgreSQL server
2. **Redis** - Install and start Redis server
3. **Node.js** - v18 or higher

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` (if not already created):

```bash
cp .env.example .env
```

Edit `.env` file with your database credentials:

```env
# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medilink
DB_USER=postgres
DB_PASSWORD=your_password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Email Configuration (for OTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@medilink.in

# Cloudinary (for document uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# License Verification API (Optional)
LICENSE_VERIFICATION_API_URL=https://api.medicalcouncil.gov.in/verify
LICENSE_VERIFICATION_API_KEY=your_api_key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### 3. Set Up PostgreSQL Database

#### Option A: Using psql (Command Line)

```bash
# Create database
createdb medilink

# Or using psql
psql -U postgres
CREATE DATABASE medilink;
\q

# Run schema
psql -U postgres -d medilink -f database/schema.sql
```

#### Option B: Using pgAdmin (GUI)

1. Open pgAdmin
2. Connect to PostgreSQL server
3. Right-click on "Databases" → "Create" → "Database"
4. Name: `medilink`
5. Click "Save"
6. Right-click on `medilink` database → "Query Tool"
7. Open `database/schema.sql` file
8. Execute the SQL script

### 4. Start Redis Server

#### Windows:
```bash
# Download Redis from: https://github.com/microsoftarchive/redis/releases
# Or use WSL:
wsl redis-server
```

#### Linux/Mac:
```bash
redis-server
```

#### Or use Docker:
```bash
docker run -d -p 6379:6379 redis:alpine
```

### 5. Run Database Migrations

```bash
npm run migrate
```

Or manually run the schema:
```bash
psql -U postgres -d medilink -f database/schema.sql
```

### 6. Start Backend Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server will start on `http://localhost:5000`

### 7. Verify Installation

Check health endpoint:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "connected"
}
```

## Troubleshooting

### Backend Returns 503 Error

**Issue**: Database connection failed

**Solutions**:
1. Ensure PostgreSQL is running:
   ```bash
   # Check PostgreSQL status
   pg_isready
   ```

2. Check database credentials in `.env` file

3. Verify database exists:
   ```bash
   psql -U postgres -l | grep medilink
   ```

4. Run schema migration:
   ```bash
   npm run migrate
   ```

### Redis Connection Failed

**Issue**: Redis server not running

**Solutions**:
1. Start Redis server:
   ```bash
   redis-server
   ```

2. Check Redis is running:
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

3. For development, the app will continue without Redis (graceful degradation)

### Port Already in Use

**Issue**: Port 5000 is already in use

**Solutions**:
1. Find process using port 5000:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   
   # Linux/Mac
   lsof -i :5000
   ```

2. Kill the process or change PORT in `.env`:
   ```env
   PORT=5001
   ```

## Default Admin Account

After running the schema, a default admin account is created:
- **Email**: `admin@medilink.in`
- **Password**: Change after first login (currently hashed placeholder)

⚠️ **Important**: Update the admin password in the database after first login!

## Testing the API

### Test Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123456",
    "role": "PATIENT"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

## Next Steps

1. ✅ Backend server running
2. ✅ Database configured
3. ✅ Redis configured (optional but recommended)
4. ✅ Environment variables set
5. 🔄 Configure email service (for OTP)
6. 🔄 Configure Cloudinary (for document uploads)
7. 🔄 Test API endpoints

For more details, see `README.md`

