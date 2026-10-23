import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "../lib/i18n";
import { useEffect, useRef, useState } from "react";
import { X, Play, Pause, Check } from "lucide-react";
import { type PracticeSession } from "../lib/domain";
import { lessons } from "../lib/curriculum";
const phases = [
  {
    name: "Khởi động đôi tay",
    duration: 180,
    lesson: lessons[1],
    tip: "Chơi Đô – Rê – Mi – Fa – Sol rồi quay về, ngón tay cong nhẹ. Luyện từng tay và giữ vai thả lỏng.",
  },
  {
    name: "Luyện nhịp thật đều",
    duration: 300,
    lesson: lessons[2],
    tip: "Đếm 1 – 2 – 3 – 4 ở tốc độ thoải mái. Chơi Đô mỗi phách, sau đó giữ Đô 2 phách và Rê 2 phách.",
  },
  {
    name: "Chơi giai điệu",
    duration: 420,
    lesson: lessons[3],
    tip: "Mi Mi Fa Sol | Sol Fa Mi Rê | Đô Đô Rê Mi | Mi (1½), Rê (½), Rê (2 phách). Luyện từng câu rồi ghép lại.",
  },
];
export default function DailyPractice({
  onSave,
  onClose,
}: {
  onSave: (s: PracticeSession) => Promise<void>;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const [seconds, setSeconds] = useState(0),
    [running, setRunning] = useState(false),
    [saving, setSaving] = useState(false);
  const started = useRef(new Date().toISOString()),
    elapsed = useRef(0),
    sessionId = useRef(crypto.randomUUID()),
    inFlight = useRef(false),
    root = useRef<HTMLDivElement>(null);
  const phase = seconds < 180 ? 0 : seconds < 480 ? 1 : 2;
  useEffect(() => {
    const focus = document.activeElement as HTMLElement;
    root.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      focus?.focus();
      document.body.style.overflow = old;
    };
  }, []);
  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      elapsed.current = Math.min(
        900,
        elapsed.current + Math.min(1.5, (now - last) / 1000),
      );
      last = now;
      setSeconds(Math.floor(elapsed.current));
      if (elapsed.current >= 900) setRunning(false);
    }, 250);
    return () => clearInterval(id);
  }, [running]);
  useEffect(() => {
    const stop = () => {
      if (document.hidden) setRunning(false);
    };
    const pause = () => setRunning(false);
    document.addEventListener("visibilitychange", stop);
    document.addEventListener("phim:pause", pause);
    return () => {
      document.removeEventListener("visibilitychange", stop);
      document.removeEventListener("phim:pause", pause);
    };
  }, []);
  async function finish() {
    if (inFlight.current) return;
    inFlight.current = true;
    setRunning(false);
    setSaving(true);
    try {
      if (seconds > 0)
        await onSave({
          id: sessionId.current,
          lesson_id: "daily",
          started_at: started.current,
          active_seconds: seconds,
          correct_notes: 0,
          wrong_notes: 0,
          completed: seconds >= 900,
          input_mode: "manual",
        });
      onClose();
    } catch {
      inFlight.current = false;
      setSaving(false);
    }
  }
  const remaining = 900 - seconds;
  return (
    <div
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="daily-title"
      ref={root}
      onKeyDown={(e) => {
        if (e.key === "Escape" && !saving) void finish();
        if (e.key === "Tab") {
          const a = root.current?.querySelectorAll<HTMLButtonElement>(
            "button:not(:disabled),select",
          );
          if (!a?.length) return;
          const f = a[0],
            l = a[a.length - 1];
          if (e.shiftKey && document.activeElement === f) {
            e.preventDefault();
            l.focus();
          } else if (!e.shiftKey && document.activeElement === l) {
            e.preventDefault();
            f.focus();
          }
        }
      }}
    >
      <article className="daily-modal">
        <button
          className="icon close"
          aria-label={t("Đóng buổi luyện")}
          disabled={saving}
          onClick={() => void finish()}
        >
          <X />
        </button>
        <div className="modal-language">
          <LanguageSwitcher />
        </div>
        <span className="eyebrow">{t("15 PHÚT CHO CHÍNH MÌNH")}</span>
        <h2 id="daily-title">{t("Buổi luyện hôm nay")}</h2>
        <p className="muted">
          {t("Đặt iPad cạnh đàn, chỉnh ghế thoải mái và bắt đầu.")}
        </p>
        <div className="daily-stages">
          {phases.map((p, i) => (
            <div
              key={t(p.name)}
              className={i === phase ? "active" : i < phase ? "finished" : ""}
            >
              <span>{i < phase ? t("✓") : i + 1}</span>
              <b>{t(p.name)}</b>
              <small>
                {p.duration / 60}
                {t(" phút")}
              </small>
            </div>
          ))}
        </div>
        <div className="daily-clock">
          {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
          <small>{t("THỜI GIAN CÒN LẠI")}</small>
        </div>
        <div className="bar">
          <i style={{ width: `${seconds / 9}%` }} />
        </div>
        <div className="instructions">
          <h3>
            {seconds >= 900
              ? t("Bạn đã dành 15 phút cho piano!")
              : t(phases[phase].name)}
          </h3>
          <p>
            {seconds >= 900
              ? t(
                  "Ghi lại buổi luyện và dành một chút thời gian nghỉ cho đôi tay.",
                )
              : t(phases[phase].tip)}
          </p>
        </div>
        <p className="small muted">
          {t(
            "Đây là buổi tự luyện, không tự chấm tiếng đàn. Đồng hồ tạm dừng khi bạn rời ứng dụng.",
          )}
        </p>
        <div className="modal-footer">
          <button
            className="outline compact"
            disabled={saving}
            onClick={() => void finish()}
          >
            {t("Lưu và nghỉ")}
          </button>
          {seconds < 900 ? (
            <button
              className="primary"
              disabled={saving}
              onClick={() => setRunning(!running)}
            >
              {running ? <Pause size={16} /> : <Play size={16} />}{" "}
              {running ? t("Tạm dừng") : t("Bắt đầu luyện")}
            </button>
          ) : (
            <button
              className="primary"
              disabled={saving}
              onClick={() => void finish()}
            >
              <Check size={16} />
              {t("Ghi lại buổi luyện")}
            </button>
          )}
        </div>
      </article>
    </div>
  );
}
