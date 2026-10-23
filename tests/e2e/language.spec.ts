import { test, expect } from "../vietnamese-fixture";
test("English translates every page and persists after reload", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Ngôn ngữ", { exact: true }).selectOption("en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page).toHaveTitle("Phím · Learn piano every day");
  await expect(
    page.getByRole("heading", { name: "A little piano, every day." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "C4", exact: true }),
  ).toContainText("C");
  for (const [nav, title] of [
    ["Learning path", "From your first notes to advanced practice."],
    ["Practice room", "A space for your music."],
    ["Your progress", "Every practice is a step forward."],
    ["Account & connections", "One journey, across your devices."],
  ]) {
    await page.getByRole("button", { name: nav, exact: true }).click();
    await expect(
      page.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      ),
    ).toBe(false);
  }
  await expect(
    page.getByRole("button", { name: "Continue with Google" }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Language", { exact: true })).toHaveValue("en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByLabel("Language", { exact: true }).selectOption("vi");
  await expect(
    page.getByRole("heading", { name: "Một chút piano, mỗi ngày." }),
  ).toBeVisible();
});
test("switching language in a running lesson preserves notes, timer, quiz and saved progress", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Bắt đầu bài đầu tiên" }).click();
  const d = page.getByRole("dialog");
  await d.getByRole("button", { name: "Bắt đầu luyện", exact: true }).click();
  for (const note of ["C4", "D4", "E4"])
    await d.getByRole("button", { name: note, exact: true }).click();
  await expect(d.locator(".next-note strong")).toContainText("Fa");
  await d.getByLabel("Ngôn ngữ", { exact: true }).selectOption("en");
  await expect(
    d.getByRole("heading", { name: "Getting to know the keys" }),
  ).toBeVisible();
  await expect(d.locator(".next-note strong")).toContainText("F");
  await expect(
    d.getByRole("button", { name: "Pause", exact: true }),
  ).toBeVisible();
  await expect(d.getByText("Where is C on the keyboard?")).toBeVisible();
  await expect(d.locator(".finger small")).toHaveText("1 beat");
  await d.getByRole("button", { name: "C4", exact: true }).click();
  await expect(d.getByText("You played C4. Try F4.")).toBeVisible();
  for (const note of ["F4", "G4", "F4", "E4", "D4", "C4"])
    await d.getByRole("button", { name: note, exact: true }).click();
  await d
    .getByRole("button", { name: "To the left of two black keys" })
    .click();
  await d.getByLabel("Language", { exact: true }).selectOption("vi");
  await expect(d.getByRole("button", { name: "Hoàn thành bài" })).toBeEnabled();
  await d.getByRole("button", { name: "Hoàn thành bài" }).click();
  await page.getByLabel("Ngôn ngữ", { exact: true }).selectOption("en");
  await page
    .getByRole("button", { name: "Your progress", exact: true })
    .click();
  await expect(
    page.getByText("Getting to know the keys", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await page
    .getByRole("button", { name: "Learning path", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: /Getting to know the keys.*Completed/ }),
  ).toBeVisible();
});
test("daily practice language changes keep the session running", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Buổi luyện 15 phút" }).click();
  const d = page.getByRole("dialog");
  await d.getByRole("button", { name: "Bắt đầu luyện", exact: true }).click();
  await expect(d.locator(".daily-clock")).toContainText("14:59");
  await d.getByLabel("Ngôn ngữ", { exact: true }).selectOption("en");
  await expect(
    d.getByRole("heading", { name: "Today's practice" }),
  ).toBeVisible();
  await expect(
    d.getByRole("button", { name: "Pause", exact: true }),
  ).toBeVisible();
  await expect(
    d.getByRole("heading", { name: "Warm up your hands" }),
  ).toBeVisible();
  await expect(d.locator(".daily-clock")).not.toContainText("15:00");
  await d.getByRole("button", { name: "Save and rest" }).click();
});
