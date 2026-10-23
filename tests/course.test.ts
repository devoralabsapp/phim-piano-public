import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  lessons,
  eventPitches,
  keyboardRange,
  noteName,
  scientificName,
} from "../src/lib/curriculum";
import { levels } from "../src/lib/course";
import { matchesGroup, samePitches } from "../src/lib/training";
import { beatLabel } from "../src/lib/locale";
describe("expanded course", () => {
  it("preserves the original lesson IDs and adds eight lessons per level", () => {
    expect(lessons.slice(0, 8).map((l) => l.id)).toEqual([
      "keys",
      "fingers",
      "rhythm",
      "joy",
      "left",
      "chord",
      "twinkle",
      "review",
    ]);
    expect(lessons.length).toBe(32);
    for (const level of levels)
      expect(lessons.filter((l) => l.level === level.id)).toHaveLength(8);
  });
  it("covers chromatic pitches, multiple octaves, grouped notes, rests, and shorter subdivisions", () => {
    const advanced = lessons.filter((l) => l.level === "advanced");
    expect(
      advanced.some((l) => l.notes.some((n) => eventPitches(n).length > 1)),
    ).toBe(true);
    expect(advanced.some((l) => l.notes.some((n) => n.rest))).toBe(true);
    expect(advanced.some((l) => l.notes.some((n) => n.beats === 0.25))).toBe(
      true,
    );
    expect(
      advanced.some(
        (l) => keyboardRange(l.notes).end - keyboardRange(l.notes).base >= 24,
      ),
    ).toBe(true);
    expect(noteName(58, "en", true)).toBe("B♭");
    expect(scientificName(58, true)).toBe("B♭3");
    expect(beatLabel("en", 2 / 3)).toBe("⅔ beats");
  });
  it("keeps the extended database constraint in sync with the course", () => {
    const migration = readFileSync(
      "supabase/migrations/202610140002_extended_course.sql",
      "utf8",
    );
    const ids = [...migration.matchAll(/'([a-z-]+)'/g)].map((m) => m[1]);
    expect(new Set(ids)).toEqual(
      new Set([...lessons.map((l) => l.id), "daily"]),
    );
  });
  it("keeps the 3:2 attack positions and 3/4 accompaniment mathematically consistent", () => {
    const poly = lessons.find((l) => l.id === "three-against-two")!;
    expect(poly.notes.slice(0, 4).reduce((n, e) => n + e.beats, 0)).toBeCloseTo(
      2,
    );
    expect(poly.notes.slice(0, 4).map(eventPitches)).toEqual([
      [48, 60],
      [64],
      [55],
      [67],
    ]);
    const waltz = lessons.find((l) => l.id === "waltz-accompaniment")!;
    expect(waltz.meter).toBe(3);
    expect(waltz.notes.reduce((n, e) => n + e.beats, 0) % 3).toBe(0);
  });
});
describe("grouped-note feedback", () => {
  const chord = { midi: 60, chord: [64, 67], beats: 4 };
  it("only accepts complete screen groups regardless of order", () => {
    expect(matchesGroup(chord, [67, 60], [], "screen")).toBe(false);
    expect(matchesGroup(chord, [67, 60, 64], [], "screen")).toBe(true);
    expect(samePitches([60, 64, 67], [60, 60, 64])).toBe(false);
  });
  it("requires fresh attacks and all chord keys held together on MIDI", () => {
    expect(matchesGroup(chord, [60, 64], [60, 64, 67], "midi")).toBe(false);
    expect(matchesGroup(chord, [60, 64, 67], [60, 64], "midi")).toBe(false);
    expect(matchesGroup(chord, [60, 64, 67], [60, 64, 67, 69], "midi")).toBe(
      false,
    );
    expect(matchesGroup(chord, [60, 64, 67], [67, 64, 60], "midi")).toBe(true);
  });
  it("allows overlapping keys for single-note legato and never grades a rest as a note", () => {
    expect(matchesGroup({ midi: 62, beats: 1 }, [62], [60, 62], "midi")).toBe(
      true,
    );
    expect(
      matchesGroup({ midi: 60, beats: 1, rest: true }, [], [], "screen"),
    ).toBe(false);
  });
});
