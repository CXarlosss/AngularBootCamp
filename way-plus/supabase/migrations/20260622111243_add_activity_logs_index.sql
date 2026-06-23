-- Optimization: Add composite index for activity_logs to speed up analytics and background queries
CREATE INDEX IF NOT EXISTS idx_activity_logs_patient_created_at
ON public.activity_logs(patient_id, created_at DESC);
