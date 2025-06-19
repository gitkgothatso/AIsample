import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AccountService } from './account.service';

export const authGuard = () => {
  const accountService = inject(AccountService);
  const router = inject(Router);

  return accountService.getAuthenticationState().pipe(
    take(1),
    map(account => {
      if (account) {
        return true;
      } else {
        router.navigate(['/login']);
        return false;
      }
    }),
  );
};
