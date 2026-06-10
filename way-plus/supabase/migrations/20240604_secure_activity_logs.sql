-- MIGRACIÓN: ASEGURAR ACTIVITY LOGS CONTRA SPAM (2024-06-04)
-- Elimina permisos directos de inserción a activity_logs para forzar el uso de la Edge Function 'log-activity'

-- 1. Eliminar política existente de inserción autenticada
DROP POLICY IF EXISTS "Solo terapeutas autenticados insertan actividad" ON activity_logs;
DROP POLICY IF EXISTS "Permitir inserts de actividad clínica" ON activity_logs;

-- 2. Asegurarnos que la tabla tenga RLS (ya debería tenerlo, pero por si acaso)
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Nota: Al no existir ninguna política "FOR INSERT", el comportamiento por defecto de Supabase con RLS habilitado
-- es DENEGAR el acceso a cualquier rol público (anon o authenticated).
-- Únicamente el 'service_role' (usado por la Edge Function) podrá hacer INSERT.
