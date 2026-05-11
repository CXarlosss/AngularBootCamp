-- migrations/sprint1_telemetry.sql

-- Tabla para eventos de analítica
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  event_name TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  session_id TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  feature_flag_enabled BOOLEAN DEFAULT false
);

-- Índices para optimizar consultas de reporte
CREATE INDEX IF NOT EXISTS idx_analytics_events_name_time ON analytics_events(event_name, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id, timestamp DESC);

-- RLS: Seguridad a nivel de fila
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo pueden ver sus propios eventos (para debugging en cliente)
CREATE POLICY "analytics_own_data" ON analytics_events
  FOR SELECT USING (auth.uid() = user_id);

-- Los usuarios solo pueden insertar sus propios eventos
CREATE POLICY "analytics_insert_own" ON analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Comentario explicativo
COMMENT ON TABLE analytics_events IS 'Captura de telemetría de uso para A/B testing y optimización de UX.';
