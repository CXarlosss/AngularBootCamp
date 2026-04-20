import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ProductosService, Producto } from '../../services/productos/productos';
import { CarritoService } from '../../services/carrito/carrito';
import { FavoritosService } from '../../services/favoritos';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './producto-detalle.html',
  styleUrl: './producto-detalle.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductoDetalle implements OnInit {
  private route = inject(ActivatedRoute);
  private productosService = inject(ProductosService);
  private carritoService = inject(CarritoService);
  private favoritosService = inject(FavoritosService);

  esFavorito = computed(() =>
    this.producto()
      ? this.favoritosService.esFavorito(this.producto()!.id)
      : false
  );

  producto = signal<Producto | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  agregado = signal(false);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.productosService.getProducto(id).subscribe({
      next: (data) => {
        this.producto.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Producto no encontrado');
        this.loading.set(false);
      },
    });
  }

  toggleFavorito() {
    if (this.producto()) {
      this.favoritosService.toggleFavorito(this.producto()!);
    }
  }

  agregarAlCarrito() {
    if (this.producto()) {
      this.carritoService.añadir(this.producto()!);
      this.agregado.set(true);

      // Resetea el mensaje después de 3 segundos
      setTimeout(() => this.agregado.set(false), 3000);
    }
  }
}
