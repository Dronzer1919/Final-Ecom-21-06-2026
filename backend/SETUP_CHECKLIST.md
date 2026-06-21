# Backend Setup Checklist

Use this checklist to ensure your backend is properly configured before starting development.

## ✅ Initial Setup

- [x] Node.js installed (v16+)
- [ ] MongoDB installed or Atlas account created
- [x] Backend dependencies installed (`npm install`)
- [ ] `.env` file created from `.env.example`
- [ ] Environment variables configured

## 🔐 Security Configuration

### Required Environment Variables
- [ ] `JWT_ACCESS_SECRET` - Strong random string (32+ characters)
- [ ] `JWT_REFRESH_SECRET` - Strong random string (32+ characters)
- [ ] `ENCRYPTION_KEY` - Exactly 32 characters (hex)
- [ ] `ENCRYPTION_IV` - Exactly 16 characters (hex)
- [ ] `MONGODB_URI` - Database connection string

### Generate Secure Keys
Run these commands to generate secure keys:

```bash
# Generate 32-char encryption key
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# Generate 16-char IV
node -e "console.log(require('crypto').randomBytes(8).toString('hex'))"

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 🗄️ Database Setup

- [ ] MongoDB is running
- [ ] Can connect to MongoDB
- [ ] Database name set in MONGODB_URI
- [ ] Connection tested successfully

### Test MongoDB Connection
```bash
# Local MongoDB
mongod

# Or verify connection
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sindhu_pos').then(() => console.log('✅ Connected')).catch(err => console.log('❌ Error:', err))"
```

## 🚀 Server Startup

- [ ] Server starts without errors (`npm run dev`)
- [ ] Can access health check endpoint (http://localhost:3000)
- [ ] No console errors visible
- [ ] Database connected successfully

## 🧪 API Testing

### Test Endpoints
- [ ] GET http://localhost:3000 (health check works)
- [ ] POST /api/auth/register (can register user)
- [ ] POST /api/auth/login (can login)
- [ ] GET /api/auth/me (can get profile with token)

### Test with cURL

```bash
# Health check
curl http://localhost:3000

# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"Test123!","phone":"1234567890"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

## 📝 Documentation Review

- [x] Read QUICK_START.md
- [x] Review API_DOCUMENTATION.md
- [x] Check FRONTEND_INTEGRATION.md
- [x] Understand CREATE_NEW_MODULE.md
- [x] Review IMPLEMENTATION_SUMMARY.md

## 🔧 Development Tools

### Recommended Tools
- [ ] Postman or Insomnia (API testing)
- [ ] MongoDB Compass (database GUI)
- [ ] VS Code with extensions:
  - REST Client
  - MongoDB for VS Code
  - ESLint
  - Prettier

## 🔍 Troubleshooting

### Common Issues

**❌ MongoDB connection error**
- Solution: Ensure MongoDB is running or check MONGODB_URI

**❌ Port already in use**
- Solution: Change PORT in .env or kill process using the port

**❌ Encryption/Decryption errors**
- Solution: Verify ENCRYPTION_KEY is 32 chars and ENCRYPTION_IV is 16 chars

**❌ Token errors**
- Solution: Generate new JWT secrets and restart server

## 🎯 Next Steps

Once all checklist items are complete:

1. **Test all endpoints** using Postman or cURL
2. **Integrate with frontend** following FRONTEND_INTEGRATION.md
3. **Create new modules** using CREATE_NEW_MODULE.md template
4. **Add features** based on your requirements

## 📋 Production Readiness

Before deploying to production:

- [ ] All .env secrets changed to strong random values
- [ ] NODE_ENV set to 'production'
- [ ] MongoDB Atlas or managed database configured
- [ ] HTTPS enabled
- [ ] CORS_ORIGIN set to frontend domain
- [ ] Rate limits configured appropriately
- [ ] Error logging configured
- [ ] Backup strategy in place
- [ ] Security headers configured
- [ ] API documentation updated

## 💾 Backup Your .env

**Important**: Your `.env` file contains sensitive information. 

- [ ] Backup .env securely (password manager, encrypted storage)
- [ ] Never commit .env to git
- [ ] Share secrets securely with team members
- [ ] Use different .env for different environments

## 📊 Monitor After Setup

After starting the server, monitor:

- [ ] Server logs for errors
- [ ] MongoDB connection status
- [ ] API response times
- [ ] Memory usage
- [ ] Error rates

## ✨ You're Ready!

Once this checklist is complete:
- ✅ Backend is properly configured
- ✅ Security measures in place
- ✅ Database connected
- ✅ API endpoints working
- ✅ Ready for frontend integration
- ✅ Ready to add new features

---

**Need Help?**
- Check QUICK_START.md for setup instructions
- Review TROUBLESHOOTING section in documentation
- Check inline code comments
- Review error messages carefully
