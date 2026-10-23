import { test, expect } from "@playwright/test";

test("new visitors start in English and can keep Vietnamese after reload", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page).toHaveTitle("Phím · Learn piano every day");
  await expect(
    page.getByRole("heading", { name: "A little piano, every day." }),
  ).toBeVisible();
  await expect(page.getByLabel("Language", { exact: true })).toHaveValue("en");
  await page.getByLabel("Language", { exact: true }).selectOption("vi");
  await expect(
    page.getByRole("heading", { name: "Một chút piano, mỗi ngày." }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
  await expect(page.getByLabel("Ngôn ngữ", { exact: true })).toHaveValue("vi");
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
