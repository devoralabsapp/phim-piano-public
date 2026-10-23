import { test as base, expect } from "@playwright/test";

// These scenarios exercise Vietnamese labels explicitly. Saved language changes
// still win on reload; default-language scenarios use Playwright's base test.
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      if (localStorage.getItem("phim:language") === null) {
        localStorage.setItem("phim:language", "vi");
      }
    });
    await use(page);
  },
});
export { expect };
