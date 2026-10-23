import { useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { levels, type Level } from "../lib/course";
import type { Lesson } from "../lib/curriculum";
import { useLanguage } from "../lib/i18n";
export default function LessonBrowser({
  lessons,
  completed,
  nextId,
  onSelect,
}: {
  lessons: Lesson[];
  completed: Set<string>;
  nextId: string;
  onSelect: (id: string) => void;
}) {
  const { t } = useLanguage(),
    [filter, setFilter] = useState<Level | "all">("all");
  return (
    <div className="course-browser">
      <div
        className="level-filters"
        role="group"
        aria-label={t("Lọc theo cấp độ")}
      >
        <button
          aria-pressed={filter === "all"}
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          {t("Tất cả cấp độ")}
          <span>{lessons.length}</span>
        </button>
        {levels.map((level) => (
          <button
            key={level.id}
            aria-pressed={filter === level.id}
            className={filter === level.id ? "active" : ""}
            onClick={() => setFilter(level.id)}
          >
            {t(level.title)}
            <span>{lessons.filter((l) => l.level === level.id).length}</span>
          </button>
        ))}
      </div>
      {levels
        .filter((l) => filter === "all" || filter === l.id)
        .map((level, i) => {
          const items = lessons.filter((l) => l.level === level.id),
            done = items.filter((l) => completed.has(l.id)).length;
          return (
            <section key={level.id} className="course-level">
              <div className="level-heading">
                <div>
                  <span className="eyebrow">
                    {t("Cấp độ {level}", {
                      level: levels.findIndex((l) => l.id === level.id) + 1,
                    })}
                  </span>
                  <h2>{t(level.title)}</h2>
                  <p>{t(level.description)}</p>
                </div>
                <span className="level-completion">
                  {done} / {items.length}
                </span>
              </div>
              <div className="lesson-list">
                {items.map((l) => (
                  <button
                    className="lesson-row"
                    key={l.id}
                    onClick={() => onSelect(l.id)}
                  >
                    <span
                      className={
                        "lesson-number " + (completed.has(l.id) ? "done" : "")
                      }
                    >
                      {completed.has(l.id) ? (
                        <Check size={19} />
                      ) : (
                        String(
                          lessons.findIndex((item) => item.id === l.id) + 1,
                        ).padStart(2, "0")
                      )}
                    </span>
                    <span className="lesson-meta">
                      <b>{t(l.title)}</b>
                      <small>
                        {t(l.topic)} · {l.minutes} {t("phút")} ·{" "}
                        {t(
                          l.hand === "both"
                            ? "Hai tay"
                            : l.hand === "left"
                              ? "Tay trái"
                              : "Tay phải",
                        )}
                      </small>
                    </span>
                    <span className="badge">
                      {completed.has(l.id)
                        ? t("Đã hoàn thành")
                        : l.id === nextId
                          ? t("Tiếp theo")
                          : t("Bài ") +
                            (lessons.findIndex((item) => item.id === l.id) + 1)}
                    </span>
                    <ChevronRight size={18} />
                  </button>
                ))}
              </div>
            </section>
          );
        })}
    </div>
  );
}
