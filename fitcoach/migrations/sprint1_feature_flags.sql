-- Migration: feature_flags table
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage BETWEEN 0 AND 100),
  allowed_users UUID[] DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar flag para Sprint 1
INSERT INTO feature_flags (name, enabled, rollout_percentage, description) VALUES
('quick_log_v1', true, 50, 'Quick-Log System: botones +/-, swipe copy, validación en tiempo real')
ON CONFLICT (name) DO UPDATE SET 
  enabled = EXCLUDED.enabled, 
  rollout_percentage = EXCLUDED.rollout_percentage;

-- RLS: solo admins pueden modificar
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feature_flags_read_all" ON feature_flags FOR SELECT USING (true);
CREATE POLICY "feature_flags_write_admin" ON feature_flags FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
