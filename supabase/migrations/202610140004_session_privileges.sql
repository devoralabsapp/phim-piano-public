-- Supabase default table grants may include privileges outside row-level security.
-- The application needs only the four operations covered by its RLS policies.
revoke truncate, references, trigger on table public.practice_sessions from authenticated;
