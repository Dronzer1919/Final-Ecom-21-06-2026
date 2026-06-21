# Authentication API Integration Guide

## Overview
Complete API integration for three authentication pages with encrypted payload support.

## Features Implemented ✅

### 1. **Register API** (`POST /api/auth/register`)
- **Endpoint:** `http://localhost:3000/api/auth/register`
- **Access:** Public
- **Encryption:** Supported (optional)

#### Request Body:
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass@123",
  "phone": "1234567890"
}
```

#### With Encryption:
```json
{
  "encrypted": true,
  "data": "encrypted_hex_string_here"
}
```

#### Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "role": "customer",
      "isEmailVerified": false
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token"
    }
  }
}
```

#### Validation Rules:
- `fullName`: Required, 2-100 characters
- `email`: Required, valid email format
- `password`: Required, min 8 characters, must contain uppercase, lowercase, number, and special character
- `phone`: Optional, 10-15 digits

---

### 2. **Login API** (`POST /api/auth/login`)
- **Endpoint:** `http://localhost:3000/api/auth/login`
- **Access:** Public
- **Encryption:** Supported (optional)
- **Rate Limiting:** 5 requests per 15 minutes

#### Request Body:
```json
{
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```

#### Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "role": "customer",
      "avatar": null,
      "isEmailVerified": false,
      "lastLogin": "2025-12-27T13:55:49.357Z"
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token"
    }
  }
}
```

#### Features:
- ✅ Account lockout after 5 failed attempts (30 minutes)
- ✅ Automatic login attempt reset on success
- ✅ Last login timestamp tracking
- ✅ Account status validation (active/inactive)

---

### 3. **Forgot Password API** (`POST /api/auth/forgot-password`)
- **Endpoint:** `http://localhost:3000/api/auth/forgot-password`
- **Access:** Public
- **Encryption:** Supported (optional)
- **Rate Limiting:** 3 requests per hour

#### Request Body:
```json
{
  "email": "john@example.com"
}
```

#### Response:
```json
{
  "success": true,
  "message": "Password reset link sent successfully",
  "data": {
    "resetUrl": "http://localhost:4200/reset-password?token=reset_token",
    "resetToken": "token_here"
  }
}
```

#### Features:
- ✅ Secure token generation (32 bytes random)
- ✅ Token hashed before storing in database
- ✅ 1-hour token expiration
- ✅ No user enumeration (same response for valid/invalid emails)

---

### 4. **Reset Password API** (`POST /api/auth/reset-password`)
- **Endpoint:** `http://localhost:3000/api/auth/reset-password`
- **Access:** Public
- **Encryption:** Supported (optional)

