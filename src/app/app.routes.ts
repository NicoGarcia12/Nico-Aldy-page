import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'formulario',
  },
  {
    path: 'formulario',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/login/login-page/login-page.component').then(
        (m) => m.LoginPageComponent,
      ),
  },
  {
    path: 'carta',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard-page/dashboard-page.component').then(
        (m) => m.DashboardPageComponent,
      ),
  },
  {
    path: '404',
    loadComponent: () =>
      import('./features/not-found/not-found-page/not-found-page.component').then(
        (m) => m.NotFoundPageComponent,
      ),
  },
  {
    path: '**',
    redirectTo: '404',
  },
];
