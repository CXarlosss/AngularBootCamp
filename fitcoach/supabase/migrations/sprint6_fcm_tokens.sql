-- 1. Tabla hija de tokens FCM
CREATE TABLE IF NOT EXISTS user_fcm_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  device_type TEXT DEFAULT 'unknown' CHECK (device_type IN ('android', 'ios', 'web', 'unknown')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- 2. Índices estratégicos
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_user_active 
  ON user_fcm_tokens(user_id, is_active, last_used_at DESC);
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_token_lookup 
  ON user_fcm_tokens(token) WHERE is_active = true;

-- 3. RLS
ALTER TABLE user_fcm_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own tokens" ON user_fcm_tokens;
CREATE POLICY "Users manage own tokens"
  ON user_fcm_tokens
  FOR ALL
  USING (user_id = auth.uid());

-- 4. RPC: Upsert atómico (llamado desde frontend al registrar token)
CREATE OR REPLACE FUNCTION upsert_fcm_token(
  target_user_id UUID,
  target_token TEXT,
  target_device TEXT DEFAULT 'unknown'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_fcm_tokens (user_id, token, device_type, last_used_at)
  VALUES (target_user_id, target_token, target_device, now())
  ON CONFLICT (token) 
  DO UPDATE SET 
    last_used_at = now(),
    is_active = true,
    user_id = EXCLUDED.user_id,
    device_type = EXCLUDED.device_type;
END;
$$;

-- 5. RPC: Invalidación por token muerto (llamado desde Edge Function)
CREATE OR REPLACE FUNCTION deactivate_fcm_token(target_token TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE user_fcm_tokens 
  SET is_active = false 
  WHERE token = target_token;
END;
$$;

-- 6. RPC: Obtener tokens activos de un usuario (llamado desde Edge Function de envío)
-- EXCLUSIÓN ELENA: Si el user_id es Elena, devuelve vacío
CREATE OR REPLACE FUNCTION get_active_fcm_tokens(target_user_id UUID)
RETURNS TABLE(token TEXT, device_type TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Blindaje Elena
  IF target_user_id = 'f4796979-a7ad-49dd-80df-8bfe66423a9d' THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT t.token, t.device_type
  FROM user_fcm_tokens t
  WHERE t.user_id = target_user_id
    AND t.is_active = true
  ORDER BY t.last_used_at DESC;
END;
$$;

-- 7. Permisos
GRANT EXECUTE ON FUNCTION upsert_fcm_token(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION deactivate_fcm_token(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION get_active_fcm_tokens(UUID) TO service_role;
