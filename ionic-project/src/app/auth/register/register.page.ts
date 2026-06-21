import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBack, mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, personOutline, callOutline, alertCircle } from 'ionicons/icons';
import { AuthService } from '../services/auth.service';
import { RegisterRequest } from '../interfaces/auth.interface';
import { ThemeButtonComponent } from '../../components/buttons/theme-button/theme-button.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, IonIcon, IonSpinner, ThemeButtonComponent]
})
export class RegisterPage {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({ arrowBack, mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, personOutline, callOutline, alertCircle });

    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[0-9]{10,15}$/)]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    const pw = g.get('password')?.value;
    const cpw = g.get('confirmPassword')?.value;
    return pw === cpw ? null : { passwordMismatch: true };
  }

  togglePassword() { this.showPassword = !this.showPassword; }
  toggleConfirmPassword() { this.showConfirmPassword = !this.showConfirmPassword; }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (!field?.errors) return '';
    if (field.errors['required']) return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    if (field.errors['email']) return 'Please enter a valid email';
    if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} characters required`;
    if (field.errors['pattern']) {
      if (fieldName === 'phone') return 'Enter a valid phone number (10-15 digits)';
      if (fieldName === 'password') return 'Use uppercase, lowercase, number, and special character';
    }
    return '';
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(k => this.registerForm.get(k)?.markAsTouched());
      return;
    }
    if (this.registerForm.hasError('passwordMismatch')) {
      this.errorMessage = 'Passwords do not match';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    const { confirmPassword, ...rawPayload } = this.registerForm.value;
    const payload: RegisterRequest = {
      fullName: rawPayload.fullName,
      email: rawPayload.email,
      password: rawPayload.password,
      phone: rawPayload.phone
    };

    this.authService.register(payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.router.navigate(['/auth/sign-in']);
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
