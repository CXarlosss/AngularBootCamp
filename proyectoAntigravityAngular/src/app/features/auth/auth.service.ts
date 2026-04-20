import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, throwError } from 'rxjs';
import { AuthState, AuthTokens, User } from '../../core/models/user.model';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  // Estado privado: nadie fuera del servicio puede mutar esto directamente
  private readonly _authState = signal<AuthState>({
    user: null,
    tokens: null,
    isAuthenticated: false,
  });

  // API pública: solo lectura
  readonly authState = this._authState.asReadonly();

  // Computed signals derivados — sin lógica repetida en componentes
  readonly currentUser = computed(() => this._authState().user);
  readonly isAuthenticated = computed(() => this._authState().isAuthenticated);
  readonly userRole = computed(() => this._authState().user?.role ?? null);

  login(credentials: LoginCredentials) {
    return this.http.post<LoginResponse>('/api/auth/login', credentials).pipe(
      tap(({ user, tokens }) => {
        // Mutación controlada: solo el servicio escribe el estado
        this._authState.set({
          user,
          tokens,
          isAuthenticated: true,
        });
        // Persistencia: guardamos el token para refrescar sesión
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
      }),
    );
  }

  logout(): void {
    this._authState.set({
      user: null,
      tokens: null,
      isAuthenticated: false,
    });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.router.navigate(['/login']);
  }

  getAccessToken(): string | null {
    // El interceptor llama a esto — no al signal directamente
    return this._authState().tokens?.accessToken ?? localStorage.getItem('accessToken');
  }

  // Hidratar estado desde localStorage al arrancar la app
  // Se llama desde app.config.ts con APP_INITIALIZER
  hydrateFromStorage(): void {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;
    // En producción aquí harías un refresh token real
    // Por ahora marcamos como autenticado con token existente
    this._authState.update((state) => ({
      ...state,
      isAuthenticated: true,
      tokens: {
        accessToken,
        refreshToken: localStorage.getItem('refreshToken') ?? '',
        expiresAt: 0,
      },
    }));
  }
  refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<AuthTokens>('/api/auth/refresh', { refreshToken }).pipe(
      tap((tokens) => {
        // Actualiza estado y storage
        this._authState.update((state) => ({ ...state, tokens }));
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
      }),
    );
  }
}
