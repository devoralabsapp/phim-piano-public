# The 32-lesson course

**English** | [Tiếng Việt](COURSE.vi.md)

Each level contains eight lessons. Filter by level or open any lesson; existing lesson IDs and practice history remain compatible. Lessons and feedback are available in English and Vietnamese.

| Level | Topics |
| --- | --- |
| Beginner | Keys, posture, five fingers, pulse, first melodies, left hand, chords, and review |
| Foundation | C major hands separately, G/F major and natural A minor, eighth notes and rests, articulation, I–IV–V–I |
| Intermediate | Two-octave scales, arpeggios, chord inversions, hands together, Alberti bass, waltz accompaniment, syncopation, ii–V–I |
| Advanced | Harmonic A minor, chromatic scales, diminished arpeggios, seventh-chord inversions, melody voicing, 3-against-2, secondary dominants, and an original étude |

Start at the lesson's slow practice tempo. Increase by about 5 BPM when comfortable and steady; target tempos are suggestions, not completion requirements. Practice hands separately before combining them. Stop and adjust if you feel pain or tension.

Playback includes every note in a group and its beat duration, including rests. The screen keyboard follows the lesson's range and scrolls horizontally. You can tap chord notes individually on screen. MIDI chords require freshly pressing and holding every group note together, then releasing before proceeding. In pitch mode, count rests yourself and continue.

**Rhythm scoring** follows a clock with a one-bar count-in and evaluates timing, missing/extra notes, and MIDI hold duration. Early/late feedback uses a tolerance of min(120 ms, 18% of a beat). Events match the nearest corresponding pitch within min(400 ms, 60% of a beat); remaining events are missing/extra. Scores combine pitch and timing and penalize extra notes. Hold duration comes from note-off rather than acoustic sustain. Pedal, posture, and voice quality are not assessed.

Notation supports treble/bass clefs, accidentals, note lengths, dots, rests, and triplet indicators. It is a practice view rather than a full multi-voice engraving engine. Select a hand and section before playback or practice. Tap a note to restart there; completing a lesson requires playing the whole lesson.

The **music library** has 10 practice pieces with source/composer information. Simplified arrangements are prepared for Piano Sprout without copying commercial recordings or arrangements. Minuet in G is credited to Christian Petzold ([source](https://imslp.org/wiki/Minuet_%28Pezold%2C_Christian%29)); the garden waltz and nocturne are original pieces.

The **practice room** includes animated technique guides, four-bar sight-reading at three levels, and a placement assessment. Recommendations use recent practice results. They are not certificate grades or a teacher's performance assessment. Technique exercises require learners to listen and adjust their own playing.

Microphone input detects one note at a time in C2–C7 and processes it locally without recording/uploading audio. It releases the stream when changing input, closing practice, or entering the background. Use MIDI for chords and headphones to reduce click/background interference. Microphone rhythm feedback is approximate.

Databases created before the course expansion need the missing `202610140002_extended_course.sql` and `202610140003_practice_assessments.sql` migrations to accept the newer lesson IDs. Preserve the Row Level Security policies.
