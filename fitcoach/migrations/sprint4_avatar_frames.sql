-- migrations/sprint4_avatar_frames.sql
-- Ejecutar en Supabase SQL Editor para dar soporte al sistema de personalización premium

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS equipped_frame TEXT DEFAULT 'none';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banner_color TEXT DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banner_pattern TEXT DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rank TEXT DEFAULT 'Rookie';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT NULL;
