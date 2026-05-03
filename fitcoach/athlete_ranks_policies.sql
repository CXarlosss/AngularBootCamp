-- athlete_ranks table and policies
create table if not exists public.athlete_ranks (
  client_id     uuid primary key references public.profiles(id) on delete cascade,
  xp_total      integer default 0,
  rank_level    integer default 0,
  days_xp       integer default 0,
  sets_xp       integer default 0,
  progress_xp   integer default 0,
  updated_at    timestamptz default now()
);

alter table public.athlete_ranks enable row level security;

-- Drop existing policies if any to avoid conflicts
do $$
begin
    drop policy if exists "athlete_ranks: select own" on public.athlete_ranks;
    drop policy if exists "athlete_ranks: insert own" on public.athlete_ranks;
    drop policy if exists "athlete_ranks: update own" on public.athlete_ranks;
    drop policy if exists "athlete_ranks: coach select clients" on public.athlete_ranks;
exception
    when others then null;
end $$;

create policy "athlete_ranks: select own"
  on public.athlete_ranks for select
  using (auth.uid() = client_id);

create policy "athlete_ranks: insert own"
  on public.athlete_ranks for insert
  with check (auth.uid() = client_id);

create policy "athlete_ranks: update own"
  on public.athlete_ranks for update
  using (auth.uid() = client_id);

-- Coach can see their clients' ranks
create policy "athlete_ranks: coach select clients"
  on public.athlete_ranks for select
  using (
    exists (
      select 1 from public.profiles
      where id = public.athlete_ranks.client_id
      and coach_id = auth.uid()
    )
  );
