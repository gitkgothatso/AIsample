import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AccountService } from '../auth/account.service';
import { RouterModule } from '@angular/router';
import { ErrorHandlerService } from '../shared/error-handler.service';
import { NotificationService } from '../shared/notification/notification.service';

@Component({
  selector: 'jhi-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  loading = false;
  passwordLoading = false;
  successMessage = '';
  errorMessage = '';
  passwordSuccess = '';
  passwordError = '';
  passwordStrength = 0;
  passwordRequirements = {
    length: false,
    uppercase: false,
    lowercase: false,
    digit: false,
    special: false
  };

  constructor(
    private fb: FormBuilder, 
    private accountService: AccountService,
    private errorHandler: ErrorHandlerService,
    private notificationService: NotificationService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
    });
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100), this.passwordComplexityValidator()]],
    });
  }

  ngOnInit(): void {
    this.accountService.identity(true).subscribe(account => {
      if (account) {
        this.profileForm.patchValue({
          firstName: account.firstName || '',
          lastName: account.lastName || '',
          email: account.email || '',
        });
      }
    });

    // Monitor password changes for strength calculation
    this.passwordForm.get('newPassword')?.valueChanges.subscribe(password => {
      this.updatePasswordStrength(password);
    });
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
      const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"|,.<>/?]/.test(password);
      
      if (!hasUppercase || !hasLowercase || !hasDigit || !hasSpecial) {
        return { passwordComplexity: true };
      }
      
      return null;
    };
  }

  updatePasswordStrength(password: string): void {
    if (!password) {
      this.passwordStrength = 0;
      this.passwordRequirements = {
        length: false,
        uppercase: false,
        lowercase: false,
        digit: false,
        special: false
      };
      return;
    }

    this.passwordRequirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      digit: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=[\]{};':"|,.<>/?]/.test(password)
    };

    const metRequirements = Object.values(this.passwordRequirements).filter(Boolean).length;
    this.passwordStrength = (metRequirements / 5) * 100;
  }

  getPasswordStrengthColor(): string {
    if (this.passwordStrength < 40) return '#dc3545';
    if (this.passwordStrength < 80) return '#ffc107';
    return '#28a745';
  }

  getPasswordStrengthText(): string {
    if (this.passwordStrength < 40) return 'Weak';
    if (this.passwordStrength < 80) return 'Medium';
    return 'Strong';
  }

  onSaveProfile(): void {
    if (this.profileForm.invalid) {
      this.showProfileValidationErrors();
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.accountService.updateProfile(this.profileForm.value).subscribe({
      next: msg => {
        this.loading = false;
        this.successMessage = msg;
        this.notificationService.showSuccess(msg || 'Profile updated successfully!');
      },
      error: err => {
        this.loading = false;
        this.handleProfileError(err);
      },
    });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.showPasswordValidationErrors();
      return;
    }

    this.passwordLoading = true;
    this.passwordSuccess = '';
    this.passwordError = '';

    this.accountService.changePassword(this.passwordForm.value).subscribe({
      next: msg => {
        this.passwordLoading = false;
        this.passwordSuccess = msg;
        this.notificationService.showSuccess(msg || 'Password changed successfully!');
        this.passwordForm.reset();
        this.passwordStrength = 0;
        this.passwordRequirements = {
          length: false,
          uppercase: false,
          lowercase: false,
          digit: false,
          special: false
        };
      },
      error: err => {
        this.passwordLoading = false;
        this.handlePasswordError(err);
      },
    });
  }

  private handleProfileError(error: any): void {
    // Handle network errors
    if (error.status === 0) {
      this.notificationService.showNetworkError();
      this.errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      return;
    }

    // Handle profile-specific errors
    const errorInfo = this.errorHandler.handleProfileError(error);
    this.notificationService.showFromErrorInfo(errorInfo);
    this.errorMessage = errorInfo.message;
  }

  private handlePasswordError(error: any): void {
    // Handle network errors
    if (error.status === 0) {
      this.notificationService.showNetworkError();
      this.passwordError = 'Unable to connect to the server. Please check your internet connection and try again.';
      return;
    }

    // Handle password-specific errors
    const errorInfo = this.errorHandler.handlePasswordError(error);
    this.notificationService.showFromErrorInfo(errorInfo);
    this.passwordError = errorInfo.message;

    // Clear password fields on error
    this.passwordForm.patchValue({ 
      currentPassword: '', 
      newPassword: '' 
    });
    this.passwordStrength = 0;
  }

  private showProfileValidationErrors(): void {
    const firstNameControl = this.profileForm.get('firstName');
    const lastNameControl = this.profileForm.get('lastName');
    const emailControl = this.profileForm.get('email');

    if (!firstNameControl) return;
    if (firstNameControl.invalid && firstNameControl.touched) {
      if (firstNameControl.errors && firstNameControl.errors['required']) {
        this.notificationService.showValidationError('First name is required.');
      } else if (firstNameControl.errors && firstNameControl.errors['maxlength']) {
        this.notificationService.showValidationError('First name must be less than 50 characters.');
      }
    }

    if (!lastNameControl) return;
    if (lastNameControl.invalid && lastNameControl.touched) {
      if (lastNameControl.errors && lastNameControl.errors['required']) {
        this.notificationService.showValidationError('Last name is required.');
      } else if (lastNameControl.errors && lastNameControl.errors['maxlength']) {
        this.notificationService.showValidationError('Last name must be less than 50 characters.');
      }
    }

    if (!emailControl) return;
    if (emailControl.invalid && emailControl.touched) {
      if (emailControl.errors && emailControl.errors['required']) {
        this.notificationService.showValidationError('Email is required.');
      } else if (emailControl.errors && emailControl.errors['email']) {
        this.notificationService.showValidationError('Please enter a valid email address.');
      }
    }

    if (this.profileForm.invalid) {
      this.notificationService.showValidationError('Please fill in all required fields correctly.');
    }
  }

  private showPasswordValidationErrors(): void {
    const currentPasswordControl = this.passwordForm.get('currentPassword');
    const newPasswordControl = this.passwordForm.get('newPassword');

    if (!currentPasswordControl) return;
    if (currentPasswordControl.invalid && currentPasswordControl.touched) {
      if (currentPasswordControl.errors && currentPasswordControl.errors['required']) {
        this.notificationService.showValidationError('Current password is required.');
      }
    }

    if (!newPasswordControl) return;
    if (newPasswordControl.invalid && newPasswordControl.touched) {
      if (newPasswordControl.errors && newPasswordControl.errors['required']) {
        this.notificationService.showValidationError('New password is required.');
      } else if (newPasswordControl.errors && newPasswordControl.errors['minlength']) {
        this.notificationService.showValidationError('New password must be at least 8 characters long.');
      } else if (newPasswordControl.errors && newPasswordControl.errors['passwordComplexity']) {
        this.notificationService.showValidationError('Password must contain uppercase, lowercase, digit, and special character.');
      }
    }

    if (this.passwordForm.invalid) {
      this.notificationService.showValidationError('Please fill in all password fields correctly.');
    }
  }
} 