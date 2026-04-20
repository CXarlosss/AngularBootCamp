import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarritoService } from '../../services/carrito/carrito';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Carrito {
  private carritoService = inject(CarritoService);

  items = this.carritoService.getItems();
  totalItems = this.carritoService.totalItems;
  totalPrecio = this.carritoService.totalPrecio;

  eliminar(productoId: number) {
    this.carritoService.eliminar(productoId);
  }

  cambiarCantidad(productoId: number, cantidad: number) {
    this.carritoService.cambiarCantidad(productoId, cantidad);
  }

  vaciar() {
    this.carritoService.vaciar();
  }
}
