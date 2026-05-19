-- migrations/sprint4_weight_improved_rpc.sql
-- Migration: Add get_weight_improved_kg stored procedure/RPC to calculate the 33% Tercile-based Weight Improved KPI on the server.

CREATE OR REPLACE FUNCTION get_weight_improved_kg(p_client_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_total_improvement NUMERIC := 0.0;
  r_exercise RECORD;
  v_unique_dates DATE[];
  v_total_sessions INT;
  v_slice_size INT;
  v_early_dates DATE[];
  v_recent_dates DATE[];
  v_early_max NUMERIC;
  v_recent_max NUMERIC;
  v_diff NUMERIC;
BEGIN
  -- 1. Iterar sobre cada ejercicio único que tenga sets registrados y completados para el cliente
  FOR r_exercise IN 
    SELECT DISTINCT sl.exercise_name
    FROM set_logs sl
    INNER JOIN workout_logs wl ON wl.id = sl.workout_log_id
    WHERE wl.client_id = p_client_id
      AND wl.completed = true
      AND sl.weight_kg IS NOT NULL
  LOOP
    -- 2. Obtener todas las fechas de sesión únicas para este ejercicio ordenadas cronológicamente
    SELECT array_agg(d.session_date ORDER BY d.session_date)
    INTO v_unique_dates
    FROM (
      SELECT DISTINCT wl.logged_date::date as session_date
      FROM set_logs sl
      INNER JOIN workout_logs wl ON wl.id = sl.workout_log_id
      WHERE wl.client_id = p_client_id
        AND wl.completed = true
        AND sl.weight_kg IS NOT NULL
        AND sl.exercise_name = r_exercise.exercise_name
    ) d;

    v_total_sessions := array_length(v_unique_dates, 1);
    
    -- 3. Si el atleta tiene al menos 2 sesiones de este ejercicio, comparamos el primer vs último tercio (33%)
    IF v_total_sessions >= 2 THEN
      -- Calcular tamaño del tercio (33% truncado, mínimo 1)
      v_slice_size := greatest(1, floor(v_total_sessions * 0.33)::int);
      
      -- Extraer sub-arreglos de fechas primeras y últimas
      v_early_dates := v_unique_dates[1 : v_slice_size];
      v_recent_dates := v_unique_dates[(v_total_sessions - v_slice_size + 1) : v_total_sessions];
      
      -- Calcular peso máximo de las primeras sesiones
      SELECT COALESCE(max(sl.weight_kg), 0)
      INTO v_early_max
      FROM set_logs sl
      INNER JOIN workout_logs wl ON wl.id = sl.workout_log_id
      WHERE wl.client_id = p_client_id
        AND wl.completed = true
        AND sl.exercise_name = r_exercise.exercise_name
        AND wl.logged_date::date = ANY(v_early_dates);
        
      -- Calcular peso máximo de las últimas sesiones
      SELECT COALESCE(max(sl.weight_kg), 0)
      INTO v_recent_max
      FROM set_logs sl
      INNER JOIN workout_logs wl ON wl.id = sl.workout_log_id
      WHERE wl.client_id = p_client_id
        AND wl.completed = true
        AND sl.exercise_name = r_exercise.exercise_name
        AND wl.logged_date::date = ANY(v_recent_dates);
        
      -- Calcular mejora si es positiva
      v_diff := v_recent_max - v_early_max;
      IF v_diff > 0 THEN
        v_total_improvement := v_total_improvement + v_diff;
      END IF;
    END IF;
  END LOOP;
  
  RETURN round(v_total_improvement, 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_weight_improved_kg(UUID) IS 'Calcula la fuerza mejorada del atleta (KPI Kg Mejorados) mediante la fórmula matemática pura de terciles (primer 33% vs último 33% de las sesiones) agrupada por ejercicio.';
