-- Migración: supabase/migrations/sprint4_coach_notes.sql

CREATE TABLE coach_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 2000),
  category TEXT CHECK (category IN ('general', 'injury', 'nutrition', 'motivation', 'technique')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance del coach (lista de notas por cliente y búsqueda reciente)
CREATE INDEX idx_coach_notes_lookup ON coach_notes(coach_id, client_id, created_at DESC);
CREATE INDEX idx_coach_notes_updated ON coach_notes(updated_at DESC);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_coach_notes_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER coach_notes_updated
  BEFORE UPDATE ON coach_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_coach_notes_timestamp();

-- RLS: un coach solo ve/edita sus notas sobre sus clientes
ALTER TABLE coach_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coach owns notes"
  ON coach_notes
  FOR ALL
  USING (coach_id = auth.uid());
