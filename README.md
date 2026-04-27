# MediLink - Healthcare App 🏥

A comprehensive healthcare platform connecting patients, doctors, and pharmacies with AI-powered features, real-time video consultations, emergency services, and more.

## ✨ Features

- 🤖 **AI-Powered Symptom Checker** - Multi-AI provider support (Llama 3, OpenAI, Gemini)
- 💬 **ChatDoc** - AI doctor assistant with real-time chat
- 📹 **Video Consultations** - WebRTC-based video calls with Jitsi fallback
- 🚨 **Emergency SOS** - One-tap emergency alert system
- 💊 **Medicine Ordering** - Order medicines from local pharmacies
- 📱 **Digital Health ID** - Secure medical records and history
- 🎤 **Voice Assistant** - Voice-activated features
- 💳 **Payment Integration** - Stripe payment processing
- 🔔 **Push Notifications** - Real-time alerts and reminders
- 🌐 **Multi-language** - English, Hindi, Punjabi support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- PostgreSQL 12+
- Redis 6+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MediLink
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install && cd ..
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Set up database**
   ```bash
   createdb medilink
   psql -U postgres -d medilink -f backend/database/schema.sql
   ```

5. **Start services**
   ```bash
   # Terminal 1: Redis
   redis-server
   
   # Terminal 2: Backend
   cd backend && npm run dev
   
   # Terminal 3: Frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

For detailed setup instructions, see [QUICK_START.md](./QUICK_START.md).

## 📚 Documentation

- **[Complete Documentation](./DOCUMENTATION.md)** - Comprehensive guide covering all aspects
- **[Quick Start Guide](./QUICK_START.md)** - Get started in 5 minutes
- **[Backend API](./backend/API_ENDPOINTS.md)** - Complete API reference
- **[Backend Setup](./backend/README.md)** - Backend architecture and setup
- **[AI Integration](./AI_INTEGRATION.md)** - AI service configuration
- **[Deployment Guide](./VERCEL_DEPLOYMENT.md)** - Deploy to Vercel
- **[Backend Features](./BACKEND_FEATURES.md)** - Backend features documentation

## 🏗️ Architecture

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: Express.js, PostgreSQL, Redis
- **Real-time**: WebSocket, Server-Sent Events, WebRTC
- **AI**: Google Genkit, OpenAI, Google Gemini, Llama 3
- **Payments**: Stripe
- **Notifications**: Firebase Cloud Messaging
- **Storage**: Cloudinary

## 🛠️ Tech Stack

### Frontend
- Next.js 15.3.3
- React 18.3.1
- TypeScript
- Tailwind CSS
- Radix UI / shadcn/ui
- Framer Motion
- React Hook Form + Zod

### Backend
- Express.js
- PostgreSQL
- Redis
- JWT Authentication
- BCrypt
- Cloudinary
- Nodemailer

## 📁 Project Structure

```
MediLink/
├── src/              # Frontend source code
│   ├── app/         # Next.js pages
│   ├── components/  # React components
│   ├── lib/         # Utility libraries
│   └── locales/     # Translation files
├── backend/         # Backend API
│   ├── src/         # Source code
│   └── database/    # Database schema
└── docs/            # Documentation
```

## 🔐 Security

- JWT-based authentication
- BCrypt password hashing
- Rate limiting
- Input validation
- CORS configuration
- Security headers (Helmet.js)
- HTTPS/TLS encryption

## 🧪 Development

```bash
# Frontend development
npm run dev

# Backend development
cd backend && npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Build for production
npm run build
```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - TypeScript type checking
- `npm run genkit:dev` - Start Genkit AI dev server

## 🚀 Deployment

### Vercel (Recommended for Frontend)
See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed instructions.

### Backend
Deploy to VPS, Railway, Render, or any Node.js hosting platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

[Add your license information here]

## 🆘 Support

- **Documentation**: See [DOCUMENTATION.md](./DOCUMENTATION.md)
- **Issues**: [GitHub Issues]
- **Email**: [Support Email]

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- All open-source contributors
- Healthcare professionals for feedback

---

**Made with ❤️ for better healthcare accessibility**
