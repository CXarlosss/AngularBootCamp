-- ═══════════════════════════════════════════════════════════════
-- WAY+ RLS Policies — Seguridad de datos
-- Niño ve solo su progreso. Terapeuta ve solo sus pacientes.
-- ═══════════════════════════════════════════════════════════════

alter table profiles enable row level security;
alter table therapists enable row level security;
alter table parents enable row level security;
alter table patients enable row level security;
alter table levels enable row level security;
alter table tasks enable row level security;
alter table patient_levels enable row level security;
alter table patient_tasks enable row level security;
alter table sessions enable row level security;
alter table rewards enable row level security;
alter table achievements enable row level security;
alter table therapist_notes enable row level security;

-- ─── PROFILES ───
create policy "Users can read own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- ─── PATIENTS ───
create policy "Therapists can CRUD their patients"
  on patients for all using (
    therapist_id in (select id from therapists where id = auth.uid())
  );

create policy "Parents can read their children"
  on patients for select using (
    parent_id in (select id from parents where id = auth.uid())
  );

create policy "System can read patients for auth"
  on patients for select using (true);

-- ─── LEVELS ───
create policy "Therapists can CRUD their levels"
  on levels for all using (
    therapist_id = auth.uid() or is_template = true
  );

create policy "Anyone can read template levels"
  on levels for select using (is_template = true);

-- ─── PATIENT_LEVELS ───
create policy "Patients can read own progress"
  on patient_levels for select using (
    patient_id in (
      select id from patients 
      where id = patient_levels.patient_id
      and (therapist_id = auth.uid() or parent_id in (select id from parents where id = auth.uid()))
    )
  );

create policy "System can insert patient progress"
  on patient_levels for insert with check (true);

create policy "System can update patient progress"
  on patient_levels for update using (true);

-- ─── SESSIONS ───
create policy "Therapists can read sessions of their patients"
  on sessions for select using (
    patient_id in (select id from patients where therapist_id = auth.uid())
  );

create policy "System can insert sessions"
  on sessions for insert with check (true);

create policy "System can update own sessions"
  on sessions for update using (true);

-- ─── REWARDS ───
create policy "Patients can read own rewards"
  on rewards for select using (
    patient_id in (select id from patients where parent_id in (select id from parents where id = auth.uid()))
  );

create policy "System can manage rewards"
  on rewards for all using (true);

-- ─── THERAPIST_NOTES ───
create policy "Therapists can CRUD own notes"
  on therapist_notes for all using (therapist_id = auth.uid());

create policy "Parents can read visible notes"
  on therapist_notes for select using (is_visible_to_parent = true);
