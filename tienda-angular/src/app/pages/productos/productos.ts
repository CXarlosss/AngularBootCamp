import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ProductosService, Producto } from '../../services/productos/productos';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './productos.html',
  styleUrl: './productos.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Productos implements OnInit {
  private productosService = inject(ProductosService);

  productos = signal<Producto[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  categoriaActiva = signal<string>('todas');
  busqueda = signal<string>('');
  orden = signal<'ninguno' | 'asc' | 'desc'>('ninguno');

  productosFiltrados = computed(() => {
    let lista = this.productos();

    // Filtro por categoria
    if (this.categoriaActiva() !== 'todas') {
      lista = lista.filter(p => p.category === this.categoriaActiva());
    }

    // Filtro por busqueda
    const busqueda = this.busqueda().toLowerCase().trim();
    if (busqueda.length >= 2) {
      lista = lista.filter(p =>
        p.title.toLowerCase().includes(busqueda)
      );
    }

    // Orden por precio
    if (this.orden() === 'asc') {
      lista = [...lista].sort((a, b) => a.price - b.price);
    } else if (this.orden() === 'desc') {
      lista = [...lista].sort((a, b) => b.price - a.price);
    }

    return lista;
  });

  categorias = computed(() => {
    const cats = this.productos().map(p => p.category);
    return ['todas', ...new Set(cats)];
  });

  ngOnInit() {
    this.productosService.getProductos().subscribe({
      next: (data) => {
        this.productos.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar productos');
        this.loading.set(false);
      }
    });
  }

  filtrar(categoria: string) {
    this.categoriaActiva.set(categoria);
  }

  ordenar(orden: 'ninguno' | 'asc' | 'desc') {
    this.orden.set(orden);
  }
}
