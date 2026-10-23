import { test, expect } from "@playwright/test";
test("library filters, notation and hand isolation work in both languages", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Thư viện bài nhạc", exact: true })
    .click();
  await expect(page.locator(".music-piece")).toHaveCount(10);
  await page.getByLabel("Tìm bài nhạc", { exact: true }).fill("Waltz");
  await expect(page.locator(".music-piece")).toHaveCount(1);
  await page.locator(".music-piece").click();
  const d = page.getByRole("dialog");
  await expect(d.getByLabel("Khuông nhạc tương tác")).toBeVisible();
  await d.getByLabel("Tay luyện", { exact: true }).selectOption("left");
  await expect(d.locator(".next-note strong")).toContainText("C3");
  await d.getByLabel("Tay luyện", { exact: true }).selectOption("right");
  await expect(d.locator(".next-note strong")).toContainText("E4");
  await d.getByLabel("Đoạn luyện", { exact: true }).selectOption({ index: 1 });
  await expect(
    d.getByText("Đang luyện một phần.", { exact: false }),
  ).toBeVisible();
  await d.getByLabel("Ngôn ngữ", { exact: true }).selectOption("en");
  await expect(
    d.getByRole("heading", { name: "Garden waltz", exact: true }),
  ).toBeVisible();
  await expect(d.getByLabel("Practice hand", { exact: true })).toHaveValue(
    "right",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
});
test("seeking to the final note cannot mark an unplayed lesson complete", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Bắt đầu bài đầu tiên", exact: true })
    .click();
  const d = page.getByRole("dialog");
  await d.locator(".score-event").last().click();
  await d.getByRole("button", { name: "Bắt đầu luyện", exact: true }).click();
  await d.getByRole("button", { name: "C4", exact: true }).click();
  await d
    .getByRole("button", { name: "Bên trái nhóm 2 phím đen", exact: true })
    .click();
  await expect(
    d.getByRole("button", { name: "Hoàn thành bài", exact: true }),
  ).toBeDisabled();
});
test("timed round counts in, records missing notes and saves the assessment once", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/");
  await page
    .getByRole("button", { name: "Bắt đầu bài đầu tiên", exact: true })
    .click();
  const d = page.getByRole("dialog");
  await d.getByLabel("Đoạn luyện", { exact: true }).selectOption({ index: 2 });
  await d.getByRole("button", { name: "Chấm tiết tấu", exact: true }).click();
  await d
    .getByRole("button", { name: "Bắt đầu chấm nhịp", exact: true })
    .click();
  await expect(d.getByText(/Đếm vào:/)).toBeVisible();
  await page.clock.runFor(6500);
  await expect(
    d.getByText("Kết quả lượt luyện", { exact: true }),
  ).toBeVisible();
  await expect(d.getByText("0 sớm · 0 trễ · 1 thiếu · 0 dư")).toBeVisible();
  await d.getByRole("button", { name: "Lưu kết quả", exact: true }).click();
  await expect(
    d.getByRole("button", { name: "Đã lưu kết quả", exact: true }),
  ).toBeDisabled();
  const sessions = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("phim:sessions:guest") || "[]"),
  );
  expect(sessions).toHaveLength(1);
  expect(sessions[0].assessment).toMatchObject({
    kind: "rhythm",
    pitchAccuracy: 0,
    missed: 1,
    start: 8,
    end: 8,
  });
  await d.getByRole("button", { name: "Đóng và lưu buổi luyện" }).click();
  await page
    .getByRole("button", { name: "Tiến độ của bạn", exact: true })
    .click();
  await expect(page.getByText("Cao độ 0% · Nhịp 0% · Điểm 0")).toBeVisible();
});
test("reading generates fresh notation and placement produces an actionable suggestion", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/");
  await page
    .getByRole("button", { name: "Phòng luyện tập", exact: true })
    .click();
  const reading = page.locator(".sight-reading");
  const before = await reading
    .locator(".score-event")
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("aria-label")));
  await reading
    .getByRole("button", { name: "Tạo bản nhạc mới", exact: true })
    .click();
  const after = await reading
    .locator(".score-event")
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("aria-label")));
  expect(before).not.toEqual(after);
  await reading
    .getByRole("button", { name: "Đánh giá đầu vào", exact: true })
    .click();
  await reading
    .getByRole("button", { name: "Bắt đầu chấm nhịp", exact: true })
    .click();
  await expect(reading.getByText(/Đếm vào:/)).toBeVisible();
  await page.clock.runFor(15500);
  await reading
    .getByRole("button", { name: "Lưu kết quả", exact: true })
    .click();
  await expect(reading.getByText("Điểm bắt đầu gợi ý: Cơ bản")).toBeVisible();
  await reading
    .getByRole("button", { name: "Mở bài được gợi ý", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Làm quen với phím đàn", exact: true }),
  ).toBeVisible();
});
test("microphone denial is recoverable and does not start a round", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "mediaDevices", {
      value: {
        getUserMedia: async () => {
          throw new DOMException("Denied", "NotAllowedError");
        },
      },
    });
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Bắt đầu bài đầu tiên", exact: true })
    .click();
  const d = page.getByRole("dialog");
  await d.getByRole("button", { name: "Chấm tiết tấu", exact: true }).click();
  await d.getByLabel("Nguồn nốt", { exact: true }).selectOption("microphone");
  await d.getByRole("button", { name: "Bật micro", exact: true }).click();
  await expect(d.getByRole("alert")).toContainText("Không mở được micro");
  await d.getByLabel("Nguồn nốt", { exact: true }).selectOption("screen");
  await expect(
    d.getByRole("button", { name: "Bắt đầu chấm nhịp", exact: true }),
  ).toBeEnabled();
});
test("original technique videos load, play and switch", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Phòng luyện tập", exact: true })
    .click();
  const videos = page.locator(".technique-videos");
  await videos.locator("video").evaluate(async (video: HTMLVideoElement) => {
    await video.play();
  });
  await expect
    .poll(() =>
      videos.locator("video").evaluate((v: HTMLVideoElement) => v.currentTime),
    )
    .toBeGreaterThan(0);
  await videos
    .getByRole("button", { name: "Luồn ngón cái", exact: true })
    .click();
  await expect(videos.locator("video")).toHaveAttribute(
    "src",
    "/guides/thumb-crossing.mp4",
  );
  await expect(videos.getByText(/Gam Đô: 1–2–3–1/)).toBeVisible();
});

