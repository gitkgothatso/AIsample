import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'jhi-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  standalone: true,
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  passwordStrength = 0;
  passwordStrengthLabel = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.registerForm = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator },
    );
    this.registerForm.get('password')?.valueChanges.subscribe(value => {
      this.updatePasswordStrength(value);
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  updatePasswordStrength(password: string) {
    // Simple strength logic: length + variety
    let score = 0;
    if (!password) {
      this.passwordStrength = 0;
      this.passwordStrengthLabel = '';
      return;
    }
    if (password.length >= 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    this.passwordStrength = score;
    this.passwordStrengthLabel = score === 0 ? '' : score === 1 ? 'Weak' : score === 2 ? 'Fair' : score === 3 ? 'Good' : 'Strong';
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const registrationData = {
        username: this.registerForm.get('username')?.value,
        email: this.registerForm.get('email')?.value,
        password: this.registerForm.get('password')?.value,
      };

      this.authService.register(registrationData).subscribe({
        next: (response: any) => {
          this.loading = false;
          this.successMessage =
            typeof response === 'string' ? response : 'Registration successful! Please check your email for activation instructions.';
          this.registerForm.reset();
          this.passwordStrength = 0;
          this.passwordStrengthLabel = '';
        },
        error: (error: any) => {
          this.loading = false;
          // Try to parse backend error for user-friendly message
          const err =
            error && error.error ? error.error : error && error.message ? error.message : 'Registration failed. Please try again.';
          if (typeof err === 'string') {
            const lower = err.toLowerCase();
            if (lower.includes('username') && lower.includes('exist')) {
              this.errorMessage = 'Username is already taken.';
            } else if (lower.includes('email') && lower.includes('exist')) {
              this.errorMessage = 'Email is already registered.';
            } else if (lower.includes('username')) {
              this.errorMessage = 'Username is already taken.';
            } else if (lower.includes('email')) {
              this.errorMessage = 'Email is already registered.';
            } else {
              this.errorMessage = err;
            }
          } else {
            this.errorMessage = 'Registration failed. Please try again.';
          }
        },
      });
    }
  }
}
