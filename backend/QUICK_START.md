# 🚀 Quick Start Guide - Sindhu POS Backend

This guide will help you get the backend up and running in minutes.

## ⚡ Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## 📦 Installation Steps

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Copy the example environment file:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

### 4. Update .env File

Edit the `.env` file with your configuration:

```env
# IMPORTANT: Change these values before deploying to production!

NODE_ENV=development
PORT=3000

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/sindhu_pos
# Or use MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/sindhu_pos

# JWT Secrets (Generate strong random strings)
JWT_ACCESS_SECRET=change_this_to_random_32_character_string_for_access
JWT_REFRESH_SECRET=change_this_to_random_32_character_string_for_refresh
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Encryption Keys (MUST be exactly these lengths)
# Use: node -e "console.log(require('crypto').randomBytes(16).toString('hex'))" to generate
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef  # 32 characters
ENCRYPTION_IV=0123456789abcdef                    # 16 characters

# Frontend URL
CORS_ORIGIN=http://localhost:4200
```

### 5. Start MongoDB

Make sure MongoDB is running:

```bash
# If MongoDB is installed locally
mongod

# Or start MongoDB service (Windows)
net start MongoDB

# Or use MongoDB Atlas (cloud) - no local setup needed
```

### 6. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

You should see:
```
✅ MongoDB Connected: localhost
🚀 Server is running on http://localhost:3000
📝 Environment: development
```

## 🧪 Testing the API

### Using cURL

```bash
# Health check
curl http://localhost:3000

# Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "phone": "1234567890"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Using Postman

1. **Import Collection**: Create a new collection in Postman
2. **Set Base URL**: `http://localhost:3000/api`
3. **Test Endpoints**: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Using VS Code REST Client

Create a file `test.http`:

```http
### Health Check
GET http://localhost:3000

### Register User
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "1234567890"
}

### Login
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

### Get Profile (Replace TOKEN with your access token)
GET http://localhost:3000/api/auth/me
Authorization: Bearer <YOUR_ACCESS_TOKEN>
```

## 🔐 Generate Secure Keys

Use these commands to generate secure random keys:

```bash
# Generate 32-character encryption key (hex)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# Generate 16-character IV (hex)
node -e "console.log(require('crypto').randomBytes(8).toString('hex'))"

# Generate JWT secret (base64)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 📁 Project Structure Overview

```
backend/
├── src/
│   ├── config/          # Database and app configuration
│   ├── controllers/     # Request handlers and business logic
│   ├── middleware/      # Express middleware (auth, error handling, etc.)
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API route definitions
│   ├── utils/           # Helper functions (encryption, JWT, etc.)
│   └── server.js        # Application entry point
├── .env                 # Environment variables (create from .env.example)
├── .env.example         # Environment template
├── package.json         # Dependencies and scripts
└── README.md           # Project documentation
```

## 🐛 Troubleshooting

### MongoDB Connection Issues

**Error**: `MongooseError: connect ECONNREFUSED localhost:27017`

**Solutions**:
1. Make sure MongoDB is running: `mongod`
2. Check MongoDB is listening on port 27017
3. Try using MongoDB Atlas (cloud) instead
4. Verify `MONGODB_URI` in `.env` file

### Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions**:
1. Change `PORT` in `.env` file to 3001 or another port
2. Kill the process using port 3000:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F

   # Linux/Mac
   lsof -ti:3000 | xargs kill -9
   ```

### Encryption/Decryption Errors

**Error**: `Encryption failed` or `Decryption failed`

**Solutions**:
1. Ensure `ENCRYPTION_KEY` is exactly 32 characters
2. Ensure `ENCRYPTION_IV` is exactly 16 characters
3. Frontend and backend must use the same keys
4. Keys should only contain valid hex characters (0-9, a-f)

### JWT Token Errors

**Error**: `Invalid token` or `Token expired`

**Solutions**:
1. Generate new strong JWT secrets
2. Ensure secrets are the same on all server instances
3. Token may have expired - login again
4. Check token format: `Bearer <token>`

## 📚 Next Steps

1. ✅ **Read API Documentation**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
2. ✅ **Frontend Integration**: [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md)
3. ✅ **Add More Modules**: Create product, category, order controllers
4. ✅ **Email Service**: Integrate email for password reset and verification
5. ✅ **File Upload**: Add image upload for products and avatars
6. ✅ **Deploy**: Deploy to production (Heroku, AWS, DigitalOcean, etc.)

## 🔒 Security Checklist

Before deploying to production:

- [ ] Change all default keys in `.env`
- [ ] Use strong, random secrets (minimum 32 characters)
- [ ] Enable HTTPS
- [ ] Update `CORS_ORIGIN` to your frontend URL
- [ ] Set `NODE_ENV=production`
- [ ] Use environment variables, never hardcode secrets
- [ ] Enable MongoDB authentication
- [ ] Set up proper firewall rules
- [ ] Implement rate limiting (already included)
- [ ] Regular security updates: `npm audit fix`
- [ ] Use environment-specific `.env` files
- [ ] Never commit `.env` to version control

## 🆘 Getting Help

- **Issues**: Create an issue in the repository
- **Documentation**: Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Frontend Setup**: See [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md)

## 📝 Available Scripts

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run tests (to be implemented)
npm test

# Check for security vulnerabilities
npm audit

# Update dependencies
npm update
```

## ✨ Features Implemented

- ✅ User registration and authentication
- ✅ JWT access and refresh tokens
- ✅ Password hashing with bcrypt
- ✅ Request/response encryption (AES-256)
- ✅ Global error handling
- ✅ Input validation
- ✅ Rate limiting
- ✅ Account lockout after failed attempts
- ✅ Role-based access control
- ✅ Password reset functionality
- ✅ Email verification (token ready)
- ✅ Profile management

## 🎯 Coming Soon

- [ ] Two-factor authentication
- [ ] Email service integration
- [ ] Product management APIs
- [ ] Order management APIs
- [ ] Inventory management
- [ ] File upload service
- [ ] Analytics and reporting
- [ ] Audit logging
- [ ] API versioning
- [ ] GraphQL support

---

**Happy Coding! 🚀**
