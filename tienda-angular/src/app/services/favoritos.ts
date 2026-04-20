import { Injectable, signal, computed, effect } from '@angular/core';
import { Producto } from './productos/productos';

@Injectable({ providedIn: 'root' })
export class FavoritosService {
  private favoritos = signal<Producto[]>(this.cargarDeStorage());

  // Solo lectura para los componentes
  getfavoritos() {
    return this.favoritos.asReadonly();
  }

  // Total de favoritos
  totalFavoritos = computed(() => this.favoritos().length);

  // Persiste en localStorage automáticamente
  constructor() {
    effect(() => {
      localStorage.setItem('favoritos', JSON.stringify(this.favoritos()));
    });
  }

  private cargarDeStorage(): Producto[] {
    try {
      const data = localStorage.getItem('favoritos');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  esFavorito(productoId: number): boolean {
    return this.favoritos().some((p) => p.id === productoId);
  }

  toggleFavorito(producto: Producto) {
    if (this.esFavorito(producto.id)) {
      this.favoritos.update((favs) => favs.filter((p) => p.id !== producto.id));
    } else {
      this.favoritos.update((favs) => [...favs, producto]);
    }
  }
}
