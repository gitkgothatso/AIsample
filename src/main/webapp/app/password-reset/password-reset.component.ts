import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { ErrorHandlerService } from '../shared/error-handler.service';
import { NotificationService } from '../shared/notification/notification.service';

@Component({
  selector: 'jhi-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.css'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  standalone: true,
})
export class PasswordResetComponent {
  requestForm: FormGroup;
  resetForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  showResetForm = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private errorHandler: ErrorHandlerService,
    private notificationService: NotificationService,
  ) {
    this.requestForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.resetForm = this.fb.group(
      {
        resetToken: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100), this.passwordComplexityValidator()]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }

    return null;
  }

  passwordComplexityValidator(): (control: AbstractControl) => ValidationErrors | null {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      
      const password = control.value;
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const hasDigit = /\d/.test(password);
      const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"|,.<>/?]/.test(password);
      
      if (!hasUppercase || !hasLowercase || !hasDigit || !hasSpecial) {
        return { passwordComplexity: true };
      }
      
      return null;
    };
  }

  onRequestReset() {
    if (this.requestForm.invalid) {
      this.showRequestValidationErrors();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const email = this.requestForm.get('email')?.value;

    this.authService.requestPasswordReset(email).subscribe({
      next: (response: any) => {
        this.loading = false;
        const successMsg = response || 'Password reset instructions sent to your email. Please check your inbox.';
        this.successMessage = successMsg;
        this.notificationService.showSuccess(successMsg);
        this.showResetForm = true;
      },
      error: (error: any) => {
        this.loading = false;
        this.handleRequestError(error);
      },
    });
  }

  onResetPassword() {
    if (this.resetForm.invalid) {
      this.showResetValidationErrors();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const resetData = {
      resetToken: this.resetForm.get('resetToken')?.value,
      newPassword: this.resetForm.get('newPassword')?.value,
    };

    this.authService.resetPassword(resetData).subscribe({
      next: (response: any) => {
        this.loading = false;
        const successMsg = response || 'Password reset successfully! You can now log in with your new password.';
        this.successMessage = successMsg;
        this.notificationService.showSuccess(successMsg);
        this.resetForm.reset();
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error: any) => {
        this.loading = false;
        this.handleResetError(error);
      },
    });
  }

  private handleRequestError(error: any): void {
    // Handle network errors
    if (error.status === 0) {
      this.notificationService.showNetworkError();
      this.errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      return;
    }

    // Handle password reset request errors
    const errorInfo = this.errorHandler.handlePasswordResetError(error);
    this.notificationService.showFromErrorInfo(errorInfo);
    this.errorMessage = errorInfo.message;
  }

  private handleResetError(error: any): void {
    // Handle network errors
    if (error.status === 0) {
      this.notificationService.showNetworkError();
      this.errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      return;
    }

    // Handle password reset errors
    const errorInfo = this.errorHandler.handlePasswordResetError(error);
    this.notificationService.showFromErrorInfo(errorInfo);
    this.errorMessage = errorInfo.message;

    // Clear sensitive fields on error
    this.resetForm.patchValue({ 
      resetToken: '', 
      newPassword: '', 
      confirmPassword: '' 
    });
  }

  private showRequestValidationErrors(): void {
    const emailControl = this.requestForm.get('email');

    if (!emailControl) return;
    if (emailControl.invalid && emailControl.touched) {
      if (emailControl.errors && emailControl.errors['required']) {
        this.notificationService.showValidationError('Email is required.');
      } else if (emailControl.errors && emailControl.errors['email']) {
        this.notificationService.showValidationError('Please enter a valid email address.');
      }
    }

    if (this.requestForm.invalid) {
      this.notificationService.showValidationError('Please enter a valid email address.');
    }
  }

  private showResetValidationErrors(): void {
    const resetTokenControl = this.resetForm.get('resetToken');
    const newPasswordControl = this.resetForm.get('newPassword');
    const confirmPasswordControl = this.resetForm.get('confirmPassword');

    if (!resetTokenControl) return;
    if (resetTokenControl.invalid && resetTokenControl.touched) {
      if (resetTokenControl.errors && resetTokenControl.errors['required']) {
        this.notificationService.showValidationError('Reset token is required.');
      }
    }

    if (!newPasswordControl) return;
    if (newPasswordControl.invalid && newPasswordControl.touched) {
      if (newPasswordControl.errors && newPasswordControl.errors['required']) {
        this.notificationService.showValidationError('New password is required.');
      } else if (newPasswordControl.errors && newPasswordControl.errors['minlength']) {
        this.notificationService.showValidationError('Password must be at least 8 characters long.');
      } else if (newPasswordControl.errors && newPasswordControl.errors['passwordComplexity']) {
        this.notificationService.showValidationError('Password must contain uppercase, lowercase, digit, and special character.');
      }
    }

    if (!confirmPasswordControl) return;
    if (confirmPasswordControl.invalid && confirmPasswordControl.touched) {
      if (confirmPasswordControl.errors && confirmPasswordControl.errors['required']) {
        this.notificationService.showValidationError('Please confirm your password.');
      }
    }

    if (this.resetForm.errors && this.resetForm.errors['passwordMismatch']) {
      this.notificationService.showValidationError('Passwords do not match.');
    }

    if (this.resetForm.invalid) {
      this.notificationService.showValidationError('Please fill in all required fields correctly.');
    }
  }
}
