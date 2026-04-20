import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Users } from './pages/users/users';
import { Search } from './pages/search/search';
import { Register } from './pages/register/register';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'users', component: Users },
  { path: 'search', component: Search },
  { path: 'register', component: Register },
  { path: 'login', component: Login },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard], // protegida con el guard
  },
];