test("timed MIDI attacks and releases produce a perfect saved score", async ({
  page,
}) => {
  await page.clock.install();
  await page.addInitScript(() => {
    const input = {
      id: "test-piano",
      name: "Yamaha YDP-163 (test)",
      state: "connected",
      onmidimessage: null as null | ((e: { data: Uint8Array }) => void),
    };
    Object.defineProperty(navigator, "requestMIDIAccess", {
      value: async () => ({
        inputs: new Map([[input.id, input]]),
        onstatechange: null,
      }),
    });
    (window as unknown as { sendMidi: (on: boolean) => void }).sendMidi = (
      on,
    ) =>
      input.onmidimessage?.({
        data: new Uint8Array([on ? 0x90 : 0x80, 60, on ? 100 : 0]),
      });
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Tài khoản & kết nối", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Kết nối đàn MIDI", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Ngắt kết nối", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Tổng quan", exact: true }).click();
  await page
    .getByRole("button", { name: "Bắt đầu bài đầu tiên", exact: true })
    .click();
  const d = page.getByRole("dialog");
  await d.getByLabel("Đoạn luyện", { exact: true }).selectOption({ index: 2 });
  await d.getByRole("button", { name: "Chấm tiết tấu", exact: true }).click();
  await page.clock.pauseAt(new Date(Date.now() + 60000));
  await d
    .getByRole("button", { name: "Bắt đầu chấm nhịp", exact: true })
    .click();
  await expect(d.getByText(/Đếm vào:/)).toBeVisible();
  await page.clock.runFor(4150);
  await page.evaluate(() =>
    (window as unknown as { sendMidi: (on: boolean) => void }).sendMidi(true),
  );
  await page.clock.runFor(1000);
  await page.evaluate(() =>
    (window as unknown as { sendMidi: (on: boolean) => void }).sendMidi(false),
  );
  await page.clock.runFor(600);
  await expect(d.getByText("100/100", { exact: true })).toBeVisible();
  await expect(d.getByText(/Độ dài giữ phím: 100%/)).toBeVisible();
  await d.getByRole("button", { name: "Lưu kết quả", exact: true }).click();
  const sessions = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("phim:sessions:guest") || "[]"),
  );
  expect(sessions[0].assessment).toMatchObject({
    input: "midi",
    score: 100,
    pitchAccuracy: 100,
    timingAccuracy: 100,
    durationAccuracy: 100,
  });
});
test("microphone recognizes a synthesized note and releases its stream when disabled", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "mediaDevices", {
      value: {
        getUserMedia: async () => {
          const context = new AudioContext(),
            osc = context.createOscillator(),
            gain = context.createGain(),
            destination = context.createMediaStreamDestination();
          osc.frequency.value = 261.63;
          gain.gain.value = 0.3;
          osc.connect(gain);
          gain.connect(destination);
          osc.start();
          await context.resume();
          (window as unknown as { micTrack: MediaStreamTrack }).micTrack =
            destination.stream.getAudioTracks()[0];
          return destination.stream;
        },
      },
    });
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Bắt đầu bài đầu tiên", exact: true })
    .click();
  const d = page.getByRole("dialog");
  await d.getByRole("button", { name: "Chấm tiết tấu", exact: true }).click();
  await d.getByLabel("Nguồn nốt", { exact: true }).selectOption("microphone");
  await d.getByRole("button", { name: "Bật micro", exact: true }).click();
  await expect(d.locator(".mic-controls>span")).toHaveText("C4");
  await d.getByRole("button", { name: "Tắt micro", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { micTrack: MediaStreamTrack }).micTrack
            .readyState,
      ),
    )
    .toBe("ended");
});
