import { test, expect, type Page, type Locator } from "@playwright/test";
const choices = [
  ["Sprout", "sprout"],
  ["Command Line", "command-line"],
  ["Visual Code", "visual-code"],
  ["Warm Paper", "warm-paper"],
  ["Playful Retro Neo-Brutalism", "playful-retro"],
] as const;
async function choose(scope: Page | Locator, name: string) {
  await scope.getByRole("button", { name: "Appearance", exact: true }).click();
  await scope.getByRole("menuitemradio", { name, exact: true }).click();
}

test("all palettes persist, remain readable, and fit the viewport", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "sprout");
  for (const [label, id] of choices) {
    await choose(page, label);
    await expect(page.locator("html")).toHaveAttribute("data-theme", id);
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", id);
    await expect(
      page.getByRole("button", { name: "Appearance", exact: true }),
    ).toContainText(label);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    // Test real computed contrast, rather than only checking palette variables.
    const contrasts = await page.evaluate(() => {
      const rgb = (value: string) =>
        (value.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
      const luminance = (value: number[]) =>
        value
          .map((n) => {
            const s = n / 255;
            return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
          })
          .reduce((sum, n, i) => sum + n * [0.2126, 0.7152, 0.0722][i], 0);
      return [
        ".hero h2",
        ".primary",
        ".card h2",
        ".language-trigger",
        ".lesson-row",
      ].map((selector) => {
        const element = document.querySelector(selector)!;
        const text = luminance(rgb(getComputedStyle(element).color));
        let parent: Element | null = element;
        let background = "rgb(255, 255, 255)";
        while (parent) {
          const color = getComputedStyle(parent).backgroundColor;
          if (color !== "rgba(0, 0, 0, 0)" && color !== "transparent") {
            background = color;
            break;
          }
          parent = parent.parentElement;
        }
        const bg = luminance(rgb(background));
        return {
          selector,
          ratio: (Math.max(text, bg) + 0.05) / (Math.min(text, bg) + 0.05),
        };
      });
    });
    for (const result of contrasts)
      expect(
        result.ratio,
        `${label}: ${result.selector}`,
      ).toBeGreaterThanOrEqual(4.5);
    await page.getByRole("button", { name: "Appearance", exact: true }).click();
    const bounds = await page
      .getByRole("menu", { name: "Appearance", exact: true })
      .boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(
      page.viewportSize()!.width,
    );
    await page.keyboard.press("Escape");
  }
});

test("changing a theme during a lesson keeps its note and language", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Start your first lesson" }).click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("button", { name: "Start practicing", exact: true })
    .click();
  await dialog.getByRole("button", { name: "C4", exact: true }).click();
  const note = await dialog.locator(".next-note strong").innerText();
  await choose(dialog, "Command Line");
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme",
    "command-line",
  );
  await expect(dialog.locator(".next-note strong")).toHaveText(note);
  await expect(
    dialog.getByRole("button", { name: "Pause", exact: true }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Appearance", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("menu")).not.toBeVisible();
});

test("theme menus support keyboard selection and outside dismissal", async ({
  page,
}) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Appearance", exact: true });
  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await expect(
    page.getByRole("menuitemradio", { name: "Command Line", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme",
    "command-line",
  );
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole("button", { name: "Overview", exact: true }).click();
  await expect(
    page.getByRole("menu", { name: "Appearance", exact: true }),
  ).not.toBeVisible();
});

test("saved appearance is applied before React starts", async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("piano-sprout:theme", "playful-retro"),
  );
  await page.route(/\/src\/main\.tsx(?:\?.*)?$/, (route) => route.abort());
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme",
    "playful-retro",
  );
  await expect(page.locator("#root")).toBeEmpty();
});

test("an invalid preference safely uses Sprout", async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("piano-sprout:theme", "not-a-theme"),
  );
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "sprout");
  await expect(
    page.getByRole("heading", { name: "A little piano, every day." }),
  ).toBeVisible();
});

test("retro appearance spans all screens and preserves Vietnamese practice", async ({
  page,
}) => {
  await page.goto("/");
  await choose(page, "Playful Retro Neo-Brutalism");
  for (const screen of [
    "Learning path",
    "Music library",
    "Practice room",
    "Your progress",
    "Account & connections",
    "Overview",
  ]) {
    await page.getByRole("button", { name: screen, exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute(
      "data-theme",
      "playful-retro",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      screen,
    ).toBe(true);
  }
  await page.getByRole("button", { name: "Language", exact: true }).click();
  await page
    .getByRole("menuitemradio", { name: "Tiếng Việt", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
  await page
    .getByRole("button", { name: "Bắt đầu bài đầu tiên", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Giao diện", exact: true }),
  ).toContainText("Playful Retro Neo-Brutalism");
  await dialog
    .getByRole("button", { name: "Bắt đầu luyện", exact: true })
    .click();
  await dialog.getByRole("button", { name: "C4", exact: true }).click();
  await expect(
    dialog.getByRole("button", { name: "Tạm dừng", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
