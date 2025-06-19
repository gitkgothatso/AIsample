import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';

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
    if (this.activateForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const token = this.activateForm.get('activationToken')?.value;

      this.authService.activateAccount(token).subscribe({
        next: (response: any) => {
          this.loading = false;
          this.successMessage = typeof response === 'string' ? response : 'Account activated successfully! You can now login.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error: any) => {
          this.loading = false;
          this.errorMessage = error.error || 'Activation failed. Please check your token and try again.';
        },
      });
    }
  }

  useTokenFromUrl() {
    if (this.tokenFromUrl) {
      this.activateForm.patchValue({ activationToken: this.tokenFromUrl });
    }
  }
}
