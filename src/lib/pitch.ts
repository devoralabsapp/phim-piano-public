import { setNativeMicrophone } from "./native-audio";

// YIN difference function. Returns a single stable fundamental, never a chord.
export function detectPitch(
  samples: Float32Array,
  sampleRate: number,
): { midi: number; frequency: number; confidence: number } | null {
  const mean = samples.reduce((s, v) => s + v, 0) / samples.length;
  const rms = Math.sqrt(
    samples.reduce((s, v) => s + (v - mean) ** 2, 0) / samples.length,
  );
  if (rms < 0.008) return null;
  const min = Math.floor(sampleRate / 2100),
    max = Math.min(
      Math.floor(sampleRate / 65),
      Math.floor(samples.length / 2) - 1,
    ),
    length = samples.length - max;
  const diff = new Float32Array(max + 1);
  let sum = 0;
  for (let lag = 1; lag <= max; lag++) {
    let d = 0;
    for (let i = 0; i < length; i++) d += (samples[i] - samples[i + lag]) ** 2;
    sum += d;
    diff[lag] = sum ? (d * lag) / sum : 1;
  }
  let lag = min;
  for (; lag < max; lag++)
    if (diff[lag] < 0.15) {
      while (lag + 1 <= max && diff[lag + 1] < diff[lag]) lag++;
      break;
    }
  if (lag >= max || diff[lag] > 0.15) return null;
  const left = diff[lag - 1],
    center = diff[lag],
    right = diff[lag + 1];
  const correction = (left - right) / (2 * (left - 2 * center + right));
  const frequency =
    sampleRate / (lag + (Number.isFinite(correction) ? correction : 0));
  const value = 69 + 12 * Math.log2(frequency / 440),
    midi = Math.round(value);
  return midi >= 36 && midi <= 96 && Math.abs(value - midi) < 0.4
    ? { midi, frequency, confidence: 1 - center }
    : null;
}
export async function listenMicrophone(
  onNote: (note: number, on: boolean, at: number) => void,
  onPitch: (note: number | null) => void,
  signal: AbortSignal,
) {
  if (!navigator.mediaDevices?.getUserMedia)
    throw new Error("Micro cần HTTPS và trình duyệt hỗ trợ.");
  if (signal.aborted) return () => {};
  const context = new AudioContext();
  let stream: MediaStream | undefined;
  let timer: ReturnType<typeof setInterval> | undefined,
    active: number | null = null,
    candidate: number | null = null,
    stable = 0,
    silent = 0;
  let stopped = false;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    if (timer) clearInterval(timer);
    stream?.getTracks().forEach((t) => t.stop());
    signal.removeEventListener("abort", stop);
    void context.close().catch(() => {});
    void setNativeMicrophone(false).catch(() => {});
    onPitch(null);
  };
  signal.addEventListener("abort", stop, { once: true });
  try {
    // Resume from the tap before waiting for the native bridge.
    const resume = context.resume();
    await setNativeMicrophone(true);
    await resume;
    if (signal.aborted) {
      stop();
      return stop;
    }
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });
    if (signal.aborted) stream.getTracks().forEach((t) => t.stop());
    if (signal.aborted) {
      stop();
      return stop;
    }
    const source = context.createMediaStreamSource(stream),
      analyser = context.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    const data = new Float32Array(analyser.fftSize);
    timer = setInterval(() => {
      analyser.getFloatTimeDomainData(data);
      const pitch = detectPitch(data, context.sampleRate),
        n = pitch?.midi ?? null;
      onPitch(n);
      if (n === null) {
        silent++;
        stable = 0;
        candidate = null;
        if (silent >= 3 && active !== null) {
          onNote(active, false, performance.now());
          active = null;
        }
        return;
      }
      silent = 0;
      if (n === candidate) stable++;
      else {
        candidate = n;
        stable = 1;
      }
      if (stable >= 3 && n !== active) {
        if (active !== null) onNote(active, false, performance.now());
        active = n;
        onNote(n, true, performance.now());
      }
    }, 50);
    return stop;
  } catch (e) {
    stop();
    throw e;
  }
}
