-- Migración: supabase/migrations/sprint4_coach_progress_rpc.sql

CREATE OR REPLACE FUNCTION get_client_progress_snapshot(target_client_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  coach UUID;
BEGIN
  -- 1. VALIDACIÓN DE OWNERSHIP (única barrera de seguridad)
  SELECT coach_id INTO coach
  FROM profiles
  WHERE id = target_client_id;
  
  IF coach IS NULL OR coach != auth.uid() THEN
    RETURN NULL; -- O RAISE EXCEPTION 'Not your client'
  END IF;

  -- 2. SNAPSHOT ATÓMICO VIA CTEs
  SELECT jsonb_build_object(
    'profile', (
      SELECT jsonb_build_object(
        'id', p.id,
        'full_name', p.full_name,
        'rank', p.rank_level,
        'xp', p.xp_total,
        'target_weight', p.target_weight,
        'last_active', p.last_active
      )
      FROM profiles p WHERE p.id = target_client_id
    ),
    'adherence', (
      SELECT jsonb_agg(jsonb_build_object(
        'week', w.week_start,
        'planned', w.planned_days,
        'completed', w.completed_days,
        'rate', CASE WHEN w.planned_days > 0 
                THEN round((w.completed_days::numeric / w.planned_days) * 100, 1) 
                ELSE 0 END
      ) ORDER BY w.week_start DESC)
      FROM (
        -- CTE de adherencia últimas 8 semanas
        SELECT 
          date_trunc('week', rd.assigned_date) as week_start,
          COUNT(*) as planned_days,
          COUNT(cd.id) as completed_days
        FROM routine_days rd
        JOIN assigned_routines ar ON ar.routine_id = rd.routine_id
        LEFT JOIN completed_days cd ON cd.day_id = rd.id AND cd.client_id = target_client_id
        WHERE ar.client_id = target_client_id
          AND rd.assigned_date >= now() - interval '8 weeks'
        GROUP BY date_trunc('week', rd.assigned_date)
      ) w
    ),
    'recent_prs', (
      SELECT jsonb_agg(jsonb_build_object(
        'exercise', exercise_name,
        'weight', max_weight,
        'date', achieved_at
      ) ORDER BY achieved_at DESC)
      FROM (
        SELECT 
          exercise_name,
          MAX(weight_kg) as max_weight,
          MAX(completed_at) as achieved_at
        FROM set_logs sl
        JOIN workout_logs wl ON wl.id = sl.workout_log_id
        WHERE wl.client_id = target_client_id
          AND sl.completed_at >= now() - interval '14 days'
        GROUP BY exercise_name
      ) prs
    ),
    'volume_trend', (
      SELECT jsonb_agg(jsonb_build_object(
        'week', week_start,
        'total_volume', total_vol
      ) ORDER BY week_start DESC)
      FROM (
        SELECT 
          date_trunc('week', wl.logged_date) as week_start,
          SUM(sl.weight_kg * sl.reps_done) as total_vol
        FROM workout_logs wl
        JOIN set_logs sl ON sl.workout_log_id = wl.id
        WHERE wl.client_id = target_client_id
          AND wl.logged_date >= now() - interval '8 weeks'
        GROUP BY date_trunc('week', wl.logged_date)
      ) vol
    ),
    'weight_logs', (
      SELECT jsonb_agg(jsonb_build_object(
        'date', logged_date,
        'weight', weight_kg,
        'delta', weight_kg - LAG(weight_kg) OVER (ORDER BY logged_date)
      ) ORDER BY logged_date DESC)
      FROM weight_logs
      WHERE client_id = target_client_id
      ORDER BY logged_date DESC
      LIMIT 30
    ),
    'last_workout', (
      SELECT jsonb_build_object(
        'date', wl.logged_date,
        'day_name', rd.day_name,
        'completed', wl.completed
      )
      FROM workout_logs wl
      LEFT JOIN routine_days rd ON rd.id = wl.day_id
      WHERE wl.client_id = target_client_id
      ORDER BY wl.logged_date DESC
      LIMIT 1
    ),
    'photos_index', (
      SELECT jsonb_agg(jsonb_build_object(
        'id', id,
        'storage_path', storage_path,
        'created_at', created_at,
        'file_size_kb', file_size_kb,
        'thumbnail_path', thumbnail_path
      ) ORDER BY created_at DESC)
      FROM progress_photos
      WHERE client_id = target_client_id
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- Política: solo usuarios autenticados pueden invocar
GRANT EXECUTE ON FUNCTION get_client_progress_snapshot(UUID) TO authenticated;
