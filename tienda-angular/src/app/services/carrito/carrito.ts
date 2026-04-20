import { Injectable, signal, computed, effect } from '@angular/core';
import { Producto } from '../productos/productos';

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private items = signal<ItemCarrito[]>([]);

  constructor() {
    // Cargar datos de localStorage si existen
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.items.set(JSON.parse(savedCart));
    }

    // Efecto para sincronizar el estado con localStorage cada vez que items cambie
    effect(() => {
      localStorage.setItem('cart', JSON.stringify(this.items()));
    });
  }

  // Solo lectura para los componentes
  getItems() {
    return this.items.asReadonly();
  }

  // Total de productos en el carrito
  totalItems = computed(() => this.items().reduce((acc, item) => acc + item.cantidad, 0));

  // Precio total
  totalPrecio = computed(() =>
    this.items().reduce((acc, item) => acc + item.producto.price * item.cantidad, 0),
  );

  añadir(producto: Producto) {
    const existe = this.items().find((i) => i.producto.id === producto.id);

    if (existe) {
      // Si ya está en el carrito aumentamos la cantidad
      this.items.update((items) =>
        items.map((i) => (i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i)),
      );
    } else {
      // Si no está lo añadimos
      this.items.update((items) => [...items, { producto, cantidad: 1 }]);
    }
  }

  eliminar(productoId: number) {
    this.items.update((items) => items.filter((i) => i.producto.id !== productoId));
  }

  cambiarCantidad(productoId: number, cantidad: number) {
    if (cantidad <= 0) {
      this.eliminar(productoId);
      return;
    }
    this.items.update(items =>
      items.map(i =>
        i.producto.id === productoId
          ? { ...i, cantidad }
          : i
      )
    );
  }

  vaciar() {
    this.items.set([]);
  }
}
