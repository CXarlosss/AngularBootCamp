-- SCHEMA INTEGRAL WAYPLUS - 20240512 (v4)
-- Este script asegura que las tablas tengan las columnas correctas y permite el Modo Demo.

-- 1. Tabla de Perfiles (Terapeutas)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  center_name TEXT,
  role TEXT DEFAULT 'therapist'
);

-- 2. Tabla de Pacientes (Niños)
CREATE TABLE IF NOT EXISTS patient_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT,
  age INTEGER DEFAULT 6,
  equipped_avatar_id TEXT DEFAULT 'base-unicorn',
  current_level TEXT DEFAULT 'pregamer',
  coins INTEGER DEFAULT 0,
  inventory JSONB DEFAULT '[]'::jsonb,
  completed_ways JSONB DEFAULT '[]'::jsonb,
  homework_way_ids JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabla de Logs de Actividad (Telemetría)
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patient_profiles(id) ON DELETE CASCADE,
  way_id TEXT NOT NULL,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabla de Notas Clínicas
CREATE TABLE IF NOT EXISTS therapist_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patient_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabla de Recomendaciones para Padres
CREATE TABLE IF NOT EXISTS therapist_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patient_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  advice TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_recommendations ENABLE ROW LEVEL SECURITY;

-- 7. Políticas de Seguridad (Modo Demo incluido)
DROP POLICY IF EXISTS "Terapeutas gestionan sus propios pacientes" ON patient_profiles;
CREATE POLICY "Terapeutas gestionan sus propios pacientes" 
  ON patient_profiles FOR ALL 
  USING (
    auth.uid() = therapist_id OR 
    therapist_id = '00000000-0000-0000-0000-000000000000'
  )
  WITH CHECK (
    auth.uid() = therapist_id OR 
    therapist_id = '00000000-0000-0000-0000-000000000000'
  );

DROP POLICY IF EXISTS "Terapeutas gestionan sus notas" ON therapist_notes;
CREATE POLICY "Terapeutas gestionan sus notas" 
  ON therapist_notes FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM patient_profiles 
    WHERE patient_profiles.id = therapist_notes.patient_id 
    AND (patient_profiles.therapist_id = auth.uid() OR patient_profiles.therapist_id = '00000000-0000-0000-0000-000000000000')
  ));

DROP POLICY IF EXISTS "Terapeutas gestionan sus recomendaciones" ON therapist_recommendations;
CREATE POLICY "Terapeutas gestionan sus recomendaciones" 
  ON therapist_recommendations FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM patient_profiles 
    WHERE patient_profiles.id = therapist_recommendations.patient_id 
    AND (patient_profiles.therapist_id = auth.uid() OR patient_profiles.therapist_id = '00000000-0000-0000-0000-000000000000')
  ));

DROP POLICY IF EXISTS "Lectura de logs por terapeuta" ON activity_logs;
CREATE POLICY "Lectura de logs por terapeuta" 
  ON activity_logs FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM patient_profiles 
    WHERE patient_profiles.id = activity_logs.patient_id 
    AND (patient_profiles.therapist_id = auth.uid() OR patient_profiles.therapist_id = '00000000-0000-0000-0000-000000000000')
  ));

-- 8. Índices de Rendimiento
CREATE INDEX IF NOT EXISTS idx_patients_therapist ON patient_profiles(therapist_id);
CREATE INDEX IF NOT EXISTS idx_activity_patient ON activity_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_notes_patient ON therapist_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_recs_patient ON therapist_recommendations(patient_id);
