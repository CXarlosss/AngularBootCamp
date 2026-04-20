import { HttpInterceptorFn, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, throwError, EMPTY } from 'rxjs';
import { catchError, filter, switchMap, take, finalize } from 'rxjs/operators';
import { AuthService } from '../../features/auth/auth.service';
// ⚠️ SSR WARNING: estas variables son estado de módulo.
// En SSR deben vivir dentro del AuthService como propiedades de instancia.
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

const addAuthHeader = (req: HttpRequest<unknown>, token: string) =>
  req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Solo manejamos 401 con lógica de refresh
      if (error.status !== 401) {
        return throwError(() => error);
      }

      // Bucle infinito: el refresh mismo falló → logout duro
      if (req.url.includes('/api/auth/refresh')) {
        authService.logout();
        return EMPTY; // No re-lanzamos — el logout ya redirige
      }

      // ── PRIMER 401: inicia el refresh ──────────────────────────
      if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null); // bloquea la sala de espera

        return authService.refreshToken().pipe(
          switchMap((tokens) => {
            refreshTokenSubject.next(tokens.accessToken); // libera la cola
            return next(addAuthHeader(req, tokens.accessToken));
          }),
          catchError((refreshErr) => {
            // Libera la cola con null — las peticiones en espera
            // recibirán null, pero el logout las cancela antes de que importen
            refreshTokenSubject.next(null);
            authService.logout();
            return throwError(() => refreshErr);
          }),
          finalize(() => {
            // Garantía: isRefreshing vuelve a false SIEMPRE
            // sin importar si switchMap o catchError corrieron
            isRefreshing = false;
          }),
        );
      }

      // ── 401 CONCURRENTE: espera en la sala ────────────────────
      return refreshTokenSubject.pipe(
        filter((token): token is string => token !== null),
        take(1),
        switchMap((token) => next(addAuthHeader(req, token))),
      );
    }),
  );
};
