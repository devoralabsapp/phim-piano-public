import { useLanguage } from "../lib/i18n";
import { useEffect, useRef, useState } from "react";
import { Metronome as Engine } from "../lib/audio";
import { Play, Pause } from "lucide-react";
export default function Metronome() {
  const { t } = useLanguage();
  const [bpm, setBpm] = useState(60),
    [running, setRunning] = useState(false),
    [meter, setMeter] = useState(4),
    [beat, setBeat] = useState(-1),
    [error, setError] = useState("");
  const engine = useRef(new Engine());
  useEffect(() => {
    engine.current.onBeat = setBeat;
    const stop = () => {
      if (document.hidden) {
        engine.current.stop();
        setRunning(false);
        setBeat(-1);
      }
    };
    const pause = () => {
      engine.current.stop();
      setRunning(false);
      setBeat(-1);
    };
    const failed = () => {
      pause();
      setError("Không bật được âm thanh. Hãy thử chạm lại.");
    };
    document.addEventListener("phim:audio-error", failed);
    document.addEventListener("visibilitychange", stop);
    document.addEventListener("phim:pause", pause);
    return () => {
      engine.current.stop();
      document.removeEventListener("phim:audio-error", failed);
      document.removeEventListener("visibilitychange", stop);
      document.removeEventListener("phim:pause", pause);
    };
  }, []);
  async function toggle() {
    setError("");
    if (running) {
      engine.current.stop();
      setRunning(false);
      setBeat(-1);
    } else {
      try {
        await engine.current.start(bpm, meter);
        setRunning(true);
      } catch {
        setError("Không bật được âm thanh. Hãy thử chạm lại.");
      }
    }
  }
  return (
    <section className="card metro">
      <div className="card-title">
        <h2>{t("Máy đếm nhịp")}</h2>
        <select
          aria-label={t("Nhịp máy đếm nhịp")}
          value={meter}
          onChange={(e) => {
            setMeter(+e.target.value);
            engine.current.setMeter(+e.target.value);
          }}
        >
          <option value={4}>4/4</option>
          <option value={3}>3/4</option>
        </select>
      </div>
      <div className="tempo">
        {bpm}
        <small>{t("NHỊP / PHÚT")}</small>
      </div>
      <input
        aria-label={t("Tốc độ máy đếm nhịp")}
        type="range"
        min={40}
        max={160}
        value={bpm}
        onChange={(e) => {
          setBpm(+e.target.value);
          engine.current.setTempo(+e.target.value);
        }}
      />
      <div className="range-label">
        <span>40 BPM</span>
        <span>160 BPM</span>
      </div>
      <div className="beats">
        {Array.from({ length: meter }, (_, i) => i).map((i) => (
          <i key={i} className={beat === i ? "on" : ""} />
        ))}
      </div>
      <button className="outline" onClick={() => void toggle()}>
        {running ? <Pause size={16} /> : <Play size={16} />}{" "}
        {running ? t("Dừng lại") : t("Bắt đầu")}
      </button>
      <p className="small muted center">
        {t("Nhịp {meter}/4 · Chơi chậm và đều", { meter })}
      </p>
      {error && <p role="alert">{t(error)}</p>}
    </section>
  );
}
