import { Component, signal } from '@angular/core';
import { RegisterForm } from '../../components/register-form/register-form';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RegisterForm],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  // El smart gestiona el estado de la operación
  success = signal(false);
  loading = signal(false);

  onFormSubmitted(data: { name: string; email: string; password: string }) {
    this.loading.set(true);

    // Aquí iría la llamada al servicio real
    // Por ahora simulamos con un timeout
    setTimeout(() => {
      console.log('Registrando usuario:', data);
      this.loading.set(false);
      this.success.set(true);
    }, 1000);
  }
}
