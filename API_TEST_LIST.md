# 🧪 DallyHub Backend - Complete API Test List

## API Base URL
```
http://localhost:8080
```

---

## 📋 Routes Summary

| # | Method | Endpoint | Auth Required | Purpose |
|---|--------|----------|---|---------|
| 1 | POST | `/api/auth/register` | ❌ No | Register new user |
| 2 | POST | `/api/auth/login` | ❌ No | Authenticate user |
| 3 | POST | `/api/auth/refresh-token` | ❌ No | Refresh access token |
| 4 | POST | `/api/auth/logout` | ✅ Yes | Logout user |
| 5 | GET | `/api/auth/me` | ✅ Yes | Get current user profile |
| 6 | POST | `/api/auth/forgot-password` | ❌ No | Request password reset |
| 7 | PUT | `/api/auth/reset-password/:token` | ❌ No | Reset password with token |
| 8 | GET | `/api/auth/verify-email/:token` | ❌ No | Verify email with token |
| 9 | GET | `/health` | ❌ No | Health check |

---

## 🧪 Detailed Test Cases

### 1. POST `/api/auth/register` - Register New User

#### Request Format
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### Validation Rules
- `firstName`: 2-50 characters, required
- `lastName`: 2-50 characters, required  
- `email`: Valid email format, required
- `password`: 8+ characters, uppercase letter + digit, required

#### Test Cases

| # | Test Name | Input | Expected Status | Expected Response |
|---|-----------|-------|-----------------|-------------------|
| 1.1 | ✅ Valid Registration | All valid fields | 201 | `{ success: true, message: "User registered successfully", data: { accessToken, user } }` |
| 1.2 | ❌ Missing firstName | No firstName field | 400 | Validation error |
| 1.3 | ❌ Missing lastName | No lastName field | 400 | Validation error |
| 1.4 | ❌ Missing email | No email field | 400 | Validation error |
| 1.5 | ❌ Missing password | No password field | 400 | Validation error |
| 1.6 | ❌ Invalid email | `"invalid-email"` | 400 | Email validation error |
| 1.7 | ❌ Short firstName | `"a"` (1 char) | 400 | Min length error |
| 1.8 | ❌ Long firstName | 51+ characters | 400 | Max length error |
| 1.9 | ❌ Short lastName | `"a"` (1 char) | 400 | Min length error |
| 1.10 | ❌ Long lastName | 51+ characters | 400 | Max length error |
| 1.11 | ❌ Weak password - no uppercase | `"securepass123"` | 400 | Uppercase requirement error |
| 1.12 | ❌ Weak password - no digit | `"SecurePass"` | 400 | Digit requirement error |
| 1.13 | ❌ Short password | `"Pass1"` (5 chars) | 400 | Min length error |
| 1.14 | ❌ Duplicate email | Email already exists | 409 | Conflict error |
| 1.15 | ✅ Response includes accessToken | Valid data | 201 | `data.accessToken` exists |
| 1.16 | ✅ Response includes refreshToken cookie | Valid data | 201 | Cookie: refreshToken set with httpOnly |
| 1.17 | ✅ Response includes user object | Valid data | 201 | `data.user` contains id, email, firstName, lastName |

#### curl Commands

```bash
# ✅ Valid Registration
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }' \
  -c cookies.txt

# ❌ Missing email
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "password": "SecurePass123"
  }'

# ❌ Weak password
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "jane@example.com",
    "password": "weak"
  }'

# ❌ Invalid email
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "not-an-email",
    "password": "SecurePass123"
  }'
```

---

### 2. POST `/api/auth/login` - User Login

#### Request Format
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### Validation Rules
- `email`: Valid email format, required
- `password`: Non-empty, required

#### Test Cases

