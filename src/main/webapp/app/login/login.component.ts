import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Account } from '../auth/account.model';
import { AccountService } from '../auth/account.service';
import { LoginService } from './login.service';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'jhi-login',
  templateUrl: './login.component.html',
  imports: [MatButtonModule, MatInputModule, MatCardModule, ReactiveFormsModule],
  styleUrl: './login.component.css',
})
export default class LoginComponent implements OnInit {
  private readonly destroy$ = new Subject<void>();

  account = signal<Account | null>(null);

  errorMessage = signal('');

  loginForm: FormGroup;

  private readonly accountService = inject(AccountService);
  private readonly loginService = inject(LoginService);
  private readonly fb = inject(FormBuilder);

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
    this.accountService
      .getAuthenticationState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(account => this.account.set(account));
  }

  login(): void {
    this.loginService
      .login({
        username: this.loginForm.value.username!,
        password: this.loginForm.value.password!,
      })
      .subscribe({
        error: e => this.updateErrorMessage(e),
      });
  }

  logout(): void {
    this.loginService.logout();
  }

  private updateErrorMessage(e: any) {
    if (e.status === 403) {
      this.errorMessage.set('Authentication failed');
    }
  }
}
