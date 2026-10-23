import { useState } from "react";
import { sightReading } from "../lib/practice";
import { useLanguage } from "../lib/i18n";
import RhythmTrainer, { type MidiMessage } from "./RhythmTrainer";
import type { PracticeSession } from "../lib/domain";
export default function PlacementAssessment({
  midiMessages,
  midiConnected,
  pressed,
  onSave,
  onOpen,
}: {
  midiMessages: MidiMessage[];
  midiConnected: boolean;
  pressed: number[];
  onSave: (s: PracticeSession) => Promise<void>;
  onOpen: (id: string) => void;
}) {
  const { t } = useLanguage(),
    [stage, setStage] = useState<1 | 2 | 3>(1),
    [done, setDone] = useState(false),
    [suggestion, setSuggestion] = useState<
      "beginner" | "foundation" | "intermediate"
    >("beginner"),
    [restart, setRestart] = useState(0);
  const lesson = {
    ...sightReading(stage, 4488 + stage),
    id: "placement",
    title: "Đánh giá đầu vào",
  };
  lesson.notes = lesson.notes.slice(0, 8);
  async function save(session: PracticeSession) {
    await onSave(session);
    const score = session.assessment!.score;
    if (score >= 80 && stage < 3) {
      setStage((stage + 1) as 2 | 3);
      return;
    }
    setSuggestion(
      score >= 80
        ? stage === 3
          ? "intermediate"
          : "foundation"
        : stage === 1
          ? "beginner"
          : "foundation",
    );
    setDone(true);
  }
  const id =
    suggestion === "beginner"
      ? "keys"
      : suggestion === "foundation"
        ? "c-scale-rh"
        : "c-two-octaves";
  return (
    <section className="card placement">
      <h3>{t("Đánh giá đầu vào")}</h3>
      <p>
        {t(
          "Ba thử thách ngắn tăng dần độ khó. Lưu kết quả sau mỗi lượt để tiếp tục hoặc nhận gợi ý điểm bắt đầu. Đánh giá này đo đọc nhạc và nhịp, không chứng nhận trình độ biểu diễn.",
        )}
      </p>
      {done ? (
        <>
          <p>
            {t("Điểm bắt đầu gợi ý: {level}", {
              level: t(
                suggestion === "beginner"
                  ? "Cơ bản"
                  : suggestion === "foundation"
                    ? "Nền tảng"
                    : "Trung cấp",
              ),
            })}
          </p>
          <div className="practice-controls">
            <button className="primary" onClick={() => onOpen(id)}>
              {t("Mở bài được gợi ý")}
            </button>
            <button
              className="outline"
              onClick={() => {
                setDone(false);
                setStage(1);
                setRestart(restart + 1);
              }}
            >
              {t("Đánh giá lại")}
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="eyebrow">{t("Thử thách {stage}/3", { stage })}</p>
          <RhythmTrainer
            key={`${stage}:${restart}`}
            lesson={lesson}
            notes={lesson.notes}
            midiMessages={midiMessages}
            midiConnected={midiConnected}
            pressed={pressed}
            bpm={stage === 1 ? 50 : 60}
            hand="all"
            start={0}
            end={lesson.notes.length - 1}
            kind="placement"
            readingLevel={stage}
            onSave={save}
          />
        </>
      )}
    </section>
  );
}
