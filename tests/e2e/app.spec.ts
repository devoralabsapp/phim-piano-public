import { test, expect } from "../vietnamese-fixture";
test("lesson feedback, quiz and persistence after refresh", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Bắt đầu bài đầu tiên" }).click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("heading", { name: "Làm quen với phím đàn" }),
  ).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Hoàn thành bài" }),
  ).toBeDisabled();
  await dialog
    .getByRole("button", { name: "Bắt đầu luyện", exact: true })
    .click();
  await dialog.getByRole("button", { name: "D4", exact: true }).click();
  await expect(dialog.getByText("Bạn chơi D4. Hãy tìm C4.")).toBeVisible();
  for (const note of ["C4", "D4", "E4", "F4", "G4", "F4", "E4", "D4", "C4"])
    await dialog.getByRole("button", { name: note, exact: true }).click();
  await expect(dialog.getByText("Bạn đã chơi hết một lượt!")).toBeVisible();
  await dialog
    .getByRole("button", { name: "Bên trái nhóm 2 phím đen" })
    .click();
  await dialog.getByRole("button", { name: "Hoàn thành bài" }).click();
  await expect(dialog).not.toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Lộ trình học", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /Làm quen với phím đàn.*Đã hoàn thành/ }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("metronome and daily timer pause correctly", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Bắt đầu", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Dừng lại", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Dừng lại", exact: true }).click();
  await page.getByRole("button", { name: "Buổi luyện 15 phút" }).click();
  const d = page.getByRole("dialog");
  await d.getByRole("button", { name: "Bắt đầu luyện", exact: true }).click();
  await expect(d.locator(".daily-clock")).toContainText("14:59");
  await d.getByRole("button", { name: "Tạm dừng", exact: true }).click();
  const time = await d.locator(".daily-clock").textContent();
  await page.waitForTimeout(1300);
  expect(await d.locator(".daily-clock").textContent()).toBe(time);
  await d.getByRole("button", { name: "Lưu và nghỉ" }).click();
  await page
    .getByRole("button", { name: "Tiến độ của bạn", exact: true })
    .click();
  await expect(
    page.getByText("Buổi luyện 15 phút", { exact: true }),
  ).toBeVisible();
});
test("responsive layout and guest account messaging", async ({ page }) => {
  await page.goto("/");
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflows).toBe(false);
  await page
    .getByRole("button", { name: "Tài khoản & kết nối", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Tiếp tục với Google" }),
  ).toBeVisible();
  await expect(
    page.getByText("Chế độ khách lưu tiến độ trên trình duyệt này."),
  ).toBeVisible();
});
