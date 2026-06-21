# Sindhu POS Backend API

A secure, scalable backend API for Sindhu POS System with encryption, authentication, and comprehensive error handling.

## 🚀 Features

- **Secure Authentication**: JWT-based authentication with access and refresh tokens
- **Password Encryption**: Bcrypt password hashing with salt rounds
- **Request/Response Encryption**: AES-256-CBC encryption for sensitive data
- **Global Error Handling**: Centralized error handling with custom error classes
- **Input Validation**: Express-validator for request validation
- **Rate Limiting**: Protection against brute force attacks
- **Account Security**: Login attempt tracking and account locking
- **Role-Based Access Control**: Admin, Manager, Staff, and Customer roles

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js           # MongoDB connection
│   ├── controllers/
│   │   └── auth.controller.js    # Auth logic
│   ├── middleware/
│   │   ├── auth.js               # JWT verification
│   │   ├── asyncHandler.js       # Async wrapper
│   │   ├── encryption.js         # Request/response encryption
│   │   ├── errorHandler.js       # Global error handler
│   │   ├── notFound.js           # 404 handler
│   │   ├── rateLimiter.js        # Rate limiting
│   │   └── validate.js           # Validation middleware
│   ├── models/
│   │   └── User.js               # User schema
│   ├── routes/
│   │   └── auth.routes.js        # Auth endpoints
│   ├── utils/
│   │   ├── customErrors.js       # Custom error classes
│   │   ├── encryption.js         # Encryption utilities
│   │   ├── jwtUtils.js           # JWT utilities
│   │   └── responseHandler.js    # Response helpers
│   └── server.js                 # App entry point
├── .env.example
├── package.json
└── README.md
```

## 🔧 Installation

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment variables**
```bash
# Copy .env.example to .env
cp .env.example .env

# Update with your configuration
```

3. **Start the server**
```bash
# Development
npm run dev

# Production
npm start
```

## 🔐 Environment Variables

```env
# Server
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/sindhu_pos

# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Encryption (must be exact length)
ENCRYPTION_KEY=your_32_character_encryption_key  # 32 characters
ENCRYPTION_IV=your_16_char_iv                    # 16 characters

# CORS
CORS_ORIGIN=http://localhost:4200
```

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | User login | No |
| POST | `/refresh-token` | Refresh access token | No |
| GET | `/me` | Get current user | Yes |
| PUT | `/profile` | Update profile | Yes |
| PUT | `/change-password` | Change password | Yes |
| POST | `/logout` | Logout user | Yes |
| POST | `/forgot-password` | Request password reset | No |
| POST | `/reset-password` | Reset password | No |
| POST | `/verify-email` | Verify email | No |

## 📝 API Usage Examples

### 1. Register User

**Request:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "1234567890",
  "role": "customer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "role": "customer",
      "isEmailVerified": false
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

### 2. Login User

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "customer",
      "lastLogin": "2024-12-20T10:30:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

### 3. Get Current User (Protected)

**Request:**
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "customer"
    }
  }
}
```

### 4. Using Encrypted Requests

**Frontend sends encrypted data:**
```javascript
// Encrypt payload before sending
const payload = {
  email: "john@example.com",
  password: "SecurePass123!"
};

const encryptedPayload = encryptData(payload); // Your encryption function

// Send encrypted request
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    encrypted: true,
    data: encryptedPayload
  })
});
```

**Backend automatically decrypts:**
- The `decryptRequest` middleware automatically detects and decrypts encrypted payloads
- Your controller receives the decrypted data in `req.body`

## 🔒 Security Features

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

### Account Protection
- Maximum 5 failed login attempts
- Account locked for 2 hours after max attempts
- Password hashing with bcrypt (12 salt rounds)

### Rate Limiting
- **Auth endpoints**: 5 requests per 15 minutes
- **Password reset**: 3 requests per hour
- **General API**: 100 requests per 15 minutes

### JWT Tokens
- **Access Token**: 15 minutes expiry
- **Refresh Token**: 7 days expiry
- Tokens stored securely, refresh tokens saved in database

## 🛠️ Middleware Stack

1. **CORS**: Cross-origin resource sharing
2. **Body Parsers**: JSON and URL-encoded
3. **Decrypt Request**: Automatic request decryption
4. **Encrypt Response**: Optional response encryption
5. **Route Handlers**: Business logic
6. **Not Found**: 404 handler
7. **Error Handler**: Global error handling

## 🔑 Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": "Specific field error"
  }
}
```

### Common HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request / Validation Error
- **401**: Unauthorized / Authentication Failed
- **403**: Forbidden / Access Denied
- **404**: Not Found
- **409**: Conflict (e.g., duplicate email)
- **500**: Internal Server Error

## 📚 Custom Error Classes

- `AppError`: Base error class
- `ValidationError`: Input validation errors
- `AuthenticationError`: Authentication failures
- `AuthorizationError`: Access control issues
- `NotFoundError`: Resource not found
- `ConflictError`: Duplicate resource
- `DatabaseError`: Database operation failures

## 🧪 Testing

```bash
# Run tests (to be implemented)
npm test
```

## 📄 License

ISC

## 👥 Support

For issues and questions, please create an issue in the repository.
