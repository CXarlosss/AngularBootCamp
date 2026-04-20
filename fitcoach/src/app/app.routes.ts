import { Routes } from '@angular/router';
import { authGuard, coachGuard, clientGuard } from './core/auth/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },
  {
    path: 'coach',
    canActivate: [authGuard, coachGuard],
    loadChildren: () => import('./features/coach/coach.routes').then(m => m.COACH_ROUTES),
  },
  {
    path: 'client',
    canActivate: [authGuard, clientGuard],
    loadChildren: () => import('./features/client/client.routes').then(m => m.CLIENT_ROUTES),
  },
];
