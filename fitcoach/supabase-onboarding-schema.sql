-- ── Tabla de perfiles (extiende auth.users de Supabase) ──────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  role        text not null check (role in ('coach', 'client')),
  avatar_url  text,
  coach_id    uuid references public.profiles(id),  -- solo clientes
  created_at  timestamptz default now()
);

-- ── Códigos de invitación ────────────────────────────────────────────
create table public.invite_codes (
  id          uuid primary key default gen_random_uuid(),
  code        text unique not null,        -- ej: "CARLOS-A3F7"
  coach_id    uuid not null references public.profiles(id),
  used_by     uuid references public.profiles(id), -- null = disponible
  created_at  timestamptz default now(),
  expires_at  timestamptz default (now() + interval '30 days')
);

-- ── Row Level Security ────────────────────────────────────────────────
alter table public.profiles    enable row level security;
alter table public.invite_codes enable row level security;

-- Cada usuario solo ve su propio perfil y el de sus clientes/coach
create policy "profiles: select own and related"
  on public.profiles for select
  using (
    auth.uid() = id
    or coach_id = auth.uid()          -- coach ve sus clientes
    or id = (                          -- cliente ve su coach
      select coach_id from public.profiles where id = auth.uid()
    )
  );

create policy "profiles: insert own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id);

-- Códigos: coach ve los suyos, cualquiera puede leer un código para validarlo
create policy "invite_codes: coach manages own"
  on public.invite_codes for all
  using (coach_id = auth.uid());

create policy "invite_codes: anyone can read to validate"
  on public.invite_codes for select
  using (true);

-- ── Trigger: crear perfil vacío al registrarse ────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  -- El rol y nombre se rellenan en el onboarding, no aquí
  insert into public.profiles (id, full_name, role)
  values (new.id, '', 'client');     -- default client, onboarding lo corrige
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
