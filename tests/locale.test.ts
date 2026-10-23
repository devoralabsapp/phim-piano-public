import { describe, it, expect } from "vitest";
import { translate, parseLocale, beatLabel } from "../src/lib/locale";
import { english } from "../src/lib/locales/en";
import { lessons, noteName } from "../src/lib/curriculum";
describe("language support", () => {
  it("keeps Vietnamese as the default and rejects unsupported preferences", () => {
    expect(parseLocale(null)).toBe("vi");
    expect(parseLocale("fr")).toBe("vi");
    expect(parseLocale("en")).toBe("en");
    expect(translate("vi", "Tổng quan")).toBe("Tổng quan");
  });
  it("translates every lesson instruction and quiz without altering musical data", () => {
    for (const lesson of lessons) {
      for (const source of [
        lesson.title,
        lesson.topic,
        lesson.intro,
        ...lesson.steps,
        lesson.question,
        ...lesson.answers,
      ]) {
        if (
          /[^\x00-\x7f]/.test(source) ||
          ["Sol", "Mi", "Fa", "La", "Si"].includes(source)
        ) {
          expect(Object.hasOwn(english, source), source).toBe(true);
          if (
            /[À-ỹ]/.test(source) ||
            ["Sol", "Mi", "Fa", "La", "Si"].includes(source)
          )
            expect(translate("en", source), source).not.toBe(source);
        }
      }
    }
    expect(noteName(60, "en")).toBe("C");
    expect(noteName(61, "en")).toBe("C♯");
    expect(noteName(48, "vi")).toBe("Đô");
  });
  it("interpolates feedback in both languages and preserves unknown external messages", () => {
    const key = "Bạn chơi {played}. Hãy tìm {expected}.",
      params = { played: "D4", expected: "C4" };
    expect(translate("en", key, params)).toBe("You played D4. Try C4.");
    expect(translate("vi", key, params)).toBe("Bạn chơi D4. Hãy tìm C4.");
    expect(translate("en", "A network error")).toBe("A network error");
  });
  it("handles inline whitespace and singular/fractional beat counts", () => {
    expect(translate("en", " phút")).toBe(" min");
    expect(translate("en", "Đàn MIDI ")).toBe("MIDI piano ");
    expect(beatLabel("en", 1)).toBe("1 beat");
    expect(beatLabel("en", 0.5)).toBe("0.5 beats");
    expect(beatLabel("en", 2)).toBe("2 beats");
    expect(beatLabel("vi", 2)).toBe("2 phách");
  });
});

it("translates native error prefixes and preserves diagnostic details", () => {
  expect(translate("en", "Không mở được MIDI input: -50")).toBe(
    "Unable to open MIDI input: -50",
  );
  expect(translate("vi", "Không mở được MIDI input: -50")).toBe(
    "Không mở được MIDI input: -50",
  );
  expect(translate("en", "constructor")).toBe("constructor");
});