#### Request Body:
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePass@123"
}
```

#### Response:
```json
{
  "success": true,
  "message": "Password reset successful",
  "data": null
}
```

---

## Database Schema

### User Model
```javascript
{
  firstName: String (required, max 50 chars),
  lastName: String (required, max 50 chars),
  email: String (required, unique, lowercase),
  phone: String (10-15 digits),
  password: String (required, min 8 chars, hashed with bcrypt),
  role: Enum ['admin', 'manager', 'staff', 'customer'],
  avatar: String,
  isActive: Boolean (default: true),
  isEmailVerified: Boolean (default: false),
  passwordResetToken: String (hashed, select: false),
  passwordResetExpires: Date (select: false),
  lastLogin: Date,
  refreshToken: String (select: false),
  loginAttempts: Number (default: 0),
  lockUntil: Date,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

## Encryption Implementation

### How It Works

1. **Frontend sends encrypted payload:**
```json
{
  "encrypted": true,
  "data": "hex_encrypted_string"
}
```

2. **Backend decrypts automatically** via middleware (`decryptRequest`)
3. **Backend encrypts response** if requested via:
   - Query param: `?encrypt=true`
   - Header: `X-Encrypt-Response: true`

### Encryption Configuration

#### Backend (.env):
```env
ENCRYPTION_KEY=12345678901234567890123456789012  # 32 bytes
ENCRYPTION_IV=1234567890123456                  # 16 bytes
```

#### Algorithm: AES-256-CBC

### Frontend Integration Example

```typescript
// Angular Service
import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private readonly key = CryptoJS.enc.Utf8.parse('12345678901234567890123456789012');
  private readonly iv = CryptoJS.enc.Utf8.parse('1234567890123456');

  encrypt(data: any): string {
    const text = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(text, this.key, {
      iv: this.iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.ciphertext.toString(CryptoJS.enc.Hex);
  }

  decrypt(encryptedHex: string): any {
    const encrypted = CryptoJS.enc.Hex.parse(encryptedHex);
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: encrypted } as any,
      this.key,
      {
        iv: this.iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    );
    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
  }
}
```

---

## Security Features

### ✅ Implemented:
1. **Password Hashing:** bcrypt with salt rounds (10)
2. **JWT Tokens:** 
   - Access Token: 15 minutes expiry
   - Refresh Token: 7 days expiry
3. **Rate Limiting:**
   - Auth endpoints: 5 requests / 15 minutes
   - Password reset: 3 requests / hour
4. **Account Lockout:** 5 failed login attempts = 30 minutes lock
5. **Payload Encryption:** Optional AES-256-CBC encryption
6. **Token Security:** Reset tokens hashed in database
7. **No User Enumeration:** Same response for valid/invalid emails
8. **CORS Protection:** Configured for frontend origin
9. **Input Validation:** express-validator middleware
10. **Injection Protection:** MongoDB ODM (Mongoose)

---

## Middleware Stack

1. **CORS** - Cross-origin request handling
2. **Body Parser** - JSON/URL-encoded parsing (10mb limit)
3. **decryptRequest** - Automatic payload decryption
4. **encryptResponse** - Optional response encryption
5. **Rate Limiter** - Request throttling
6. **Validator** - Input validation
7. **Auth Guard** - JWT token verification (protected routes)
8. **Error Handler** - Global error handling

---

## Testing the APIs

### Using Postman/Thunder Client:

#### 1. Register User:
```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass@123",
  "phone": "1234567890"
}
```

#### 2. Login:
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```

#### 3. Forgot Password:
```bash
POST http://localhost:3000/api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### 4. Reset Password:
```bash
POST http://localhost:3000/api/auth/reset-password
Content-Type: application/json

{
  "token": "token_from_forgot_password_response",
  "newPassword": "NewSecurePass@123"
}
```

---

## Error Handling

### Standard Error Response:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Error details",
  "stack": "Stack trace (development only)"
}
```

### Common HTTP Status Codes:
- `200` - Success
- `201` - Created (Register success)
- `400` - Bad Request (Validation errors)
- `401` - Unauthorized (Invalid credentials)
- `403` - Forbidden (Account locked/inactive)
- `404` - Not Found
- `409` - Conflict (Email already exists)
- `429` - Too Many Requests (Rate limit exceeded)
- `500` - Internal Server Error

---

## Additional Protected Endpoints

### Get Current User (`GET /api/auth/me`)
- **Access:** Private (requires JWT token)
- **Header:** `Authorization: Bearer <access_token>`

### Update Profile (`PUT /api/auth/profile`)
- **Access:** Private
- **Body:** `{ "firstName", "lastName", "phone", "avatar" }`

### Change Password (`PUT /api/auth/change-password`)
- **Access:** Private
- **Body:** `{ "currentPassword", "newPassword" }`

### Logout (`POST /api/auth/logout`)
- **Access:** Private
- **Clears refresh token from database**

### Refresh Token (`POST /api/auth/refresh-token`)
- **Access:** Public
- **Body:** `{ "refreshToken" }`
- **Returns:** New access token

---

## Environment Variables Required

```env
# Server
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:4200
FRONTEND_URL=http://localhost:4200

# Database
MONGODB_URI=mongodb://localhost:27017/pos_system

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=15m
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_REFRESH_EXPIRE=7d

# Encryption
ENCRYPTION_KEY=12345678901234567890123456789012
ENCRYPTION_IV=1234567890123456
```

---

## File Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── auth.controller.js          # All auth logic
│   ├── routes/
│   │   └── auth.routes.js              # Route definitions + validation
│   ├── models/
│   │   └── User.js                     # User schema with methods
│   ├── middleware/
│   │   ├── auth.js                     # JWT verification
│   │   ├── encryption.js               # Encrypt/decrypt middleware
│   │   ├── validate.js                 # Validation handler
│   │   ├── rateLimiter.js              # Rate limiting
│   │   ├── errorHandler.js             # Global error handler
│   │   └── asyncHandler.js             # Async wrapper
│   ├── utils/
│   │   ├── encryption.js               # Encryption utilities
│   │   ├── jwtUtils.js                 # JWT generation/verification
│   │   ├── responseHandler.js          # Standard responses
│   │   └── customErrors.js             # Custom error classes
│   ├── config/
│   │   └── database.js                 # MongoDB connection
│   └── server.js                       # Express app setup
```

---

## Status: ✅ COMPLETE

All three authentication pages (Register, Login, Forgot Password) are fully integrated with:
- ✅ Backend API endpoints
- ✅ Database models
- ✅ Route handlers
- ✅ Controller logic
- ✅ Payload encryption support
- ✅ Input validation
- ✅ Error handling
- ✅ Security features
- ✅ Rate limiting
- ✅ JWT authentication

**Ready for frontend integration!** 🚀
