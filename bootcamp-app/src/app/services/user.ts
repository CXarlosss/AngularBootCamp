import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);

  private users = signal<any[]>([]);
  private loading = signal(false);
  private error = signal<string | null>(null);

  getUsers() {
    return this.users;
  }

  isLoading() {
    return this.loading;
  }

  getError() {
    return this.error;
  }

  loadUsers() {
    if (this.users().length > 0) return; // ya tenemos datos, no volvemos a pedir

    this.loading.set(true);
    this.error.set(null);

    this.http.get<any[]>('https://jsonplaceholder.typicode.com/users').subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar usuarios');
        this.loading.set(false);
      },
    });
  }
}
