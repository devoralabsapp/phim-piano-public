import { nativeAudio, usesNativeAudio } from "./native-audio";

export interface AudioClock {
  readonly currentTime: number;
}
const nativeClock: AudioClock = {
  get currentTime() {
    return performance.now() / 1000;
  },
};
let context: AudioContext | null = null;
let ready = false;
let lastError = "";
function audioFailure(error: unknown) {
  lastError = error instanceof Error ? error.message : String(error);
  if (typeof document !== "undefined")
    document.dispatchEvent(new Event("phim:audio-error"));
}
async function withTimeout<T>(pending: Promise<T>): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      pending,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(
          () => reject(new Error("Audio activation timed out")),
          3000,
        );
      }),
    ]);
  } finally {
    clearTimeout(timeout);
  }
}
export async function unlockAudio(): Promise<AudioClock> {
  lastError = "";
  try {
    if (usesNativeAudio()) {
      // iOS plays PCM tones through AVAudioPlayer, independently of WebKit's
      // AudioContext state, autoplay rules and audio-session overrides.
      await withTimeout(nativeAudio.prepare());
      ready = true;
      return nativeClock;
    }
    if (!context || context.state === "closed") context = new AudioContext();
    // Keep resume inside the original tap gesture on browsers.
    await withTimeout(
      context.state !== "running" ? context.resume() : Promise.resolve(),
    );
    if (context.state !== "running") throw new Error("Audio is suspended");
    return context;
  } catch (error) {
    ready = false;
    audioFailure(error);
    throw error;
  }
}
export async function audioStatus() {
  if (usesNativeAudio())
    return { ...(await nativeAudio.status()), error: lastError };
  return {
    backend: "web-audio",
    volume: null,
    route: "",
    category: context?.state ?? "idle",
    error: lastError,
  };
}
export function stopAudio() {
  if (usesNativeAudio()) void nativeAudio.stop().catch(audioFailure);
}
if (typeof document !== "undefined") {
  document.addEventListener("phim:pause", stopAudio);
}
export function playNote(
  midi: number,
  duration = 0.7,
  click = false,
  at?: number,
  volume = 0.22,
) {
  if (usesNativeAudio()) {
    if (!ready) return;
    void nativeAudio
      .play({
        midi,
        duration,
        click,
        volume: click ? 0.15 : volume,
        delay: Math.max(
          0,
          (at ?? nativeClock.currentTime) - nativeClock.currentTime,
        ),
      })
      .catch(audioFailure);
    return;
  }
  if (!context || context.state !== "running") return;
  const start = at ?? context.currentTime,
    g = context.createGain();
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(click ? 0.15 : volume, start + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  g.connect(context.destination);
  (click ? [1] : [1, 2, 3]).forEach((h, i) => {
    const o = context!.createOscillator(),
      v = context!.createGain();
    o.type = "sine";
    o.frequency.value = 440 * 2 ** ((midi - 69) / 12) * h;
    v.gain.value = [1, 0.2, 0.08][i];
    o.connect(v);
    v.connect(g);
    o.start(start);
    o.stop(start + duration + 0.01);
  });
}
export class Metronome {
  private timer: ReturnType<typeof setInterval> | undefined;
  private next = 0;
  private beat = 0;
  private bpm = 60;
  private meter = 4;
  onBeat?: (beat: number) => void;
  private visual: ReturnType<typeof setTimeout>[] = [];
  async start(bpm: number, meter = 4) {
    this.stop();
    const c = await unlockAudio();
    this.bpm = bpm;
    this.meter = meter;
    this.next = c.currentTime + 0.05;
    this.beat = 0;
    this.timer = setInterval(() => this.schedule(), 25);
    this.schedule();
  }
  setTempo(bpm: number) {
    this.bpm = bpm;
  }
  setMeter(meter: number) {
    this.meter = meter;
    this.beat = 0;
  }
  private schedule() {
    const clock = usesNativeAudio() ? nativeClock : context;
    if (!clock) return;
    while (this.next < clock.currentTime + 0.1) {
      const b = this.beat % this.meter;
      playNote(b === 0 ? 96 : 91, 0.045, true, this.next);
      const delay = Math.max(0, (this.next - clock.currentTime) * 1000);
      const id = setTimeout(() => {
        this.visual = this.visual.filter((x) => x !== id);
        this.onBeat?.(b);
      }, delay);
      this.visual.push(id);
      this.next += 60 / this.bpm;
      this.beat++;
    }
  }
  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    this.visual.forEach(clearTimeout);
    this.visual = [];
  }
}
