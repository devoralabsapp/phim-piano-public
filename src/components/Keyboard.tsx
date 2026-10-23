import { useLanguage } from "../lib/i18n";
import { useEffect, useRef, useState } from "react";
import { noteName, scientificName } from "../lib/curriculum";
import { playNote, unlockAudio } from "../lib/audio";
export default function Keyboard({
  base = 60,
  end = base + 12,
  expected,
  onPlay,
  pressed = [],
  flats = false,
}: {
  base?: number;
  end?: number;
  expected?: number | number[];
  onPlay?: (midi: number) => void;
  pressed?: number[];
  flats?: boolean;
}) {
  const { locale, t } = useLanguage(),
    [local, setLocal] = useState<number[]>([]),
    [audioError, setAudioError] = useState(false),
    scroll = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const failed = () => setAudioError(true);
    document.addEventListener("phim:audio-error", failed);
    return () => document.removeEventListener("phim:audio-error", failed);
  }, []);
  const expectedNotes =
      typeof expected === "number" ? [expected] : (expected ?? []),
    expectedKey = expectedNotes.join(":");
  const whiteOffsets = [0, 2, 4, 5, 7, 9, 11],
    whites: number[] = [],
    black: { note: number; boundary: number }[] = [];
  for (let n = base; n <= end; n++) {
    if (whiteOffsets.includes(n % 12)) whites.push(n);
    else black.push({ note: n, boundary: whites.length });
  }
  const mappingBase = expectedNotes.length
    ? Math.floor(expectedNotes[0] / 12) * 12
    : base;
  async function play(midi: number) {
    try {
      await unlockAudio();
      playNote(midi);
      setAudioError(false);
    } catch {
      setAudioError(true);
    }
    setLocal((x) => [...x, midi]);
    setTimeout(() => setLocal((x) => x.filter((n) => n !== midi)), 220);
    onPlay?.(midi);
  }
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (
        e.repeat ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        /INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement).tagName)
      )
        return;
      const i = "asdfghjk".indexOf(e.key.toLowerCase());
      if (i >= 0) {
        e.preventDefault();
        void play(mappingBase + [0, 2, 4, 5, 7, 9, 11, 12][i]);
      }
    };
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  });
  useEffect(() => {
    const container = scroll.current,
      key = container?.querySelector<HTMLElement>(
        `[data-midi="${expectedNotes[0]}"]`,
      );
    if (!container || !key) return;
    const left = key.offsetLeft,
      right = left + key.offsetWidth;
    if (
      left < container.scrollLeft ||
      right > container.scrollLeft + container.clientWidth
    )
      container.scrollLeft = Math.max(
        0,
        left - container.clientWidth / 2 + key.offsetWidth / 2,
      );
  }, [expectedKey, base, end]);
  const classes = (n: number) =>
    `${pressed.includes(n) || local.includes(n) ? " playing" : ""}${expectedNotes.includes(n) ? " expected" : ""}`;
  return (
    <>
      <div className="keyboard-scroll" ref={scroll}>
        <div className="keys" style={{ minWidth: whites.length * 36 }}>
          {whites.map((n, i) => (
            <button
              key={n}
              data-midi={n}
              className={"white-key" + classes(n)}
              aria-label={scientificName(n, flats)}
              onClick={() => void play(n)}
            >
              <span>
                {noteName(n, locale, flats)}
                <small>
                  {whites.length > 8 || i === 0 || i === 7
                    ? scientificName(n, flats)
                    : "ASDFGHJK"[i]}
                </small>
              </span>
            </button>
          ))}
          {black.map(({ note, boundary }) => (
            <button
              key={note}
              data-midi={note}
              className={"black-key" + classes(note)}
              style={{
                left: `${((boundary - 0.25) / whites.length) * 100}%`,
                width: `${(0.5 / whites.length) * 100}%`,
              }}
              aria-label={scientificName(note, flats)}
              onClick={() => void play(note)}
            />
          ))}
        </div>
      </div>
      {audioError && (
        <p role="alert">
          {locale === "vi"
            ? "Chưa bật được âm thanh. Hãy chạm lại phím; nếu vẫn chưa nghe, kiểm tra âm lượng và tai nghe/Bluetooth."
            : "Audio could not start. Tap a key again; if still silent, check volume and headphones/Bluetooth."}
        </p>
      )}
      <div className="keyboard-hint">
        <span>
          {scientificName(base, flats)}–{scientificName(end, flats)}
          {t(" · Chạm phím để nghe")}
        </span>
        <span>
          A–K: {scientificName(mappingBase)}–{scientificName(mappingBase + 12)}
        </span>
      </div>
    </>
  );
}
