-- Phím initial setup for a NEW Supabase project.
-- Run this entire file once in SQL Editor. Existing projects: apply missing migrations individually.

begin;

-- 202610140001_practice_sessions.sql
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

-- 202610140002_extended_course.sql
-- Expand the allowed lesson IDs without changing existing practice records or RLS.
alter table public.practice_sessions drop constraint if exists practice_sessions_lesson_id_check;
alter table public.practice_sessions add constraint practice_sessions_lesson_id_check
  check (lesson_id in ('keys', 'fingers', 'rhythm', 'joy', 'left', 'chord', 'twinkle', 'review', 'c-scale-rh', 'c-scale-lh', 'g-major', 'f-major', 'a-natural-minor', 'eighth-rests', 'articulation', 'primary-chords', 'c-two-octaves', 'c-arpeggio', 'triad-inversions', 'parallel-hands', 'alberti-bass', 'waltz-accompaniment', 'syncopation', 'ii-v-i', 'a-harmonic-minor', 'chromatic-scale', 'diminished-arpeggio', 'dominant-inversions', 'melody-voicing', 'three-against-two', 'secondary-dominant', 'advanced-etude', 'daily'));

-- 202610140003_practice_assessments.sql
-- Preserve all existing sessions and RLS policies.
alter table public.practice_sessions add column if not exists assessment jsonb;
alter table public.practice_sessions drop constraint if exists practice_sessions_lesson_id_check;
alter table public.practice_sessions add constraint practice_sessions_lesson_id_check
  check (lesson_id in ('keys', 'fingers', 'rhythm', 'joy', 'left', 'chord', 'twinkle', 'review', 'c-scale-rh', 'c-scale-lh', 'g-major', 'f-major', 'a-natural-minor', 'eighth-rests', 'articulation', 'primary-chords', 'c-two-octaves', 'c-arpeggio', 'triad-inversions', 'parallel-hands', 'alberti-bass', 'waltz-accompaniment', 'syncopation', 'ii-v-i', 'a-harmonic-minor', 'chromatic-scale', 'diminished-arpeggio', 'dominant-inversions', 'melody-voicing', 'three-against-two', 'secondary-dominant', 'advanced-etude', 'daily', 'placement', 'sight-reading', 'song-ode', 'song-twinkle', 'song-frere', 'song-mary', 'song-london', 'song-clair', 'song-grace', 'song-minuet', 'song-garden', 'song-night'));
alter table public.practice_sessions add constraint practice_sessions_assessment_object_check
  check (assessment is null or jsonb_typeof(assessment) = 'object');

-- 202610140004_session_privileges.sql
-- Supabase default table grants may include privileges outside row-level security.
-- The application needs only the four operations covered by its RLS policies.
revoke truncate, references, trigger on table public.practice_sessions from authenticated;


commit;
