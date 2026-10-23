import { eventPitches, type Lesson, type Note } from "./curriculum";
export type PracticeHand = "all" | "right" | "left";
export function handNotes(lesson: Lesson, hand: PracticeHand): Note[] {
  if (hand === "all") return lesson.notes;
  return lesson.notes.map((n) => {
    if (n.rest) return n;
    const assigned = n.hand ?? lesson.hand;
    if (assigned !== "both")
      return assigned === hand
        ? n
        : { ...n, rest: true, chord: undefined, hand, hands: undefined };
    const pitches = eventPitches(n).filter(
      (p, i) => (n.hands?.[i] ?? (i === 0 ? "left" : "right")) === hand,
    );
    return pitches.length
      ? {
          ...n,
          midi: pitches[0],
          chord: pitches.slice(1),
          fingers: undefined,
          finger: undefined,
          hand,
          hands: pitches.map(() => hand),
        }
      : { ...n, rest: true, chord: undefined, hand, hands: undefined };
  });
}
export function noteTimeline(notes: Note[]) {
  let beat = 0;
  return notes.map((note, index) => {
    const item = { note, index, beat };
    beat += note.beats;
    return item;
  });
}
export function phraseRanges(notes: Note[], meter = 4) {
  const ranges: { start: number; end: number }[] = [];
  let start = 0,
    beat = 0;
  notes.forEach((n, i) => {
    beat += n.beats;
    if (beat >= meter * 2 - 1e-6 || i === notes.length - 1) {
      ranges.push({ start, end: i });
      start = i + 1;
      beat = 0;
    }
  });
  return ranges;
}
export type PerformanceInput = {
  note: number;
  on: boolean;
  at: number;
  velocity?: number;
};
export type RhythmDetail = {
  index: number;
  expected: number[];
  played: number[];
  offsetMs: number | null;
  durationMs: number | null;
  status: "on-time" | "early" | "late" | "missed" | "rest";
};
export type Assessment = {
  kind: "rhythm" | "sight-reading" | "placement";
  readingLevel?: 1 | 2 | 3;
  bpm: number;
  pitchAccuracy: number;
  timingAccuracy: number;
  score: number;
  early: number;
  late: number;
  missed: number;
  extra: number;
  durationAccuracy?: number;
  hand: PracticeHand;
  start: number;
  end: number;
  input: "midi" | "screen" | "microphone";
};
export function evaluateRhythm(
  notes: Note[],
  bpm: number,
  events: PerformanceInput[],
  startAt: number,
) {
  const beatMs = 60000 / bpm,
    tolerance = Math.min(120, beatMs * 0.18),
    window = Math.min(400, beatMs * 0.6);
  const attacks = events.filter((e) => e.on),
    used = new Set<number>();
  const expected = noteTimeline(notes).flatMap(({ note, index, beat }) =>
    eventPitches(note).map((p) => ({
      p,
      index,
      at: startAt + beat * beatMs,
      beats: note.beats,
    })),
  );
  const candidates = expected
    .flatMap((n, i) =>
      attacks.flatMap((a, j) =>
        a.note === n.p && Math.abs(a.at - n.at) <= window
          ? [{ i, j, d: Math.abs(a.at - n.at) }]
          : [],
      ),
    )
    .sort((a, b) => a.d - b.d);
  const matched = new Map<number, number>();
  for (const c of candidates)
    if (!matched.has(c.i) && !used.has(c.j)) {
      matched.set(c.i, c.j);
      used.add(c.j);
    }
  let onTime = 0,
    early = 0,
    late = 0,
    durationGood = 0,
    durationCount = 0;
  const offsets = new Map<number, number[]>(),
    durations = new Map<number, number[]>(),
    played = new Map<number, number[]>();
  for (const [i, j] of matched) {
    const n = expected[i],
      a = attacks[j],
      offset = a.at - n.at;
    if (Math.abs(offset) <= tolerance) onTime++;
    else if (offset < 0) early++;
    else late++;
    offsets.set(n.index, [...(offsets.get(n.index) ?? []), offset]);
    played.set(n.index, [...(played.get(n.index) ?? []), a.note]);
    const release = events.find(
      (e) => !e.on && e.note === a.note && e.at > a.at,
    );
    const next = attacks.find((e) => e.note === a.note && e.at > a.at);
    if (release && (!next || release.at <= next.at)) {
      const delta = release.at - a.at - n.beats * beatMs;
      durations.set(n.index, [...(durations.get(n.index) ?? []), delta]);
      durationCount++;
      if (Math.abs(delta) <= Math.max(150, n.beats * beatMs * 0.25))
        durationGood++;
    }
  }
  const average = (values: number[]) =>
    Math.round(values.reduce((s, n) => s + n, 0) / values.length);
  const details: RhythmDetail[] = notes.map((n, index) => {
    const offset = offsets.get(index),
      duration = durations.get(index),
      pitches = eventPitches(n);
    return {
      index,
      expected: pitches,
      played: played.get(index) ?? [],
      offsetMs: offset ? average(offset) : null,
      durationMs: duration ? average(duration) : null,
      status: n.rest
        ? "rest"
        : (played.get(index)?.length ?? 0) < pitches.length
          ? "missed"
          : offset!.every((x) => Math.abs(x) <= tolerance)
            ? "on-time"
            : average(offset!) < 0
              ? "early"
              : "late",
    };
  });
  const pitchAccuracy = expected.length
    ? Math.round((100 * matched.size) / expected.length)
    : 0;
  const timingAccuracy = expected.length
    ? Math.round((100 * onTime) / expected.length)
    : 0;
  const extra = attacks.length - used.size;
  const score = Math.max(
    0,
    Math.round(
      (pitchAccuracy + timingAccuracy) / 2 -
        (extra * 100) / Math.max(1, expected.length),
    ),
  );
  return {
    pitchAccuracy,
    timingAccuracy,
    score,
    early,
    late,
    missed: expected.length - matched.size,
    extra,
    durationAccuracy: durationCount
      ? Math.round((100 * durationGood) / durationCount)
      : undefined,
    details,
    correct: matched.size,
    wrong: expected.length - matched.size + extra,
  };
}
export function sightReading(level: 1 | 2 | 3, seed: number): Lesson {
  let value = seed >>> 0;
  const random = () => {
    value = (1664525 * value + 1013904223) >>> 0;
    return value / 4294967296;
  };
  const scale =
    level === 1
      ? [60, 62, 64, 65, 67]
      : level === 2
        ? [60, 62, 64, 65, 67, 69, 71, 72]
        : [60, 62, 64, 65, 67, 69, 71, 72, 74, 76];
  const notes: Note[] = [];
  let position = Math.floor(random() * scale.length),
    beat = 0;
  while (beat < 16) {
    const remaining = 4 - (beat % 4);
    const beats = level > 1 && random() < 0.35 ? 0.5 : 1;
    position = Math.max(
      0,
      Math.min(scale.length - 1, position + (random() < 0.5 ? -1 : 1)),
    );
    const isRest = level === 3 && random() < 0.12;
    notes.push({
      midi: scale[position],
      beats: Math.min(beats, remaining),
      rest: isRest,
      hand: "right",
    });
    beat += Math.min(beats, remaining);
  }
  return {
    id: "sight-reading",
    level:
      level === 1 ? "beginner" : level === 2 ? "foundation" : "intermediate",
    title: "Đọc nhạc mới",
    topic: "Đọc nhạc",
    intro:
      "Quan sát bản nhạc trước khi chơi; thử đọc lần đầu mà không nghe mẫu.",
    minutes: 5,
    tempo: level === 1 ? 50 : 60,
    meter: 4,
    hand: "right",
    steps: [
      "Xem cao độ, tiết tấu và âm vực trước khi bắt đầu.",
      "Đếm vào một ô nhịp, giữ nhịp ngay cả khi bỏ lỡ một nốt.",
    ],
    question: "Khi đọc nhạc mới, điều gì giúp giữ mạch nhạc?",
    answers: ["Giữ nhịp và tiếp tục", "Dừng sau từng nốt"],
    correct: 0,
    notes,
  };
}
export function recommendLesson(
  lessons: Lesson[],
  sessions: import("./domain").PracticeSession[],
) {
  const seen = new Set<string>();
  const recent = [...sessions]
    .filter((s) => s.assessment)
    .sort((a, b) => b.started_at.localeCompare(a.started_at))
    .filter((s) => {
      if (seen.has(s.lesson_id)) return false;
      seen.add(s.lesson_id);
      return true;
    })
    .slice(0, 5);
  const weak = recent.find((s) => s.assessment!.score < 70);
  if (weak) {
    const lesson = lessons.find((l) => l.id === weak.lesson_id);
    if (lesson)
      return {
        lesson,
        reason:
          weak.assessment!.timingAccuracy < weak.assessment!.pitchAccuracy
            ? "Luyện lại nhịp ở tốc độ chậm hơn."
            : "Ôn cao độ và luyện riêng từng tay.",
      };
  }
  const placement = recent.find((s) => s.assessment!.kind === "placement");
  if (placement) {
    const a = placement.assessment!;
    const target =
      a.score >= 80 && a.readingLevel === 3
        ? "intermediate"
        : a.readingLevel && a.readingLevel > 1
          ? "foundation"
          : "beginner";
    const candidate = lessons.find(
      (l) =>
        l.level === target &&
        !sessions.some((s) => s.lesson_id === l.id && s.completed),
    );
    if (candidate)
      return {
        lesson: candidate,
        reason: "Bài học dựa trên lượt đánh giá đầu vào gần đây.",
      };
  }
  const done = new Set(
    sessions.filter((s) => s.completed).map((s) => s.lesson_id),
  );
  return {
    lesson: lessons.find((l) => !done.has(l.id)) ?? lessons[0],
    reason: "Tiếp tục lộ trình từ bài chưa hoàn thành.",
  };
}
