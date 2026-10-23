-- Preserve all existing sessions and RLS policies.
alter table public.practice_sessions add column if not exists assessment jsonb;
alter table public.practice_sessions drop constraint if exists practice_sessions_lesson_id_check;
alter table public.practice_sessions add constraint practice_sessions_lesson_id_check
  check (lesson_id in ('keys', 'fingers', 'rhythm', 'joy', 'left', 'chord', 'twinkle', 'review', 'c-scale-rh', 'c-scale-lh', 'g-major', 'f-major', 'a-natural-minor', 'eighth-rests', 'articulation', 'primary-chords', 'c-two-octaves', 'c-arpeggio', 'triad-inversions', 'parallel-hands', 'alberti-bass', 'waltz-accompaniment', 'syncopation', 'ii-v-i', 'a-harmonic-minor', 'chromatic-scale', 'diminished-arpeggio', 'dominant-inversions', 'melody-voicing', 'three-against-two', 'secondary-dominant', 'advanced-etude', 'daily', 'placement', 'sight-reading', 'song-ode', 'song-twinkle', 'song-frere', 'song-mary', 'song-london', 'song-clair', 'song-grace', 'song-minuet', 'song-garden', 'song-night'));
alter table public.practice_sessions add constraint practice_sessions_assessment_object_check
  check (assessment is null or jsonb_typeof(assessment) = 'object');
