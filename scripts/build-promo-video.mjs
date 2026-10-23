import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdirSync, writeFileSync, copyFileSync } from "node:fs";
const dir = "artifacts/tiktok";
const output = process.env.PROMO_OUTPUT_DIR || "marketing/tiktok";
mkdirSync(output, { recursive: true });
mkdirSync(dir, { recursive: true });
const browser = await chromium.launch();
const ui = await browser.newPage({
  viewport: { width: 414, height: 850 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
await ui.addInitScript(() => localStorage.setItem("phim:language", "vi"));
await ui.goto("http://127.0.0.1:5173");
await ui.evaluate(() => document.fonts.ready);
await ui.screenshot({ path: `${dir}/home.png` });
await ui.getByRole("button", { name: "Lộ trình học", exact: true }).click();
await ui.screenshot({ path: `${dir}/course.png` });
await ui.getByRole("button", { name: /Làm quen với phím đàn/ }).click();
const dialog = ui.getByRole("dialog");
await dialog
  .getByRole("button", { name: "Bắt đầu luyện", exact: true })
  .click();
for (const note of ["C4", "D4", "E4"])
  await dialog.getByRole("button", { name: note, exact: true }).click();
await ui.screenshot({ path: `${dir}/lesson.png` });
await ui.keyboard.press("Escape");
// Reload isolates the guest demo and closes its modal.
await ui.goto("http://127.0.0.1:5173");
await ui
  .getByRole("button", { name: "Buổi luyện 15 phút", exact: true })
  .click();
await ui
  .getByRole("dialog")
  .getByRole("button", { name: "Bắt đầu luyện", exact: true })
  .click();
await ui.screenshot({ path: `${dir}/daily.png` });
const shots = {};
for (const name of ["home", "course", "lesson", "daily"]) {
  const { readFileSync } = await import("node:fs");
  shots[name] =
    "data:image/png;base64," +
    readFileSync(`${dir}/${name}.png`).toString("base64");
}
const page = await browser.newPage({
  viewport: { width: 1080, height: 1920 },
  deviceScaleFactor: 1,
});
await page.setContent(
  `<html><head><style>body{margin:0}</style></head><body><canvas width="1080" height="1920"></canvas></body></html>`,
);
// System sans fonts include Vietnamese. Keep the composition self-contained.
await page.evaluate(async (shots) => {
  window.images = {};
  for (const [key, src] of Object.entries(shots)) {
    const im = new Image();
    im.src = src;
    await im.decode();
    window.images[key] = im;
  }
  window.render = (t) => {
    const c = document.querySelector("canvas").getContext("2d");
    const W = 1080,
      H = 1920,
      ink = "#233c30",
      green = "#31654e",
      light = "#f3f1e8",
      muted = "#6b8174",
      acid = "#d9f3a5";
    const cuts = [0, 3.5, 7.5, 12, 16.5, 21, 26];
    let s = cuts.findIndex((x, i) => t >= x && t < cuts[i + 1]);
    if (s < 0) s = 5;
    const local = t - cuts[s],
      dur = cuts[s + 1] - cuts[s];
    const ease = (x) => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);
    const entrance = ease(local / 0.65);
    const rounded = (x, y, w, h, r, fill, stroke) => {
      c.beginPath();
      c.roundRect(x, y, w, h, r);
      if (fill) {
        c.fillStyle = fill;
        c.fill();
      }
      if (stroke) {
        c.strokeStyle = stroke;
        c.lineWidth = 2;
        c.stroke();
      }
    };
    function text(str, x, y, size = 56, color = ink, weight = 700) {
      c.fillStyle = color;
      c.font = `${weight} ${size}px "DejaVu Sans",Arial,sans-serif`;
      c.fillText(str, x, y);
    }
    function centered(str, y, size, color = ink, weight = 700) {
      c.font = `${weight} ${size}px "DejaVu Sans",Arial,sans-serif`;
      const tw = c.measureText(str).width;
      text(str, (W - tw) / 2, y, size, color, weight);
    }
    function logo(x, y, scale = 1, color = ink) {
      c.save();
      c.translate(x, y);
      c.scale(scale, scale);
      rounded(0, -40, 10, 40, 3, color);
      rounded(17, -31, 10, 31, 3, color);
      rounded(34, -47, 10, 47, 3, color);
      text("phím.", 64, 0, 59, color, 800);
      c.restore();
    }
    const dark = s === 0 || s === 5;
    c.fillStyle = dark ? ink : light;
    c.fillRect(0, 0, W, H);
    const grad = c.createRadialGradient(850, 400, 0, 850, 400, 1000);
    grad.addColorStop(0, dark ? "#3c654c" : "#dfe8d6");
    grad.addColorStop(1, dark ? ink : light);
    c.fillStyle = grad;
    c.fillRect(0, 0, W, H);
    // Subtle music staff and moving note shapes.
    c.save();
    c.globalAlpha = dark ? 0.07 : 0.055;
    c.strokeStyle = dark ? light : ink;
    c.lineWidth = 2;
    for (let n = 0; n < 5; n++) {
      c.beginPath();
      c.moveTo(-100, 950 + n * 35);
      c.lineTo(1200, 670 + n * 35);
      c.stroke();
    }
    c.restore();
    logo(90, 195, 0.85, dark ? light : ink);
    text("HỌC PIANO MỖI NGÀY", 90, 252, 23, dark ? "#a9c5b2" : muted, 500);
    rounded(90, 1740, 900, 4, 2, dark ? "#466050" : "#dce2d6");
    rounded(90, 1740, 900 * Math.min(1, t / 26), 4, 2, dark ? acid : green);
    text(
      "PHÍM  /  MỖI NGÀY MỘT CHÚT TIẾN BỘ",
      90,
      1800,
      21,
      dark ? "#a9c5b2" : muted,
      500,
    );
    if (s === 0) {
      const dy = (1 - entrance) * 55;
      text("Có đàn rồi.", 90, 470 + dy, 91, light, 800);
      text("Bắt đầu", 90, 590 + dy, 91, light, 800);
      text("từ đâu?", 90, 710 + dy, 106, acid, 800);
      text("Để phím. đồng hành cùng bạn.", 94, 825, 36, "#bdd0c0", 400);
      c.save();
      c.translate(90, 1040 + (1 - entrance) * 90);
      c.rotate(-0.045);
      c.shadowColor = "#102619";
      c.shadowBlur = 60;
      c.shadowOffsetY = 30;
      rounded(-10, -15, 950, 440, 32, "#173223");
      c.shadowBlur = 0;
      c.shadowOffsetY = 0;
      c.shadowColor = "transparent";
      const seq = [0, 2, 4, 5, 4, 2, 0],
        active = seq[Math.floor(local / 0.5) % seq.length];
      for (let i = 0; i < 8; i++) {
        rounded(i * 115, 0, 108, 380, 12, i === active ? acid : "#f3f1e8");
        text(
          ["ĐÔ", "RÊ", "MI", "FA", "SOL", "LA", "SI", "ĐÔ"][i],
          i * 115 + 20,
          333,
          21,
          ink,
          600,
        );
      }
      for (const i of [0, 1, 3, 4, 5])
        rounded(i * 115 + 80, 0, 58, 230, 10, "#163525");
      c.restore();
      rounded(95, 1560, 440, 70, 35, "#3c5a43");
      text("BẮT ĐẦU TỪ NHỮNG NỐT ĐẦU", 120, 1605, 23, acid, 600);
    } else if (s === 5) {
      text("Chiếc đàn", 90, 463 + (1 - entrance) * 40, 86, light, 800);
      text("đã sẵn sàng.", 90, 575 + (1 - entrance) * 40, 86, light, 800);
      text("Đến lượt bạn.", 90, 714 + (1 - entrance) * 40, 85, acid, 800);
      logo(238, 1020, 2, light);
      centered("Một chút piano, mỗi ngày.", 1160, 42, "#bdd0c0", 400);
      rounded(90, 1305, 900, 150, 30, acid);
      centered("MỞ WEB VÀ THỬ NGAY", 1399, 43, ink, 800);
      centered("example.com", 1550, 43, light, 600);
      centered("Web · iPhone · iPad", 1633, 29, "#bdd0c0", 400);
    } else {
      const headlines = [
        null,
        ["Chạm phím.", "Bắt đầu hành trình."],
        ["32 bài học.", "Từng bước tiến bộ."],
        ["Nhìn nốt nhạc.", "Chơi theo nhịp."],
        ["15 phút mỗi ngày.", "Thêm một thói quen."],
      ];
      const subtitles = [
        null,
        "Bắt đầu cùng chiếc đàn bạn đang có.",
        "Từ nhập môn đến nâng cao.",
        "Luyện từng nốt, giữ nhịp thật đều.",
        "Luyện tập và theo dõi tiến độ.",
      ];
      const line = headlines[s];
      text(line[0], 90, 375 + (1 - entrance) * 45, 68, ink, 800);
      text(line[1], 90, 468 + (1 - entrance) * 45, 65, green, 800);
      text(subtitles[s], 94, 546, 29, muted, 400);
      const shot = window.images[["", "home", "course", "lesson", "daily"][s]];
      const p = ease(local / dur),
        phoneW = 540 + 18 * p,
        phoneH = (phoneW * 850) / 414;
      const x = (W - phoneW) / 2,
        y = 620 + 40 * (1 - entrance) - 9 * p;
      c.save();
      c.shadowColor = "#1c382636";
      c.shadowBlur = 55;
      c.shadowOffsetY = 24;
      rounded(x - 17, y - 17, phoneW + 34, phoneH + 34, 57, "#203b2e");
      c.shadowBlur = 0;
      c.shadowOffsetY = 0;
      c.shadowColor = "transparent";
      c.beginPath();
      c.roundRect(x, y, phoneW, phoneH, 40);
      c.clip();
      c.drawImage(shot, x, y, phoneW, phoneH);
      c.restore();
      // small beat-synced indicator reinforces the musical rhythm.
      const bx = 110,
        by = 1540;
      for (let i = 0; i < 4; i++) {
        c.globalAlpha = Math.floor(t / 0.625) % 4 === i ? 1 : 0.24;
        rounded(bx, by - i * 28, 12, 14 + (i % 2) * 12, 5, green);
      }
      c.globalAlpha = 1;
      if (s === 2) {
        rounded(635, 1448, 300, 84, 24, acid);
        text("4 CẤP ĐỘ", 668, 1500, 26, ink, 800);
      }
      // Fade between chapters without adding a black flash.
    }
    const endFade = Math.min(1, (dur - local) / 0.18);
    if (endFade < 1 && s < 5) {
      c.fillStyle = s === 0 ? "#233c30" : "#f3f1e8";
      c.globalAlpha = 1 - endFade;
      c.fillRect(0, 0, W, H);
      c.globalAlpha = 1;
    }
    return document
      .querySelector("canvas")
      .toDataURL("image/png")
      .split(",")[1];
  };
}, shots);
// Original piano soundtrack; no third-party samples or licensed song.
const sr = 48000,
  duration = 26,
  frames = sr * duration,
  mono = new Float64Array(frames);
function tone(midi, at, len, vol, pan = 0) {
  const f = 440 * 2 ** ((midi - 69) / 12),
    start = Math.floor(at * sr),
    count = Math.floor(len * sr);
  for (let i = 0; i < count && start + i < frames; i++) {
    const t = i / sr,
      e =
        Math.min(1, t / 0.008) *
        Math.exp((-t * 3.8) / len) *
        Math.min(1, (len - t) / 0.07);
    mono[start + i] +=
      vol *
      e *
      (Math.sin(2 * Math.PI * f * t) +
        0.22 * Math.sin(4 * Math.PI * f * t) +
        0.075 * Math.sin(6 * Math.PI * f * t));
  }
}
const chords = [
  [48, 55, 60, 64],
  [45, 52, 57, 60],
  [41, 48, 53, 57],
  [43, 50, 55, 59],
];
const melody = [
  [72, 76, 79, 76, 74, 72, 76, 79],
  [72, 71, 69, 72, 76, 72, 69, 67],
  [69, 72, 77, 76, 72, 69, 67, 69],
  [71, 74, 79, 77, 74, 71, 72, 74],
];
const beat = 0.625;
for (let bar = 0; bar < 10; bar++) {
  const at = bar * 4 * beat,
    ch = chords[bar % 4];
  tone(ch[0], at, 2.5, 0.105);
  ch.slice(1).forEach((n, i) => {
    tone(n, at + 0.625 + i * 0.024, 1.8, 0.052);
    tone(n, at + 1.875 + i * 0.024, 0.8, 0.04);
  });
  melody[bar % 4].forEach((n, i) => tone(n, at + (i * beat) / 2, 0.8, 0.085));
}
tone(48, 25, 1, 0.09);
tone(60, 25, 1, 0.06);
tone(64, 25.02, 0.98, 0.05);
tone(67, 25.04, 0.96, 0.045);
tone(72, 25.06, 0.94, 0.07);
const wav = Buffer.alloc(44 + frames * 4);
wav.write("RIFF", 0);
wav.writeUInt32LE(wav.length - 8, 4);
wav.write("WAVEfmt ", 8);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(2, 22);
wav.writeUInt32LE(sr, 24);
wav.writeUInt32LE(sr * 4, 28);
wav.writeUInt16LE(4, 32);
wav.writeUInt16LE(16, 34);
wav.write("data", 36);
wav.writeUInt32LE(frames * 4, 40);
for (let i = 0; i < frames; i++) {
  const fade = Math.min(1, i / sr / 0.08, (duration - i / sr) / 0.65);
  for (let ch = 0; ch < 2; ch++) {
    const delay = Math.floor(sr * (ch === 0 ? 0.17 : 0.23));
    const value =
      mono[i] +
      (i > delay ? mono[i - delay] * 0.2 : 0) +
      (i > delay * 2 ? mono[i - delay * 2] * 0.09 : 0);
    wav.writeInt16LE(
      Math.round(Math.tanh(value * 1.65) * fade * 29000),
      44 + i * 4 + ch * 2,
    );
  }
}
writeFileSync(`${dir}/piano-original.wav`, wav);
const ffmpeg = process.env.FFMPEG_BIN || "ffmpeg";
const enc = spawn(
  ffmpeg,
  [
    "-y",
    "-loglevel",
    "error",
    "-f",
    "image2pipe",
    "-vcodec",
    "png",
    "-framerate",
    "30",
    "-i",
    "pipe:0",
    "-i",
    `${dir}/piano-original.wav`,
    "-c:v",
    "libx264",
    "-preset",
    "fast",
    "-crf",
    "19",
    "-threads",
    "4",
    "-pix_fmt",
    "yuv420p",
    "-profile:v",
    "high",
    "-level",
    "4.1",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-af",
    "loudnorm=I=-16:TP=-1.5:LRA=9",
    "-ar",
    "48000",
    "-movflags",
    "+faststart",
    "-t",
    "26",
    `${dir}/phim-piano-tiktok.mp4`,
  ],
  { stdio: ["pipe", "ignore", "inherit"] },
);
const done = once(enc, "close");
for (let f = 0; f < 780; f++) {
  const png = Buffer.from(
    await page.evaluate((t) => window.render(t), f / 30),
    "base64",
  );
  if (!enc.stdin.write(png)) await once(enc.stdin, "drain");
  if ([35, 150, 285, 420, 555, 705].includes(f))
    writeFileSync(`${dir}/preview-${f}.png`, png);
  if (f === 35) writeFileSync(`${output}/cover.png`, png);
  if (f % 150 === 0) console.log(`Rendered ${f}/780 frames`);
}
enc.stdin.end();
const [code] = await done;
if (code !== 0) throw new Error(`ffmpeg exited ${code}`);
await browser.close();
copyFileSync(`${dir}/phim-piano-tiktok.mp4`, `${output}/phim-piano-tiktok.mp4`);
writeFileSync(
  `${output}/caption.txt`,
  `Có đàn rồi nhưng chưa biết bắt đầu từ đâu? 🎹\nCùng Phím học từng nốt, giữ nhịp và xây thói quen luyện piano mỗi ngày.\n\n32 bài học từ nhập môn đến nâng cao.\nThử tại: https://example.com\n\n#PhimPiano #HocPiano #PianoChoNguoiMoi #LuyenPiano #PianoMoiNgay\n\nVideo: 1080 × 1920, 30 fps, 26 giây.\nNhạc piano được tổng hợp riêng cho video, không dùng bản thu của bên thứ ba.\n`,
);
console.log(`Video complete: ${output}/phim-piano-tiktok.mp4`);
