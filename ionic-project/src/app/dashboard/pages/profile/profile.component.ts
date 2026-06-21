import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, User } from '../../../auth/services/auth';
import { ThemeButtonComponent } from '../../../components/buttons/theme-button/theme-button.component';
import { ShimmerProfileComponent } from '../../../components/shimmer/shimmer-profile/shimmer-profile.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ThemeButtonComponent, ShimmerProfileComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  currentUser = this.authService.currentUser;
  isLoading = signal(false);
  isPageLoading = signal(true);
  isEditing = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  showChangePassword = signal(false);
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string>('');

  ngOnInit(): void {
    this.initializeForms();
    this.loadUserData();
    // Show shimmer briefly on initial load
    setTimeout(() => this.isPageLoading.set(false), 600);
  }

  private initializeForms(): void {
    // Profile form
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: [{ value: '', disabled: true }],
      phone: ['', [Validators.pattern(/^[\d\+\-\(\)\s]+$/)]],
      avatar: ['']
    });

    // Password change form
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  private loadUserData(): void {
    const user = this.currentUser();
    if (user) {
      this.profileForm.patchValue({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || '',
        avatar: user.avatar || ''
      });
    }
  }

  toggleEdit(): void {
    this.isEditing.update(v => !v);
    if (!this.isEditing()) {
      this.loadUserData(); // Reset form if cancel
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      return;
    }

    this.isLoading.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    const formValue = this.profileForm.getRawValue();
    const updateData: Partial<User> = {
      fullName: formValue.fullName,
      phone: formValue.phone,
      avatar: formValue.avatar
    };

    this.authService.updateProfile(updateData).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        this.isEditing.set(false);
        this.successMessage.set('Profile updated successfully!');
        setTimeout(() => this.successMessage.set(''), 5000);
      },
      error: (error: any) => {
        this.isLoading.set(false);
        this.errorMessage.set(error?.error?.message || 'Failed to update profile. Please try again.');
        setTimeout(() => this.errorMessage.set(''), 5000);
      }
    });
  }

  toggleChangePassword(): void {
    this.showChangePassword.update(v => !v);
    if (!this.showChangePassword()) {
      this.passwordForm.reset();
    }
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.markFormGroupTouched(this.passwordForm);
      return;
    }

    this.isLoading.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        this.showChangePassword.set(false);
        this.passwordForm.reset();
        this.successMessage.set('Password changed successfully!');
        setTimeout(() => this.successMessage.set(''), 5000);
      },
      error: (error: any) => {
        this.isLoading.set(false);
        this.errorMessage.set(error?.error?.message || 'Failed to change password. Please try again.');
        setTimeout(() => this.errorMessage.set(''), 5000);
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getFormControl(formName: 'profile' | 'password', controlName: string) {
    const form = formName === 'profile' ? this.profileForm : this.passwordForm;
    return form.get(controlName);
  }

  isFieldInvalid(formName: 'profile' | 'password', fieldName: string): boolean {
    const control = this.getFormControl(formName, fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getErrorMessage(formName: 'profile' | 'password', fieldName: string): string {
    const control = this.getFormControl(formName, fieldName);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return `${fieldName} is required`;
    if (control.errors['minlength']) return `${fieldName} must be at least ${control.errors['minlength'].requiredLength} characters`;
    if (control.errors['pattern']) return `Invalid ${fieldName} format`;
    if (control.errors['email']) return 'Invalid email address';

    return '';
  }

  get passwordMismatch(): boolean {
    return !!(this.passwordForm.errors?.['passwordMismatch'] && 
             this.passwordForm.get('confirmPassword')?.touched);
  }

  get userInitials(): string {
    const user = this.currentUser();
    if (!user || !user.fullName) return 'U';
    const names = user.fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
    }
    return user.fullName.charAt(0).toUpperCase();
  }

  get userFullName(): string {
    const user = this.currentUser();
    return user?.fullName || 'User';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.errorMessage.set('Please select a valid image file');
        setTimeout(() => this.errorMessage.set(''), 3000);
        input.value = ''; // Reset input
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage.set('Image size must be less than 5MB');
        setTimeout(() => this.errorMessage.set(''), 3000);
        input.value = ''; // Reset input
        return;
      }

      this.selectedFile.set(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result as string;
        this.previewUrl.set(result);
        // Update form with base64 data
        this.profileForm.patchValue({ avatar: result });
      };
      reader.onerror = () => {
        this.errorMessage.set('Failed to read file. Please try again.');
        setTimeout(() => this.errorMessage.set(''), 3000);
        input.value = ''; // Reset input
      };
      reader.readAsDataURL(file);
    }
  }

  removeSelectedFile(): void {
    this.selectedFile.set(null);
    this.previewUrl.set('');
    this.profileForm.patchValue({ avatar: '' });
    // Reset file input
    const fileInput = document.getElementById('avatarFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('avatarFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }
}
