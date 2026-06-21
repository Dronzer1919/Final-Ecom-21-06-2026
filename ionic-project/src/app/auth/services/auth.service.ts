import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import {
  User,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest
} from '../interfaces/auth.interface';
import { environment } from '../../../environments/environment';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

interface AuthData {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

@Injectable({providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private apiUrl = `${environment.apiUrl}/auth`;

  // Signal for template/computed use; BehaviorSubject for reliable service-to-service subscriptions
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  /** Fires synchronously on login, logout, and profile refresh. Subscribe to this in services. */
  readonly currentUser$ = new BehaviorSubject<User | null>(null);

  constructor() {
    this.checkAuthStatus();
  }

  // Check if user is authenticated on init
  private checkAuthStatus(): void {
    const token = this.getToken();
    const user = this.getStoredUser();

    if (token && user) {
      this.currentUser.set(user);
      this.currentUser$.next(user);
      this.isAuthenticated.set(true);

      // Verify token with backend; update user with fresh profile data
      this.getProfile().subscribe({
        error: () => this.clearSession()
      });
    }
  }

  // Register new user
  register(data: RegisterRequest): Observable<ApiResponse<AuthData>> {
    const payload = {
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      phone: data.phone || ''
    };

    return this.http.post<ApiResponse<AuthData>>(`${this.apiUrl}/register`, payload).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setSession(response.data);
        }
      }),
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => error);
      })
    );
  }

  // Sign In
  signIn(credentials: LoginRequest): Observable<ApiResponse<AuthData>> {
    return this.http.post<ApiResponse<AuthData>>(`${this.apiUrl}/login`, {
      email: credentials.email,
      password: credentials.password
    }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setSession(response.data);
        }
      }),
      catchError(error => {
        console.error('Sign in error:', error);
        return throwError(() => error);
      })
    );
  }

  // Get current user profile
  getProfile(): Observable<ApiResponse<{ user: User }>> {
    return this.http.get<ApiResponse<{ user: User }>>(`${this.apiUrl}/me`).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.currentUser.set(response.data.user);
          this.currentUser$.next(response.data.user);
          this.isAuthenticated.set(true);
        }
      }),
      catchError(error => {
        console.error('Get profile error:', error);
        return throwError(() => error);
      })
    );
  }

  // Update user profile
  updateProfile(userData: Partial<User>): Observable<ApiResponse<{ user: User }>> {
    return this.http.put<ApiResponse<{ user: User }>>(`${this.apiUrl}/profile`, userData).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.currentUser.set(response.data.user);
          this.setStoredUser(response.data.user);
        }
      }),
      catchError(error => {
        console.error('Update profile error:', error);
        return throwError(() => error);
      })
    );
  }

  // Change password
  changePassword(currentPassword: string, newPassword: string): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/change-password`, {
      currentPassword,
      newPassword
    }).pipe(
      catchError(error => {
        console.error('Change password error:', error);
        return throwError(() => error);
      })
    );
  }

  // Forgot Password
  forgotPassword(data: ForgotPasswordRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/forgot-password`, {
      email: data.email
    }).pipe(
      catchError(error => {
        console.error('Forgot password error:', error);
        return throwError(() => error);
      })
    );
  }

  // Reset Password
  resetPassword(data: ResetPasswordRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/reset-password`, {
      token: data.token,
      newPassword: data.newPassword
    }).pipe(
      catchError(error => {
        console.error('Reset password error:', error);
        return throwError(() => error);
      })
    );
  }

  // Verify Email OTP
  verifyEmailOTP(data: { email: string; otp: string }): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/verify-email`, data).pipe(
      catchError(error => {
        console.error('Verify email OTP error:', error);
        return throwError(() => error);
      })
    );
  }

  // Verify 2-Step OTP
  verify2StepOTP(data: { email: string; otp: string }): Observable<ApiResponse<AuthData>> {
    return this.http.post<ApiResponse<AuthData>>(`${this.apiUrl}/verify-2fa`, data).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setSession(response.data);
        }
      }),
      catchError(error => {
        console.error('Verify 2FA OTP error:', error);
        return throwError(() => error);
      })
    );
  }

  // Resend OTP
  resendOTP(email: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/resend-otp`, { email }).pipe(
      catchError(error => {
        console.error('Resend OTP error:', error);
        return throwError(() => error);
      })
    );
  }

  // Refresh access token
  refreshToken(): Observable<ApiResponse<{ accessToken: string }>> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<ApiResponse<{ accessToken: string }>>(`${this.apiUrl}/refresh-token`, {
      refreshToken
    }).pipe(
      tap(response => {
        if (response.success && response.data) {
          localStorage.setItem('accessToken', response.data.accessToken);
        }
      }),
      catchError(error => {
        console.error('Refresh token error:', error);
        this.clearSession();
        return throwError(() => error);
      })
    );
  }

  // Sign Out
  signOut(): void {
    this.http.post<ApiResponse>(`${this.apiUrl}/logout`, {}).subscribe({
      next: () => {
        this.clearSession();
        this.router.navigate(['/auth/signin']);
      },
      error: () => {
        // Clear session even if API call fails
        this.clearSession();
        this.router.navigate(['/auth/signin']);
      }
    });
  }

  // Set session data
  private setSession(authData: AuthData): void {
    localStorage.setItem('accessToken', authData.tokens.accessToken);
    localStorage.setItem('refreshToken', authData.tokens.refreshToken);
    localStorage.setItem('user', JSON.stringify(authData.user));
    this.currentUser.set(authData.user);
    this.currentUser$.next(authData.user);
    this.isAuthenticated.set(true);
  }

  // Clear session data
  private clearSession(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.currentUser$.next(null);
    this.isAuthenticated.set(false);
  }

  // Token Management
  private setToken(token: string): void {
    localStorage.setItem('accessToken', token);
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private setRefreshToken(token: string): void {
    localStorage.setItem('refreshToken', token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  // User Management
  private setStoredUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  private getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    return this.currentUser()?.role === role;
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles: string[]): boolean {
    const userRole = this.currentUser()?.role;
    return userRole ? roles.includes(userRole) : false;
  }
}
