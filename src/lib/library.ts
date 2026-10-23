import type { Lesson, Note } from "./curriculum";
export type LibraryPiece = Lesson & { composer: string; credit: string };
const melody = (
  pitches: number[],
  beats: number[] = pitches.map(() => 1),
): Note[] =>
  pitches.map((midi, i) => ({ midi, beats: beats[i], hand: "right" }));
const accompaniment = (notes: Note[], roots: number[], meter = 4): Note[] => {
  let beat = 0;
  return notes.map((n) => {
    const bar = Math.floor(beat / meter),
      onBar = Math.abs(beat % meter) < 1e-8;
    beat += n.beats;
    return onBar && !n.rest
      ? {
          ...n,
          midi: roots[bar % roots.length],
          chord: [n.midi],
          hand: "both" as const,
          hands: ["left", "right"] as ("left" | "right")[],
        }
      : n;
  });
};
const make = (
  id: string,
  title: string,
  composer: string,
  level: Lesson["level"],
  notes: Note[],
  meter: 3 | 4 = 4,
  hand: Lesson["hand"] = "right",
): LibraryPiece => ({
  id: "song-" + id,
  title,
  composer,
  credit:
    composer === "Phím"
      ? "Bài nhạc tự biên soạn"
      : "Giai điệu cổ điển/dân gian · bản luyện giản lược do Phím biên soạn",
  level,
  notes,
  meter,
  hand,
  song: true,
  tempo: level === "beginner" ? 50 : level === "advanced" ? 45 : 60,
  targetTempo: 80,
  minutes: 10,
  topic: "Thư viện bài nhạc",
  intro:
    "Học một đoạn mỗi lần, tập riêng từng tay rồi ghép cả bài ở tốc độ chậm.",
  steps: [
    "Xem số chỉ nhịp và cao độ trên khuông nhạc; nghe mẫu để hình dung câu nhạc.",
    "Chọn đoạn ngắn ở phần Đoạn luyện. Khi đã đều, bật lặp đoạn hoặc chuyển sang đoạn kế tiếp.",
    "Bài hai tay: tập tay trái và tay phải riêng, rồi chọn Cả bài để ghép.",
    "Dùng Chấm tiết tấu để kiểm tra sớm/trễ. Giữ nhịp ngay cả khi bỏ lỡ nốt.",
  ],
  question: "Khi gặp đoạn khó, cách luyện nào phù hợp?",
  answers: ["Giảm tốc và lặp đoạn ngắn", "Chơi nhanh hơn ngay", "Bỏ qua nhịp"],
  correct: 0,
});
export const libraryPieces: LibraryPiece[] = [
  make(
    "ode",
    "Ode to Joy · giai điệu trọn đoạn",
    "Ludwig van Beethoven",
    "beginner",
    melody(
      [
        64, 64, 65, 67, 67, 65, 64, 62, 60, 60, 62, 64, 64, 62, 62, 64, 64, 65,
        67, 67, 65, 64, 62, 60, 60, 62, 64, 62, 60, 60, 62, 62, 64, 60, 62, 64,
        65, 64, 60, 62, 64, 65, 64, 62, 60, 62, 67, 64, 64, 65, 67, 67, 65, 64,
        62, 60, 60, 62, 64, 62, 60, 60,
      ],
      [
        ...Array(12).fill(1),
        1.5,
        0.5,
        2,
        ...Array(12).fill(1),
        1.5,
        0.5,
        2,
        1,
        1,
        1,
        1,
        1,
        0.5,
        0.5,
        1,
        1,
        1,
        0.5,
        0.5,
        1,
        1,
        1,
        1,
        2,
        ...Array(12).fill(1),
        1.5,
        0.5,
        2,
      ],
    ),
  ),
  make(
    "twinkle",
    "Twinkle, Twinkle · ba câu nhạc",
    "Dân ca Pháp",
    "beginner",
    melody(
      [
        60, 60, 67, 67, 69, 69, 67, 65, 65, 64, 64, 62, 62, 60, 67, 67, 65, 65,
        64, 64, 62, 67, 67, 65, 65, 64, 64, 62, 60, 60, 67, 67, 69, 69, 67, 65,
        65, 64, 64, 62, 62, 60,
      ],
      Array.from({ length: 42 }, (_, i) => (i % 7 === 6 ? 2 : 1)),
    ),
  ),
  make(
    "frere",
    "Frère Jacques",
    "Dân ca Pháp",
    "beginner",
    melody(
      [
        60, 62, 64, 60, 60, 62, 64, 60, 64, 65, 67, 64, 65, 67, 67, 69, 67, 65,
        64, 60, 67, 69, 67, 65, 64, 60, 60, 55, 60, 60, 55, 60,
      ],
      [
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 0.5, 0.5, 0.5, 0.5, 1, 1, 0.5,
        0.5, 0.5, 0.5, 1, 1, 1, 1, 2, 1, 1, 2,
      ],
    ),
  ),
  make(
    "mary",
    "Mary Had a Little Lamb",
    "Dân ca",
    "beginner",
    melody(
      [
        64, 62, 60, 62, 64, 64, 64, 62, 62, 62, 64, 67, 67, 64, 62, 60, 62, 64,
        64, 64, 64, 62, 62, 64, 62, 60,
      ],
      [
        1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 4,
      ],
    ),
  ),
  make(
    "london",
    "London Bridge",
    "Dân ca Anh",
    "foundation",
    melody(
      [
        67, 69, 67, 65, 64, 65, 67, 62, 64, 65, 64, 65, 67, 67, 69, 67, 65, 64,
        65, 67, 62, 67, 64, 60,
      ],
      [
        1.5, 0.5, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1.5, 0.5, 1, 1, 1, 1, 2, 2,
        2, 2, 2,
      ],
    ),
  ),
  make(
    "clair",
    "Au clair de la lune",
    "Dân ca Pháp",
    "foundation",
    melody(
      [
        60, 60, 60, 62, 64, 62, 60, 64, 62, 62, 60, 60, 60, 60, 62, 64, 62, 60,
        64, 62, 62, 60,
      ],
      [1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 2, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 2],
    ),
  ),
  make(
    "grace",
    "Amazing Grace · câu mở đầu",
    "Giai điệu truyền thống NEW BRITAIN",
    "foundation",
    [
      { midi: 60, beats: 2, rest: true },
      ...melody(
        [67, 72, 76, 72, 76, 74, 72, 69, 67, 67, 72, 76, 72, 76, 74, 79],
        [1, 2, 0.5, 0.5, 2, 1, 2, 1, 2, 1, 2, 0.5, 0.5, 2, 1, 3],
      ),
    ],
    3,
  ),
  make(
    "minuet",
    "Minuet in G · tám ô nhịp đầu",
    "Christian Petzold",
    "intermediate",
    melody(
      [
        74, 67, 69, 71, 72, 74, 67, 67, 76, 72, 74, 76, 78, 79, 67, 67, 72, 74,
        72, 71, 69, 71, 72, 71, 69, 67, 66, 67, 69, 71, 67, 71, 69,
      ],
      [
        1, 0.5, 0.5, 0.5, 0.5, 1, 1, 1, 1, 0.5, 0.5, 0.5, 0.5, 1, 1, 1, 1, 0.5,
        0.5, 0.5, 0.5, 1, 0.5, 0.5, 0.5, 0.5, 1, 0.5, 0.5, 0.5, 0.5, 2, 1,
      ],
    ),
    3,
  ),
  make(
    "garden",
    "Waltz trong khu vườn",
    "Phím",
    "intermediate",
    accompaniment(
      melody(
        [
          64, 67, 72, 71, 67, 62, 65, 69, 72, 71, 69, 67, 64, 67, 72, 74, 71,
          67, 65, 64, 62, 60,
        ],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
      ),
      [48, 43, 53, 43, 48, 43, 53, 48],
      3,
    ),
    3,
    "both",
  ),
  make(
    "night",
    "Khúc đêm · bè và tiết tấu",
    "Phím",
    "advanced",
    accompaniment(
      melody(
        [
          64, 67, 71, 72, 71, 67, 65, 69, 72, 76, 74, 72, 62, 65, 69, 71, 69,
          65, 64, 67, 72, 76, 74, 72,
        ],
        [
          1, 0.5, 0.5, 1, 0.5, 0.5, 1, 0.5, 0.5, 1, 0.5, 0.5, 1, 0.5, 0.5, 1,
          0.5, 0.5, 1, 0.5, 0.5, 1, 0.5, 0.5,
        ],
      ),
      [48, 53, 50, 48],
    ),
    4,
    "both",
  ),
];
