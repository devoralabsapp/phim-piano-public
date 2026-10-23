import { useEffect, useRef, useState } from "react";
import {
  eventPitches,
  keyboardRange,
  scientificName,
  type Lesson,
  type Note,
} from "../lib/curriculum";
import {
  evaluateRhythm,
  noteTimeline,
  type PerformanceInput,
  type Assessment,
  type PracticeHand,
} from "../lib/practice";
import { playNote, unlockAudio } from "../lib/audio";
import { listenMicrophone } from "../lib/pitch";
import { useLanguage } from "../lib/i18n";
import type { PracticeSession } from "../lib/domain";
import type { MidiNote } from "../lib/midi";
import Keyboard from "./Keyboard";
import Score from "./Score";
export type MidiMessage = MidiNote & { seq: number; at: number };
export default function RhythmTrainer({
  lesson,
  notes,
  midiMessages,
  midiConnected,
  pressed,
  bpm,
  hand,
  start,
  end,
  onSave,
  kind = "rhythm",
  readingLevel,
}: {
  lesson: Lesson;
  notes: Note[];
  midiMessages: MidiMessage[];
  midiConnected: boolean;
  pressed: number[];
  bpm: number;
  hand: PracticeHand;
  start: number;
  end: number;
  onSave: (s: PracticeSession) => Promise<void>;
  kind?: Assessment["kind"];
  readingLevel?: 1 | 2 | 3;
}) {
  const { t } = useLanguage();
  const [input, setInput] = useState<"screen" | "midi" | "microphone">(
      midiConnected ? "midi" : "screen",
    ),
    [phase, setPhase] = useState<"idle" | "count" | "play" | "result">("idle"),
    [count, setCount] = useState(0),
    [active, setActive] = useState(-1),
    [result, setResult] = useState<ReturnType<typeof evaluateRhythm> | null>(
      null,
    ),
    [error, setError] = useState(""),
    [mic, setMic] = useState(false),
    [micBusy, setMicBusy] = useState(false),
    [heard, setHeard] = useState<number | null>(null),
    [saved, setSaved] = useState(false),
    [saving, setSaving] = useState(false),
    [hideNames, setHideNames] = useState(kind !== "rhythm");
  const run = useRef<{
      startAt: number;
      finishAt: number;
      events: PerformanceInput[];
      started: string;
      id: string;
    } | null>(null),
    lastSeq = useRef(-1),
    timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined),
    abort = useRef<AbortController | null>(null),
    clickTimers = useRef<ReturnType<typeof setTimeout>[]>([]),
    generation = useRef(0),
    saveBusy = useRef(false),
    resultSession = useRef<PracticeSession | null>(null);
  const range = keyboardRange(notes),
    timeline = noteTimeline(notes),
    totalBeats = notes.reduce((s, n) => s + n.beats, 0),
    meter = lesson.meter ?? 4;
  const monophonic = notes.every((n) => eventPitches(n).length <= 1);
  function cancel() {
    generation.current++;
    run.current = null;
    clearInterval(timer.current);
    clickTimers.current.forEach(clearTimeout);
    clickTimers.current = [];
    setPhase("idle");
    setActive(-1);
  }
  const cancelRef = useRef(cancel);
  cancelRef.current = cancel;
  useEffect(() => {
    const pause = () => {
      cancelRef.current();
      abort.current?.abort();
      setMic(false);
    };
    const hidden = () => {
      if (document.hidden) pause();
    };
    document.addEventListener("visibilitychange", hidden);
    document.addEventListener("phim:pause", pause);
    return () => {
      generation.current++;
      clearInterval(timer.current);
      clickTimers.current.forEach(clearTimeout);
      abort.current?.abort();
      document.removeEventListener("visibilitychange", hidden);
      document.removeEventListener("phim:pause", pause);
    };
  }, []);
  useEffect(() => {
    if (input === "midi" && !midiConnected && run.current) {
      cancel();
      setError(
        "Đàn đã ngắt kết nối. Kiểm tra dây USB hoặc chuyển sang tự luyện.",
      );
    }
  }, [midiConnected, input]);
  function receive(e: PerformanceInput) {
    if (
      run.current &&
      e.at >= run.current.startAt - (60000 / bpm) * 0.6 &&
      e.at <= run.current.finishAt
    )
      run.current.events.push(e);
  }
  const receiveRef = useRef(receive);
  receiveRef.current = receive;
  useEffect(() => {
    for (const e of midiMessages) {
      if (e.seq <= lastSeq.current) continue;
      lastSeq.current = e.seq;
      if (input === "midi") receiveRef.current(e);
    }
  }, [midiMessages, input]);
  async function toggleMic() {
    if (micBusy) return;
    setError("");
    if (mic) {
      abort.current?.abort();
      setMic(false);
      cancel();
      return;
    }
    const controller = new AbortController();
    abort.current?.abort();
    abort.current = controller;
    setMicBusy(true);
    try {
      await listenMicrophone(
        (note, on, at) => receiveRef.current({ note, on, at }),
        setHeard,
        controller.signal,
      );
      if (!controller.signal.aborted) setMic(true);
    } catch {
      if (!controller.signal.aborted)
        setError(
          "Không mở được micro. Kiểm tra quyền micro trong cài đặt rồi thử lại.",
        );
    } finally {
      if (abort.current === controller) setMicBusy(false);
    }
  }
  async function begin() {
    if (saveBusy.current) return;
    cancel();
    setError("");
    setSaved(false);
    setResult(null);
    resultSession.current = null;
    if (input === "midi" && !midiConnected) {
      setError("Kết nối đàn MIDI trước khi bắt đầu.");
      return;
    }
    if (input === "microphone" && (!mic || !monophonic)) {
      setError("Bật micro và chọn bài một nốt mỗi lần.");
      return;
    }
    if (notes.every((n) => n.rest)) {
      setError("Đoạn này chỉ có dấu lặng cho tay đã chọn. Hãy chọn đoạn khác.");
      return;
    }
    const g = generation.current;
    let context: { readonly currentTime: number };
    try {
      context = await unlockAudio();
    } catch {
      setError("Không bật được âm thanh. Hãy thử chạm lại.");
      return;
    }
    if (g !== generation.current) return;
    const beatMs = 60000 / bpm,
      zero = performance.now() + 150,
      startAt = zero + meter * beatMs,
      finishAt = startAt + totalBeats * beatMs + Math.min(400, beatMs * 0.6);
    const session = {
      startAt,
      finishAt,
      events: [] as PerformanceInput[],
      started: new Date().toISOString(),
      id: crypto.randomUUID(),
    };
    run.current = session;
    setPhase("count");
    setCount(meter);
    // Audio clock scheduling keeps clicks independent of React painting.
    const audioZero = context.currentTime + (zero - performance.now()) / 1000;
    for (let beat = 0; beat < meter + Math.ceil(totalBeats); beat++) {
      const at = audioZero + (beat * 60) / bpm;
      clickTimers.current.push(
        setTimeout(
          () => playNote(beat % meter === 0 ? 96 : 91, 0.035, true, at),
          Math.max(0, (at - context.currentTime - 0.08) * 1000),
        ),
      );
    }
    timer.current = setInterval(() => {
      const now = performance.now();
      if (now < startAt) {
        setCount(Math.max(1, meter - Math.floor((now - zero) / beatMs)));
        return;
      }
      setPhase("play");
      let index = 0;
      for (let i = 0; i < timeline.length; i++)
        if (timeline[i].beat <= (now - startAt) / beatMs) index = i;
      setActive(index);
      if (now >= finishAt) {
        clearInterval(timer.current);
        run.current = null;
        setPhase("result");
        setActive(-1);
        const outcome = evaluateRhythm(notes, bpm, session.events, startAt);
        setResult(outcome);
        const { details, correct, wrong, ...summary } = outcome;
        resultSession.current = {
          id: session.id,
          lesson_id: lesson.id,
          started_at: session.started,
          active_seconds: Math.max(1, Math.round((totalBeats * 60) / bpm)),
          correct_notes: correct,
          wrong_notes: wrong,
          completed: false,
          input_mode:
            input === "midi"
              ? "midi"
              : input === "screen"
                ? "screen"
                : "manual",
          assessment: {
            ...summary,
            kind,
            bpm,
            hand,
            start,
            end,
            input,
            ...(readingLevel ? { readingLevel } : {}),
          },
        };
      }
    }, 25);
  }
  async function save() {
    if (!resultSession.current || saveBusy.current || saved) return;
    saveBusy.current = true;
    setSaving(true);
    try {
      await onSave(resultSession.current);
      setSaved(true);
    } catch {
      setError("Chưa lưu được buổi luyện. Hãy thử lại.");
    } finally {
      saveBusy.current = false;
      setSaving(false);
    }
  }
  const playing = phase === "count" || phase === "play";
  return (
    <section className="rhythm-trainer card">
      <h3>
        {t(kind !== "rhythm" ? "Đọc nhạc lần đầu" : "Luyện và chấm tiết tấu")}
      </h3>
      <p className="small muted">
        {t(
          "Đếm vào một ô nhịp, rồi chơi theo click. Đồng hồ tiếp tục dù bạn bỏ lỡ nốt; kết quả báo cao độ, sớm/trễ và nốt thiếu.",
        )}
      </p>
      <div className="practice-controls">
        <label>
          {t("Nguồn nốt")}
          <select
            aria-label={t("Nguồn nốt")}
            value={input}
            disabled={playing || saving}
            onChange={(e) => {
              cancel();
              abort.current?.abort();
              setMic(false);
              setInput(e.target.value as typeof input);
            }}
          >
            <option value="screen">{t("Bàn phím màn hình")}</option>
            <option value="midi">{t("Đàn MIDI")}</option>
            <option value="microphone" disabled={!monophonic}>
              {t("Micro · từng nốt")}
            </option>
          </select>
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={hideNames}
            onChange={(e) => setHideNames(e.target.checked)}
          />
          {t("Ẩn tên nốt để tập đọc")}
        </label>
      </div>
      {input === "microphone" && (
        <div className="mic-controls">
          <button
            className="outline"
            disabled={playing || micBusy}
            onClick={() => void toggleMic()}
          >
            {t(
              micBusy
                ? "Đang xin quyền micro…"
                : mic
                  ? "Tắt micro"
                  : "Bật micro",
            )}
          </button>
          <span>
            {heard !== null
              ? scientificName(heard)
              : t("Chơi một nốt rõ, rồi nhả trước khi lặp.")}
          </span>
          <p className="small muted">
            {t(
              "Micro xử lý tại thiết bị, không thu hoặc tải âm thanh lên. Dùng tai nghe để tiếng click không lọt vào micro. Kết quả nhịp qua micro chỉ tham khảo do độ trễ nhận nốt.",
            )}
          </p>
        </div>
      )}
      <Score
        notes={notes}
        hand={hand === "all" ? lesson.hand : hand}
        meter={meter}
        flats={lesson.flats}
        current={active}
        hideNames={hideNames}
      />
      <div className="rhythm-status" role="status">
        {phase === "count"
          ? t("Đếm vào: {count}", { count })
          : phase === "play"
            ? t("Giữ nhịp và tiếp tục chơi")
            : phase === "result"
              ? t("Kết quả lượt luyện")
              : t("Sẵn sàng · {bpm} BPM", { bpm })}
      </div>
      {input === "screen" && (
        <Keyboard
          base={range.base}
          end={range.end}
          flats={lesson.flats}
          onPlay={(n) => receive({ note: n, on: true, at: performance.now() })}
        />
      )}
      {input === "midi" && (
        <Keyboard
          base={range.base}
          end={range.end}
          flats={lesson.flats}
          pressed={pressed}
        />
      )}
      <div className="practice-controls">
        <button
          className="primary"
          disabled={saving}
          onClick={() => (playing ? cancel() : void begin())}
        >
          {t(playing ? "Dừng lượt luyện" : "Bắt đầu chấm nhịp")}
        </button>
        {result && (
          <button
            className="outline"
            disabled={saved || saving}
            onClick={() => void save()}
          >
            {t(saved ? "Đã lưu kết quả" : "Lưu kết quả")}
          </button>
        )}
      </div>
      {result && (
        <div className="assessment-result">
          <div className="assessment-stats">
            <div>
              <b>{result.pitchAccuracy}%</b>
              <span>{t("Cao độ")}</span>
            </div>
            <div>
              <b>{result.timingAccuracy}%</b>
              <span>{t("Đúng nhịp")}</span>
            </div>
            <div>
              <b>{result.score}/100</b>
              <span>{t("Điểm lượt luyện")}</span>
            </div>
          </div>
          <p>
            {t("{early} sớm · {late} trễ · {missed} thiếu · {extra} dư", {
              early: result.early,
              late: result.late,
              missed: result.missed,
              extra: result.extra,
            })}
          </p>
          {result.durationAccuracy !== undefined && input === "midi" && (
            <p className="small">
              {t(
                "Độ dài giữ phím: {score}% · đo note-off, không đo pedal hoặc articulation.",
                { score: result.durationAccuracy },
              )}
            </p>
          )}
          <div className="result-scroll">
            <table>
              <thead>
                <tr>
                  <th>{t("Nốt / cụm")}</th>
                  <th>{t("Cần chơi")}</th>
                  <th>{t("Phản hồi")}</th>
                </tr>
              </thead>
              <tbody>
                {result.details
                  .filter((d) => d.status !== "rest")
                  .map((d) => (
                    <tr key={d.index}>
                      <td>{d.index + start + 1}</td>
                      <td>
                        {d.expected
                          .map((p) => scientificName(p, lesson.flats))
                          .join(" + ")}
                      </td>
                      <td>
                        {t(
                          d.status === "missed"
                            ? "Thiếu nốt"
                            : d.status === "early"
                              ? "Sớm"
                              : d.status === "late"
                                ? "Trễ"
                                : "Đúng nhịp",
                        )}
                        {d.offsetMs !== null
                          ? ` (${d.offsetMs > 0 ? "+" : ""}${d.offsetMs} ms)`
                          : ""}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <p className="small muted">
            {t(
              result.score >= 80
                ? "Chơi thêm một lượt đều trước khi tăng 5 BPM."
                : "Giảm 5–10 BPM hoặc chọn đoạn ngắn hơn để sửa lỗi.",
            )}
          </p>
        </div>
      )}
      {error && <p role="alert">{t(error)}</p>}
    </section>
  );
}
