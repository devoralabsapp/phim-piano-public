import { extendedLessons, type Level } from "./course";
export type Note = {
  midi: number;
  beats: number;
  finger?: number;
  fingers?: number[];
  hands?: ("left" | "right")[];
  chord?: number[];
  rest?: boolean;
  hand?: "right" | "left" | "both";
};
export type Lesson = {
  id: string;
  level: Level;
  tempo?: number;
  targetTempo?: number;
  meter?: 3 | 4;
  flats?: boolean;
  title: string;
  topic: string;
  minutes: number;
  intro: string;
  steps: string[];
  question: string;
  answers: string[];
  correct: number;
  notes: Note[];
  hand: "right" | "left" | "both";
  song?: boolean;
};
const phrase = (
  values: number[],
  fingers?: number[],
  beats?: number[],
): Note[] =>
  values.map((midi, i) => ({
    midi,
    beats: beats?.[i] ?? 1,
    finger: fingers?.[i],
  }));
const beginnerLessons: Omit<Lesson, "level">[] = [
  {
    id: "keys",
    title: "Làm quen với phím đàn",
    topic: "Khám phá bàn phím",
    minutes: 5,
    intro: "Tìm nốt Đô trên đàn của bạn và làm quen với 5 phím trắng đầu tiên.",
    steps: [
      "Phím đen lặp lại theo nhóm 2 và nhóm 3. Đô là phím trắng ngay bên trái nhóm 2 phím đen.",
      "Tìm Đô giữa (C4, MIDI 60), gần giữa bàn phím. Bạn có thể nghe mẫu để đối chiếu.",
      "Tay phải: ngón cái trên Đô, ngón trỏ trên Rê, ngón giữa trên Mi, ngón áp út trên Fa, ngón út trên Sol.",
      "Chơi Đô – Rê – Mi – Fa – Sol rồi quay về. Thả lỏng vai, chơi chậm 5 lần.",
    ],
    question: "Nốt Đô nằm ở đâu?",
    answers: [
      "Bên trái nhóm 2 phím đen",
      "Bên phải nhóm 3 phím đen",
      "Trên một phím đen",
    ],
    correct: 0,
    hand: "right",
    notes: phrase(
      [60, 62, 64, 65, 67, 65, 64, 62, 60],
      [1, 2, 3, 4, 5, 4, 3, 2, 1],
    ),
  },
  {
    id: "fingers",
    title: "Đặt tay và luyện 5 ngón",
    topic: "Kỹ thuật cơ bản",
    minutes: 5,
    intro: "Tạo tư thế thoải mái, giữ cổ tay tự nhiên và các ngón cong nhẹ.",
    steps: [
      "Ngồi giữa đàn, điều chỉnh ghế để khuỷu tay gần ngang phím. Thả lỏng vai.",
      "Đánh số ngón: cái 1, trỏ 2, giữa 3, áp út 4, út 5; giống nhau ở cả hai tay.",
      "Tay phải chơi Đô – Mi – Rê – Fa – Mi – Sol, mỗi nốt dùng ngón tương ứng.",
      "Chơi chậm và đều; nghỉ khi tay mỏi hoặc khó chịu. Không cố kéo giãn ngón.",
    ],
    question: "Ngón cái được đánh số mấy?",
    answers: ["1", "3", "5"],
    correct: 0,
    hand: "right",
    notes: phrase(
      [60, 64, 62, 65, 64, 67, 65, 62, 60],
      [1, 3, 2, 4, 3, 5, 4, 2, 1],
    ),
  },
  {
    id: "rhythm",
    title: "Giữ nhịp thật đều",
    topic: "Nhịp & tiết tấu",
    minutes: 5,
    intro: "Làm quen với nhịp 4/4 ở 60 BPM: mỗi tiếng click ứng với một phách.",
    steps: [
      "Bật máy đếm nhịp ở 60 BPM, đếm 1 – 2 – 3 – 4 theo tiếng click.",
      "Vỗ tay 1 lần mỗi phách trong 4 ô nhịp.",
      "Chơi 4 nốt Đô, mỗi nốt dài 1 phách (nốt đen).",
      "Chơi Đô giữ 2 phách, Rê giữ 2 phách (nốt trắng). Sau đó chơi Mi giữ 4 phách (nốt tròn).",
    ],
    question: "Trong nhịp 4/4, nốt trắng dài bao nhiêu phách?",
    answers: ["1 phách", "2 phách", "4 phách"],
    correct: 1,
    hand: "right",
    notes: phrase(
      [60, 60, 60, 60, 60, 62, 64],
      [1, 1, 1, 1, 1, 2, 3],
      [1, 1, 1, 1, 2, 2, 4],
    ),
  },
  {
    id: "joy",
    title: "Giai điệu đầu tiên: Ode to Joy",
    topic: "Giai điệu",
    minutes: 5,
    intro: "Chơi câu mở đầu của Ode to Joy bằng 5 ngón tay phải.",
    steps: [
      "Đặt tay phải trên Đô – Rê – Mi – Fa – Sol, ngón 1 đến 5.",
      "Câu 1: Mi Mi Fa Sol | Sol Fa Mi Rê. Mỗi nốt dài 1 phách.",
      "Câu 2: Đô Đô Rê Mi | Mi (1½ phách), Rê (½ phách), Rê (2 phách).",
      "Luyện từng câu ở 60 BPM. Nghe mẫu rồi ghép cả hai câu.",
    ],
    question: "Câu mở đầu bắt đầu bằng nốt nào?",
    answers: ["Đô", "Sol", "Mi"],
    correct: 2,
    hand: "right",
    song: true,
    notes: phrase(
      [64, 64, 65, 67, 67, 65, 64, 62, 60, 60, 62, 64, 64, 62, 62],
      [3, 3, 4, 5, 5, 4, 3, 2, 1, 1, 2, 3, 3, 2, 2],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5, 0.5, 2],
    ),
  },
  {
    id: "left",
    title: "Làm quen với tay trái",
    topic: "Tay trái",
    minutes: 5,
    intro: "Tay trái tạo nền cho giai điệu. Hãy luyện riêng từng tay trước.",
    steps: [
      "Tìm Đô thấp hơn Đô giữa 1 quãng tám (C3). Đặt ngón út tay trái (5) lên Đô.",
      "Các ngón 4, 3, 2, 1 lần lượt trên Rê, Mi, Fa, Sol.",
      "Chơi Đô – Rê – Mi – Fa – Sol rồi quay về thật chậm.",
      "Sau khi quen: tay trái giữ Đô 4 phách, tay phải chơi Đô – Rê – Mi – Fa. Đây là bài tự luyện trên đàn thật.",
    ],
    question: "Ngón nào của tay trái chơi Đô ở vị trí này?",
    answers: ["Ngón cái (1)", "Ngón út (5)", "Ngón giữa (3)"],
    correct: 1,
    hand: "left",
    notes: phrase(
      [48, 50, 52, 53, 55, 53, 52, 50, 48],
      [5, 4, 3, 2, 1, 2, 3, 4, 5],
    ),
  },
  {
    id: "chord",
    title: "Hợp âm Đô trưởng",
    topic: "Hợp âm",
    minutes: 5,
    intro: "Ba nốt Đô – Mi – Sol tạo nên hợp âm Đô trưởng.",
    steps: [
      "Tìm Đô – Mi – Sol trên đàn. Tay phải dùng ngón 1 – 3 – 5.",
      "Luyện rải hợp âm: Đô – Mi – Sol – Mi, mỗi nốt dài 1 phách.",
      "Sau đó chơi 3 nốt cùng lúc trên đàn thật, giữ 4 phách rồi thả.",
      "Lặp lại chậm 4 lần. Phần luyện có phản hồi bên dưới chấm từng nốt của hợp âm rải.",
    ],
    question: "Hợp âm Đô trưởng gồm các nốt nào?",
    answers: ["Đô – Rê – Mi", "Rê – Fa – La", "Đô – Mi – Sol"],
    correct: 2,
    hand: "right",
    notes: phrase([60, 64, 67, 64, 60, 64, 67, 64], [1, 3, 5, 3, 1, 3, 5, 3]),
  },
  {
    id: "twinkle",
    title: "Twinkle, Twinkle: câu đầu",
    topic: "Giai điệu",
    minutes: 5,
    intro:
      "Thêm một giai điệu quen thuộc; ngón út cần chuyển nhẹ từ Sol sang La.",
    steps: [
      "Bắt đầu với tay phải trên Đô – Rê – Mi – Fa – Sol.",
      "Chơi Đô Đô Sol Sol | La La Sol (giữ 2 phách). Khi chơi La, chuyển tay nhẹ sang phải.",
      "Tiếp: Fa Fa Mi Mi | Rê Rê Đô (giữ 2 phách). Trở về vị trí ban đầu.",
      "Luyện từng câu. Không với ngón hoặc căng tay để chạm nốt La.",
    ],
    question: "Nốt cuối của câu đầu được giữ bao lâu?",
    answers: ["½ phách", "1 phách", "2 phách"],
    correct: 2,
    hand: "right",
    song: true,
    notes: phrase(
      [60, 60, 67, 67, 69, 69, 67, 65, 65, 64, 64, 62, 62, 60],
      [1, 1, 5, 5, 5, 5, 5, 4, 4, 3, 3, 2, 1, 1],
      [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2],
    ),
  },
  {
    id: "review",
    title: "Ôn tập và luyện đều",
    topic: "Củng cố",
    minutes: 5,
    intro: "Kết hợp kiểm soát ngón và độ dài nốt ở tốc độ chậm.",
    steps: [
      "Khởi động 1 phút với Đô – Rê – Mi – Fa – Sol.",
      "Chơi mẫu bên dưới, chú ý nốt dài 2 phách.",
      "Luyện một lượt không nhìn tay. Nếu mất vị trí, dừng và đặt lại tay.",
      "Ghi lại buổi luyện. Chỉ tăng 5 BPM khi bạn chơi thoải mái và đều.",
    ],
    question: "Khi chơi chưa đều, bạn nên làm gì?",
    answers: [
      "Tăng tốc ngay",
      "Giảm tốc và luyện từng đoạn",
      "Nhấn phím mạnh hơn",
    ],
    correct: 1,
    hand: "right",
    notes: phrase(
      [60, 62, 64, 65, 67, 64, 65, 62, 60],
      [1, 2, 3, 4, 5, 3, 4, 2, 1],
      [1, 1, 1, 1, 2, 2, 2, 2, 4],
    ),
  },
];
export const lessons: Lesson[] = [
  ...beginnerLessons.map((lesson) => ({
    ...lesson,
    level: "beginner" as const,
    tempo: 60,
    targetTempo: 80,
  })),
  ...extendedLessons.map((lesson) => ({
    ...lesson,
    notes: lesson.notes.map((note) =>
      (note.hand ?? lesson.hand) === "both" && !note.rest
        ? {
            ...note,
            hands: eventPitches(note).map((_, i) =>
              i === 0 ? ("left" as const) : ("right" as const),
            ),
          }
        : note,
    ),
  })),
];

