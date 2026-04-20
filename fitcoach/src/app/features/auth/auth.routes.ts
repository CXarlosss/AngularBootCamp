import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register-coach',
    loadComponent: () =>
      import('./register-coach.component').then(m => m.RegisterCoachComponent),
  },
  {
    path: 'register-client',
    loadComponent: () =>
      import('./register-client.component').then(m => m.RegisterClientComponent),
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
