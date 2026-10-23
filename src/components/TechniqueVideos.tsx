import { useState } from "react";
import { useLanguage } from "../lib/i18n";
const guides = [
  {
    id: "five-fingers",
    title: "Năm ngón tay phải",
    tip: "Ngón 1 đến 5 trên C–D–E–F–G. Giữ vai thả lỏng, cổ tay tự nhiên; nhả phím sau mỗi nốt.",
  },
  {
    id: "thumb-crossing",
    title: "Luồn ngón cái",
    tip: "Gam Đô: 1–2–3–1–2–3–4–5. Chuyển nhẹ cánh tay, luồn ngón cái từ E sang F; không xoắn cổ tay.",
  },
  {
    id: "both-hands",
    title: "Ghép hai tay",
    tip: "Tập riêng từng tay trước. Ghép hai tay theo từng nốt, giữ nhịp đều; tay trái thấp hơn tay phải một quãng tám.",
  },
];
export default function TechniqueVideos() {
  const { t } = useLanguage(),
    [index, setIndex] = useState(0),
    guide = guides[index];
  return (
    <section className="card technique-videos">
      <h2>{t("Video minh họa kỹ thuật")}</h2>
      <p className="small muted">
        {t(
          "Video hoạt họa do Phím biên soạn, minh họa thứ tự ngón và phối hợp tay. Không phải video giáo viên biểu diễn.",
        )}
      </p>
      <div className="technique-tabs">
        {guides.map((g, i) => (
          <button
            key={g.id}
            aria-pressed={index === i}
            onClick={() => setIndex(i)}
          >
            {t(g.title)}
          </button>
        ))}
      </div>
      <video
        key={guide.id}
        controls
        playsInline
        preload="metadata"
        poster={`/guides/${guide.id}.png`}
        src={`/guides/${guide.id}.mp4`}
        aria-label={t(guide.title)}
      />
      <p>{t(guide.tip)}</p>
    </section>
  );
}
