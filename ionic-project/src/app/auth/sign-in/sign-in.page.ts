import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { ThemeButtonComponent } from '../../components/buttons/theme-button/theme-button.component';
import { AuthService } from '../services/auth.service';
import { LoginRequest } from '../interfaces/auth.interface';
import { addIcons } from 'ionicons';
import { arrowBack, mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, storefrontOutline, logoGoogle, logoFacebook, logoApple, alertCircle } from 'ionicons/icons';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    IonIcon, IonSpinner, ThemeButtonComponent
  ]
})
export class SignInPage {
  signInForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    addIcons({ arrowBack, mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, storefrontOutline, logoGoogle, logoFacebook, logoApple, alertCircle });

    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.signInForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.signInForm.get(fieldName);
    if (!field || !field.errors) return '';
    if (field.errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
    if (field.errors['email']) return 'Please enter a valid email';
    if (field.errors['minlength']) return 'Password must be at least 6 characters';
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = { email: 'Email', password: 'Password' };
    return labels[fieldName] || fieldName;
  }

  onSubmit() {
    // Guard against double-submit: app-theme-button fires both (ngSubmit) and (clicked)
    if (this.isLoading) return;

    if (this.signInForm.invalid) {
      Object.keys(this.signInForm.controls).forEach(key => {
        this.signInForm.get(key)?.markAsTouched();
      });
      return;
    }

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
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard/home';
          this.router.navigateByUrl(returnUrl);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Sign in failed. Please check your credentials.';
      }
    });
  }
}
