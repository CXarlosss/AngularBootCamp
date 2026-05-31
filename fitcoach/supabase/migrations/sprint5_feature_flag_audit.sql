-- sprint5_feature_flag_audit.sql

ALTER TABLE feature_flags 
  ADD COLUMN IF NOT EXISTS previous_percentage INTEGER,
  ADD COLUMN IF NOT EXISTS updated_by TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Índice para auditoría
CREATE INDEX IF NOT EXISTS idx_feature_flags_updated 
  ON feature_flags(updated_at DESC);
