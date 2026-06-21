export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'staff' | 'customer';
  avatar?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword?: string;
  phone?: string;
  agreeToTerms?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  message?: string;
}

export interface OTPRequest {
  email: string;
  otp: string;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  token?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface SocialAuthProvider {
  provider: 'facebook' | 'google' | 'apple';
  token: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string>;
}
