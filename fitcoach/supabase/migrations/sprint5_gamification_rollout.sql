-- supabase/migrations/sprint5_gamification_rollout.sql

-- Forzar rollout de gamification_v2 al 100% para todos los usuarios.
UPDATE feature_flags 
SET rollout_percentage = 100, enabled = true, updated_at = NOW(), updated_by = 'migration_script'
WHERE name = 'gamification_v2';
