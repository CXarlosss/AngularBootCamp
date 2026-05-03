import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { supabase } from '../supabase.client';
import { AuthService } from '../auth/auth.service';
import { from, map, of } from 'rxjs';

export const workoutDayGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const auth   = inject(AuthService);
  const dayId  = route.paramMap.get('dayId');
  const user   = auth.user();

  if (!user || !dayId) return of(true);

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(dayId)) return of(true);

  // Verificamos si el día ya fue completado
  return from(
    supabase
      .from('completed_days')
      .select('id')
      .eq('client_id', user.id)    // ✅ client_id
      .eq('day_id', dayId)         // ✅ day_id
      .maybeSingle()
  ).pipe(
    map(({ data }) => {
      if (data) {
        // Día ya completado → redirige al progreso con mensaje
        router.navigate(['/client/progress'], {
          queryParams: { alreadyCompleted: true, dayId }
        });
        return false;
      }
      return true;
    })
  );
};
