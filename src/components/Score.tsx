import { useEffect, useRef } from "react";
import { eventPitches, scientificName, type Note } from "../lib/curriculum";
import { noteTimeline } from "../lib/practice";
import { useLanguage } from "../lib/i18n";
export function staffPosition(
  midi: number,
  clef: "treble" | "bass",
  flats = false,
) {
  const pitch = ((midi % 12) + 12) % 12;
  const degrees = flats
    ? [0, 1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 6]
    : [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6];
  const step = (Math.floor(midi / 12) - 1) * 7 + degrees[pitch];
  return (
    (clef === "treble" ? 132 : 252) - (step - (clef === "treble" ? 30 : 18)) * 5
  );
}
export default function Score({
  notes,
  hand = "right",
  meter = 4,
  flats = false,
  current = -1,
  start = 0,
  end = notes.length - 1,
  hideNames = false,
  onSelect,
}: {
  notes: Note[];
  hand: "left" | "right" | "both";
  meter?: number;
  flats?: boolean;
  current?: number;
  start?: number;
  end?: number;
  hideNames?: boolean;
  onSelect?: (index: number) => void;
}) {
  const { t, beats } = useLanguage(),
    scroll = useRef<HTMLDivElement>(null),
    items = noteTimeline(notes);
  let x = 94;
  const positions = items.map((item) => {
    const pos = x;
    x += Math.max(42, item.note.beats * 48);
    return pos;
  });
  const width = Math.max(600, x + 45),
    both =
      hand === "both" ||
      notes.some(
        (n) => !n.rest && (n.hand === "both" || (!!n.hand && n.hand !== hand)),
      ),
    height = both ? 330 : 210;
  useEffect(() => {
    const container = scroll.current;
    if (!container || current < 0) return;
    const target = container.querySelector(
      `[data-index="${current}"]`,
    ) as SVGElement | null;
    if (target) {
      const box = target.getBoundingClientRect(),
        parent = container.getBoundingClientRect();
      if (box.right > parent.right - 30 || box.left < parent.left + 40)
        container.scrollLeft += box.left - parent.left - 100;
    }
  }, [current]);
  return (
    <div
      className="score-scroll"
      ref={scroll}
      aria-label={t("Khuông nhạc tương tác")}
    >
      <svg
        className="music-score"
        width={width}
        height={height}
        role={onSelect ? "group" : "img"}
        aria-label={t("Bản nhạc khóa Sol và Fa")}
        viewBox={`0 0 ${width} ${height}`}
      >
        {(both
          ? ["treble", "bass"]
          : [hand === "left" ? "bass" : "treble"]
        ).map((clef) => {
          const actual = clef as "treble" | "bass",
            bottom = actual === "treble" || !both ? 132 : 252;
          return (
            <g key={clef}>
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={i}
                  x1={15}
                  x2={width - 15}
                  y1={bottom - i * 10}
                  y2={bottom - i * 10}
                  stroke="currentColor"
                  strokeWidth=".8"
                  opacity=".6"
                />
              ))}
              {actual === "treble" ? (
                <g
                  transform={`translate(27 ${bottom - 30})`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M12 42 C-10 35 -5 13 11 7 C25 2 29 19 18 24 C7 30 1 18 9 14 C16 11 23 18 21 24 M10 38 L7 -35 C6 -53 24 -52 18 -34 C13 -20 -9 -4 -5 15" />
                  <ellipse cx="14" cy="46" rx="5" ry="3" fill="currentColor" />
                </g>
              ) : (
                <g
                  transform={`translate(25 ${bottom - 30})`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M0 1 C0 -16 25 -15 19 4 C14 18 4 22 -1 23" />
                  <circle cx="2" cy="-2" r="3" fill="currentColor" />
                  <circle cx="27" cy="-7" r="1.5" fill="currentColor" />
                  <circle cx="27" cy="5" r="1.5" fill="currentColor" />
                </g>
              )}
              <text
                x="64"
                y={bottom - 20}
                fontSize="19"
                fontWeight="600"
                textAnchor="middle"
              >
                {meter}
              </text>
              <text
                x="64"
                y={bottom}
                fontSize="19"
                fontWeight="600"
                textAnchor="middle"
              >
                4
              </text>
            </g>
          );
        })}
        {items.map(({ note, index, beat }) => {
          const xpos = positions[index],
            pitches = eventPitches(note),
            isCurrent = index === current,
            selected = index >= start && index <= end,
            assigned = note.hand ?? hand;
          const clefs = (_p: number, i: number): "treble" | "bass" =>
            (note.hands?.[i] ??
              (assigned === "both"
                ? i === 0
                  ? "left"
                  : "right"
                : assigned)) === "left"
              ? "bass"
              : "treble";
          const dotted =
              Math.abs(note.beats - 1.5) < 0.001 ||
              Math.abs(note.beats - 3) < 0.001,
            tuple =
              Math.abs(note.beats * 3 - Math.round(note.beats * 3)) < 0.001 &&
              note.beats % 1 !== 0 &&
              note.beats !== 0.5;
          const duration = tuple
            ? note.beats * 1.5
            : dotted
              ? note.beats / 1.5
              : note.beats;
          const label = note.rest
            ? t("Lặng")
            : pitches.map((p) => scientificName(p, flats)).join(" + ");
          return (
            <g
              key={index}
              data-index={index}
              className={`score-event ${isCurrent ? "active" : ""}`}
              role={onSelect ? "button" : undefined}
              tabIndex={onSelect ? 0 : undefined}
              aria-label={`${index + 1}: ${label}, ${beats(note.beats)}`}
              onClick={() => onSelect?.(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect?.(index);
                }
              }}
              opacity={selected ? 1 : 0.35}
            >
              <rect
                x={xpos - 15}
                y="65"
                width={Math.max(40, note.beats * 48) - 3}
                height={both ? 220 : 130}
                rx="7"
                fill={isCurrent ? "#e4eed9" : "transparent"}
              />
              {beat > 0 &&
                Math.abs(beat / meter - Math.round(beat / meter)) < 0.0001 && (
                  <line
                    x1={xpos - 18}
                    x2={xpos - 18}
                    y1="92"
                    y2={both ? 252 : 132}
                    stroke="currentColor"
                  />
                )}
              {index === 0 ||
              (beat > 0 &&
                Math.abs(beat / meter - Math.round(beat / meter)) < 0.0001) ? (
                <text x={xpos - 10} y="57" fontSize="11" fill="#68815d">
                  {Math.floor(beat / meter) + 1}
                </text>
              ) : null}
              {note.rest ? (
                <g
                  transform={`translate(${xpos} ${assigned === "left" && both ? 230 : 110})`}
                  fill="currentColor"
                >
                  {duration >= 2 ? (
                    <rect
                      x="-5"
                      y={duration >= 4 ? -13 : -2}
                      width="12"
                      height="5"
                    />
                  ) : (
                    <>
                      {duration >= 1 ? (
                        <path
                          d="M3 -16 L-4 -5 L4 3 L-2 11 Q-8 12 -4 19"
                          stroke="currentColor"
                          fill="none"
                          strokeWidth="3"
                        />
                      ) : (
                        <>
                          <path
                            d="M8 -14 L-1 17"
                            stroke="currentColor"
                            fill="none"
                            strokeWidth="2"
                          />
                          <circle cx="2" cy="-9" r="3" />
                          {duration <= 0.25 && <circle cx="-1" cy="1" r="3" />}
                        </>
                      )}
                      {dotted && <circle cx="14" cy="2" r="1.5" />}
                    </>
                  )}
                </g>
              ) : (
                pitches.map((p, i) => {
                  const clef = clefs(p, i),
                    y =
                      staffPosition(p, clef, flats) -
                      (clef === "bass" && !both ? 120 : 0),
                    bottom = clef === "treble" || !both ? 132 : 252,
                    top = bottom - 40;
                  const ledgers: number[] = [];
                  for (let ly = bottom + 10; ly <= y + 1; ly += 10)
                    ledgers.push(ly);
                  for (let ly = top - 10; ly >= y - 1; ly -= 10)
                    ledgers.push(ly);
                  const accidental = [1, 3, 6, 8, 10].includes(p % 12),
                    stemUp = y >= bottom - 20;
                  return (
                    <g key={p}>
                      {ledgers.map((ly) => (
                        <line
                          key={ly}
                          x1={xpos - 10}
                          x2={xpos + 10}
                          y1={ly}
                          y2={ly}
                          stroke="currentColor"
                        />
                      ))}
                      {accidental && (
                        <text
                          x={xpos - 19 - (i % 2) * 8}
                          y={y + 5}
                          fontSize="18"
                        >
                          {flats ? "♭" : "♯"}
                        </text>
                      )}
                      <ellipse
                        cx={
                          xpos +
                          (i % 2 && pitches[i] - pitches[i - 1] <= 2 ? 8 : 0)
                        }
                        cy={y}
                        rx="6.5"
                        ry="4.5"
                        transform={`rotate(-18 ${xpos} ${y})`}
                        fill={duration >= 2 ? "white" : "currentColor"}
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                      {duration < 4 && (
                        <>
                          <line
                            x1={xpos + (stemUp ? 6 : -6)}
                            x2={xpos + (stemUp ? 6 : -6)}
                            y1={y}
                            y2={y + (stemUp ? -30 : 30)}
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          {duration < 1 &&
                            [0, ...(duration <= 0.25 ? [1] : [])].map(
                              (flag) => (
                                <path
                                  key={flag}
                                  d={`M${xpos + (stemUp ? 6 : -6)} ${y + (stemUp ? -30 : 30) + (stemUp ? 1 : -1) * flag * 6} q15 ${stemUp ? 8 : -8} 7 ${stemUp ? 18 : -18}`}
                                  stroke="currentColor"
                                  fill="none"
                                  strokeWidth="2"
                                />
                              ),
                            )}
                        </>
                      )}
                      {dotted && (
                        <circle
                          cx={xpos + 13}
                          cy={y - 2}
                          r="1.6"
                          fill="currentColor"
                        />
                      )}
                    </g>
                  );
                })
              )}
              {tuple && (
                <text x={xpos} y="76" textAnchor="middle" fontSize="11">
                  3
                </text>
              )}
              {!hideNames && (
                <text
                  x={xpos}
                  y={both ? 298 : 185}
                  fontSize="10"
                  textAnchor="middle"
                >
                  {label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
