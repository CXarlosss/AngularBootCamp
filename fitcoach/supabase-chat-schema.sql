-- ── Mensajes con tipos extendidos ────────────────────────────────────
create table public.messages (
  id           uuid primary key default gen_random_uuid(),
  sender_id    uuid references public.profiles(id) on delete cascade,
  receiver_id  uuid references public.profiles(id) on delete cascade,
  content      text not null,
  type         text not null default 'text'
               check (type in ('text', 'system', 'routine_card', 'photo')),
  metadata     jsonb,           -- payload extra según el tipo
  status       text not null default 'sent'
               check (status in ('sent', 'delivered', 'read')),
  created_at   timestamptz default now()
);

-- Índice para cargar conversación entre dos usuarios eficientemente
create index messages_conversation_idx
  on public.messages (
    least(sender_id::text, receiver_id::text),
    greatest(sender_id::text, receiver_id::text),
    created_at
  );

-- RLS: solo los participantes ven sus mensajes
alter table public.messages enable row level security;

create policy "messages: participants only"
  on public.messages for all
  using (
    auth.uid() = sender_id or
    auth.uid() = receiver_id
  );

-- Habilitar Realtime para esta tabla en Supabase
alter publication supabase_realtime add table public.messages;