| # | Test Name | Input | Expected Status | Expected Response |
|---|-----------|-------|-----------------|-------------------|
| 2.1 | ✅ Valid Login | Correct credentials | 200 | `{ success: true, message: "Login successful", data: { accessToken, user } }` |
| 2.2 | ❌ Missing email | No email field | 400 | Validation error |
| 2.3 | ❌ Missing password | No password field | 400 | Validation error |
| 2.4 | ❌ Invalid email format | `"not-an-email"` | 400 | Email validation error |
| 2.5 | ❌ Wrong password | Correct email, wrong password | 401 | Unauthorized error |
| 2.6 | ❌ Non-existent email | Email not registered | 401 | Unauthorized error |
| 2.7 | ✅ Response includes accessToken | Valid credentials | 200 | `data.accessToken` exists |
| 2.8 | ✅ Response includes refreshToken cookie | Valid credentials | 200 | Cookie: refreshToken set |
| 2.9 | ✅ Response includes user object | Valid credentials | 200 | `data.user` with all fields |
| 2.10 | ✅ Case-insensitive email | `"JOHN@EXAMPLE.COM"` | 200 | Should work |

#### curl Commands

```bash
# ✅ Valid Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }' \
  -c cookies.txt

# ❌ Wrong password
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "WrongPassword123"
  }'

# ❌ Non-existent email
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "SecurePass123"
  }'

# ✅ Case-insensitive email
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "JOHN@EXAMPLE.COM",
    "password": "SecurePass123"
  }' \
  -c cookies.txt
```

---

### 3. POST `/api/auth/refresh-token` - Refresh Access Token

#### Request Format
```http
POST /api/auth/refresh-token
Cookie: refreshToken=<token>

OR

POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "<token>"
}
```

#### Test Cases

| # | Test Name | Input | Expected Status | Expected Response |
|---|-----------|-------|-----------------|-------------------|
| 3.1 | ✅ Valid refresh from cookie | Valid refreshToken in cookie | 200 | `{ success: true, message: "Token refreshed", data: { accessToken } }` |
| 3.2 | ✅ Valid refresh from body | Valid refreshToken in body | 200 | `{ success: true, message: "Token refreshed", data: { accessToken } }` |
| 3.3 | ❌ Missing refresh token | No token provided | 400 | "No refresh token provided" error |
| 3.4 | ❌ Invalid token | Malformed token | 401 | Unauthorized error |
| 3.5 | ❌ Expired token | Expired token | 401 | Unauthorized error |
| 3.6 | ✅ Returns new accessToken | Valid token | 200 | `data.accessToken` exists and is valid |

#### curl Commands

```bash
# ✅ Refresh from cookie (after login)
curl -X POST http://localhost:8080/api/auth/refresh-token \
  -b cookies.txt

# ✅ Refresh from body
curl -X POST http://localhost:8080/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your_refresh_token_here"
  }'

# ❌ No token provided
curl -X POST http://localhost:8080/api/auth/refresh-token
```

---

### 4. POST `/api/auth/logout` - Logout User

#### Request Format
```http
POST /api/auth/logout
Authorization: Bearer <accessToken>
```

#### Test Cases

| # | Test Name | Input | Expected Status | Expected Response |
|---|-----------|-------|-----------------|-------------------|
| 4.1 | ✅ Valid logout | Valid accessToken | 200 | `{ success: true, message: "Logged out successfully", data: {} }` |
| 4.2 | ❌ Missing token | No Authorization header | 401 | Unauthorized error |
| 4.3 | ❌ Invalid token | Malformed token | 401 | Unauthorized error |
| 4.4 | ✅ Clears refreshToken cookie | Valid token | 200 | refreshToken cookie cleared |

#### curl Commands

```bash
# ✅ Valid logout (after login)
curl -X POST http://localhost:8080/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# ❌ No token
curl -X POST http://localhost:8080/api/auth/logout

# ✅ With cookie
curl -X POST http://localhost:8080/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -b cookies.txt
```

---

### 5. GET `/api/auth/me` - Get Current User Profile

#### Request Format
```http
GET /api/auth/me
Authorization: Bearer <accessToken>
```

#### Test Cases

| # | Test Name | Input | Expected Status | Expected Response |
|---|-----------|-------|-----------------|-------------------|
| 5.1 | ✅ Valid request | Valid accessToken | 200 | `{ success: true, message: "User fetched successfully", data: { user } }` |
| 5.2 | ❌ Missing token | No Authorization header | 401 | Unauthorized error |
| 5.3 | ❌ Invalid token | Malformed token | 401 | Unauthorized error |
| 5.4 | ❌ Expired token | Expired accessToken | 401 | Unauthorized error |
| 5.5 | ✅ Response includes all user fields | Valid token | 200 | `data.user` has id, email, firstName, lastName, isVerified, createdAt |
| 5.6 | ✅ No password in response | Valid token | 200 | `data.user.password` not included |

