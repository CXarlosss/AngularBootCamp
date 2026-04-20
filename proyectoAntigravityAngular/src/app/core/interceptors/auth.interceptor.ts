import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../features/auth/auth.service';

// URLs que nunca llevan token — lista blanca explícita
const PUBLIC_URLS = ['/api/auth/login', '/api/auth/register'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // ¿Es una URL pública? Pasa sin modificar
  if (PUBLIC_URLS.some((url) => req.url.includes(url))) {
    return next(req);
  }

  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  // Sin token: deja pasar (el auth guard redirigirá si hace falta)
  if (!token) {
    return next(req);
  }

  // HttpRequest es inmutable — clone() es obligatorio
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authReq);
};
