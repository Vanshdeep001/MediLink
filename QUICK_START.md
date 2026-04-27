# MediLink - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites Check
```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be v9.0.0 or higher
```

### Step 1: Install Dependencies
```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### Step 2: Set Up Environment Variables

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Backend** (`backend/.env`):
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medilink
DB_USER=postgres
DB_PASSWORD=your_password

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=your_secret_key_here
FRONTEND_URL=http://localhost:3000
```

### Step 3: Set Up Database
```bash
# Create database
createdb medilink

# Run schema
psql -U postgres -d medilink -f backend/database/schema.sql
```

### Step 4: Start Services

**Terminal 1 - Redis:**
```bash
redis-server
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 3 - Frontend:**
```bash
npm run dev
```

### Step 5: Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## 📚 Next Steps

1. **Read Full Documentation**: See `DOCUMENTATION.md`
2. **Configure AI Services**: See `AI_INTEGRATION.md`
3. **Set Up Payments**: Configure Stripe keys
4. **Deploy**: See `VERCEL_DEPLOYMENT.md`

## 🆘 Quick Troubleshooting

**Port 3000 in use?**
```bash
npx kill-port 3000
```

**Database connection error?**
- Check PostgreSQL is running
- Verify credentials in `backend/.env`

**Redis connection error?**
- Check Redis is running: `redis-cli ping`

**Module not found?**
```bash
rm -rf node_modules .next
npm install
```

## 📖 Documentation Index

- **Complete Documentation**: `DOCUMENTATION.md`
- **Backend API**: `backend/API_ENDPOINTS.md`
- **Backend Setup**: `backend/README.md`
- **AI Integration**: `AI_INTEGRATION.md`
- **Deployment**: `VERCEL_DEPLOYMENT.md`
- **Backend Features**: `BACKEND_FEATURES.md`

## 🎯 Common Commands

```bash
# Development
npm run dev              # Start frontend dev server
cd backend && npm run dev # Start backend dev server

# Building
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run typecheck        # TypeScript type checking

# Database
cd backend
npm run migrate          # Run database migrations
```

## 🔑 Default Admin Account

After running the schema, a default admin account is created:
- **Email**: `admin@medilink.in`
- **Password**: Change after first login

## 💡 Tips

1. **Development Mode**: OTPs are logged to console for testing
2. **Hot Reload**: Both frontend and backend support hot reload
3. **Environment Variables**: Restart servers after changing `.env` files
4. **Database Migrations**: Run migrations after schema changes

---

**Need Help?** Check `DOCUMENTATION.md` for detailed information.

