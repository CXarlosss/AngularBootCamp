import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { supabase } from '../supabase.client';
import { AuthService } from '../auth/auth.service';
import { from, map, of, switchMap } from 'rxjs';
import { ToastService } from '../../shared/services/toast/toast.service';
import { ClientRoutineService } from '../services/client-routine.service';

export const workoutDayGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const auth   = inject(AuthService);
  const toast  = inject(ToastService);
  const routineSvc = inject(ClientRoutineService);
  const dayId  = route.paramMap.get('dayId');
  const user   = auth.user();

  if (!user) return of(true);

  if (dayId) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(dayId)) return of(true);
    return checkBlocked(user.id, dayId, router, toast);
  } else {
    // Resolver el dayId por defecto para hoy
    return from(routineSvc.getActiveRoutine(user.id)).pipe(
      switchMap(assigned => {
        if (!assigned) return of(true);
        const r = assigned.routine;
        const jsDay  = new Date().getDay();
        const isoDay = jsDay === 0 ? 7 : jsDay;
        const todayDay = r?.days.find(d => d.dayNumber === isoDay) ?? r?.days[0];
        
        if (!todayDay) return of(true);
        
        return checkBlocked(user.id, todayDay.id, router, toast);
      })
    );
  }
};

function checkBlocked(userId: string, dayId: string, router: Router, toast: ToastService) {
  // Verificamos si el día ya fue completado vía RPC (atómico y centralizado)
  return from(
    supabase.rpc('is_day_blocked', {
      p_client_id: userId,
      p_day_id: dayId
    })
  ).pipe(
    map(({ data }) => {
      if (data) {
        // Día ya completado → feedback y redirige
        toast.info('🔒 Este entrenamiento ya fue completado');
        router.navigate(['/client/progress'], {
          queryParams: { alreadyCompleted: true, dayId }
        });
        return false;
      }
      return true;
    })
  );
}
