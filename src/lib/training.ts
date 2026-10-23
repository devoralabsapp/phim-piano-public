import { eventPitches, type Note } from "./curriculum";
export function samePitches(expected: number[], actual: number[]) {
  const a = new Set(actual);
  return expected.length === a.size && expected.every((n) => a.has(n));
}
// MIDI groups need fresh attacks on every note and all target keys held together.
export function matchesGroup(
  note: Note,
  attacks: number[],
  held: number[],
  mode: "screen" | "midi",
) {
  const pitches = eventPitches(note);
  return (
    !note.rest &&
    samePitches(pitches, attacks) &&
    (mode === "screen" || pitches.length === 1 || samePitches(pitches, held))
  );
}
