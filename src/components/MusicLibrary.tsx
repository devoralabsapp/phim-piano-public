import { useState } from "react";
import { libraryPieces } from "../lib/library";
import { levels } from "../lib/course";
import { useLanguage } from "../lib/i18n";
export default function MusicLibrary({
  completed,
  onOpen,
}: {
  completed: Set<string>;
  onOpen: (id: string) => void;
}) {
  const { t } = useLanguage(),
    [query, setQuery] = useState(""),
    [level, setLevel] = useState("all");
  const filtered = libraryPieces.filter(
    (p) =>
      (level === "all" || p.level === level) &&
      `${t(p.title)} ${t(p.composer)}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <div className="wide-content">
      <div className="notice">
        {t(
          "Bản luyện giản lược từ giai điệu cổ điển, dân gian và bài nhạc tự biên soạn. Mỗi bài có khuông nhạc, nghe mẫu, luyện từng đoạn và chấm tiết tấu.",
        )}
      </div>
      <div className="library-filters">
        <input
          type="search"
          aria-label={t("Tìm bài nhạc")}
          placeholder={t("Tìm bài hoặc tác giả")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          aria-label={t("Độ khó bài nhạc")}
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        >
          <option value="all">{t("Tất cả cấp độ")}</option>
          {levels.map((l) => (
            <option key={l.id} value={l.id}>
              {t(l.title)}
            </option>
          ))}
        </select>
      </div>
      <div className="music-library">
        {filtered.map((p) => (
          <button
            key={p.id}
            className="card music-piece"
            onClick={() => onOpen(p.id)}
          >
            <span className="eyebrow">
              {t(levels.find((l) => l.id === p.level)!.title)} · {p.meter}/4
            </span>
            <h3>{t(p.title)}</h3>
            <p>{t(p.composer)}</p>
            <small>{t(p.credit)}</small>
            <span className="badge">
              {t(completed.has(p.id) ? "Đã hoàn thành" : "Mở bản nhạc")}
            </span>
          </button>
        ))}
      </div>
      {!filtered.length && <p>{t("Không tìm thấy bài phù hợp.")}</p>}
    </div>
  );
}
