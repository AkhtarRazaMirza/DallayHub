Auth Service (Node.js + PostgreSQL)

A scalable authentication service built with Node.js, Express, and PostgreSQL.

This service provides core authentication features such as user registration, login, JWT-based authentication, email verification, and password reset. It is designed with a clean architecture and can be integrated into larger applications.

Overview

This project implements a typical authentication system used in real-world applications. It follows a layered architecture (routes → controller → service → database) to keep the codebase maintainable and easy to extend.

Features
User registration and login
JWT authentication (access + refresh tokens)
Secure password hashing (bcrypt)
Email verification flow
Password reset flow
Session management using refresh tokens
Google OAuth (basic setup)
Tech Stack
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
Architecture
Notes
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

JWT_SECRET=your_secret
REFRESH_TOKEN_SECRET=your_refresh_secret

EMAIL_USER=your_email
EMAIL_PASSWORD=your_password

GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
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
Security Considerations
Passwords are hashed using bcrypt
Access tokens are short-lived
Refresh tokens are stored and validated
Email verification prevents fake accounts
Password reset tokens are time-limited
Running in Production

For production deployment:

Use strong secrets for JWT
Use HTTPS (required for secure cookies)
Store environment variables securely
Configure proper CORS settings
Use a managed PostgreSQL database
Set up logging and monitoring
What I Learned
Designing authentication systems
Implementing JWT and refresh tokens
Structuring scalable backend applications
Managing database schema and migrations
Handling real-world auth flows
Author

Akhtar Raza