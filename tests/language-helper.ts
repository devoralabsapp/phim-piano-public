import type { Page, Locator } from "@playwright/test";

export async function selectLanguage(
  scope: Page | Locator,
  locale: "en" | "vi",
) {
  await scope.getByRole("button", { name: /^(Language|Ngôn ngữ)$/ }).click();
  await scope
    .getByRole("menuitemradio", {
      name: locale === "en" ? "English" : "Tiếng Việt",
      exact: true,
    })
    .click();
}
