const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const { successResponse } = require('../utils/responseHandler');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwtUtils');
const encryption = require('../utils/encryption');
const {
  AuthenticationError,
  ValidationError,
  ConflictError,
  NotFoundError
} = require('../utils/customErrors');

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ConflictError('Email already registered');
  }

  // Split fullName into firstName and lastName
  const nameParts = fullName.trim().split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ') || firstName;

  // Create user (password will be hashed automatically by pre-save middleware)
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    phone,
    role: role || 'customer' // Default to customer if not specified
  });

  // Generate tokens
  const accessToken = generateAccessToken({ userId: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user._id });

  // Save refresh token to user
  user.refreshToken = refreshToken;
  await user.save();

  // Prepare response data
  const responseData = {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isEmailVerified: user.isEmailVerified
    },
    tokens: {
      accessToken,
      refreshToken
    }
  };

  return successResponse(
    res,
    201,
    'User registered successfully',
    responseData
  );
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and include password field
  const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');
  
  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Check if account is locked
  if (user.isLocked) {
    throw new AuthenticationError('Account is temporarily locked due to multiple failed login attempts. Please try again later.');
  }

  // Check if account is active
  if (!user.isActive) {
    throw new AuthenticationError('Your account has been deactivated. Please contact support.');
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    // Increment login attempts
    await user.incLoginAttempts();
    throw new AuthenticationError('Invalid email or password');
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }

  // Update last login
  user.lastLogin = Date.now();

  // Generate tokens
  const accessToken = generateAccessToken({ userId: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user._id });

  // Save refresh token
  user.refreshToken = refreshToken;
  await user.save();

  // Prepare response data
  const responseData = {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      lastLogin: user.lastLogin
    },
    tokens: {
      accessToken,
      refreshToken
    }
  };

  return successResponse(
    res,
    200,
    'Login successful',
    responseData
  );
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  return successResponse(
    res,
    200,
    'User profile retrieved successfully',
    { user }
  );
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, avatar } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Update fields
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (phone) user.phone = phone;
  if (avatar) user.avatar = avatar;

  await user.save();

  return successResponse(
    res,
    200,
    'Profile updated successfully',
    { user }
  );
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Verify current password
  const isPasswordValid = await user.comparePassword(currentPassword);
  
  if (!isPasswordValid) {
    throw new AuthenticationError('Current password is incorrect');
  }

  // Update password (will be hashed by pre-save middleware)
  user.password = newPassword;
  await user.save();

  return successResponse(
    res,
    200,
    'Password changed successfully',
    null
  );
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ValidationError('Refresh token is required');
  }

  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user with refresh token
    const user = await User.findById(decoded.userId).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      throw new AuthenticationError('Invalid refresh token');
    }

    if (!user.isActive) {
      throw new AuthenticationError('Account is deactivated');
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({ userId: user._id, role: user.role });

    return successResponse(
      res,
      200,
      'Token refreshed successfully',
      { accessToken: newAccessToken }
    );
  } catch (error) {
    throw new AuthenticationError('Invalid or expired refresh token');
  }
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // Clear refresh token
    user.refreshToken = undefined;
    await user.save();
  }

  return successResponse(
    res,
    200,
    'Logout successful',
    null
  );
});

/**
 * @desc    Forgot password - Send reset token
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    // Don't reveal if user exists
    return successResponse(
      res,
      200,
      'If an account exists with this email, a password reset link has been sent',
      null
    );
  }

  // Generate reset token
  const resetToken = encryption.generateToken(32);
  user.passwordResetToken = encryption.hash(resetToken);
  user.passwordResetExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  // TODO: Send email with reset token
  // For now, return token in response (remove in production)
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  return successResponse(
    res,
    200,
    'Password reset link sent successfully',
    { resetUrl, resetToken } // Remove resetToken in production
  );
});

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    throw new ValidationError('Token and new password are required');
  }

  // Hash token and find user
  const hashedToken = encryption.hash(token);
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) {
    throw new AuthenticationError('Invalid or expired reset token');
  }

  // Update password
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return successResponse(
    res,
    200,
    'Password reset successful',
    null
  );
});

/**
 * @desc    Verify email (OTP or token based)
 * @route   POST /api/auth/verify-email
 * @access  Public
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const { token, email } = req.body;

  if (!token || !email) {
    throw new ValidationError('Token and email are required');
  }

  const hashedToken = encryption.hash(token);
  const user = await User.findOne({
    email,
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() }
  }).select('+emailVerificationToken +emailVerificationExpires');

  if (!user) {
    throw new AuthenticationError('Invalid or expired verification token');
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  return successResponse(
    res,
    200,
    'Email verified successfully',
    null
  );
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail
};
