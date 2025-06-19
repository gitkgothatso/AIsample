import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';

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
  ) {
    this.requestForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.resetForm = this.fb.group(
      {
        resetToken: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  onRequestReset() {
    if (this.requestForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const email = this.requestForm.get('email')?.value;

      this.authService.requestPasswordReset(email).subscribe({
        next: (response: any) => {
          this.loading = false;
          this.successMessage = response || 'Password reset instructions sent to your email. Please check your inbox.';
          this.showResetForm = true;
        },
        error: (error: any) => {
          this.loading = false;
          this.errorMessage = error.error || 'Failed to request password reset. Please try again.';
        },
      });
    }
  }

  onResetPassword() {
    if (this.resetForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const resetData = {
        resetToken: this.resetForm.get('resetToken')?.value,
        newPassword: this.resetForm.get('newPassword')?.value,
      };

      this.authService.resetPassword(resetData).subscribe({
        next: () => {
          this.loading = false;
          this.successMessage = 'Password reset successfully! You can now login with your new password.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error: any) => {
          this.loading = false;
          this.errorMessage = error.error || 'Password reset failed. Please check your token and try again.';
        },
      });
    }
  }
}
