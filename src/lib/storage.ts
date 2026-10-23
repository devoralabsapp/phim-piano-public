import { validSession, type PracticeSession } from "./domain";
export function readSessions(key: string): PracticeSession[] {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(data) ? data.filter(validSession) : [];
  } catch {
    return [];
  }
}
// One-time conversion from the prototype; leave its original record intact.
export function migratePrototype() {
  const key = "phim:sessions:guest";
  try {
    if (localStorage.getItem(key)) return;
    const old = JSON.parse(localStorage.getItem("phim-v1") || "null");
    if (!old || !Array.isArray(old.sessions)) return;
    const ids = ["keys", "fingers", "rhythm", "joy", "left", "chord"];
    const sessions: PracticeSession[] = old.sessions
      .filter(
        (s: Record<string, unknown>) =>
          Number.isInteger(s.lesson) &&
          typeof s.date === "string" &&
          typeof s.minutes === "number",
      )
      .flatMap((s: { lesson: number; date: string; minutes: number }) => {
        if (!ids[s.lesson] || !/^\d{4}-\d{2}-\d{2}$/.test(s.date)) return [];
        const converted: PracticeSession = {
          id: crypto.randomUUID(),
          lesson_id: ids[s.lesson],
          started_at: new Date(s.date + "T12:00:00").toISOString(),
          active_seconds: Math.max(0, Math.floor(s.minutes * 60)),
          correct_notes: 0,
          wrong_notes: 0,
          completed:
            Array.isArray(old.completed) && old.completed.includes(s.lesson),
          input_mode: "manual",
        };
        return validSession(converted) ? [converted] : [];
      });
    localStorage.setItem(key, JSON.stringify(sessions));
  } catch {}
}
