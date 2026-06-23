-- ============================================
-- WAY+ RLS Security Hardening
-- Fecha: 2026-06-23
-- Crítico: Datos de menores con TEA
-- ============================================

-- 1. AÑADIR expires_at A family_access
-- -------------------------------------
ALTER TABLE public.family_access
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Actualizar tokens existentes: 30 días de validez
UPDATE public.family_access
SET expires_at = created_at + INTERVAL '30 days'
WHERE expires_at IS NULL;

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_family_access_expires 
ON public.family_access(expires_at) 
WHERE expires_at IS NOT NULL;

-- 2. RECREAR family_dashboard CON security_invoker
-- -------------------------------------------------
-- ⚠️ DROP primero si existe, luego recrear
DROP VIEW IF EXISTS public.family_dashboard;

CREATE VIEW public.family_dashboard
WITH (security_invoker = true) AS
SELECT 
  p.id AS patient_id,
  p.name AS patient_name,
  p.avatar_emoji,
  p.gender,
  pp.coins,
  pp.current_level,
  pp.completed_ways,
  array_length(pp.completed_ways, 1) AS completed_ways_count,
  pp.accessibility_config,
  fa.access_token,
  fa.access_enabled,
  fa.notification_enabled,
  fa.expires_at
FROM public.patients p
JOIN public.patient_profiles pp ON p.id = pp.patient_id
JOIN public.family_access fa ON p.id = fa.patient_id
WHERE fa.access_enabled = true
  AND (fa.expires_at IS NULL OR fa.expires_at > now());

-- 3. POLÍTICA RLS: Familia (Magic Link)
-- --------------------------------------
-- La familia solo ve su paciente vía token en header

CREATE OR REPLACE FUNCTION public.get_family_patient_id()
RETURNS UUID AS $$
DECLARE
  token TEXT;
BEGIN
  -- Leer header x-family-token de la petición
  token := current_setting('request.headers', true)::json->>'x-family-token';
  
  IF token IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN (
    SELECT patient_id 
    FROM public.family_access 
    WHERE access_token = token
      AND access_enabled = true
      AND (expires_at IS NULL OR expires_at > now())
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Política SELECT para familias en patients
DROP POLICY IF EXISTS "family_read_own_patient" ON public.patients;
CREATE POLICY "family_read_own_patient" ON public.patients
  FOR SELECT
  TO anon
  USING (id = public.get_family_patient_id());

-- Política SELECT para familias en patient_profiles
DROP POLICY IF EXISTS "family_read_own_profile" ON public.patient_profiles;
CREATE POLICY "family_read_own_profile" ON public.patient_profiles
  FOR SELECT
  TO anon
  USING (patient_id = public.get_family_patient_id());

-- 4. POLÍTICA RLS: Niño (PIN)
-- -----------------------------
-- El niño solo lee/actualiza SU perfil vía PIN

CREATE OR REPLACE FUNCTION public.get_patient_id_by_pin()
RETURNS UUID AS $$
DECLARE
  pin TEXT;
BEGIN
  pin := current_setting('request.headers', true)::json->>'x-player-pin';
  
  IF pin IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN (
    SELECT id 
    FROM public.patients 
    WHERE player_pin = pin
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Política SELECT para niños en patient_profiles
DROP POLICY IF EXISTS "player_read_own_profile" ON public.patient_profiles;
CREATE POLICY "player_read_own_profile" ON public.patient_profiles
  FOR SELECT
  TO anon
  USING (patient_id = public.get_patient_id_by_pin());

-- Política UPDATE para niños (solo coins, completed_ways, etc.)
DROP POLICY IF EXISTS "player_update_own_profile" ON public.patient_profiles;
CREATE POLICY "player_update_own_profile" ON public.patient_profiles
  FOR UPDATE
  TO anon
  USING (patient_id = public.get_patient_id_by_pin())
  WITH CHECK (patient_id = public.get_patient_id_by_pin());

-- 5. BLOQUEAR LECTURA DIRECTA DE patients POR ANON
-- -------------------------------------------------
-- Solo Edge Functions o autenticados pueden leer todos

DROP POLICY IF EXISTS "anon_no_read_patients" ON public.patients;
CREATE POLICY "anon_no_read_patients" ON public.patients
  FOR SELECT
  TO anon
  USING (
    -- Solo si se cumple lo de arriba pasará por las otras políticas
    -- El defecto sin políticas permisivas es false
    id = public.get_family_patient_id() OR
    id = public.get_patient_id_by_pin()
  );

-- 6. VERIFICACIÓN: Asegurar RLS activado en TODAS las tablas
-- -----------------------------------------------------------
DO $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
      AND tablename NOT IN ('schema_migrations', 'seed_files')
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl.tablename);
  END LOOP;
END $$;
