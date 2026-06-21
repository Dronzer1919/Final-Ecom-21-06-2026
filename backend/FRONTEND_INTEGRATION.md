# Frontend Integration Guide

## How to Integrate with Encrypted Backend API

This guide shows how to integrate the Angular frontend with the encrypted backend API.

## 🔐 Encryption Setup

### 1. Install crypto-js in Angular

```bash
npm install crypto-js
npm install --save-dev @types/crypto-js
```

### 2. Create Encryption Service

Create a new service: `ng generate service services/encryption`

**File: `src/app/services/encryption.service.ts`**

```typescript
import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private readonly encryptionKey: string;
  private readonly encryptionIV: string;

  constructor() {
    // These must match the backend .env values
    this.encryptionKey = environment.encryptionKey;
    this.encryptionIV = environment.encryptionIV;
  }

  /**
   * Encrypt data using AES-256-CBC
   * @param data - Data to encrypt (string or object)
   * @returns Encrypted string in hex format
   */
  encrypt(data: any): string {
    try {
      const text = typeof data === 'object' ? JSON.stringify(data) : String(data);
      
      const key = CryptoJS.enc.Utf8.parse(this.encryptionKey);
      const iv = CryptoJS.enc.Utf8.parse(this.encryptionIV);
      
      const encrypted = CryptoJS.AES.encrypt(text, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      
      return encrypted.ciphertext.toString(CryptoJS.enc.Hex);
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Encryption failed');
    }
  }

  /**
   * Decrypt data using AES-256-CBC
   * @param encryptedData - Encrypted string in hex format
   * @returns Decrypted data (parsed as JSON if possible)
   */
  decrypt(encryptedData: string): any {
    try {
      const key = CryptoJS.enc.Utf8.parse(this.encryptionKey);
      const iv = CryptoJS.enc.Utf8.parse(this.encryptionIV);
      
      const ciphertext = CryptoJS.enc.Hex.parse(encryptedData);
      const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: ciphertext
      });
      
      const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      
      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
      
      // Try to parse as JSON
      try {
        return JSON.parse(decryptedText);
      } catch {
        return decryptedText;
      }
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Decryption failed');
    }
  }
}
```

### 3. Update Environment Configuration

**File: `src/environments/environment.ts`**

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  encryptionKey: 'your_32_character_encryption_key_change_this_must_be_32_chars',
  encryptionIV: 'your_16_char_iv_change_this_must_be_16',
  useEncryption: true // Toggle encryption on/off
};
```

**File: `src/environments/environment.prod.ts`**

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api.com/api',
  encryptionKey: 'production_32_character_key_here',
  encryptionIV: 'production_16_iv',
  useEncryption: true
};
```

### 4. Create HTTP Interceptor

Create interceptor: `ng generate interceptor interceptors/auth`

**File: `src/app/interceptors/auth.interceptor.ts`**

```typescript
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { EncryptionService } from '../services/encryption.service';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private encryptionService: EncryptionService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Get token from localStorage
    const token = localStorage.getItem('accessToken');
    
    // Clone request and add authorization header if token exists
    let modifiedRequest = request;
    
    if (token) {
      modifiedRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Encrypt request body if enabled and method is POST/PUT/PATCH
    if (environment.useEncryption && 
        modifiedRequest.body && 
        ['POST', 'PUT', 'PATCH'].includes(modifiedRequest.method)) {
      
      const encryptedData = this.encryptionService.encrypt(modifiedRequest.body);
      
      modifiedRequest = modifiedRequest.clone({
        body: {
          encrypted: true,
          data: encryptedData
        }
      });
    }

    return next.handle(modifiedRequest).pipe(
      map((event: HttpEvent<any>) => {
        // Decrypt response if it's encrypted
        if (event instanceof HttpResponse && event.body?.data?.encrypted) {
          const decryptedData = this.encryptionService.decrypt(event.body.data.data);
          return event.clone({
            body: {
              ...event.body,
              data: decryptedData
            }
          });
        }
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        // Handle authentication errors
        if (error.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          // Redirect to login
          window.location.href = '/auth/signin';
        }
        return throwError(() => error);
      })
    );
  }
}
```

