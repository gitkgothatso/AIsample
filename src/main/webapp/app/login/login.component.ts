import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Account } from '../auth/account.model';
import { AccountService } from '../auth/account.service';
import { LoginService } from './login.service';
import { ErrorHandlerService } from '../shared/error-handler.service';
import { NotificationService } from '../shared/notification/notification.service';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'jhi-login',
  templateUrl: './login.component.html',
  imports: [CommonModule, MatButtonModule, MatInputModule, MatCardModule, ReactiveFormsModule],
  styleUrl: './login.component.css',
})
export default class LoginComponent implements OnInit {
  private readonly destroy$ = new Subject<void>();

  account = signal<Account | null>(null);

  errorMessage = signal('');
  loading = signal(false);

  loginForm: FormGroup;

  private readonly accountService = inject(AccountService);
  private readonly loginService = inject(LoginService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly notificationService = inject(NotificationService);

  constructor() {
    this.loginForm = this.fb.nonNullable.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => {
      this.destroy$.next();
      this.destroy$.complete();
    });
  }

  ngOnInit(): void {
    // Check if user is already authenticated
    this.accountService.getAuthenticationState().pipe(takeUntil(this.destroy$)).subscribe(account => {
      this.account.set(account);
      if (account) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  login(): void {
    if (this.loginForm.invalid) {
      this.showFormValidationErrors();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.loginService
      .login({
        username: this.loginForm.value.username!,
        password: this.loginForm.value.password!,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.notificationService.showSuccess('Successfully logged in!');
          console.log('Login successful, redirecting to /dashboard');
          this.router.navigate(['/dashboard']);
        },
        error: e => {
          this.loading.set(false);
          this.handleLoginError(e);
        },
      });
  }

  private handleLoginError(error: any): void {
    // Handle network errors
    if (error.status === 0) {
      this.notificationService.showNetworkError();
      this.errorMessage.set('Unable to connect to the server. Please check your internet connection and try again.');
      return;
    }

    // Handle authentication errors
    const errorInfo = this.errorHandler.handleAuthError(error);
    this.notificationService.showFromErrorInfo(errorInfo);
    this.errorMessage.set(errorInfo.message);

    // Clear password field on authentication failure
    if (error.status === 403) {
      this.loginForm.patchValue({ password: '' });
      this.loginForm.get('password')?.markAsUntouched();
    }
  }

  private showFormValidationErrors(): void {
    const usernameControl = this.loginForm.get('username');
    const passwordControl = this.loginForm.get('password');

    if (!usernameControl) return;
    if (usernameControl.invalid && usernameControl.touched) {
      this.notificationService.showValidationError('Please enter a valid username.');
    }

    if (!passwordControl) return;
    if (passwordControl.invalid && passwordControl.touched) {
      this.notificationService.showValidationError('Please enter your password.');
    }

    if (this.loginForm.invalid) {
      this.notificationService.showValidationError('Please fill in all required fields.');
    }
  }

  // Legacy method for backward compatibility
  private updateErrorMessage(e: any) {
    if (e && e.status === 403) {
      this.errorMessage.set('Authentication failed: Invalid username or password.');
    } else if (e && e.error && typeof e.error === 'string') {
      this.errorMessage.set(e.error);
    } else if (e && e.message) {
      this.errorMessage.set(e.message);
    } else {
      this.errorMessage.set('Login failed. Please try again.');
    }
  }
}
