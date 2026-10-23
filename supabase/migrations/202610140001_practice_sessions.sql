create table public.practice_sessions (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null check (lesson_id in ('keys','fingers','rhythm','joy','left','chord','twinkle','review','daily')),
  started_at timestamptz not null,
  active_seconds integer not null check (active_seconds between 0 and 86400),
  correct_notes integer not null default 0 check (correct_notes >= 0),
  wrong_notes integer not null default 0 check (wrong_notes >= 0),
  completed boolean not null default false,
  input_mode text not null check (input_mode in ('screen','midi','manual'))
);
create index practice_sessions_user_date on public.practice_sessions(user_id, started_at desc);
alter table public.practice_sessions enable row level security;
revoke all on public.practice_sessions from anon;
grant select, insert, update, delete on public.practice_sessions to authenticated;
create policy "Read own sessions" on public.practice_sessions for select to authenticated using ((select auth.uid()) = user_id);
create policy "Insert own sessions" on public.practice_sessions for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own sessions" on public.practice_sessions for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Delete own sessions" on public.practice_sessions for delete to authenticated using ((select auth.uid()) = user_id);
