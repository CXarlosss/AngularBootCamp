-- ═══════════════════════════════════════════════════════════════
-- WAY+ Supabase Schema v2.0 — Backend real
-- Tablas: profiles, therapists, parents, patients, levels, progress, sessions, rewards
-- ═══════════════════════════════════════════════════════════════

-- Extensiones
create extension if not exists "uuid-ossp";

-- ─── ENUMS ───
create type user_role as enum ('therapist', 'parent', 'child');
create type patient_status as enum ('active', 'paused', 'completed');
create type session_status as enum ('started', 'completed', 'abandoned');
create type reward_type as enum ('star', 'coin', 'chest', 'badge', 'milestone');

-- ─── PROFILES (extiende auth.users) ───
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  role user_role not null default 'child',
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── THERAPISTS ───
create table therapists (
  id uuid references profiles(id) on delete cascade primary key,
  license_number text unique,
  specialization text,
  clinic_name text,
  is_verified boolean default false,
  created_at timestamptz default now()
);

-- ─── PARENTS ───
create table parents (
  id uuid references profiles(id) on delete cascade primary key,
  phone text,
  email text,
  created_at timestamptz default now()
);

-- ─── PATIENTS (niños) ───
create table patients (
  id uuid default uuid_generate_v4() primary key,
  therapist_id uuid references therapists(id) on delete set null,
  parent_id uuid references parents(id) on delete set null,
  pin_code text, -- 4 dígitos para login rápido del niño
  display_name text not null,
  age integer check (age between 3 and 18),
  character_id text default 'luna', -- luna, nube, roble, chispa
  status patient_status default 'active',
  onboarding_completed boolean default false,
  current_streak integer default 0,
  max_streak integer default 0,
  total_stars integer default 0,
  total_coins integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── LEVELS (creados por terapeutas o sistema) ───
create table levels (
  id uuid default uuid_generate_v4() primary key,
  therapist_id uuid references therapists(id) on delete cascade,
  title text not null,
  description text,
  difficulty integer check (difficulty between 1 and 10),
  category text, -- atencion, regulacion, memoria, etc.
  order_index integer not null,
  is_template boolean default false,
  config jsonb default '{}', -- configuración específica del nivel
  created_at timestamptz default now()
);

-- ─── TASKS (subtareas dentro de un nivel) ───
create table tasks (
  id uuid default uuid_generate_v4() primary key,
  level_id uuid references levels(id) on delete cascade,
  title text not null,
  description text,
  order_index integer not null,
  type text default 'tap', -- tap, drag, hold, trace, etc.
  config jsonb default '{}',
  created_at timestamptz default now()
);

-- ─── PATIENT_LEVELS (progreso del niño por nivel) ───
create table patient_levels (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references patients(id) on delete cascade,
  level_id uuid references levels(id) on delete cascade,
  status text default 'locked', -- locked, available, current, completed
  score integer default 0,
  attempts integer default 0,
  best_time_ms integer,
  completed_at timestamptz,
  created_at timestamptz default now(),
  unique(patient_id, level_id)
);

-- ─── PATIENT_TASKS (progreso por subtarea) ───
create table patient_tasks (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references patients(id) on delete cascade,
  task_id uuid references tasks(id) on delete cascade,
  status text default 'locked', -- locked, current, completed
  attempts integer default 0,
  completed_at timestamptz,
  created_at timestamptz default now(),
  unique(patient_id, task_id)
);

-- ─── SESSIONS (sesiones de juego) ───
create table sessions (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references patients(id) on delete cascade,
  level_id uuid references levels(id) on delete set null,
  status session_status default 'started',
  duration_seconds integer default 0,
  score integer default 0,
  frustration_events integer default 0,
  help_requests integer default 0,
  device_info jsonb default '{}',
  started_at timestamptz default now(),
  ended_at timestamptz
);

-- ─── REWARDS ───
create table rewards (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references patients(id) on delete cascade,
  type reward_type not null,
  title text not null,
  description text,
  is_claimed boolean default false,
  claimed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- ─── ACHIEVEMENTS (logros desbloqueados) ───
create table achievements (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references patients(id) on delete cascade,
  key text not null, -- nivel_5_completado, racha_7_dias, etc.
  title text not null,
  emoji text,
  unlocked_at timestamptz default now()
);

-- ─── THERAPIST_NOTES ───
create table therapist_notes (
  id uuid default uuid_generate_v4() primary key,
  therapist_id uuid references therapists(id) on delete cascade,
  patient_id uuid references patients(id) on delete cascade,
  content text not null,
  is_visible_to_parent boolean default false,
  created_at timestamptz default now()
);

-- ─── INDICES ───
create index idx_patients_therapist on patients(therapist_id);
create index idx_patients_parent on patients(parent_id);
create index idx_patient_levels_patient on patient_levels(patient_id);
create index idx_patient_tasks_patient on patient_tasks(patient_id);
create index idx_sessions_patient on sessions(patient_id);
create index idx_sessions_started on sessions(started_at);
create index idx_rewards_patient on rewards(patient_id);
create index idx_achievements_patient on achievements(patient_id);

-- ─── TRIGGERS: updated_at ───
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on profiles
  for each row execute function update_updated_at();
create trigger patients_updated_at before update on patients
  for each row execute function update_updated_at();
