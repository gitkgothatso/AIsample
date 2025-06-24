import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { ErrorHandlerService } from '../shared/error-handler.service';
import { NotificationService } from '../shared/notification/notification.service';

@Component({
  selector: 'jhi-activate',
  templateUrl: './activate.component.html',
  styleUrls: ['./activate.component.css'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  standalone: true,
})
export class ActivateComponent implements OnInit {
  activateForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  tokenFromUrl = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private errorHandler: ErrorHandlerService,
    private notificationService: NotificationService,
  ) {
    this.activateForm = this.fb.group({
      activationToken: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    // Check if token is provided in URL parameters
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.tokenFromUrl = params['token'];
        this.activateForm.patchValue({ activationToken: this.tokenFromUrl });
      }
    });
  }

  onSubmit() {
    if (this.activateForm.invalid) {
      this.showValidationErrors();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const token = this.activateForm.get('activationToken')?.value;

    this.authService.activateAccount(token).subscribe({
      next: (response: any) => {
        this.loading = false;
        const successMsg = typeof response === 'string' ? response : 'Account activated successfully! You can now log in.';
        this.successMessage = successMsg;
        this.notificationService.showSuccess(successMsg);
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error: any) => {
        this.loading = false;
        this.handleActivationError(error);
      },
    });
  }

  useTokenFromUrl() {
    if (this.tokenFromUrl) {
      this.activateForm.patchValue({ activationToken: this.tokenFromUrl });
    }
  }

  private handleActivationError(error: any): void {
    // Handle network errors
    if (error.status === 0) {
      this.notificationService.showNetworkError();
      this.errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      return;
    }

    // Handle activation-specific errors
    const errorInfo = this.errorHandler.handleActivationError(error);
    this.notificationService.showFromErrorInfo(errorInfo);
    this.errorMessage = errorInfo.message;

    // Clear token field on error
    this.activateForm.patchValue({ activationToken: '' });
  }

  private showValidationErrors(): void {
    const activationTokenControl = this.activateForm.get('activationToken');
    if (!activationTokenControl) return;
    if (activationTokenControl.invalid && activationTokenControl.touched) {
      if (activationTokenControl.errors && activationTokenControl.errors['required']) {
        this.notificationService.showValidationError('Activation token is required.');
      }
    }

    if (this.activateForm.invalid) {
      this.notificationService.showValidationError('Please enter a valid activation token.');
    }
  }
} 