[English](README.md) | **Tiếng Việt**

# Dựng video giới thiệu Piano Sprout

Repo cung cấp renderer và caption mẫu. Video dựng sẵn chứa địa chỉ triển khai riêng không nằm trong bản public. Bạn có thể dựng video của mình và thay `example.com` trong renderer/caption bằng địa chỉ của bạn.

Cần Node.js 22.12+, FFmpeg có libx264 và Chromium của Playwright. Trong repo:

```sh
npm ci
npx playwright install chromium
npm run dev -- --port 5173
```

Trong terminal khác:

```sh
node scripts/build-promo-video.mjs
```

Có thể cấu hình `FFMPEG_BIN` và `PROMO_OUTPUT_DIR`. Ảnh/âm thanh trung gian nằm trong `artifacts/tiktok/`; nhạc piano được tổng hợp bởi script, không dùng bản thu bên thứ ba.
