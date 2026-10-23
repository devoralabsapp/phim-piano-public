import { test, expect } from "../vietnamese-fixture";

test("sound check generates audible samples and translates its status", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const Original = window.AudioContext;
    (window as unknown as { audioSamples: number }).audioSamples = 0;
    window.AudioContext = class extends Original {
      constructor(options?: AudioContextOptions) {
        super(options);
        const analyser = this.createAnalyser();
        const destination = this.destination;
        const originalConnect = AudioNode.prototype.connect;
        const data = new Float32Array(1024);
        this.createGain = (() => {
          const original = Original.prototype.createGain.bind(this);
          return () => {
            const gain = original();
            gain.connect = ((target: AudioNode, ...args: unknown[]) => {
              if (target === destination) originalConnect.call(gain, analyser);
              return originalConnect.call(gain, target, ...(args as []));
            }) as typeof gain.connect;
            return gain;
          };
        })();
        setInterval(() => {
          analyser.getFloatTimeDomainData(data);
          if (data.some((v) => Math.abs(v) > 0.001))
            (window as unknown as { audioSamples: number }).audioSamples++;
        }, 20);
      }
    };
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Tài khoản & kết nối", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Phát thử âm thanh", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("web-audio");
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as unknown as { audioSamples: number }).audioSamples,
      ),
    )
    .toBeGreaterThan(0);
  await page.getByLabel("Ngôn ngữ", { exact: true }).selectOption("en");
  await expect(
    page.getByRole("heading", { name: "Sound check", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Test sound", exact: true }),
  ).toBeVisible();
});

test("sound check displays activation failure", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(AudioContext.prototype, "state", {
      get: () => "suspended",
    });
    AudioContext.prototype.resume = () =>
      Promise.reject(new Error("Audio device unavailable"));
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Tài khoản & kết nối", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Phát thử âm thanh", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "Audio device unavailable",
  );
});
