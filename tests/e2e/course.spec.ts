import { selectLanguage } from "../language-helper";
import { test, expect } from "../vietnamese-fixture";
test("all levels are available in both languages without losing original progress", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "phim:sessions:guest",
      JSON.stringify([
        {
          id: "11111111-1111-4111-8111-111111111111",
          lesson_id: "keys",
          started_at: new Date().toISOString(),
          active_seconds: 120,
          correct_notes: 9,
          wrong_notes: 0,
          completed: true,
          input_mode: "screen",
        },
      ]),
    );
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Lộ trình học", exact: true }).click();
  await expect(page.locator(".course-browser .lesson-row")).toHaveCount(32);
  await expect(
    page.getByRole("button", { name: /Làm quen với phím đàn.*Đã hoàn thành/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Nâng cao 8", exact: true }).click();
  await expect(page.locator(".course-browser .lesson-row")).toHaveCount(8);
  await expect(
    page.getByRole("button", { name: /Étude tổng hợp/ }),
  ).toBeVisible();
  await selectLanguage(page, "en");
  await expect(
    page.getByRole("heading", { name: "Advanced", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Integrated etude/ }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    ),
  ).toBe(false);
});
test("a two-octave scale is fully playable and can be saved", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Lộ trình học", exact: true }).click();
  await page
    .getByRole("button", { name: /Gam Đô trưởng hai quãng tám/ })
    .click();
  const d = page.getByRole("dialog");
  await d.getByRole("button", { name: "Bắt đầu luyện", exact: true }).click();
  const up = [
    "C4",
    "D4",
    "E4",
    "F4",
    "G4",
    "A4",
    "B4",
    "C5",
    "D5",
    "E5",
    "F5",
    "G5",
    "A5",
    "B5",
    "C6",
  ];
  for (const n of [...up, ...up.slice(0, -1).reverse()])
    await d.getByRole("button", { name: n, exact: true }).click();
  await expect(d.getByText("Bạn đã chơi hết một lượt!")).toBeVisible();
  await d.getByRole("button", { name: "Ngón 1", exact: true }).click();
  await d.getByRole("button", { name: "Hoàn thành bài", exact: true }).click();
  await expect(
    page.getByRole("button", {
      name: /Gam Đô trưởng hai quãng tám.*Đã hoàn thành/,
    }),
  ).toBeVisible();
});
test("chord groups do not advance early and rests can be counted through", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Lộ trình học", exact: true }).click();
  await page.getByRole("button", { name: /Hợp âm I–IV–V–I/ }).click();
  const d = page.getByRole("dialog");
  await d.getByRole("button", { name: "Bắt đầu luyện", exact: true }).click();
  for (const n of ["C4", "E4"])
    await d.getByRole("button", { name: n, exact: true }).click();
  await expect(d.locator(".next-note strong")).toContainText("Đô + Mi + Sol");
  await d.getByRole("button", { name: "G4", exact: true }).click();
  await expect(d.locator(".next-note strong")).toContainText("Fa + La + Đô");
  await d.getByRole("button", { name: "Đóng và lưu buổi luyện" }).click();
  await page.getByRole("button", { name: /Nốt móc đơn và dấu lặng/ }).click();
  await d.getByRole("button", { name: "Bắt đầu luyện", exact: true }).click();
  for (const n of ["C4", "D4", "E4", "F4"])
    await d.getByRole("button", { name: n, exact: true }).click();
  await expect(
    d.getByRole("button", { name: "Tiếp tục sau dấu lặng" }),
  ).toBeEnabled();
  await d.getByRole("button", { name: "Tiếp tục sau dấu lặng" }).click();
  await expect(d.locator(".next-note strong")).toContainText("Sol");
});
test("MIDI chords arriving in one burst are not lost to React batching", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const input: {
      id: string;
      name: string;
      state: string;
      onmidimessage: ((e: { data: Uint8Array }) => void) | null;
    } = {
      id: "test-piano",
      name: "Yamaha YDP-163 (test)",
      state: "connected",
      onmidimessage: null,
    };
    Object.defineProperty(navigator, "requestMIDIAccess", {
      value: async () => ({
        inputs: new Map([[input.id, input]]),
        onstatechange: null,
      }),
    });
    (
      window as unknown as { sendMidi: (notes: number[], on: boolean) => void }
    ).sendMidi = (notes, on) =>
      notes.forEach((note) =>
        input.onmidimessage?.({
          data: new Uint8Array([on ? 0x90 : 0x80, note, on ? 100 : 0]),
        }),
      );
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Tài khoản & kết nối", exact: true })
    .click();
  await page.getByRole("button", { name: "Kết nối đàn MIDI" }).click();
  await expect(
    page.getByRole("button", { name: "Ngắt kết nối", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Lộ trình học", exact: true }).click();
  await page.getByRole("button", { name: /Hợp âm I–IV–V–I/ }).click();
  const d = page.getByRole("dialog");
  await d.getByRole("button", { name: "Bắt đầu luyện", exact: true }).click();
  await page.evaluate(() => {
    (
      window as unknown as { sendMidi: (n: number[], on: boolean) => void }
    ).sendMidi([60, 64, 67], true);
  });
  await expect(d.locator(".next-note strong")).toContainText("Fa + La + Đô");
  await page.evaluate(() => {
    const emit = (
      window as unknown as { sendMidi: (n: number[], on: boolean) => void }
    ).sendMidi;
    emit([60, 64, 67], false);
    emit([65, 69], true);
  });
  await expect(d.locator(".next-note strong")).toContainText("Fa + La + Đô");
  await page.evaluate(() => {
    (
      window as unknown as { sendMidi: (n: number[], on: boolean) => void }
    ).sendMidi([72], true);
  });
  await expect(d.locator(".next-note strong")).toContainText("Sol + Si + Rê");
});
