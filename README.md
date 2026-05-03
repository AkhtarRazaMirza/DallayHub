# Auth Service (Node.js + PostgreSQL)

A **authentication service** built with Node.js, Express, TypeScript, and PostgreSQL.

This service provides authentication features including user registration, login, JWT-based authentication, email verification, password reset, and more. It follows best practices with a clean layered architecture and comprehensive security measures.

Overview

This project implements a typical authentication system used in real-world applications. It follows a layered architecture (routes → controller → service → database) to keep the codebase maintainable and easy to extend.

## 🎯 Production Features

✅ **Structured Logging** - JSON-formatted logs for all auth events  
✅ **Rate Limiting** - Protect auth endpoints from brute force attacks  
✅ **Security Headers** - CORS, X-Frame-Options, content security headers  
✅ **RBAC** - Role-based access control for admin/user separation  
✅ **Token Rotation** - Refresh tokens invalidated on every use  
✅ **Input Validation** - Strong password enforcement, email validation  
✅ **Health Check** - Monitoring endpoint with timestamp  

## Features

**Core Authentication:**
- User registration with email verification
- Secure login with JWT tokens
- Refresh token rotation
- Logout with session invalidation
- Password reset flow

**Security:**
- Bcrypt password hashing (10+ rounds)
- JWT access & refresh tokens
- HttpOnly secure cookies
- Rate limiting on sensitive endpoints
- CORS configuration
- Security headers (clickjacking, MIME sniffing protection)
- Input validation with password strength requirements

**Advanced Features:**
- Role-Based Access Control (RBAC)
- Structured logging for monitoring
- Session management with token versioning
- Email verification tokens
- Password reset tokens with expiration
- Google OAuth integration (basic setup)
## 📚 Documentation

## Tech Stack
Node.js + Express
TypeScript
PostgreSQL
Drizzle ORM
JWT
Bcrypt
Docker
Project Structure
src/
├── auth/
├── config/
├── db/
├── middlewares/
├── utils/
└── index.ts

## Notes
Routes define API endpoints
Controllers handle request/response
Services contain business logic
Database stores users and sessions
JWT is used for stateless authentication
Email service handles verification and password reset
Quick Start
1. Install dependencies
npm install
2. Configure environment variables

Create a .env file:

PORT=8080
DATABASE_URL=postgresql://user:password@localhost:5432/db_name

JWT_ACCESS_SECRET=your_access_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d

EMAIL_FROM=noreply@example.com
EMAIL_FROM_NAME=SecureAuth

GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
CLIENT_URL=http://localhost:3000
3. Start database (Docker)
npm run startDB
4. Run migrations
npm run generateDB
npm run migrateDB
5. Start server
npm run dev

Server runs on:

http://localhost:8080
API Routes
Auth
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
Token
POST /api/auth/refresh-token
Email & Password
POST /api/auth/forgot-password
PUT /api/auth/reset-password/:token
GET /api/auth/verify-email/:token
OAuth
GET /api/auth/google
GET /api/auth/google/callback
Authentication Flow (Login)
User sends email and password
Server validates credentials
Access token is generated
Refresh token is generated and stored
Access token is returned to the client

## 🔐 Security Considerations

Passwords are hashed using bcrypt
Access tokens are short-lived
Refresh tokens are stored and validated
Email verification prevents fake accounts
Password reset tokens are time-limited

## 🎯 Using Production Features

### Rate Limiting
Rate limiting is automatically applied to sensitive endpoints:
- **Login & Register**: 5 requests per 15 minutes
- **Password Reset**: 3 requests per 30 minutes

Clients receive `429 Too Many Requests` with a `Retry-After` header.

### Role-Based Access Control (RBAC)
```typescript
import { authenticate } from "./auth/middleware.js";
import { requireAdmin } from "./middlewares/authorization.js";

// Protect admin endpoints
router.delete("/api/users/:id", authenticate, requireAdmin, handler);
```

Update user role in database:
```sql
UPDATE users SET role = 'admin' WHERE id = 'user-id';
```

### Structured Logging
All authentication events are logged as JSON:
- Login attempts (success & failure)
- Token refresh operations
- Password reset requests
- Email verification
- Logout events

View logs in console output or parse from log files.

### Health Check Endpoint
```bash
curl http://localhost:8080/health

# Response:
{
  "status": "✅ Server is running",
  "timestamp": "2026-05-03T12:34:56.789Z"
}
```

## Running in Production

For production deployment:

✅ Use strong secrets for JWT  
✅ Use HTTPS (required for secure cookies)  
✅ Store environment variables securely  
✅ Configure proper CORS settings (set CLIENT_URL)  
✅ Use a managed PostgreSQL database  
✅ Set up logging and monitoring  
✅ Run database migrations before deploying  
✅ Test rate limiting, token rotation, and RBAC  

### Deployment Checklist
1. Run migrations: `npm run migrateDB`
2. Set all required environment variables
3. Start server: `npm run dev` (or production start script)
4. Monitor logs for authentication events
5. Test all auth endpoints
6. Verify rate limiting works
7. Check CORS is configured for your domain

## What I Learned

- Designing production-grade authentication systems
- Implementing JWT and refresh token rotation
- Structuring scalable backend applications
- Managing database schema and migrations
- Handling real-world auth flows with security
- Rate limiting and RBAC patterns
- Structured logging for production monitoring

## Author
Akhtar Raza