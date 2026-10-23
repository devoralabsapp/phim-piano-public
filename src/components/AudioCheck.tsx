import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../lib/i18n";
import { audioStatus, playNote, unlockAudio } from "../lib/audio";

export default function AudioCheck() {
  const { locale } = useLanguage();
  const vi = locale === "vi";
  const [status, setStatus] = useState<Awaited<
    ReturnType<typeof audioStatus>
  > | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    const failed = () => {
      void audioStatus()
        .then((s) => {
          setStatus(s);
          setError(s.error);
        })
        .catch((e) => setError(String(e)));
    };
    document.addEventListener("phim:audio-error", failed);
    return () => {
      document.removeEventListener("phim:audio-error", failed);
      timers.current.forEach(clearTimeout);
    };
  }, []);
  async function check() {
    setBusy(true);
    setError("");
    timers.current.forEach(clearTimeout);
    try {
      const clock = await unlockAudio();
      const start = clock.currentTime;
      // Schedule only a short lookahead, as with the metronome.
      playNote(60, 0.45, false, start, 0.4);
      for (const [index, midi] of [64, 67].entries()) {
        timers.current.push(
          setTimeout(
            () => playNote(midi, 0.45, false, undefined, 0.4),
            (index + 1) * 500,
          ),
        );
      }
      setStatus(await audioStatus());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="card">
      <h2>{vi ? "Kiểm tra âm thanh" : "Sound check"}</h2>
      <p className="muted">
        {vi
          ? "Phát ba nốt Đô–Mi–Sol. Tăng âm lượng khi đang phát và kiểm tra đầu ra bên dưới nếu chưa nghe tiếng."
          : "Play C–E–G. Turn up the volume during playback and check the output below if you cannot hear it."}
      </p>
      <button className="outline" disabled={busy} onClick={() => void check()}>
        {vi ? "Phát thử âm thanh" : "Test sound"}
      </button>
      {status && (
        <p className="small" role="status">
          {vi ? "Bộ phát" : "Player"}: {status.backend}
          <br />
          {status.volume !== null && (
            <>
              {vi ? "Âm lượng" : "Volume"}: {Math.round(status.volume * 100)}%
              <br />
            </>
          )}
          {status.route && (
            <>
              {vi ? "Đầu ra" : "Output"}: {status.route}
              <br />
            </>
          )}
          {status.category}
        </p>
      )}
      {error && (
        <p role="alert">
          {vi ? "Lỗi âm thanh" : "Audio error"}: {error}
        </p>
      )}
    </section>
  );
}
