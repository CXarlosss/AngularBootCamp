-- migrations/sprint3_gamification.sql

-- 1. Tabla de misiones semanales (plantilla)
CREATE TABLE IF NOT EXISTS mission_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('frequency', 'volume', 'quality', 'social')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL,
  icon TEXT DEFAULT '⭐',
  difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 3),
  is_active BOOLEAN DEFAULT true
);

-- 2. Tabla de misiones asignadas a cada cliente por semana
CREATE TABLE IF NOT EXISTS client_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_template_id UUID REFERENCES mission_templates(id),
  week_start DATE NOT NULL,
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  xp_reward INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  is_claimed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(client_id, mission_template_id, week_start)
);

-- 3. Tabla de rachas semanales
CREATE TABLE IF NOT EXISTS weekly_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  days_completed INTEGER DEFAULT 0,
  target_days INTEGER DEFAULT 3,
  freeze_used BOOLEAN DEFAULT false,
  freeze_auto_applied BOOLEAN DEFAULT false,
  streak_count INTEGER DEFAULT 0,
  is_maintained BOOLEAN DEFAULT false,
  
  UNIQUE(client_id, week_start)
);

-- 4. Tabla de leaderboards por coach
CREATE TABLE IF NOT EXISTS coach_leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  metric TEXT NOT NULL CHECK (metric IN ('xp', 'adherence', 'prs', 'volume')),
  value INTEGER DEFAULT 0,
  rank_position INTEGER,
  is_anonymous BOOLEAN DEFAULT false,
  
  UNIQUE(coach_id, client_id, week_start, metric)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_client_missions_active ON client_missions(client_id, week_start, is_completed);
CREATE INDEX IF NOT EXISTS idx_weekly_streaks_client ON weekly_streaks(client_id, week_start);
CREATE INDEX IF NOT EXISTS idx_leaderboard_week ON coach_leaderboards(coach_id, week_start, metric);

-- RLS
ALTER TABLE client_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_leaderboards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "missions_own" ON client_missions FOR ALL USING (auth.uid() = client_id);
CREATE POLICY "streaks_own" ON weekly_streaks FOR ALL USING (auth.uid() = client_id);
CREATE POLICY "leaderboard_coach_view" ON coach_leaderboards 
  FOR SELECT USING (
    auth.uid() = coach_id OR 
    auth.uid() = client_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Insertar templates de misiones base
INSERT INTO mission_templates (type, title, description, target_value, xp_reward, icon, difficulty) VALUES
('frequency', 'Constancia de Hierro', 'Completa 3 entrenamientos esta semana', 3, 50, '🔥', 1),
('volume', 'Centurión de Series', 'Registra 50 series en total esta semana', 50, 75, '⚔️', 2),
('quality', 'Precisión Perfecta', 'Mantén 90% de adherencia al peso objetivo', 90, 100, '🎯', 2),
('social', 'Feedback al Coach', 'Envía un mensaje a tu coach esta semana', 1, 25, '💬', 1),
('frequency', 'Guerrero de la Semana', 'Entrena 5 días esta semana', 5, 150, '🛡️', 3),
('volume', 'Titán del Volumen', 'Acumula 100 series esta semana', 100, 200, '🏛️', 3);

-- Feature flag update
UPDATE feature_flags 
SET rollout_percentage = 25, enabled = true
WHERE name = 'gamification_v2';

-- Verificar
SELECT name, enabled, rollout_percentage FROM feature_flags;

-- SQL: Función RPC para Leaderboard
CREATE OR REPLACE FUNCTION get_coach_leaderboard(
  p_coach_id UUID,
  p_week_start DATE,
  p_metric TEXT
)
RETURNS TABLE (
  client_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  value INTEGER,
  trend TEXT
) AS $$
BEGIN
  IF p_metric = 'xp' THEN
    RETURN QUERY
    SELECT 
      ar.client_id,
      p.full_name,
      p.avatar_url,
      COALESCE(ar.xp_total, 0)::int as value,
      'same'::text as trend
    FROM athlete_ranks ar
    JOIN profiles p ON p.id = ar.client_id
    WHERE p.coach_id = p_coach_id
    ORDER BY ar.xp_total DESC
    LIMIT 10;
    
  ELSIF p_metric = 'adherence' THEN
    RETURN QUERY
    SELECT 
      cd.client_id,
      p.full_name,
      p.avatar_url,
      (COUNT(*) FILTER (WHERE cd.completed_at IS NOT NULL) * 100 / 
       NULLIF(COUNT(*), 0))::int as value,
      'same'::text as trend
    FROM completed_days cd
    JOIN profiles p ON p.id = cd.client_id
    WHERE p.coach_id = p_coach_id
      AND cd.completed_at >= p_week_start
    GROUP BY cd.client_id, p.full_name, p.avatar_url
    ORDER BY value DESC
    LIMIT 10;
  END IF;
END;
$$ LANGUAGE plpgsql;
