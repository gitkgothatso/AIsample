import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Account } from '../auth/account.model';
import { AccountService } from '../auth/account.service';
import { LoginService } from '../login/login.service';

@Component({
  selector: 'jhi-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
  imports: [RouterModule],
  standalone: true,
})
export default class NavComponent implements OnInit {
  private readonly destroy$ = new Subject<void>();

  account = signal<Account | null>(null);

  private readonly accountService = inject(AccountService);
  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);

  constructor() {
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

  logout(): void {
    this.loginService.logout();
    this.router.navigate(['/login']);
  }

  isActive(path: string): boolean {
    return this.router.url === path;
  }
}
