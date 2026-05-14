import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { supabase } from '../supabase.client';
import { AuthService } from '../auth/auth.service';
import { from, map, of } from 'rxjs';
import { ToastService } from '../../shared/services/toast/toast.service';

export const workoutDayGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const auth   = inject(AuthService);
  const toast  = inject(ToastService);
  const dayId  = route.paramMap.get('dayId');
  const user   = auth.user();

  if (!user || !dayId) return of(true);

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(dayId)) return of(true);

  // Verificamos si el día ya fue completado vía RPC (atómico y centralizado)
  return from(
    supabase.rpc('is_day_blocked', {
      p_client_id: user.id,
      p_day_id: dayId
    })
  ).pipe(
    map(({ data }) => {
      if (data) {
        // Día ya completado → feedback y redirige
        toast.show('🔒 Este entrenamiento ya fue completado', 'info');
        router.navigate(['/client/progress'], {
          queryParams: { alreadyCompleted: true, dayId }
        });
        return false;
      }
      return true;
    })
  );
};