#### curl Commands

```bash
# ✅ Get current user (after login)
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# ❌ No token
curl -X GET http://localhost:8080/api/auth/me

# ❌ Invalid token
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer invalid.token.here"

# ✅ With Bearer prefix
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer eyJhbGc..."
```

---

### 6. POST `/api/auth/forgot-password` - Request Password Reset

#### Request Format
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Validation Rules
- `email`: Valid email format, required

#### Test Cases

| # | Test Name | Input | Expected Status | Expected Response |
|---|-----------|-------|-----------------|-------------------|
| 6.1 | ✅ Valid email | Registered email | 200 | `{ success: true, message: "If user exists, reset email will be sent", data: {} }` |
| 6.2 | ❌ Missing email | No email field | 400 | Validation error |
| 6.3 | ❌ Invalid email | `"not-an-email"` | 400 | Email validation error |
| 6.4 | ✅ Non-existent email | Unregistered email | 200 | Same response (security: don't reveal if email exists) |
| 6.5 | ✅ Case-insensitive | `"JOHN@EXAMPLE.COM"` | 200 | Should work |
| 6.6 | ✅ Sends email | Valid email | 200 | Check email for reset link |

#### curl Commands

```bash
# ✅ Valid email
curl -X POST http://localhost:8080/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'

# ❌ Invalid email format
curl -X POST http://localhost:8080/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email"
  }'

# ✅ Non-existent email (should still return 200)
curl -X POST http://localhost:8080/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com"
  }'
```

---

### 7. PUT `/api/auth/reset-password/:token` - Reset Password with Token

#### Request Format
```http
PUT /api/auth/reset-password/token_from_email
Content-Type: application/json

{
  "newPassword": "NewSecurePass456"
}
```

#### Validation Rules
- `token`: From email link (URL parameter)
- `newPassword`: 8+ characters, uppercase + digit, required

#### Test Cases

| # | Test Name | Input | Expected Status | Expected Response |
|---|-----------|-------|-----------------|-------------------|
| 7.1 | ✅ Valid token & password | Valid reset token + strong password | 200 | `{ success: true, message: "Password reset successfully", data: {} }` |
| 7.2 | ❌ Missing token | No token in URL | 400 | Error |
| 7.3 | ❌ Invalid token | Malformed token | 400 | Invalid token error |
| 7.4 | ❌ Expired token | Expired reset token | 400 | Expired token error |
| 7.5 | ❌ Missing newPassword | No newPassword field | 400 | Validation error |
| 7.6 | ❌ Weak password - no uppercase | `"securepass123"` | 400 | Uppercase requirement error |
| 7.7 | ❌ Weak password - no digit | `"SecurePass"` | 400 | Digit requirement error |
| 7.8 | ❌ Short password | `"Pass1"` | 400 | Min length error |
| 7.9 | ✅ Password updated | Valid token & password | 200 | Can login with new password |

#### curl Commands

```bash
# ✅ Valid reset
curl -X PUT "http://localhost:8080/api/auth/reset-password/token_from_email" \
  -H "Content-Type: application/json" \
  -d '{
    "newPassword": "NewSecurePass456"
  }'

# ❌ Weak password
curl -X PUT "http://localhost:8080/api/auth/reset-password/token_from_email" \
  -H "Content-Type: application/json" \
  -d '{
    "newPassword": "weak"
  }'

# ❌ Invalid token
curl -X PUT "http://localhost:8080/api/auth/reset-password/invalid_token" \
  -H "Content-Type: application/json" \
  -d '{
    "newPassword": "NewSecurePass456"
  }'
```

---

### 8. GET `/api/auth/verify-email/:token` - Verify Email with Token

#### Request Format
```http
GET /api/auth/verify-email/token_from_email
```

#### Test Cases

| # | Test Name | Input | Expected Status | Expected Response |
|---|-----------|-------|-----------------|-------------------|
| 8.1 | ✅ Valid token | Valid email verification token | 200 | `{ success: true, message: "Email verified successfully", data: {} }` |
| 8.2 | ❌ Missing token | No token in URL | 400 | Error |
| 8.3 | ❌ Invalid token | Malformed token | 400 | Invalid token error |
| 8.4 | ❌ Expired token | Expired verification token | 400 | Expired token error |
| 8.5 | ✅ Updates isVerified | Valid token | 200 | User's isVerified set to true |
| 8.6 | ❌ Already verified | Token already used | 400 | Token already consumed error |

#### curl Commands

```bash
# ✅ Valid verification
curl -X GET "http://localhost:8080/api/auth/verify-email/token_from_email"

# ❌ Invalid token
curl -X GET "http://localhost:8080/api/auth/verify-email/invalid_token"

# ✅ From browser (simulated)
# https://localhost:8080/api/auth/verify-email/token_from_email
```

---

### 9. GET `/health` - Health Check

#### Request Format
```http
GET /health
```

#### Test Cases

| # | Test Name | Input | Expected Status | Expected Response |
|---|-----------|-------|-----------------|-------------------|
| 9.1 | ✅ Server running | No auth needed | 200 | `{ status: "✅ Server is running" }` |

#### curl Commands

```bash
# ✅ Health check
curl -X GET http://localhost:8080/health
```

---

## 📊 Test Execution Plan

### Phase 1: Basic Endpoints (No Auth)
1. ✅ Health Check (9.1)
2. ✅ Register - Valid (1.1)
3. ✅ Register - Validations (1.2-1.14)
4. ✅ Login - Valid (2.1)
5. ✅ Login - Validations (2.2-2.10)

### Phase 2: Token Operations
1. ✅ Refresh Token - Valid (3.1-3.2)
2. ✅ Refresh Token - Errors (3.3-3.5)
3. ✅ Logout - Valid (4.1)
4. ✅ Logout - Errors (4.2-4.3)

### Phase 3: Authenticated Endpoints
1. ✅ Get Current User (5.1-5.6)
2. ✅ Forgot Password (6.1-6.6)

### Phase 4: Token Reset Flows
1. ✅ Reset Password (7.1-7.9)
2. ✅ Verify Email (8.1-8.6)

---

## 🎯 Success Criteria

| Category | Count | Status |
|----------|-------|--------|
| Total Routes | 9 | ✅ Complete |
| Total Test Cases | 59+ | 📋 Listed |
| Validation Tests | 25+ | ✅ Covered |
| Authentication Tests | 10+ | ✅ Covered |
| Error Handling Tests | 15+ | ✅ Covered |
| Integration Tests | 9+ | ✅ Covered |

---

## 🔑 Important Notes

### Authentication Headers
- **Format**: `Authorization: Bearer <accessToken>`
- **Source**: From login or register response
- **Lifetime**: 15 minutes (short-lived)

### Refresh Token Cookie
- **Name**: `refreshToken`
- **Type**: httpOnly (secure)
- **Lifetime**: 7 days (long-lived)
- **AutoSent**: Browser sends automatically with requests

### Response Format
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... }
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

---

## 🛠️ Tools for Testing

### Using curl
```bash
# Save cookies
curl -X POST http://localhost:8080/api/auth/login -c cookies.txt

# Use cookies in subsequent requests
curl -X GET http://localhost:8080/api/auth/me -b cookies.txt
```

### Using Postman
1. Create collection "DallyHub Auth"
2. Import all endpoints
3. Use environment variables for token/URL
4. Run test suite

### Using Thunder Client (VS Code)
1. Install Thunder Client extension
2. Create requests for each endpoint
3. Set up environment for baseUrl and tokens

### Using REST Client (VS Code)
Create `requests.http` file with all requests

---

## 📝 Environment Setup

### .env Requirements
```env
PORT=8080
JWT_ACCESS_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
DATABASE_URL=postgresql://...
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_password
CLIENT_URL=http://localhost:3000
```

---

**Total Test Cases**: 59+  
**Coverage**: 100% of endpoints  
**Status**: Ready for testing ✅
