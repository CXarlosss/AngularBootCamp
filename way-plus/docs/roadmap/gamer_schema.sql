-- Nivel GAMER: Mecánicas avanzadas
-- Añadir a tu schema actual cuando sea momento

-- Simulador Social (Point & Click)
create table social_scenarios (
  id uuid default gen_random_uuid() primary key,
  way_id text references ways(id),
  background_image text not null,
  npcs jsonb not null, -- [{id, sprite, x, y, emotion, dialogue}]
  hotspots jsonb not null, -- [{x, y, radius, action, consequence}]
  correct_sequence jsonb not null, -- ["talk", "empathize", "offer_help"]
  timeout_seconds integer default 60
);

-- Reconocimiento de Voz
create table voice_challenges (
  id uuid default gen_random_uuid() primary key,
  way_id text references ways(id),
  target_phrase text not null,
  allowed_variants jsonb, -- ["hola", "buenas", "qué tal"]
  pronunciation_hints text[],
  min_confidence float default 0.7
);

-- Misiones Geolocalizadas (Nivel PRO)
create table geo_missions (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references patients(id),
  title text not null,
  location_type text check (location_type in ('school', 'home', 'park', 'therapy_center')),
  verification_method text check (verification_method in ('qr_code', 'photo_upload', 'beacon proximity')),
  assigned_by uuid references profiles(id),
  completed_at timestamptz,
  proof_url text
);

-- Log de intentos de voz (para métricas de pronunciación)
create table voice_attempts (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references patients(id),
  challenge_id uuid references voice_challenges(id),
  audio_url text,
  transcription text,
  confidence_score float,
  matched boolean,
  created_at timestamptz default now()
);
