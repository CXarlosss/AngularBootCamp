-- sprint5_retention_funnel.sql

-- 1. Índices críticos para la vista (crear ANTES de la VIEW)
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_event_time 
  ON analytics_events(user_id, event_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_app_opened_cohort 
  ON analytics_events(event_name, created_at, user_id) 
  WHERE event_name = 'app_opened';

-- 2. Extensión de analytics_events para session tracking
ALTER TABLE analytics_events 
  ADD COLUMN IF NOT EXISTS session_id UUID,
  ADD COLUMN IF NOT EXISTS device_type TEXT DEFAULT 'mobile';

-- 3. Vista de retención por cohorte semanal
CREATE OR REPLACE VIEW retention_cohorts AS
WITH user_first_seen AS (
  -- Primera aparición de cada usuario (fuente de verdad de la cohorte)
  SELECT 
    user_id,
    MIN(created_at) AS first_seen
  FROM analytics_events
  WHERE event_name = 'app_opened'
  GROUP BY user_id
),
cohort_users AS (
  SELECT 
    user_id,
    date_trunc('week', first_seen)::date AS cohort_week,
    first_seen
  FROM user_first_seen
),
retention_flags AS (
  -- Ventanas deslizantes por usuario usando el índice parcial
  SELECT 
    c.user_id,
    c.cohort_week,
    MAX(CASE WHEN a.created_at BETWEEN c.first_seen AND c.first_seen + INTERVAL '1 day' THEN 1 ELSE 0 END) AS d1_active,
    MAX(CASE WHEN a.created_at BETWEEN c.first_seen AND c.first_seen + INTERVAL '7 days' THEN 1 ELSE 0 END) AS d7_active,
    MAX(CASE WHEN a.created_at BETWEEN c.first_seen AND c.first_seen + INTERVAL '30 days' THEN 1 ELSE 0 END) AS d30_active,
    -- Métrica adicional: sesiones en la primera semana (engagement depth)
    COUNT(CASE WHEN a.created_at BETWEEN c.first_seen AND c.first_seen + INTERVAL '7 days' THEN 1 END) AS sessions_w1
  FROM cohort_users c
  LEFT JOIN analytics_events a 
    ON a.user_id = c.user_id 
    AND a.event_name = 'app_opened'
    AND a.created_at <= c.first_seen + INTERVAL '30 days'
  GROUP BY c.user_id, c.cohort_week
)
SELECT 
  cohort_week,
  COUNT(*) AS cohort_size,
  ROUND(COUNT(*) FILTER (WHERE d1_active = 1) * 100.0 / NULLIF(COUNT(*), 0), 2) AS d1_retention_pct,
  ROUND(COUNT(*) FILTER (WHERE d7_active = 1) * 100.0 / NULLIF(COUNT(*), 0), 2) AS d7_retention_pct,
  ROUND(COUNT(*) FILTER (WHERE d30_active = 1) * 100.0 / NULLIF(COUNT(*), 0), 2) AS d30_retention_pct,
  ROUND(AVG(sessions_w1), 1) AS avg_sessions_first_week
FROM retention_flags
GROUP BY cohort_week
ORDER BY cohort_week DESC;

-- 4. Vista adicional: retención diaria para el último mes (granularidad temporal)
CREATE OR REPLACE VIEW retention_daily AS
WITH user_first_seen AS (
  SELECT user_id, MIN(created_at)::date AS first_seen_date
  FROM analytics_events WHERE event_name = 'app_opened' GROUP BY user_id
)
SELECT 
  first_seen_date AS cohort_day,
  COUNT(DISTINCT user_id) AS cohort_size,
  COUNT(DISTINCT CASE WHEN EXISTS (
    SELECT 1 FROM analytics_events a2 
    WHERE a2.user_id = f.user_id 
    AND a2.event_name = 'app_opened'
    AND a2.created_at::date = f.first_seen_date + 1
  ) THEN user_id END) * 100.0 / COUNT(DISTINCT user_id) AS d1_pct,
  COUNT(DISTINCT CASE WHEN EXISTS (
    SELECT 1 FROM analytics_events a2 
    WHERE a2.user_id = f.user_id 
    AND a2.event_name = 'app_opened'
    AND a2.created_at::date BETWEEN f.first_seen_date + 2 AND f.first_seen_date + 7
  ) THEN user_id END) * 100.0 / COUNT(DISTINCT user_id) AS d2_7_pct
FROM user_first_seen f
WHERE first_seen_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY first_seen_date
ORDER BY first_seen_date DESC;
