import { describe, it, expect } from "vitest";
import { parseTheme, themes } from "../src/lib/theme";
describe("theme preferences", () => {
  it("preserves supported choices and falls back safely for invalid storage", () => {
    for (const theme of themes) expect(parseTheme(theme.id)).toBe(theme.id);
    for (const invalid of [null, undefined, "", "dark", "__proto__", 42, {}])
      expect(parseTheme(invalid)).toBe("sprout");
  });
});
