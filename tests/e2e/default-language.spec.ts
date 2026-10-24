import { selectLanguage } from "../language-helper";
import { test, expect } from "@playwright/test";

test("new visitors start in English and can keep Vietnamese after reload", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page).toHaveTitle("Piano Sprout · Learn piano every day");
  await expect(
    page.getByRole("button", { name: "Piano Sprout — Overview", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "A little piano, every day." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Language", exact: true }),
  ).toContainText("English");
  await selectLanguage(page, "vi");
  await expect(
    page.getByRole("heading", { name: "Một chút piano, mỗi ngày." }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
  await expect(
    page.getByRole("button", { name: "Ngôn ngữ", exact: true }),
  ).toContainText("Tiếng Việt");
});

test("English is available when preference storage is blocked", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException("Storage blocked", "SecurityError");
    };
    Storage.prototype.setItem = () => {
      throw new DOMException("Storage blocked", "SecurityError");
    };
  });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(
    page.getByRole("heading", { name: "A little piano, every day." }),
  ).toBeVisible();
});

test("language menu supports keyboard dismissal and stays inside the viewport", async ({
  page,
}) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Language", exact: true });
  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  const menu = page.getByRole("menu", { name: "Language", exact: true });
  await expect(menu).toBeVisible();
  await expect(
    page.getByRole("menuitemradio", { name: "English", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(
    page.getByRole("menuitemradio", { name: "Tiếng Việt", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  const bounds = await page.getByRole("menu").boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
  await page.getByRole("button", { name: "Overview", exact: true }).click();
  await expect(page.getByRole("menu")).not.toBeVisible();
});

test("Escape closes only the language menu in a running lesson", async ({
  page,
}) => {
  await page.goto("/");
  await selectLanguage(page, "vi");
  await page.getByRole("button", { name: "Bắt đầu bài đầu tiên" }).click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("button", { name: "Bắt đầu luyện", exact: true })
    .click();
  await dialog.getByRole("button", { name: "Ngôn ngữ", exact: true }).click();
  await expect(dialog.getByRole("menu")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog.getByRole("menu")).not.toBeVisible();
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Tạm dừng", exact: true }),
  ).toBeVisible();
});
