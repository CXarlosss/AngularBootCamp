import { Component, signal, inject, OnInit, DestroyRef } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, filter, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface User {
  id: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './search.html',
  styleUrl: './search.css',
})
export class Search implements OnInit {
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);

  // El input del buscador como FormControl
  searchControl = new FormControl('');

  // Estado con signals
  results = signal<User[]>([]);
  loading = signal(false);
  searched = signal(false);

  ngOnInit() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(400), // espera 400ms tras el último tecleo
        distinctUntilChanged(), // no busca si el valor no cambió
        filter((v) => (v?.length ?? 0) >= 2), // mínimo 2 caracteres
        switchMap((query) => {
          // cancela petición anterior
          this.loading.set(true);
          this.searched.set(true);
          return this.http.get<User[]>(`https://jsonplaceholder.typicode.com/users`).pipe(
            catchError(() => of([])), // si hay error devuelve array vacío
          );
        }),
        takeUntilDestroyed(this.destroyRef), // limpieza automática
      )
      .subscribe((users) => {
        const query = this.searchControl.value?.toLowerCase() ?? '';
        this.results.set(users.filter((u) => u.name.toLowerCase().includes(query)));
        this.loading.set(false);
      });
  }
}
