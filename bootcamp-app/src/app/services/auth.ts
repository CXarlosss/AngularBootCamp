import { Injectable, signal, computed } from '@angular/core';

export interface User {
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Estado privado — solo el servicio lo modifica
  private currentUser = signal<User | null>(null);

  // Solo lectura para los componentes
  user = this.currentUser.asReadonly();

  // computed — true si hay usuario logado
  isLoggedIn = computed(() => this.currentUser() !== null);

  login(email: string, password: string): boolean {
    // Simulamos credenciales válidas
    if (email === 'admin@test.com' && password === '123456') {
      this.currentUser.set({ name: 'Carlos', email });
      return true;
    }
    return false;
  }

  logout() {
    this.currentUser.set(null);
  }
}