### 5. Register Interceptor in App Config

**File: `src/app/app.config.ts`**

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};
```

### 6. Update Auth Service

**File: `src/app/auth/services/auth.service.ts`**

```typescript
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: any;
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  currentUser = signal<any>(null);
  isAuthenticated = signal<boolean>(false);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.checkAuth();
  }

  /**
   * Register new user
   */
  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        tap(response => {
          if (response.success) {
            this.setSession(response.data);
          }
        })
      );
  }

  /**
   * Login user
   */
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          if (response.success) {
            this.setSession(response.data);
          }
        })
      );
  }

  /**
   * Get current user profile
   */
  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`)
      .pipe(
        tap(response => {
          if (response.success) {
            this.currentUser.set(response.data.user);
            this.isAuthenticated.set(true);
          }
        })
      );
  }

  /**
   * Update user profile
   */
  updateProfile(userData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/profile`, userData)
      .pipe(
        tap(response => {
          if (response.success) {
            this.currentUser.set(response.data.user);
          }
        })
      );
  }

  /**
   * Change password
   */
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/change-password`, {
      currentPassword,
      newPassword
    });
  }

  /**
   * Logout user
   */
  logout(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/logout`, {})
      .pipe(
        tap(() => {
          this.clearSession();
          this.router.navigate(['/auth/signin']);
        })
      );
  }

  /**
   * Forgot password
   */
  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/forgot-password`, { email });
  }

  /**
   * Reset password
   */
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password`, {
      token,
      newPassword
    });
  }

  /**
   * Refresh access token
   */
  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post<any>(`${this.apiUrl}/refresh-token`, { refreshToken })
      .pipe(
        tap(response => {
          if (response.success) {
            localStorage.setItem('accessToken', response.data.accessToken);
          }
        })
      );
  }

  /**
   * Set session data
   */
  private setSession(authData: any): void {
    localStorage.setItem('accessToken', authData.tokens.accessToken);
    localStorage.setItem('refreshToken', authData.tokens.refreshToken);
    localStorage.setItem('user', JSON.stringify(authData.user));
    this.currentUser.set(authData.user);
    this.isAuthenticated.set(true);
  }

  /**
   * Clear session data
   */
  private clearSession(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  /**
   * Check if user is authenticated
   */
  private checkAuth(): void {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      this.currentUser.set(JSON.parse(user));
      this.isAuthenticated.set(true);
      
      // Optionally verify token with backend
      this.getProfile().subscribe({
        error: () => this.clearSession()
      });
    }
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    return this.currentUser()?.role === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    return roles.includes(this.currentUser()?.role);
  }
}
```

## 🔄 Usage Examples

### Example: Login Component

```typescript
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html'
})
export class SigninComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Login failed';
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }
}
```

## 🛡️ Auth Guard

Create guard: `ng generate guard guards/auth`

```typescript
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/auth/signin']);
  return false;
};
```

**Use in routes:**

```typescript
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard-layout.component'),
    canActivate: [authGuard]
  }
];
```

## ✅ Testing

Test encryption/decryption:

```typescript
// In your component or service
const testData = { email: 'test@example.com', password: 'Test123!' };
const encrypted = this.encryptionService.encrypt(testData);
console.log('Encrypted:', encrypted);

const decrypted = this.encryptionService.decrypt(encrypted);
console.log('Decrypted:', decrypted);
```

## 🔑 Important Notes

1. **Keep encryption keys secure** - Never commit them to version control
2. **Use environment variables** - Different keys for dev/prod
3. **HTTPS is required** - Always use HTTPS in production
4. **Token storage** - Consider using httpOnly cookies for production
5. **Refresh token rotation** - Implement token refresh before expiry

## 📚 Next Steps

1. Implement token refresh logic
2. Add email verification flow
3. Implement two-factor authentication
4. Add password strength indicator
5. Implement "Remember Me" functionality
