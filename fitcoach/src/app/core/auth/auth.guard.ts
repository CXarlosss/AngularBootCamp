import { inject } from '@angular/core';
import { CanActivateFn, Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (
  _route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  const redirect = () => {
    // Guardar la URL en sessionStorage en lugar de state
    sessionStorage.setItem('returnUrl', state.url);
    return router.createUrlTree(['/auth/login']);
  };

  if (!auth.loading()) {
    if (auth.isAuthed()) return true;
    return redirect();
  }

  return toObservable(auth.loading).pipe(
    filter(l => !l),
    take(1),
    map(() => auth.isAuthed() ? true : redirect())
  );
};
