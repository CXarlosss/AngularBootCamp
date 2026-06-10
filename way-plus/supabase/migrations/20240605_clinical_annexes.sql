-- Tabla de anexos clínicos digitales
create table clinical_annexes (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid not null references patient_profiles(id) on delete cascade,
  therapist_id uuid not null references profiles(id) on delete cascade,
  week_start date not null,
  type text not null check (type in ('relaxation', 'selfcheck', 'roleplay')),
  content jsonb not null default '{}',
  auto_data jsonb not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'completed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(patient_id, week_start, type)
);

-- Índices para rendimiento
create index idx_clinical_annexes_patient on clinical_annexes(patient_id);
create index idx_clinical_annexes_week on clinical_annexes(week_start);
create index idx_clinical_annexes_type on clinical_annexes(type);

-- RLS
alter table clinical_annexes enable row level security;

create policy "clinical_annexes_select"
on clinical_annexes for select
using (therapist_id = auth.uid());

create policy "clinical_annexes_insert"
on clinical_annexes for insert
with check (therapist_id = auth.uid());

create policy "clinical_annexes_update"
on clinical_annexes for update
using (therapist_id = auth.uid());

create policy "clinical_annexes_delete"
on clinical_annexes for delete
using (therapist_id = auth.uid());

-- Trigger updated_at
create or replace function update_clinical_annexes_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trigger_clinical_annexes_updated_at
before update on clinical_annexes
for each row execute function update_clinical_annexes_updated_at();
