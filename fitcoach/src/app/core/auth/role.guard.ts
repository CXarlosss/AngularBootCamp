import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  const redirect = () => {
    sessionStorage.setItem('returnUrl', state.url);
    return router.createUrlTree(['/auth/login']);
  };

  if (!auth.loading()) {
    return auth.isAuthed() ? true : redirect();
  }

  return toObservable(auth.loading).pipe(
    filter(l => !l),
    take(1),
    map(() => auth.isAuthed() ? true : redirect())
  );
};

export const coachGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  const check = () => {
    if (auth.profile()?.role === 'coach') return true;
    router.navigate(['/client/dashboard']);
    return false;
  };

  if (!auth.loading()) return check();

  return toObservable(auth.loading).pipe(
    filter(l => !l),
    take(1),
    map(() => check())
  );
};

export const clientGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  const check = () => {
    if (auth.profile()?.role === 'client') return true;
    router.navigate(['/coach/dashboard']);
    return false;
  };

  if (!auth.loading()) return check();

  return toObservable(auth.loading).pipe(
    filter(l => !l),
    take(1),
    map(() => check())
  );
};