export function eventPitches(note: Note) {
  return note.rest ? [] : [note.midi, ...(note.chord ?? [])];
}
export function keyboardRange(notes: Note[]) {
  const pitches = notes.flatMap(eventPitches);
  if (!pitches.length) return { base: 60, end: 72 };
  return {
    base: Math.floor(Math.min(...pitches) / 12) * 12,
    end: Math.max(
      Math.floor(Math.min(...pitches) / 12) * 12 + 12,
      Math.ceil(Math.max(...pitches) / 12) * 12,
    ),
  };
}

export const noteNames = [
  "Đô",
  "Đô♯",
  "Rê",
  "Rê♯",
  "Mi",
  "Fa",
  "Fa♯",
  "Sol",
  "Sol♯",
  "La",
  "La♯",
  "Si",
];
export function noteName(
  midi: number,
  locale: "vi" | "en" = "vi",
  flats = false,
) {
  const index = ((midi % 12) + 12) % 12;
  const sharpNames =
    locale === "en"
      ? ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"]
      : noteNames;
  const flatNames =
    locale === "en"
      ? ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"]
      : [
          "Đô",
          "Rê♭",
          "Rê",
          "Mi♭",
          "Mi",
          "Fa",
          "Sol♭",
          "Sol",
          "La♭",
          "La",
          "Si♭",
          "Si",
        ];
  return (flats ? flatNames : sharpNames)[index];
}
export function scientificName(midi: number, flats = false) {
  return noteName(midi, "en", flats) + (Math.floor(midi / 12) - 1);
}
