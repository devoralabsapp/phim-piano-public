export type PracticeSession = {
  id: string;
  lesson_id: string;
  started_at: string;
  active_seconds: number;
  correct_notes: number;
  wrong_notes: number;
  completed: boolean;
  assessment?: import("./practice").Assessment;
  input_mode: "screen" | "midi" | "manual";
};
export function localDay(iso: string | Date) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function mergeSessions(a: PracticeSession[], b: PracticeSession[]) {
  const map = new Map(a.map((x) => [x.id, x]));
  b.forEach((x) => {
    const old = map.get(x.id);
    if (!old) map.set(x.id, x);
    else
      map.set(x.id, {
        ...old,
        active_seconds: Math.max(old.active_seconds, x.active_seconds),
        correct_notes: Math.max(old.correct_notes, x.correct_notes),
        wrong_notes: Math.max(old.wrong_notes, x.wrong_notes),
        completed: old.completed || x.completed,
        assessment: x.assessment ?? old.assessment,
      });
  });
  return [...map.values()].sort((x, y) =>
    y.started_at.localeCompare(x.started_at),
  );
}
export function streak(sessions: PracticeSession[], now = new Date()) {
  const days = new Set(
    sessions
      .filter((s) => s.active_seconds > 0)
      .map((s) => localDay(s.started_at)),
  );
  const d = new Date(now);
  if (!days.has(localDay(d))) d.setDate(d.getDate() - 1);
  let result = 0;
  while (days.has(localDay(d))) {
    result++;
    d.setDate(d.getDate() - 1);
  }
  return result;
}
export function stats(sessions: PracticeSession[], now = new Date()) {
  return {
    totalMinutes: Math.floor(
      sessions.reduce((n, s) => n + s.active_seconds, 0) / 60,
    ),
    todayMinutes: Math.floor(
      sessions
        .filter((s) => localDay(s.started_at) === localDay(now))
        .reduce((n, s) => n + s.active_seconds, 0) / 60,
    ),
    completed: new Set(
      sessions
        .filter((s) => s.completed && s.lesson_id !== "daily")
        .map((s) => s.lesson_id),
    ),
    streak: streak(sessions, now),
  };
}
export function checkNote(expected: number, received: number) {
  return expected === received;
}
export function validSession(x: unknown): x is PracticeSession {
  if (!x || typeof x !== "object") return false;
  const s = x as PracticeSession;
  return (
    typeof s.id === "string" &&
    typeof s.lesson_id === "string" &&
    typeof s.started_at === "string" &&
    !Number.isNaN(Date.parse(s.started_at)) &&
    Number.isInteger(s.active_seconds) &&
    s.active_seconds >= 0 &&
    Number.isInteger(s.correct_notes) &&
    s.correct_notes >= 0 &&
    Number.isInteger(s.wrong_notes) &&
    s.wrong_notes >= 0 &&
    typeof s.completed === "boolean" &&
    ["screen", "midi", "manual"].includes(s.input_mode) &&
    (s.assessment == null || validAssessment(s.assessment))
  );
}

export async function accountImportId(userId: string, guestId: string) {
  const bytes = new Uint8Array(
    await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(`${userId}:${guestId}`),
    ),
  ).slice(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x80;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
    "",
  );
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function validAssessment(
  value: unknown,
): value is import("./practice").Assessment {
  if (!value || typeof value !== "object") return false;
  const a = value as import("./practice").Assessment;
  return (
    ["rhythm", "sight-reading", "placement"].includes(a.kind) &&
    (a.readingLevel === undefined || [1, 2, 3].includes(a.readingLevel)) &&
    Number.isFinite(a.bpm) &&
    a.bpm >= 40 &&
    a.bpm <= 160 &&
    [a.pitchAccuracy, a.timingAccuracy, a.score].every(
      (n) => Number.isFinite(n) && n >= 0 && n <= 100,
    ) &&
    [a.early, a.late, a.missed, a.extra, a.start, a.end].every(
      (n) => Number.isInteger(n) && n >= 0,
    ) &&
    a.end >= a.start &&
    ["all", "left", "right"].includes(a.hand) &&
    ["screen", "midi", "microphone"].includes(a.input) &&
    (a.durationAccuracy === undefined ||
      (Number.isFinite(a.durationAccuracy) &&
        a.durationAccuracy >= 0 &&
        a.durationAccuracy <= 100))
  );
}
