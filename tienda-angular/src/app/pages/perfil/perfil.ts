import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { AuthService } from '../../services/auth';
import { CarritoService } from '../../services/carrito/carrito';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Perfil {
  private authService = inject(AuthService);
  private carritoService = inject(CarritoService);
  private router = inject(Router);

  user = this.authService.user;
  totalItems = this.carritoService.totalItems;
  totalPrecio = this.carritoService.totalPrecio;

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
