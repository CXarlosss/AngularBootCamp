-- ═══════════════════════════════════════════════════════════════
-- FitCoach — migration completo v1.0
-- Ejecutar íntegramente en Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Profiles ──────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null default '',
  role        text not null default 'client' check (role in ('coach', 'client')),
  avatar_url  text,
  coach_id    uuid references public.profiles(id),
  created_at  timestamptz default now()
);

-- ── 2. Invite codes ──────────────────────────────────────────
create table if not exists public.invite_codes (
  id          uuid primary key default gen_random_uuid(),
  code        text unique not null,
  coach_id    uuid not null references public.profiles(id) on delete cascade,
  used_by     uuid references public.profiles(id),
  created_at  timestamptz default now(),
  expires_at  timestamptz default (now() + interval '30 days')
);

-- ── 3. Routines ───────────────────────────────────────────────
create table if not exists public.routines (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  goal        text not null default 'hypertrophy',
  coach_id    uuid not null references public.profiles(id) on delete cascade,
  is_template boolean not null default false,
  created_at  timestamptz default now()
);

create table if not exists public.routine_days (
  id          uuid primary key default gen_random_uuid(),
  routine_id  uuid not null references public.routines(id) on delete cascade,
  day_number  int not null check (day_number between 1 and 7),
  label       text not null default ''
);

create table if not exists public.routine_exercises (
  id            uuid primary key default gen_random_uuid(),
  day_id        uuid not null references public.routine_days(id) on delete cascade,
  exercise_name text not null,
  sets          int not null default 3,
  reps          int not null default 10,
  target_weight numeric(6,2),
  rest_seconds  int not null default 90,
  notes         text default ''
);

-- ── 4. Assigned routines ──────────────────────────────────────
create table if not exists public.assigned_routines (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.profiles(id) on delete cascade,
  routine_id  uuid not null references public.routines(id) on delete cascade,
  start_date  date not null default current_date,
  status      text not null default 'active'
              check (status in ('active', 'completed', 'paused'))
);

-- ── 5. Workout logs ───────────────────────────────────────────
create table if not exists public.workout_logs (
  id                  uuid primary key default gen_random_uuid(),
  client_id           uuid not null references public.profiles(id) on delete cascade,
  assigned_routine_id uuid references public.assigned_routines(id),
  logged_date         date not null default current_date,
  completed           boolean not null default false,
  created_at          timestamptz default now()
);

create table if not exists public.set_logs (
  id              uuid primary key default gen_random_uuid(),
  workout_log_id  uuid not null references public.workout_logs(id) on delete cascade,
  exercise_id     uuid references public.routine_exercises(id),
  exercise_name   text not null,
  set_number      int not null,
  weight_kg       numeric(6,2) not null default 0,
  reps_done       int not null default 0
);

-- ── 6. Progress photos ────────────────────────────────────────
create table if not exists public.progress_photos (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references public.profiles(id) on delete cascade,
  storage_path  text not null,
  taken_date    date not null default current_date,
  notes         text default ''
);

-- ── 7. Messages ───────────────────────────────────────────────
create table if not exists public.messages (
  id           uuid primary key default gen_random_uuid(),
  sender_id    uuid references public.profiles(id) on delete cascade,
  receiver_id  uuid references public.profiles(id) on delete cascade,
  content      text not null,
  type         text not null default 'text'
               check (type in ('text', 'system', 'routine_card', 'photo')),
  metadata     jsonb,
  status       text not null default 'sent'
               check (status in ('sent', 'delivered', 'read')),
  created_at   timestamptz default now()
);

create index if not exists messages_conv_idx
  on public.messages (
    least(sender_id::text, receiver_id::text),
    greatest(sender_id::text, receiver_id::text),
    created_at
  );

-- ── 8. Índices de rendimiento ─────────────────────────────────
create index if not exists workout_logs_client_idx on public.workout_logs(client_id, logged_date);
create index if not exists set_logs_workout_idx    on public.set_logs(workout_log_id);
create index if not exists assigned_routines_idx   on public.assigned_routines(client_id, status);

-- ── 9. RLS ────────────────────────────────────────────────────
alter table public.profiles          enable row level security;
alter table public.invite_codes      enable row level security;
alter table public.routines          enable row level security;
alter table public.routine_days      enable row level security;
alter table public.routine_exercises enable row level security;
alter table public.assigned_routines enable row level security;
alter table public.workout_logs      enable row level security;
alter table public.set_logs          enable row level security;
alter table public.progress_photos   enable row level security;
alter table public.messages          enable row level security;

-- Profiles
create policy "profiles_select" on public.profiles for select
  using (auth.uid() = id or coach_id = auth.uid()
    or id = (select coach_id from public.profiles where id = auth.uid()));
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- Invite codes
create policy "invite_read_all"   on public.invite_codes for select using (true);
create policy "invite_coach_write" on public.invite_codes for all using (coach_id = auth.uid());

-- Routines (coach gestiona las suyas, cliente lee las asignadas)
create policy "routines_coach"  on public.routines for all using (coach_id = auth.uid());
create policy "routines_client" on public.routines for select
  using (id in (select routine_id from public.assigned_routines where client_id = auth.uid()));

create policy "routine_days_access" on public.routine_days for select
  using (routine_id in (
    select id from public.routines where coach_id = auth.uid()
    union
    select routine_id from public.assigned_routines where client_id = auth.uid()
  ));
create policy "routine_days_coach" on public.routine_days for all
  using (routine_id in (select id from public.routines where coach_id = auth.uid()));

create policy "routine_ex_access" on public.routine_exercises for select
  using (day_id in (
    select rd.id from public.routine_days rd
    join public.routines r on r.id = rd.routine_id
    where r.coach_id = auth.uid()
       or r.id in (select routine_id from public.assigned_routines where client_id = auth.uid())
  ));
create policy "routine_ex_coach" on public.routine_exercises for all
  using (day_id in (
    select rd.id from public.routine_days rd
    join public.routines r on r.id = rd.routine_id
    where r.coach_id = auth.uid()
  ));

-- Assigned routines
create policy "assigned_client" on public.assigned_routines for select using (client_id = auth.uid());
create policy "assigned_coach"  on public.assigned_routines for all
  using (routine_id in (select id from public.routines where coach_id = auth.uid()));

-- Workout logs & sets
create policy "wlog_own"   on public.workout_logs for all using (client_id = auth.uid());
create policy "wlog_coach" on public.workout_logs for select
  using (client_id in (select id from public.profiles where coach_id = auth.uid()));
create policy "setlog_own" on public.set_logs for all
  using (workout_log_id in (select id from public.workout_logs where client_id = auth.uid()));
create policy "setlog_coach" on public.set_logs for select
  using (workout_log_id in (
    select wl.id from public.workout_logs wl
    join public.profiles p on p.id = wl.client_id
    where p.coach_id = auth.uid()
  ));

-- Photos
create policy "photos_own"   on public.progress_photos for all using (client_id = auth.uid());
create policy "photos_coach" on public.progress_photos for select
  using (client_id in (select id from public.profiles where coach_id = auth.uid()));

-- Messages
create policy "messages_participants" on public.messages for all
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- ── 10. Realtime ──────────────────────────────────────────────
alter publication supabase_realtime add table public.messages;

-- ── 11. Trigger auto-perfil ───────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, '', 'client')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
