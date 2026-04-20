import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { CarritoService } from '../../services/carrito/carrito';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Checkout {
  private fb = inject(FormBuilder);
  private carritoService = inject(CarritoService);
  private router = inject(Router);

  items = this.carritoService.getItems();
  totalPrecio = this.carritoService.totalPrecio;
  totalItems = this.carritoService.totalItems;

  // Paso actual — 1, 2 o 3
  pasoActual = signal<1 | 2 | 3>(1);

  // Formulario de envio
  formEnvio = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    direccion: ['', [Validators.required, Validators.minLength(5)]],
    ciudad: ['', Validators.required],
    codigo: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]]
  });

  // Formulario de pago
  formPago = this.fb.group({
    titular: ['', [Validators.required, Validators.minLength(3)]],
    tarjeta: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
    expiracion: ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]]
  });

  loading = signal(false);
  submittedEnvio = signal(false);
  submittedPago = signal(false);

  // Getters envio
  get nombre() { return this.formEnvio.get('nombre'); }
  get direccion() { return this.formEnvio.get('direccion'); }
  get ciudad() { return this.formEnvio.get('ciudad'); }
  get codigo() { return this.formEnvio.get('codigo'); }

  // Getters pago
  get titular() { return this.formPago.get('titular'); }
  get tarjeta() { return this.formPago.get('tarjeta'); }
  get expiracion() { return this.formPago.get('expiracion'); }
  get cvv() { return this.formPago.get('cvv'); }

  siguientePaso() {
    this.submittedEnvio.set(true);
    if (this.formEnvio.invalid) return;
    this.pasoActual.set(2);
  }

  confirmarPago() {
    this.submittedPago.set(true);
    if (this.formPago.invalid) return;

    this.loading.set(true);

    // Simulamos el proceso de pago
    setTimeout(() => {
      this.carritoService.vaciar();
      this.pasoActual.set(3);
      this.loading.set(false);
    }, 1500);
  }

  volverAlCatalogo() {
    this.router.navigate(['/productos']);
  }
}
