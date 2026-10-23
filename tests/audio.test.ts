import { afterEach, beforeEach, expect, it, vi } from "vitest";

const { nativeAudio, usesNativeAudio } = vi.hoisted(() => ({
  nativeAudio: {
    prepare: vi.fn(),
    play: vi.fn(),
    stop: vi.fn(),
    status: vi.fn(),
  },
  usesNativeAudio: vi.fn(),
}));
vi.mock("../src/lib/native-audio", () => ({ nativeAudio, usesNativeAudio }));
let state: string;
const resume = vi.fn();
const createContext = vi.fn();
beforeEach(() => {
  vi.resetModules();
  state = "suspended";
  usesNativeAudio.mockReturnValue(false);
  resume.mockReset().mockImplementation(() => {
    state = "running";
    return Promise.resolve();
  });
  createContext.mockClear();
  Object.values(nativeAudio).forEach((mock) =>
    mock.mockReset().mockResolvedValue(undefined),
  );
  vi.stubGlobal(
    "AudioContext",
    class {
      constructor() {
        createContext();
      }
      get state() {
        return state;
      }
      resume = resume;
    },
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

it("resumes browsers directly in the tap and after an interruption", async () => {
  const { unlockAudio } = await import("../src/lib/audio");
  const pending = unlockAudio();
  expect(resume).toHaveBeenCalledOnce();
  await pending;
  state = "suspended";
  await unlockAudio();
  expect(resume).toHaveBeenCalledTimes(2);
  expect(nativeAudio.prepare).not.toHaveBeenCalled();
});
it("bounds a stalled browser resume so another tap can retry", async () => {
  vi.useFakeTimers();
  resume.mockImplementationOnce(() => new Promise(() => {}));
  const { unlockAudio } = await import("../src/lib/audio");
  const result = expect(unlockAudio()).rejects.toThrow("timed out");
  await vi.advanceTimersByTimeAsync(3000);
  await result;
  await expect(unlockAudio()).resolves.toHaveProperty("state", "running");
});
it("recreates a closed browser context", async () => {
  const { unlockAudio } = await import("../src/lib/audio");
  const first = await unlockAudio();
  state = "closed";
  expect(await unlockAudio()).not.toBe(first);
});
it("plays iOS notes and scheduled clicks without creating any Web Audio context", async () => {
  usesNativeAudio.mockReturnValue(true);
  const { unlockAudio, playNote, stopAudio } = await import("../src/lib/audio");
  const clock = await unlockAudio();
  playNote(60, 0.7);
  playNote(96, 0.04, true, clock.currentTime + 0.08);
  expect(createContext).not.toHaveBeenCalled();
  expect(nativeAudio.play.mock.calls[0][0]).toMatchObject({
    midi: 60,
    duration: 0.7,
    delay: 0,
    volume: 0.22,
  });
  const click = nativeAudio.play.mock.calls[1][0];
  expect(click).toMatchObject({ midi: 96, click: true, volume: 0.15 });
  expect(click.delay).toBeGreaterThan(0.05);
  expect(click.delay).toBeLessThanOrEqual(0.08);
  stopAudio();
  expect(nativeAudio.stop).toHaveBeenCalledOnce();
});
it("does not play after failed iOS activation and reports the failure", async () => {
  usesNativeAudio.mockReturnValue(true);
  nativeAudio.prepare.mockRejectedValue(new Error("Session unavailable"));
  nativeAudio.status.mockResolvedValue({ backend: "ios-native-v2" });
  const { unlockAudio, playNote, audioStatus } =
    await import("../src/lib/audio");
  await expect(unlockAudio()).rejects.toThrow("Session unavailable");
  playNote(60);
  expect(nativeAudio.play).not.toHaveBeenCalled();
  expect(await audioStatus()).toMatchObject({ error: "Session unavailable" });
});
it("surfaces a native playback rejection after activation", async () => {
  usesNativeAudio.mockReturnValue(true);
  nativeAudio.play.mockRejectedValue(new Error("Playback failed"));
  nativeAudio.status.mockResolvedValue({ backend: "ios-native-v2" });
  const { unlockAudio, playNote, audioStatus } =
    await import("../src/lib/audio");
  await unlockAudio();
  playNote(60);
  await Promise.resolve();
  expect(await audioStatus()).toMatchObject({ error: "Playback failed" });
});
