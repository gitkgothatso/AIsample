import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.default),
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'activate',
    loadComponent: () => import('./activate/activate.component').then(m => m.ActivateComponent),
  },
  {
    path: 'password-reset',
    loadComponent: () => import('./password-reset/password-reset.component').then(m => m.PasswordResetComponent),
  },
  // jhipster-needle-angular-route
];
