import { Injectable, signal } from '@angular/core';

export interface User {
  id: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<User | null>({ id: '123', name: 'Carlos' });

  login() {
    this.currentUser.set({ id: '123', name: 'Carlos' });
  }

  logout() {
    this.currentUser.set(null);
  }
}
