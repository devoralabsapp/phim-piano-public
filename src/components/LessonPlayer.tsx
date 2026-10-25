import ThemeSwitcher from "./ThemeSwitcher";
import Score from "./Score";
import RhythmTrainer, { type MidiMessage } from "./RhythmTrainer";
import { handNotes, phraseRanges, type PracticeHand } from "../lib/practice";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "../lib/i18n";
import { useEffect, useRef, useState } from "react";
import { X, Play, Pause, Check, Volume2, RotateCcw } from "lucide-react";
import {
  type Lesson,
  noteName,
  scientificName,
  eventPitches,
  keyboardRange,
} from "../lib/curriculum";
import { type PracticeSession } from "../lib/domain";
import { playNote, unlockAudio } from "../lib/audio";
import Keyboard from "./Keyboard";
import { matchesGroup } from "../lib/training";
import { levels } from "../lib/course";
export default function LessonPlayer({
  lesson,
  onSave,
  onClose,
  midiEvents,
  midiMessages,
  midiConnected,
  pressed,
}: {
  lesson: Lesson;
  onSave: (s: PracticeSession) => Promise<void>;
  onClose: () => void;
  midiMessages: MidiMessage[];
  midiEvents: import("../lib/midi").MidiAttack[];
  midiConnected: boolean;
  pressed: number[];
}) {
  const { locale, t, beats } = useLanguage();
  const [mode, setMode] = useState<"screen" | "midi" | "manual">(
      midiConnected ? "midi" : "screen",
    ),
    [running, setRunning] = useState(false),
    [seconds, setSeconds] = useState(0),
    [index, setIndex] = useState(0),
    [rounds, setRounds] = useState(0),
    [correct, setCorrect] = useState(0),
    [wrong, setWrong] = useState(0),
    [answer, setAnswer] = useState<number | null>(null),
    [manual, setManual] = useState(false),
    [feedback, setFeedback] = useState(""),
    [feedbackParams, setFeedbackParams] = useState<Record<string, string>>({}),
    [demo, setDemo] = useState(false),
    [bpm, setBpm] = useState(lesson.tempo ?? 60),
    [saving, setSaving] = useState(false);
  const session = useRef({
      id: crypto.randomUUID(),
      started_at: new Date().toISOString(),
    }),
    timers = useRef<ReturnType<typeof setTimeout>[]>([]),
    root = useRef<HTMLDivElement>(null),
    elapsed = useRef(0),
    last = useRef(0),
    inFlight = useRef(false),
    done = useRef(false),
    covered = useRef(new Set<number>()),
    attacks = useRef(new Set<number>()),
    lastMidiSeq = useRef(-1),
    currentIndex = useRef(0);
  const [selectedNotes, setSelectedNotes] = useState<number[]>([]);
  const [hand, setHand] = useState<PracticeHand>("all"),
    [sectionStart, setSectionStart] = useState(0),
    [sectionEnd, setSectionEnd] = useState(lesson.notes.length - 1),
    [loop, setLoop] = useState(true),
    [showRhythm, setShowRhythm] = useState(false),
    [hideNames, setHideNames] = useState(false);
  const fullNotes = handNotes(lesson, hand),
    practiceNotes = fullNotes.slice(sectionStart, sectionEnd + 1),
    phrases = phraseRanges(lesson.notes, lesson.meter ?? 4);
  const fullPractice =
    hand === "all" &&
    sectionStart === 0 &&
    sectionEnd === lesson.notes.length - 1;
  const range = keyboardRange(practiceNotes);
  function changeSection(
    start: number,
    end: number,
    nextHand: PracticeHand = hand,
  ) {
    stopDemo();
    setRunning(false);
    setSectionStart(start);
    setSectionEnd(end);
    setHand(nextHand);
    setIndex(0);
    currentIndex.current = 0;
    setRounds(0);
    covered.current.clear();
    setCorrect(0);
    setWrong(0);
    attacks.current.clear();
    setSelectedNotes([]);
    setFeedback("");
  }

  const note = practiceNotes[index],
    passed = answer === lesson.correct,
    canComplete =
      fullPractice &&
      passed &&
      (mode === "manual" ? manual && seconds >= 60 : rounds > 0);
  function stopDemo() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setDemo(false);
  }
  useEffect(() => {
    const prev = document.activeElement as HTMLElement;
    root.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
      prev?.focus();
      timers.current.forEach(clearTimeout);
    };
  }, []);
  useEffect(() => {
    if (!running) return;
    last.current = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      elapsed.current += Math.min(1.5, (now - last.current) / 1000);
      last.current = now;
      setSeconds(Math.floor(elapsed.current));
    }, 250);
    return () => clearInterval(timer);
  }, [running]);
  useEffect(() => {
    if (mode === "midi" && !midiConnected) {
      setRunning(false);
      setFeedback(
        "Đàn đã ngắt kết nối. Kiểm tra dây USB hoặc chuyển sang tự luyện.",
      );
    }
  }, [midiConnected, mode]);
  useEffect(() => {
    const hidden = () => {
      if (document.hidden) {
        setRunning(false);
        stopDemo();
      }
    };
    const pause = () => {
      setRunning(false);
      stopDemo();
    };
    document.addEventListener("visibilitychange", hidden);
    document.addEventListener("phim:pause", pause);
    return () => {
      document.removeEventListener("visibilitychange", hidden);
      document.removeEventListener("phim:pause", pause);
    };
  }, []);
  function advance() {
    attacks.current.clear();
    setSelectedNotes([]);
    covered.current.add(currentIndex.current);
    if (currentIndex.current === practiceNotes.length - 1) {
      currentIndex.current = 0;
      setIndex(0);
      if (covered.current.size === practiceNotes.length)
        setRounds((x) => x + 1);
      covered.current.clear();
      if (!loop) setRunning(false);
      setFeedback("Bạn đã chơi hết một lượt!");
    } else {
      currentIndex.current++;
      setIndex(currentIndex.current);
      setFeedback("Đúng rồi!");
    }
  }
  function receive(n: number, held = pressed) {
    const activeNote = practiceNotes[currentIndex.current];
    if (!running || demo || mode === "manual") return;
    if (activeNote.rest) {
      setFeedback("Đang có dấu lặng: đếm đủ phách, rồi tiếp tục.");
      return;
    }
    const pitches = eventPitches(activeNote);
    if (!pitches.includes(n)) {
      attacks.current.clear();
      setSelectedNotes([]);
      setWrong((x) => x + 1);
      setFeedbackParams({
        played: scientificName(n, lesson.flats),
        expected: pitches
          .map((p) => scientificName(p, lesson.flats))
          .join(" + "),
      });
      setFeedback("Bạn chơi {played}. Hãy tìm {expected}.");
      return;
    }
    attacks.current.add(n);
    setSelectedNotes([...attacks.current]);
    if (matchesGroup(activeNote, [...attacks.current], held, mode)) {
      setCorrect((x) => x + pitches.length);
      advance();
    } else {
      setFeedback(
        mode === "midi"
          ? "Bấm và giữ đủ các nốt của cụm cùng lúc; thả các phím khác."
          : "Tiếp tục chạm các nốt còn lại để ghép cụm.",
      );
    }
  }
  const receiveRef = useRef(receive);
  receiveRef.current = receive;
  useEffect(() => {
    for (const event of midiEvents) {
      if (event.seq <= lastMidiSeq.current) continue;
      lastMidiSeq.current = event.seq;
      if (mode === "midi") receiveRef.current(event.note, event.held);
    }
  }, [midiEvents, mode]);

  async function sample() {
    setRunning(false);
    stopDemo();
    try {
      await unlockAudio();
    } catch {
      setFeedback("Không bật được âm thanh. Hãy chạm lại nút nghe mẫu.");
      return;
    }
    setDemo(true);
    let delay = 0;
    practiceNotes.forEach((n) => {
      timers.current.push(
        setTimeout(() => {
          const pitches = eventPitches(n);
          pitches.forEach((p) =>
            playNote(
              p,
              ((n.beats * 60) / bpm) * 0.9,
              false,
              undefined,
              0.22 / Math.sqrt(pitches.length),
            ),
          );
        }, delay),
      );
      delay += (n.beats * 60000) / bpm;
    });
    timers.current.push(setTimeout(stopDemo, delay));
  }
  async function finish(completed: boolean) {
    if (inFlight.current || done.current) return;
    if (completed && !canComplete) return;
    inFlight.current = true;
    setSaving(true);
    setRunning(false);
    stopDemo();
    try {
      if (seconds > 0 || correct > 0 || wrong > 0)
        await onSave({
          ...session.current,
          lesson_id: lesson.id,
          active_seconds: seconds,
          correct_notes: correct,
          wrong_notes: wrong,
          completed,
          input_mode: mode,
        });
      done.current = true;
      onClose();
    } catch {
      setFeedback("Chưa lưu được buổi luyện. Hãy thử lại.");
      setSaving(false);
      inFlight.current = false;
    }
  }
  return (
    <div
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lesson-title"
      ref={root}
      onKeyDown={(e) => {
        if (e.key === "Escape" && !saving) void finish(false);
        if (e.key === "Tab") {
          const all = root.current?.querySelectorAll<HTMLButtonElement>(
            'button:not(:disabled),input:not(:disabled),select,[tabindex="0"]',
          );
          if (!all?.length) return;
          const first = all[0],
            last = all[all.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }}
    >
      <article className="lesson-modal">
        <button
          className="icon close"
          aria-label={t("Đóng và lưu buổi luyện")}
          disabled={saving}
          onClick={() => void finish(false)}
        >
          <X />
        </button>
        <div className="modal-language">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
        <span className="eyebrow">
          {t(levels.find((level) => level.id === lesson.level)?.title ?? "")} ·{" "}
          {t(lesson.topic)}
          {t(" · ")}
          {lesson.minutes}
          {t(" phút")}
        </span>
        <h2 id="lesson-title">{t(lesson.title)}</h2>
        <p className="small muted">
          {t(
            "Bắt đầu {start} BPM · Mục tiêu tham khảo {target} BPM · Nhịp {meter}/4",
            {
              start: lesson.tempo ?? 60,
              target: lesson.targetTempo ?? 80,
              meter: lesson.meter ?? 4,
            },
          )}
        </p>
        <p className="muted">{t(lesson.intro)}</p>
        <ol className="instructions">
          {lesson.steps.map((s) => (
            <li key={s}>{t(s)}</li>
          ))}
        </ol>
        <section className="practice-settings card">
          <h3>{t("Chọn cách luyện")}</h3>
          <div className="practice-controls">
            <label>
              {t("Tốc độ luyện")}{" "}
              <input
                type="number"
                min={40}
                max={160}
                aria-label={t("Tốc độ luyện")}
                value={bpm}
                disabled={saving}
                onChange={(e) => {
                  stopDemo();
                  setRunning(false);
                  setBpm(Math.max(40, Math.min(160, +e.target.value)));
                }}
              />{" "}
              BPM
            </label>
            <label>
              {t("Tay luyện")}
              <select
                aria-label={t("Tay luyện")}
                value={hand}
                disabled={saving}
                onChange={(e) =>
                  changeSection(
                    sectionStart,
                    sectionEnd,
                    e.target.value as PracticeHand,
                  )
                }
              >
                <option value="all">{t("Cả bài")}</option>
                <option
                  value="right"
                  disabled={
                    lesson.hand === "left" &&
                    !lesson.notes.some(
                      (n) => n.hand === "right" || n.hand === "both",
                    )
                  }
                >
                  {t("Tay phải")}
                </option>
                <option
                  value="left"
                  disabled={
                    lesson.hand === "right" &&
                    !lesson.notes.some(
                      (n) => n.hand === "left" || n.hand === "both",
                    )
                  }
                >
                  {t("Tay trái")}
                </option>
              </select>
            </label>
            <label>
              {t("Đoạn luyện")}
              <select
                aria-label={t("Đoạn luyện")}
                value={
                  sectionStart === 0 && sectionEnd === lesson.notes.length - 1
                    ? "all"
                    : `${sectionStart}:${sectionEnd}`
                }
                disabled={saving}
                onChange={(e) => {
                  const [a, b] =
                    e.target.value === "all"
                      ? [0, lesson.notes.length - 1]
                      : e.target.value.split(":").map(Number);
                  changeSection(a, b);
                }}
              >
                <option value="all">{t("Cả bài")}</option>
                {phrases.map((p, i) => (
                  <option key={i} value={`${p.start}:${p.end}`}>
                    {t("Đoạn {number} · nốt {start}–{end}", {
                      number: i + 1,
                      start: p.start + 1,
                      end: p.end + 1,
                    })}
                  </option>
                ))}
              </select>
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={loop}
                onChange={(e) => setLoop(e.target.checked)}
              />
              {t("Lặp đoạn khi chơi hết")}
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
          <p className="small muted">
            {t(
              "Chạm nốt trên khuông để bắt đầu từ vị trí đó. Bè tay trái ở khóa Fa, bè tay phải ở khóa Sol; theo số ngón trong hướng dẫn.",
            )}
          </p>
          <Score
            notes={fullNotes}
            hand={hand === "all" ? lesson.hand : hand}
            meter={lesson.meter ?? 4}
            flats={lesson.flats}
            current={index + sectionStart}
            start={sectionStart}
            end={sectionEnd}
            hideNames={hideNames}
            onSelect={(i) => {
              if (i < sectionStart || i > sectionEnd) return;
              stopDemo();
              setIndex(i - sectionStart);
              currentIndex.current = i - sectionStart;
              setRounds(0);
              covered.current.clear();
              attacks.current.clear();
              setSelectedNotes([]);
            }}
          />
          {!fullPractice && (
            <p className="small muted">
              {t(
                "Đang luyện một phần. Chọn Cả bài và ghép hai tay để đánh dấu hoàn thành bài.",
              )}
            </p>
          )}
          <button
            className="outline"
            disabled={saving}
            aria-expanded={showRhythm}
            onClick={() => {
              setRunning(false);
              stopDemo();
              setShowRhythm(!showRhythm);
            }}
          >
            {t(showRhythm ? "Về luyện cao độ" : "Chấm tiết tấu")}
          </button>
        </section>
        {showRhythm && (
          <RhythmTrainer
            key={`${hand}:${sectionStart}:${sectionEnd}:${bpm}`}
            lesson={lesson}
            notes={practiceNotes}
            midiMessages={midiMessages}
            midiConnected={midiConnected}
            pressed={pressed}
            bpm={bpm}
            hand={hand}
            start={sectionStart}
            end={sectionEnd}
            onSave={onSave}
          />
        )}
        <div className="trainer" hidden={showRhythm}>
          <div className="section-title">
            <h3>{t("Luyện theo từng nốt")}</h3>
            <select
              aria-label={t("Cách luyện tập")}
              value={mode}
              disabled={saving}
              onChange={(e) => {
                setMode(e.target.value as typeof mode);
                setRunning(false);
                setIndex(0);
                currentIndex.current = 0;
                setRounds(0);
                covered.current.clear();
                setCorrect(0);
                setWrong(0);
                setManual(false);
                setFeedback("");
                attacks.current.clear();
                setSelectedNotes([]);
              }}
            >
              <option value="screen">{t("Bàn phím màn hình")}</option>
              <option value="manual">{t("Tự luyện trên đàn")}</option>
              <option value="midi" disabled={!midiConnected}>
                {t("Đàn MIDI ")}
                {!midiConnected ? t("(chưa kết nối)") : ""}
              </option>
            </select>
          </div>
          <div className="note-sequence">
            {practiceNotes.map((n, i) => (
              <span
                key={i}
                className={i === index ? "current" : i < index ? "played" : ""}
              >
                {n.rest
                  ? t("Lặng")
                  : eventPitches(n)
                      .map((p) => noteName(p, locale, lesson.flats))
                      .join(" + ")}
                <small>{beats(n.beats)}</small>
              </span>
            ))}
          </div>
          <div className="next-note">
            <div>
              <span className="small muted">
                {mode === "manual" ? t("Mẫu luyện tập") : t("Nốt tiếp theo")}
              </span>
              <strong>
                {note.rest
                  ? t("Lặng")
                  : eventPitches(note)
                      .map((p) => noteName(p, locale, lesson.flats))
                      .join(" + ")}{" "}
                <small>
                  {note.rest
                    ? ""
                    : eventPitches(note)
                        .map((p) => scientificName(p, lesson.flats))
                        .join(" + ")}
                </small>
              </strong>
            </div>
            <div className="finger">
              {t(
                (note.hand ?? lesson.hand) === "both"
                  ? "Hai tay"
                  : (note.hand ?? lesson.hand) === "left"
                    ? "Tay trái"
                    : "Tay phải",
              )}
              <b>
                {note.rest ? (
                  "—"
                ) : note.fingers || note.finger ? (
                  <>
                    {t("Ngón ")}
                    {note.fingers?.join("–") ?? note.finger}
                  </>
                ) : (
                  t("Theo hướng dẫn")
                )}
              </b>
              <small>{beats(note.beats)}</small>
            </div>
          </div>
          {mode !== "manual" && (
            <Keyboard
              base={range.base}
              end={range.end}
              expected={eventPitches(note)}
              flats={lesson.flats}
              pressed={mode === "screen" ? selectedNotes : pressed}
              onPlay={mode === "screen" ? receive : undefined}
            />
          )}
          {mode !== "manual" && eventPitches(note).length > 1 && (
            <p className="small muted">
              {t(
                "Màn hình: chạm từng nốt để ghép cụm. MIDI: bấm và giữ đủ cụm cùng lúc, rồi thả trước cụm tiếp theo.",
              )}
            </p>
          )}
          {mode !== "manual" && note.rest && (
            <div className="rest-action">
              <p>
                {t("Đếm {beats} rồi tiếp tục.", { beats: beats(note.beats) })}
              </p>
              <button
                className="outline"
                disabled={!running || demo}
                onClick={advance}
              >
                {t("Tiếp tục sau dấu lặng")}
              </button>
            </div>
          )}
          <div className="player-controls">
            <button
              className="primary"
              disabled={saving || demo}
              onClick={() => {
                setRunning(!running);
                setFeedback("");
              }}
            >
              {running ? <Pause size={16} /> : <Play size={16} />}{" "}
              {running ? t("Tạm dừng") : t("Bắt đầu luyện")}
            </button>
            <button
              className="outline compact"
              onClick={() => (demo ? stopDemo() : void sample())}
              disabled={saving}
            >
              <Volume2 size={16} />
              {demo ? t("Dừng mẫu") : t("Nghe mẫu")}
            </button>
            <label className="small">
              BPM{" "}
              <input
                aria-label={t("Tốc độ nghe mẫu")}
                type="number"
                min={40}
                max={160}
                value={bpm}
                onChange={(e) =>
                  setBpm(Math.max(40, Math.min(160, +e.target.value)))
                }
              />
            </label>
            <span className="timer">
              {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
            </span>
          </div>
          <p className="feedback" aria-live="polite">
            {t(feedback, feedbackParams) ||
              (running
                ? t("Hãy chơi nốt được đánh dấu.")
                : t("Bấm Bắt đầu luyện để ghi thời gian thực hành."))}
          </p>
          {mode !== "manual" ? (
            <div className="small muted">
              {t(
                "{rounds} lượt · {correct} nốt đúng · {wrong} nốt cần sửa · Chấm cao độ; tự luyện nhịp theo mẫu.",
                {
                  rounds,
                  correct,
                  wrong,
                  roundWord: rounds === 1 ? "round" : "rounds",
                  correctWord: correct === 1 ? "note" : "notes",
                  wrongWord: wrong === 1 ? "note" : "notes",
                },
              )}
            </div>
          ) : (
            <label className="checkbox">
              <input
                type="checkbox"
                checked={manual}
                onChange={(e) => setManual(e.target.checked)}
              />
              {t("Tôi đã luyện mẫu này trên đàn thật (ít nhất 1 phút).")}
            </label>
          )}
          <button
            className="text-button"
            onClick={() => {
              setIndex(0);
              currentIndex.current = 0;
              setRounds(0);
              covered.current.clear();
              setCorrect(0);
              setWrong(0);
              setFeedback("");
              attacks.current.clear();
              setSelectedNotes([]);
            }}
            disabled={saving}
          >
            <RotateCcw size={13} />
            {t(" Luyện lại mẫu")}
          </button>
        </div>
        <div className="quiz">
          <h3>{t("Kiểm tra nhanh")}</h3>
          <p>{t(lesson.question)}</p>
          <div className="answers">
            {lesson.answers.map((a, i) => (
              <button
                key={a}
                aria-pressed={answer === i}
                className={
                  answer === i
                    ? passed
                      ? "answer correct"
                      : "answer wrong"
                    : "answer"
                }
                onClick={() => setAnswer(i)}
              >
                {t(a)}
                {answer === i && passed && <Check size={15} />}
              </button>
            ))}
          </div>
          {answer !== null && (
            <p className="small" aria-live="polite">
              {passed
                ? t("Chính xác!")
                : t("Thử lại nhé. Xem phần hướng dẫn phía trên.")}
            </p>
          )}
        </div>
        <div className="modal-footer">
          <button
            className="outline compact"
            disabled={saving}
            onClick={() => void finish(false)}
          >
            {t("Lưu và nghỉ")}
          </button>
          <button
            className="primary"
            disabled={!canComplete || saving}
            onClick={() => void finish(true)}
          >
            <Check size={16} />
            {saving ? t("Đang lưu…") : t("Hoàn thành bài")}
          </button>
        </div>
        {!canComplete && (
          <p className="small muted">
            {t(
              "Hoàn thành một lượt luyện (hoặc xác nhận tự luyện ít nhất 1 phút) và trả lời đúng câu hỏi để hoàn thành bài.",
            )}
          </p>
        )}
      </article>
    </div>
  );
}
