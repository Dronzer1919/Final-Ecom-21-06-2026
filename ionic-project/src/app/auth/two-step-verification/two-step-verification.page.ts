import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBack, shieldCheckmarkOutline, alertCircle, checkmarkCircleOutline, refreshOutline } from 'ionicons/icons';
import { AuthService } from '../services/auth';
import { ThemeButtonComponent } from '../../components/buttons/theme-button/theme-button.component';

@Component({
  selector: 'app-two-step-verification',
  templateUrl: './two-step-verification.page.html',
  styleUrls: ['./two-step-verification.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonIcon, IonSpinner, ThemeButtonComponent]
})
export class TwoStepVerificationPage implements OnInit, OnDestroy {
  otp = ['', '', '', '', '', ''];
  isLoading = false;
  isResending = false;
  errorMessage = '';
  successMessage = '';
  email = '';
  countdown = 30;
  canResend = false;
  private timer: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    addIcons({ arrowBack, shieldCheckmarkOutline, alertCircle, checkmarkCircleOutline, refreshOutline });
  }

  ngOnInit() {
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
    this.startCountdown();
  }

  ngOnDestroy() { clearInterval(this.timer); }

  startCountdown() {
    this.countdown = 30;
    this.canResend = false;
    this.timer = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) { clearInterval(this.timer); this.canResend = true; }
    }, 1000);
  }

  onOtpInput(index: number, event: any) {
    const val = event.target.value.replace(/\D/g, '').slice(0, 1);
    this.otp[index] = val;
    if (val && index < 5) {
      const next = document.getElementById(`totp-${index + 1}`) as HTMLInputElement;
      next?.focus();
    }
  }

  onOtpKeydown(index: number, event: KeyboardEvent) {
    if (event.key === 'Backspace' && !this.otp[index] && index > 0) {
      const prev = document.getElementById(`totp-${index - 1}`) as HTMLInputElement;
      prev?.focus();
    }
  }

  onOtpPaste(event: ClipboardEvent) {
    const text = event.clipboardData?.getData('text')?.replace(/\D/g, '').slice(0, 6) || '';
    text.split('').forEach((c, i) => { if (i < 6) this.otp[i] = c; });
    event.preventDefault();
  }

  get fullOtp(): string { return this.otp.join(''); }

  onSubmit() {
    if (this.fullOtp.length !== 6) {
      this.errorMessage = 'Please enter the complete 6-digit code';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.authService.verifyTwoFactor(this.email, this.fullOtp).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Verified successfully!';
        setTimeout(() => this.router.navigate(['/home']), 1500);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Invalid code. Please try again.';
      }
    });
  }

  resendCode() {
    if (!this.canResend) return;
    this.isResending = true;
    this.errorMessage = '';
    this.authService.resend2FA(this.email).subscribe({
      next: () => {
        this.isResending = false;
        this.successMessage = 'Code resent!';
        this.startCountdown();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err: any) => {
        this.isResending = false;
        this.errorMessage = err?.error?.message || 'Failed to resend code';
      }
    });
  }
}
