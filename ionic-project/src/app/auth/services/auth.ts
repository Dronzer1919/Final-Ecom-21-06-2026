import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap, delay, catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  createdAt?: Date;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  private readonly STORAGE_KEYS = {
    TOKEN: 'auth_token',
    USER: 'auth_user'
  };

  constructor() {
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    const token = this.getToken();
    const user = this.getStoredUser();
    if (token && user) {
      this.currentUser.set(user);
      this.isAuthenticated.set(true);
    }
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<any>(`${environment.apiUrl}/auth/register`, {
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      phone: data.phone,
      role: 'enduser'
    }).pipe(
      map(res => {
        const token = res.token || res.data?.token;
        const user: User = res.user || res.data?.user || {
          id: res.data?.user?._id || res._id || '',
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          createdAt: new Date()
        };
        return { success: true, message: res.message || 'Registration successful', user, token } as AuthResponse;
      }),
      tap(response => {
        if (response.success && response.user && response.token) {
          this.setSession(response.user, response.token);
        }
      })
    );
  }

  signIn(credentials: LoginRequest): Observable<AuthResponse> {
    return of({
      success: true,
      message: 'Sign in successful',
      user: {
        id: '1',
        fullName: 'Demo User',
        email: credentials.email,
        createdAt: new Date()
      },
      token: 'mock_token_' + Date.now()
    }).pipe(
      delay(1000),
      tap(response => {
        if (response.success && response.user && response.token) {
          this.setSession(response.user, response.token, credentials.rememberMe);
        }
      })
    );
  }

  signOut(): void {
    this.clearSession();
    this.router.navigate(['/auth/sign-in']);
  }

  private setSession(user: User, token: string, rememberMe: boolean = false): void {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(this.STORAGE_KEYS.TOKEN, token);
    storage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(user));
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
  }

  private clearSession(): void {
    localStorage.removeItem(this.STORAGE_KEYS.TOKEN);
    localStorage.removeItem(this.STORAGE_KEYS.USER);
    sessionStorage.removeItem(this.STORAGE_KEYS.TOKEN);
    sessionStorage.removeItem(this.STORAGE_KEYS.USER);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.STORAGE_KEYS.TOKEN) ||
           sessionStorage.getItem(this.STORAGE_KEYS.TOKEN);
  }

  private getStoredUser(): User | null {
    const userStr = localStorage.getItem(this.STORAGE_KEYS.USER) ||
                   sessionStorage.getItem(this.STORAGE_KEYS.USER);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  getCurrentUser(): User | null {
    return this.currentUser();
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/reset-password`, { token, password });
  }

  verifyEmailOtp(email: string, otp: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/verify-email`, { email, otp });
  }

  resendOtp(email: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/resend-otp`, { email });
  }

  verifyTwoFactor(email: string, code: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/verify-2fa`, { email, code });
  }

  resend2FA(email: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/resend-2fa`, { email });
  }

  updateProfile(userData: Partial<User>): Observable<{ success: boolean; message: string; data?: { user: User } }> {
    // Mock implementation - replace with actual API call
    return of({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          ...this.currentUser()!,
          ...userData
        }
      }
    }).pipe(
      delay(500),
      tap(response => {
        if (response.success && response.data) {
          const updatedUser = response.data.user;
          this.currentUser.set(updatedUser);
          // Update stored user
          const storage = localStorage.getItem(this.STORAGE_KEYS.USER) ? localStorage : sessionStorage;
          storage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        }
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{ success: boolean; message: string }> {
    // Mock implementation - replace with actual API call
    return of({
      success: true,
      message: 'Password changed successfully'
    }).pipe(
      delay(500)
    );
  }
}
