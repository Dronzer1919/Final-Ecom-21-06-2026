import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { OTPRequest } from '../interfaces/auth.interface';
import { ThemeButtonComponent } from '../../components/buttons/theme-button/theme-button.component';

@Component({
  selector: 'app-two-step-verification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ThemeButtonComponent],
  templateUrl: './two-step-verification.component.html',
  styleUrls: ['./two-step-verification.component.scss']
})
export class TwoStepVerificationComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  otpForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  email = '';
  maskedEmail = '';
  timer = 60;
  timerInterval: any;
  canResend = false;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.maskedEmail = this.maskEmail(this.email);
    });
    this.initializeForm();
    this.startTimer();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  private initializeForm(): void {
    this.otpForm = this.fb.group({
      digit1: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      digit2: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      digit3: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      digit4: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      digit5: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      digit6: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
    });
  }

  private maskEmail(email: string): string {
    if (!email) return '';
    const [username, domain] = email.split('@');
    const maskedUsername = username.substring(0, 5) + '*'.repeat(Math.max(0, username.length - 5));
    return `${maskedUsername}@${domain}`;
  }

  private startTimer(): void {
    this.timer = 60;
    this.canResend = false;
    
    this.timerInterval = setInterval(() => {
      this.timer--;
      if (this.timer <= 0) {
        clearInterval(this.timerInterval);
        this.canResend = true;
      }
    }, 1000);
  }

  onOtpInput(event: any, nextInput: string): void {
    const input = event.target;
    const value = input.value;

    if (value.length === 1 && nextInput) {
      const next = document.getElementById(nextInput) as HTMLInputElement;
      if (next) {
        next.focus();
      }
    }
  }

  onOtpKeydown(event: KeyboardEvent, prevInput: string): void {
    const input = event.target as HTMLInputElement;
    
    if (event.key === 'Backspace' && input.value === '' && prevInput) {
      const prev = document.getElementById(prevInput) as HTMLInputElement;
      if (prev) {
        prev.focus();
      }
    }
  }

  onSubmit(): void {
    if (this.otpForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const otp = Object.values(this.otpForm.value).join('');
      const otpData: OTPRequest = {
        email: this.email,
        otp: otp
      };

      this.authService.verify2StepOTP(otpData).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error: any) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Invalid OTP. Please try again.';
          this.otpForm.reset();
          const firstInput = document.getElementById('digit1') as HTMLInputElement;
          if (firstInput) firstInput.focus();
        }
      });
    }
  }

  resendOTP(): void {
    if (!this.canResend) return;

    this.authService.resendOTP(this.email).subscribe({
      next: (response: any) => {
        this.startTimer();
        this.errorMessage = '';
      },
      error: (error: any) => {
        this.errorMessage = error.error?.message || 'Failed to resend OTP. Please try again.';
      }
    });
  }
}
