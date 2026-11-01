import { describe, it, expect } from "vitest";
import { lessons, eventPitches, type Note } from "../src/lib/curriculum";
import { libraryPieces } from "../src/lib/library";
import {
  evaluateRhythm,
  handNotes,
  phraseRanges,
  sightReading,
  recommendLesson,
  type Assessment,
} from "../src/lib/practice";
import { detectPitch } from "../src/lib/pitch";
import {
  validSession,
  validAssessment,
  type PracticeSession,
} from "../src/lib/domain";
import { english } from "../src/lib/locales/en";
import { staffPosition } from "../src/components/Score";
const notes: Note[] = [
  { midi: 60, beats: 1 },
  { midi: 62, beats: 1 },
  { midi: 64, beats: 2 },
];
const assessment: Assessment = {
  kind: "rhythm",
  bpm: 60,
  pitchAccuracy: 100,
  timingAccuracy: 100,
  score: 100,
  early: 0,
  late: 0,
  missed: 0,
  extra: 0,
  hand: "all",
  start: 0,
  end: 2,
  input: "midi",
};
const session: PracticeSession = {
  id: "a",
  lesson_id: "keys",
  started_at: "2026-10-14T12:00:00Z",
  active_seconds: 4,
  correct_notes: 3,
  wrong_notes: 0,
  completed: false,
  input_mode: "midi",
  assessment,
};
describe("timed practice", () => {
  it("scores perfect attacks and MIDI releases independently", () => {
    const r = evaluateRhythm(
      notes,
      60,
      [
        { note: 60, on: true, at: 1000 },
        { note: 60, on: false, at: 2000 },
        { note: 62, on: true, at: 2000 },
        { note: 62, on: false, at: 3000 },
        { note: 64, on: true, at: 3000 },
        { note: 64, on: false, at: 5000 },
      ],
      1000,
    );
    expect(r.score).toBe(100);
    expect(r.durationAccuracy).toBe(100);
    expect(r.details.map((d) => d.status)).toEqual([
      "on-time",
      "on-time",
      "on-time",
    ]);
  });
  it("reports early, late, missing, wrong and extra notes without shifting the clock", () => {
    const r = evaluateRhythm(
      notes,
      60,
      [
        { note: 60, on: true, at: 800 },
        { note: 62, on: true, at: 2200 },
        { note: 65, on: true, at: 3000 },
      ],
      1000,
    );
    expect(r).toMatchObject({
      early: 1,
      late: 1,
      missed: 1,
      extra: 1,
      pitchAccuracy: 67,
      timingAccuracy: 0,
    });
  });
  it("requires fresh attacks for repeated notes and all pitches in a chord", () => {
    const r = evaluateRhythm(
      [
        { midi: 60, chord: [64, 67], beats: 1 },
        { midi: 60, beats: 1 },
      ],
      60,
      [
        { note: 60, on: true, at: 1000 },
        { note: 64, on: true, at: 1000 },
      ],
      1000,
    );
    expect(r.missed).toBe(2);
    expect(r.correct).toBe(2);
  });
  it("counts attacks in rests as extra notes and measures short releases", () => {
    const r = evaluateRhythm(
      [
        { midi: 60, beats: 1 },
        { midi: 60, beats: 1, rest: true },
      ],
      60,
      [
        { note: 60, on: true, at: 1000 },
        { note: 60, on: false, at: 1150 },
        { note: 62, on: true, at: 2000 },
      ],
      1000,
    );
    expect(r.extra).toBe(1);
    expect(r.durationAccuracy).toBe(0);
    expect(r.details[1].status).toBe("rest");
  });
  it("assigns repeated-pitch attacks to the nearest target and tolerates finite MIDI latency", () => {
    const r = evaluateRhythm(
      [
        { midi: 60, beats: 0.5 },
        { midi: 60, beats: 0.5 },
      ],
      60,
      [
        { note: 60, on: true, at: 1530 },
        { note: 60, on: true, at: 1030 },
      ],
      1000,
    );
    expect(r.score).toBe(100);
    expect(r.details.map((d) => d.offsetMs)).toEqual([30, 30]);
  });
  it("preserves time when isolating each hand", () => {
    const lesson = lessons.find((l) => l.id === "parallel-hands")!,
      left = handNotes(lesson, "left"),
      right = handNotes(lesson, "right");
    expect(left.map((n) => n.beats)).toEqual(lesson.notes.map((n) => n.beats));
    expect(left.flatMap(eventPitches).every((p) => p <= 60)).toBe(true);
    expect(right.flatMap(eventPitches).every((p) => p >= 60)).toBe(true);
    expect(left.some((n) => eventPitches(n).includes(60))).toBe(true);
    expect(phraseRanges(lesson.notes).at(-1)?.end).toBe(
      lesson.notes.length - 1,
    );
  });
  it("creates reproducible new reading challenges lasting four complete bars", () => {
    for (const level of [1, 2, 3] as const) {
      const l = sightReading(level, 41);
      expect(l).toEqual(sightReading(level, 41));
      expect(l.notes.reduce((s, n) => s + n.beats, 0)).toBe(16);
      expect(l.notes).not.toEqual(sightReading(level, 42).notes);
    }
  });
  it("recommends a weak recent lesson and uses placement without changing completion", () => {
    const weak = {
      ...session,
      lesson_id: "c-scale-rh",
      assessment: { ...assessment, score: 60, timingAccuracy: 20 },
    };
    expect(recommendLesson(lessons, [weak])).toMatchObject({
      lesson: { id: "c-scale-rh" },
      reason: "Luyện lại nhịp ở tốc độ chậm hơn.",
    });
    const recovered = {
      ...weak,
      id: "new",
      started_at: "2026-10-15T12:00:00Z",
      assessment: { ...assessment, score: 100 },
    };
    expect(recommendLesson(lessons, [weak, recovered]).lesson.id).toBe("keys");
    const placement = {
      ...session,
      lesson_id: "placement",
      assessment: {
        ...assessment,
        kind: "placement" as const,
        readingLevel: 3 as const,
      },
    };
    expect(recommendLesson(lessons, [placement]).lesson.level).toBe(
      "intermediate",
    );
  });
  it("validates new assessment records while accepting old sessions", () => {
    expect(validSession(session)).toBe(true);
    const { assessment: _, ...old } = session;
    expect(validSession(old)).toBe(true);
    expect(validAssessment({ ...assessment, score: NaN })).toBe(false);
    expect(validSession({ ...session, assessment: {} })).toBe(false);
  });
});
describe("library and notation", () => {
  it("contains ten independent arrangements with playable, finite note durations", () => {
    expect(libraryPieces).toHaveLength(10);
    expect(new Set(libraryPieces.map((l) => l.id)).size).toBe(10);
    for (const l of libraryPieces) {
      expect(l.notes.length).toBeGreaterThan(10);
      for (const n of l.notes) {
        expect(Number.isFinite(n.beats)).toBe(true);
        expect(n.beats).toBeGreaterThan(0);
        expect(eventPitches(n).every((p) => p >= 21 && p <= 108)).toBe(true);
      }
      for (const s of [
        l.title,
        l.intro,
        l.topic,
        l.credit,
        l.question,
        ...l.steps,
        ...l.answers,
      ])
        if (/[À-ỹ]/.test(s)) expect(Object.hasOwn(english, s), s).toBe(true);
    }
  });
  it("accepts saved progress for every course, library and practice exercise", () => {
    for (const id of [...lessons, ...libraryPieces]
      .map((lesson) => lesson.id)
      .concat(["placement", "sight-reading", "daily"])) {
      expect(validSession({ ...session, lesson_id: id }), id).toBe(true);
    }
  });
  it("positions natural, sharp and flat notes on the appropriate staff degree", () => {
    expect(staffPosition(64, "treble")).toBe(132);
    expect(staffPosition(60, "treble")).toBe(142);
    expect(staffPosition(43, "bass")).toBe(252);
    expect(staffPosition(61, "treble")).toBe(staffPosition(60, "treble"));
    expect(staffPosition(61, "treble", true)).toBe(staffPosition(62, "treble"));
  });
});
describe("on-device single-note detection", () => {
  const wave = (frequency: number, harmonics = false) =>
    Float32Array.from(
      { length: 2048 },
      (_, i) =>
        0.3 * Math.sin((2 * Math.PI * frequency * i) / 44100) +
        (harmonics ? 0.1 * Math.sin((4 * Math.PI * frequency * i) / 44100) : 0),
    );
  it("recognizes piano-range sine tones and fundamentals with harmonics", () => {
    for (const [frequency, midi] of [
      [130.81, 48],
      [261.63, 60],
      [440, 69],
      [1046.5, 84],
    ]) {
      expect(detectPitch(wave(frequency), 44100)?.midi).toBe(midi);
      expect(detectPitch(wave(frequency, true), 44100)?.midi).toBe(midi);
    }
  });
  it("rejects silence, quiet input and out-of-tune tones", () => {
    expect(detectPitch(new Float32Array(2048), 44100)).toBeNull();
    expect(
      detectPitch(
        Float32Array.from(wave(440), (x) => x * 0.001),
        44100,
      ),
    ).toBeNull();
    expect(detectPitch(wave(453), 44100)).toBeNull();
  });
});
