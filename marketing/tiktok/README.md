# Render a Piano Sprout promo video

**English** | [Tiếng Việt](README.vi.md)

This folder contains a renderer and Vietnamese caption template. Existing promotional content remains Vietnamese. The renderer explicitly selects Vietnamese without changing the app's English default. A pre-rendered video tied to a private deployment is not included. Replace `example.com` in the renderer/caption with your own URL.

Requires Node.js 22.12+, FFmpeg with libx264, and Playwright Chromium:

```sh
npm ci
npx playwright install chromium
npm run dev -- --port 5173
```

In a second terminal:

```sh
node scripts/build-promo-video.mjs
```

Set `FFMPEG_BIN` or `PROMO_OUTPUT_DIR` if needed. Intermediate screenshots/audio go to `artifacts/tiktok/`. The script synthesizes its own piano audio rather than using a third-party recording.

The old pre-rendered cover was removed during the rename. Running the renderer creates a new `cover.png` with the Piano Sprout wordmark.
