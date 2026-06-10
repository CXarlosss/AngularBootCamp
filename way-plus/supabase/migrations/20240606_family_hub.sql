-- Tabla de acceso familiar (vinculación padre-paciente)
create table family_access (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid not null references patients(id) on delete cascade,
  therapist_id uuid not null references profiles(id) on delete cascade,
  parent_email text,
  parent_phone text,
  access_token text not null unique, -- Magic link token
  access_enabled boolean not null default true,
  created_at timestamptz default now(),
  last_accessed_at timestamptz,
  notification_enabled boolean not null default true
);

-- RLS: Nadie lee directamente. Solo la Edge Function valida el token.
alter table family_access enable row level security;

-- Vista segura para padres (solo lectura)
create or replace view family_dashboard as
select 
  p.id as patient_id,
  p.name as patient_name,
  p.avatar_emoji,
  p.gender,
  pp.coins,
  pp.current_level,
  pp.completed_ways,
  array_length(pp.completed_ways, 1) as completed_ways_count,
  pp.accessibility_config,
  fa.access_token,
  fa.notification_enabled
from patients p
join patient_profiles pp on p.id = pp.patient_id
join family_access fa on p.id = fa.patient_id
where fa.access_enabled = true;

-- Política: solo el terapeuta puede gestionar family_access
create policy "family_access_therapist_manage"
on family_access for all
using (therapist_id = auth.uid());

-- Edge Function para validar token (sin auth)
-- Se accede via POST /functions/v1/family-auth con { token }
