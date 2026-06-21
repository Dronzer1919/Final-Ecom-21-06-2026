# Sindhu POS Backend API 🚀

A secure, scalable, and well-structured backend API for the Sindhu POS System featuring encryption, JWT authentication, role-based access control, and comprehensive error handling.

## ⭐ Key Features

- 🔐 **Secure Authentication**: JWT-based auth with access & refresh tokens
- 🔒 **End-to-End Encryption**: AES-256-CBC encryption for sensitive data
- 🛡️ **Password Security**: Bcrypt hashing with automatic salt generation
- 🚨 **Global Error Handling**: Centralized error management with custom error classes
- ✅ **Input Validation**: Express-validator for comprehensive request validation
- ⚡ **Rate Limiting**: Protection against brute force and DDoS attacks
- 🔑 **RBAC**: Role-based access control (Admin, Manager, Staff, Customer)
- 🔄 **Auto Retry**: Account lockout with failed login attempt tracking

## 📚 Documentation

- **[Quick Start Guide](./QUICK_START.md)** - Get up and running in 5 minutes
- **[API Documentation](./API_DOCUMENTATION.md)** - Complete API reference
- **[Frontend Integration](./FRONTEND_INTEGRATION.md)** - Angular integration guide
- **[Create New Module](./CREATE_NEW_MODULE.md)** - Module creation template

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB** (if using local instance)

4. **Run the server:**
   ```bash
   npm run dev  # Development with auto-reload
   # OR
   npm start    # Production mode
   ```

For detailed setup instructions, see **[QUICK_START.md](./QUICK_START.md)**

## 📡 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register new user | No |
| POST | `/login` | User login | No |
| POST | `/refresh-token` | Refresh access token | No |
| GET | `/me` | Get current user profile | Yes |
| PUT | `/profile` | Update user profile | Yes |
| PUT | `/change-password` | Change password | Yes |
| POST | `/logout` | Logout user | Yes |
| POST | `/forgot-password` | Request password reset | No |
| POST | `/reset-password` | Reset password with token | No |

For complete API documentation, see **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   └── database.js
│   ├── controllers/         # Route controllers
│   │   └── auth.controller.js
│   ├── middleware/          # Custom middleware
│   │   ├── auth.js
│   │   ├── encryption.js
│   │   ├── errorHandler.js
│   │   └── ...
│   ├── models/              # Database models
│   │   └── User.js
│   ├── routes/              # API routes
│   │   └── auth.routes.js
│   ├── utils/               # Utility functions
│   │   ├── encryption.js
│   │   ├── jwtUtils.js
│   │   └── ...
│   └── server.js           # Entry point
├── .env.example
├── package.json
└── Documentation/
    ├── API_DOCUMENTATION.md
    ├── FRONTEND_INTEGRATION.md
    ├── CREATE_NEW_MODULE.md
    └── QUICK_START.md
```

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Encryption**: Crypto (AES-256-CBC) & Bcrypt
- **Validation**: Express Validator
- **Security**: Express Rate Limit, CORS

## 🔐 Security Features

- JWT access tokens (15min expiry)
- Refresh tokens (7 days expiry)
- Role-based access control
- Account lockout after 5 failed attempts
- AES-256-CBC encryption
- Bcrypt password hashing (12 rounds)
- Rate limiting on all endpoints
- Input sanitization & validation

## 📝 Scripts

```bash
# Development (auto-reload on changes)
npm run dev

# Production
npm start

# Run tests
npm test
```

## 🌍 Environment Variables

Required environment variables (see `.env.example`):

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/sindhu_pos
JWT_ACCESS_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
ENCRYPTION_KEY=32_character_key
ENCRYPTION_IV=16_character_iv
CORS_ORIGIN=http://localhost:4200
```

## 🐛 Troubleshooting

See **[QUICK_START.md](./QUICK_START.md)** for common issues and solutions.

## 📄 License

ISC

---

**Built with ❤️ for secure and scalable POS systems**
