const { verifyAccessToken } = require('../utils/jwtUtils');
const { AuthenticationError } = require('../utils/customErrors');
const User = require('../models/User');
const asyncHandler = require('./asyncHandler');

/**
 * Protect routes - Verify JWT token
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AuthenticationError('Not authorized, no token provided');
  }

  try {
    // Verify token
    const decoded = verifyAccessToken(token);
    
    // Get user from token (exclude password)
    req.user = await User.findById(decoded.userId).select('-password');
    
    if (!req.user) {
      throw new AuthenticationError('User not found');
    }

    if (!req.user.isActive) {
      throw new AuthenticationError('Account is deactivated');
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new AuthenticationError('Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      throw new AuthenticationError('Token expired');
    }
    throw error;
  }
});

/**
 * Check user roles
 * @param  {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AuthenticationError('Not authorized to access this resource');
    }
    next();
  };
};

module.exports = { protect, authorize };
