import PlacementAssessment from "./PlacementAssessment";
import { useState } from "react";
import { sightReading } from "../lib/practice";
import { useLanguage } from "../lib/i18n";
import RhythmTrainer, { type MidiMessage } from "./RhythmTrainer";
import type { PracticeSession } from "../lib/domain";
export default function SightReading({
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
    [level, setLevel] = useState<1 | 2 | 3>(1),
    [seed, setSeed] = useState(
      () => crypto.getRandomValues(new Uint32Array(1))[0],
    ),
    [bpm, setBpm] = useState(50),
    [placement, setPlacement] = useState(false);
  const lesson = sightReading(level, seed);
  return (
    <section className="card sight-reading">
      <h2>{t("Đọc nhạc mới")}</h2>
      <p className="muted">
        {t(
          "Bản nhạc mới mỗi lượt. Quan sát trước, không nghe mẫu; đọc cao độ và giữ nhịp trong 4 ô nhịp.",
        )}
      </p>
      <div className="technique-tabs">
        <button aria-pressed={!placement} onClick={() => setPlacement(false)}>
          {t("Luyện đọc nhạc")}
        </button>
        <button aria-pressed={placement} onClick={() => setPlacement(true)}>
          {t("Đánh giá đầu vào")}
        </button>
      </div>
      {placement ? (
        <PlacementAssessment
          midiMessages={midiMessages}
          midiConnected={midiConnected}
          pressed={pressed}
          onSave={onSave}
          onOpen={onOpen}
        />
      ) : (
        <>
          <div className="practice-controls">
            <label>
              {t("Mức đọc nhạc")}
              <select
                aria-label={t("Mức đọc nhạc")}
                value={level}
                onChange={(e) => {
                  setLevel(+e.target.value as 1 | 2 | 3);
                  setSeed(crypto.getRandomValues(new Uint32Array(1))[0]);
                }}
              >
                <option value="1">{t("1 · Năm nốt, nốt đen")}</option>
                <option value="2">{t("2 · Một quãng tám, móc đơn")}</option>
                <option value="3">{t("3 · Âm vực rộng và dấu lặng")}</option>
              </select>
            </label>
            <label>
              BPM{" "}
              <input
                type="number"
                min="40"
                max="120"
                aria-label={t("Tốc độ đọc nhạc")}
                value={bpm}
                onChange={(e) =>
                  setBpm(Math.max(40, Math.min(120, +e.target.value)))
                }
              />
            </label>
            <button
              className="outline"
              onClick={() =>
                setSeed(crypto.getRandomValues(new Uint32Array(1))[0])
              }
            >
              {t("Tạo bản nhạc mới")}
            </button>
          </div>
          <RhythmTrainer
            key={`${seed}:${bpm}`}
            lesson={lesson}
            notes={lesson.notes}
            midiMessages={midiMessages}
            midiConnected={midiConnected}
            pressed={pressed}
            bpm={bpm}
            hand="all"
            start={0}
            end={lesson.notes.length - 1}
            kind="sight-reading"
            readingLevel={level}
            onSave={onSave}
          />
        </>
      )}
    </section>
  );
}
