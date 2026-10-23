import { describe, it, expect } from "vitest";
import {
  checkNote,
  accountImportId,
  mergeSessions,
  stats,
  streak,
  validSession,
  type PracticeSession,
} from "../src/lib/domain";
import { lessons, eventPitches, keyboardRange } from "../src/lib/curriculum";
const session = (id: string, day: number, seconds = 90): PracticeSession => ({
  id,
  lesson_id: "keys",
  started_at: new Date(2026, 9, day, 12).toISOString(),
  active_seconds: seconds,
  correct_notes: 8,
  wrong_notes: 1,
  completed: true,
  input_mode: "screen",
});
describe("progress", () => {
  it("counts distinct completed lessons, actual active minutes and local today", () => {
    const s = stats(
      [session("a", 14, 40), session("b", 14, 40), session("c", 13, 80)],
      new Date(2026, 9, 14, 15),
    );
    expect(s.completed.size).toBe(1);
    expect(s.totalMinutes).toBe(2);
    expect(s.todayMinutes).toBe(1);
  });
  it("counts consecutive days rather than total practice days", () => {
    expect(
      streak(
        [session("a", 14), session("b", 13), session("c", 10)],
        new Date(2026, 9, 14),
      ),
    ).toBe(2);
  });
  it("preserves streak until the end of the current day", () => {
    expect(
      streak([session("a", 13), session("b", 12)], new Date(2026, 9, 14)),
    ).toBe(2);
    expect(streak([session("a", 12)], new Date(2026, 9, 14))).toBe(0);
  });
  it("deduplicates retries and never replaces longer progress with stale data", () => {
    const a = session("a", 14, 120),
      b = session("a", 14, 30);
    expect(mergeSessions([a], [b])).toEqual([a]);
    expect(mergeSessions([b], [a])).toEqual([a]);
  });
  it("does not count zero-duration activity as a practice day", () => {
    expect(streak([session("a", 14, 0)], new Date(2026, 9, 14))).toBe(0);
  });
  it("rejects corrupt local storage sessions", () => {
    expect(validSession(null)).toBe(false);
    expect(validSession({ ...session("a", 14), active_seconds: -1 })).toBe(
      false,
    );
    expect(validSession({ ...session("a", 14), started_at: "bad" })).toBe(
      false,
    );
    expect(validSession(session("a", 14))).toBe(true);
  });
});
describe("note checking and lesson content", () => {
  it("requires the correct octave", () => {
    expect(checkNote(60, 60)).toBe(true);
    expect(checkNote(60, 48)).toBe(false);
  });
  it("keeps playable notes and valid quiz answers for each lesson", () => {
    expect(new Set(lessons.map((l) => l.id)).size).toBe(lessons.length);
    for (const l of lessons) {
      expect(l.correct).toBeLessThan(l.answers.length);
      expect(l.notes.length).toBeGreaterThan(0);
      const range = keyboardRange(l.notes);
      for (const n of l.notes) {
        for (const pitch of eventPitches(n)) {
          expect(pitch).toBeGreaterThanOrEqual(21);
          expect(pitch).toBeLessThanOrEqual(108);
          expect(pitch).toBeGreaterThanOrEqual(range.base);
          expect(pitch).toBeLessThanOrEqual(range.end);
        }
        expect(new Set(eventPitches(n)).size).toBe(eventPitches(n).length);
        expect(n.beats).toBeGreaterThan(0);
        for (const finger of n.fingers ?? (n.finger ? [n.finger] : [])) {
          expect(finger).toBeGreaterThanOrEqual(1);
          expect(finger).toBeLessThanOrEqual(5);
        }
        if (n.fingers) expect(n.fingers.length).toBe(eventPitches(n).length);
      }
    }
  });
});

it("daily sessions do not inflate completed lesson count", () => {
  expect(
    stats([{ ...session("daily", 14), lesson_id: "daily" }]).completed.size,
  ).toBe(0);
});
it("guest import IDs are stable within one account and distinct across accounts", async () => {
  const a = await accountImportId("user-a", "session-a");
  expect(await accountImportId("user-a", "session-a")).toBe(a);
  expect(await accountImportId("user-b", "session-a")).not.toBe(a);
});
it("completion survives stale sync of the same session", () => {
  const a = session("a", 14);
  expect(mergeSessions([a], [{ ...a, completed: false }])[0].completed).toBe(
    true,
  );
});
