import { Routes } from '@angular/router';
import { Productos } from './pages/productos/productos';
import { ProductoDetalle } from './pages/producto-detalle/producto-detalle';
import { Carrito } from './pages/carrito/carrito';
import { Login } from './pages/login/login';
import { authGuard } from './guards/auth-guard';
import { Perfil } from './pages/perfil/perfil';
import { Checkout } from './pages/checkout/checkout';
import { Favoritos } from './pages/favoritos/favoritos';

export const routes: Routes = [
  { path: '', redirectTo: 'productos', pathMatch: 'full' },
  { path: 'productos', component: Productos },
  { path: 'productos/:id', component: ProductoDetalle },
  { path: 'favoritos', component: Favoritos },
  { path: 'login', component: Login },
  { path: 'perfil', component: Perfil },
  {
    path: 'carrito',
    component: Carrito,
    canActivate: [authGuard],
  },
  {
    path: 'checkout',
    component: Checkout,
    canActivate: [authGuard]
  },
];
