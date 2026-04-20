import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CarritoService } from './services/carrito/carrito';
import { AuthService } from './services/auth';
import { FavoritosService } from './services/favoritos';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private carritoService = inject(CarritoService);
  private authService = inject(AuthService);
  private favoritosService = inject(FavoritosService);

  totalFavoritos = this.favoritosService.totalFavoritos;
  totalItems = this.carritoService.totalItems;
  isLoggedIn = this.authService.isLoggedIn;
  user = this.authService.user;

  logout() {
    this.authService.logout();
  }
}
