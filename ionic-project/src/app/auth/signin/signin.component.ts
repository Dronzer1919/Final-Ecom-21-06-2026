import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoginRequest } from '../interfaces/auth.interface';
import { WishlistService } from '../../services/wishlist.service';
import { ToastService } from '../../services/toast.service';
import { ThemeButtonComponent } from '../../components/buttons/theme-button/theme-button.component';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ThemeButtonComponent],
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private wishlistService = inject(WishlistService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  signInForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  translations: any;
  returnUrl: string = '/dashboard';

  ngOnInit(): void {
    this.initializeForm();
    this.loadTranslations();
    
    // Get return URL from route parameters or default to dashboard
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  private initializeForm(): void {
    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false]
    });
  }

  private loadTranslations(): void {
    // Load translations from en.json
    // In a real app, you would use a translation service like ngx-translate
    fetch('/assets/i18n/en.json')
      .then(response => response.json())
      .then(data => {
        this.translations = data.auth;
      });
  }

  goToHome(): void {
    this.router.navigateByUrl('/home');
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.signInForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const credentials: LoginRequest = {
        email: this.signInForm.value.email,
        password: this.signInForm.value.password,
        rememberMe: this.signInForm.value.rememberMe
      };

      this.authService.signIn(credentials).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.toastService.success('Login successful!');
            
            // Sync wishlist from IndexedDB to backend
            this.wishlistService.syncWishlistOnLogin().subscribe({
              next: (syncResponse) => {
                // Silent sync
              },
              error: (err) => {
                // Silent error
              }
            });
            
            // Navigate to return URL or dashboard
            this.router.navigateByUrl(this.returnUrl);
          }
        },
        error: (error) => {
          this.isLoading = false;
          // Handle different error formats
          if (error.error?.message) {
            this.errorMessage = error.error.message;
          } else if (error.message) {
            this.errorMessage = error.message;
          } else {
            this.errorMessage = 'An error occurred. Please try again.';
          }
          
          // Show field-specific errors if available
          if (error.error?.errors) {
            Object.keys(error.error.errors).forEach(key => {
              const control = this.signInForm.get(key);
              if (control) {
                control.setErrors({ serverError: error.error.errors[key] });
              }
            });
          }
        }
      });
    } else {
      this.markFormGroupTouched(this.signInForm);
    }
  }

  onSocialLogin(provider: 'facebook' | 'google' | 'apple'): void {
    // Implement social login logic
    console.log(`Social login with ${provider}`);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.signInForm.get(controlName);
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (control?.hasError('minlength')) {
      return 'Password must be at least 8 characters';
    }
    return '';
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.signInForm.get(controlName);
    return !!(control?.invalid && (control?.dirty || control?.touched));
  }
}
