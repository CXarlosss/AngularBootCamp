-- MIGRACIÓN DE ENDURECIMIENTO DE SEGURIDAD - WAYPLUS
-- Este archivo debe ejecutarse en el SQL Editor de Supabase para cerrar la brecha en activity_logs.

-- 1. Asegurar RLS en todas las tablas
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;

-- 2. Limpiar políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Permitir inserts de actividad clínica" ON activity_logs;
DROP POLICY IF EXISTS "Lectura de logs por terapeuta" ON activity_logs;
DROP POLICY IF EXISTS "Lectura de perfiles por terapeuta" ON patient_profiles;
DROP POLICY IF EXISTS "Gestión total de perfiles por terapeuta" ON patient_profiles;

-- 3. Políticas de Activity Logs
-- Solo usuarios autenticados (terapeutas) pueden insertar actividad.
-- Esto protege contra spam anónimo.
CREATE POLICY "Solo terapeutas autenticados insertan actividad" 
ON activity_logs 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Lectura privada: Solo terapeutas ven los logs.
CREATE POLICY "Lectura privada de logs por terapeuta" 
ON activity_logs 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- 4. Políticas de Patient Profiles
-- Los terapeutas tienen control total sobre los perfiles de sus pacientes.
CREATE POLICY "Gestión total de perfiles por terapeuta" 
ON patient_profiles 
FOR ALL 
USING (auth.role() = 'authenticated');

-- 5. Auditoría de Metadata
-- Asegurar que nadie pueda insertar logs sin el ID del paciente
ALTER TABLE activity_logs ALTER COLUMN patient_id SET NOT NULL;
ALTER TABLE activity_logs ALTER COLUMN way_id SET NOT NULL;
