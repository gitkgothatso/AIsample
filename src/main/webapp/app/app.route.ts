import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./login/login.component'),
  },
  // jhipster-needle-angular-route
];
