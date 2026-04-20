import { Injectable, signal, computed } from '@angular/core';

export interface User {
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser = signal<User | null>(null);

  user = this.currentUser.asReadonly();
  isLoggedIn = computed(() => this.currentUser() !== null);

  login(email: string, password: string): boolean {
    if (email === 'admin@tienda.com' && password === '123456') {
      this.currentUser.set({ name: 'Carlos', email });
      return true;
    }
    return false;
  }

  logout() {
    this.currentUser.set(null);
  }
}
