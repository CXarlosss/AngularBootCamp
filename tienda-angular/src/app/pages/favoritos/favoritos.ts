import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { FavoritosService } from '../../services/favoritos';
import { CarritoService } from '../../services/carrito/carrito';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './favoritos.html',
  styleUrl: './favoritos.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Favoritos {
  private favoritosService = inject(FavoritosService);
  private carritoService = inject(CarritoService);

  favoritos = this.favoritosService.getfavoritos();
  totalFavoritos = this.favoritosService.totalFavoritos;

  quitarFavorito(productoId: number) {
    const producto = this.favoritos().find(p => p.id === productoId);
    if (producto) this.favoritosService.toggleFavorito(producto);
  }

  agregarAlCarrito(productoId: number) {
    const producto = this.favoritos().find(p => p.id === productoId);
    if (producto) this.carritoService.añadir(producto);
  }
}
