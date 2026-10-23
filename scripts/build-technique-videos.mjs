// Original, silent fingering animations. Requires Chromium and an ffmpeg binary.
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { once } from "node:events";
mkdirSync("public/guides", { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent('<canvas width="960" height="540"></canvas>');
for (const kind of ["five-fingers", "thumb-crossing", "both-hands"]) {
  const encoder = spawn(
    process.env.FFMPEG_BIN || "ffmpeg",
    [
      "-y",
      "-loglevel",
      "error",
      "-f",
      "image2pipe",
      "-vcodec",
      "png",
      "-r",
      "15",
      "-i",
      "pipe:0",
      "-an",
      "-c:v",
      "libx264",
      "-profile:v",
      "baseline",
      "-level",
      "3.1",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      `public/guides/${kind}.mp4`,
    ],
    { stdio: ["pipe", "ignore", "inherit"] },
  );
  const completed = once(encoder, "close");
  for (let frame = 0; frame < 180; frame++) {
    const png = await page.evaluate(
      ({ kind, frame }) => {
        const canvas = document.querySelector("canvas"),
          c = canvas.getContext("2d"),
          time = frame / 15;
        c.fillStyle = "#f3f6ee";
        c.fillRect(0, 0, 960, 540);
        c.fillStyle = "#315440";
        c.font = "600 24px sans-serif";
        c.fillText("phím. / PIANO TECHNIQUE", 52, 52);
        c.font = "600 36px sans-serif";
        c.fillText(
          kind === "five-fingers"
            ? "Five fingers"
            : kind === "thumb-crossing"
              ? "C major · thumb crossing"
              : "C major · both hands",
          52,
          110,
        );
        c.font = "18px sans-serif";
        c.fillStyle = "#75836e";
        c.fillText(
          "Slow, even notes · relaxed wrist · release between notes",
          52,
          148,
        );
        const start = kind === "both-hands" ? 48 : 60,
          whiteCount = kind === "both-hands" ? 15 : 8,
          width = 810 / whiteCount,
          x0 = 75,
          y0 = 235,
          white = [];
        for (let p = start; white.length < whiteCount; p++)
          if ([0, 2, 4, 5, 7, 9, 11].includes(p % 12)) white.push(p);
        const seq =
          kind === "five-fingers"
            ? [60, 62, 64, 65, 67, 65, 64, 62, 60]
            : [60, 62, 64, 65, 67, 69, 71, 72, 71, 69, 67, 65, 64, 62, 60];
        const fingers =
          kind === "five-fingers"
            ? [1, 2, 3, 4, 5, 4, 3, 2, 1]
            : [1, 2, 3, 1, 2, 3, 4, 5, 4, 3, 2, 1, 3, 2, 1];
        const i = Math.min(
            seq.length - 1,
            Math.floor(time / (12 / seq.length)),
          ),
          note = seq[i],
          finger = fingers[i];
        for (let j = 0; j < white.length; j++) {
          const active =
            white[j] === note ||
            (kind === "both-hands" && white[j] === note - 12);
          c.fillStyle = active
            ? white[j] < 60
              ? "#e4b873"
              : "#a8c99b"
            : "#ffffff";
          c.strokeStyle = "#cbd7c4";
          c.lineWidth = 1;
          c.fillRect(x0 + j * width, y0, width - 1, 180);
          c.strokeRect(x0 + j * width, y0, width - 1, 180);
          c.fillStyle = "#75836e";
          c.font = "14px sans-serif";
          c.fillText(
            ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"][
              white[j] % 12
            ] +
              (Math.floor(white[j] / 12) - 1),
            x0 + j * width + 8,
            y0 + 162,
          );
        }
        for (let j = 0; j < white.length - 1; j++)
          if ([0, 2, 5, 7, 9].includes(white[j] % 12)) {
            c.fillStyle = "#273d2d";
            c.fillRect(
              x0 + (j + 1) * width - width * 0.28,
              y0,
              width * 0.56,
              100,
            );
          }
        function marker(p, label, color) {
          const j = white.indexOf(p),
            x = x0 + (j + 0.5) * width;
          c.fillStyle = color;
          c.beginPath();
          c.arc(x, y0 - 34, 23, 0, Math.PI * 2);
          c.fill();
          c.fillStyle = "white";
          c.font = "600 24px sans-serif";
          c.textAlign = "center";
          c.fillText(String(label), x, y0 - 25);
          c.textAlign = "left";
          c.strokeStyle = color;
          c.lineWidth = 3;
          c.beginPath();
          c.moveTo(x, y0 - 10);
          c.lineTo(x, y0 + 8);
          c.stroke();
        }
        marker(note, finger, "#436c4c");
        if (kind === "both-hands")
          marker(
            note - 12,
            [5, 4, 3, 2, 1, 3, 2, 1, 2, 3, 1, 2, 3, 4, 5][i],
            "#b28142",
          );
        c.fillStyle = "#315440";
        c.font = "600 20px sans-serif";
        c.fillText(
          kind === "five-fingers"
            ? "1 – 2 – 3 – 4 – 5"
            : kind === "thumb-crossing"
              ? "1 – 2 – 3 – 1 – 2 – 3 – 4 – 5"
              : "RIGHT: 1 – 2 – 3 – 1 – 2 – 3 – 4 – 5",
          75,
          462,
        );
        if (kind === "both-hands") {
          c.fillStyle = "#b28142";
          c.fillText("LEFT:    5 – 4 – 3 – 2 – 1 – 3 – 2 – 1", 75, 500);
        }
        if (
          kind === "thumb-crossing" &&
          (i === 2 || i === 3 || i === 11 || i === 12)
        ) {
          c.strokeStyle = "#b28142";
          c.lineWidth = 3;
          c.beginPath();
          c.arc(x0 + 3 * width, y0 - 44, 55, Math.PI, Math.PI * 2);
          c.stroke();
          c.fillStyle = "#b28142";
          c.font = "16px sans-serif";
          c.fillText("3 → 1", x0 + 2.7 * width, y0 - 109);
        }
        return canvas.toDataURL("image/png").split(",")[1];
      },
      { kind, frame },
    );
    const buffer = Buffer.from(png, "base64");
    if (frame === 0) writeFileSync(`public/guides/${kind}.png`, buffer);
    if (!encoder.stdin.write(buffer)) await once(encoder.stdin, "drain");
  }
  encoder.stdin.end();
  const [code] = await completed;
  if (code !== 0) throw new Error("ffmpeg failed: " + kind);
  console.log("Created " + kind);
}
await browser.close();
