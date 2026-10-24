import { Capacitor, registerPlugin } from "@capacitor/core";
export type MidiDevice = { id: string; name: string };
export type MidiAttack = {
  note: number;
  seq: number;
  held: number[];
  at?: number;
  velocity?: number;
};
export type MidiNote = {
  note: number;
  velocity: number;
  on: boolean;
  at?: number;
};
interface NativeMidi {
  shareProgress(options: { json: string }): Promise<void>;
  start(): Promise<{ devices: MidiDevice[] }>;
  stop(): Promise<void>;
  addListener(
    event: "note",
    cb: (note: MidiNote) => void,
  ): Promise<{ remove: () => Promise<void> }>;
  addListener(
    event: "devices",
    cb: (event: { devices: MidiDevice[] }) => void,
  ): Promise<{ remove: () => Promise<void> }>;
}
const native = registerPlugin<NativeMidi>("PianoMidi");
type MidiInput = {
  id: string;
  name?: string;
  state: string;
  onmidimessage: ((e: { data: Uint8Array }) => void) | null;
};
type MidiAccess = {
  inputs: Map<string, MidiInput>;
  onstatechange: (() => void) | null;
};
export function midiAvailable() {
  return Capacitor.getPlatform() === "ios" || "requestMIDIAccess" in navigator;
}
export async function connectMidi(
  onNote: (event: MidiNote) => void,
  onDevices: (devices: MidiDevice[]) => void,
): Promise<() => Promise<void>> {
  if (Capacitor.getPlatform() === "ios") {
    const n = await native.addListener("note", onNote),
      d = await native.addListener("devices", (e) => onDevices(e.devices));
    try {
      const result = await native.start();
      onDevices(result.devices);
    } catch (e) {
      await n.remove();
      await d.remove();
      throw e;
    }
    return async () => {
      await n.remove();
      await d.remove();
      await native.stop();
    };
  }
  const request = (
    navigator as unknown as { requestMIDIAccess?: () => Promise<MidiAccess> }
  ).requestMIDIAccess;
  if (!request)
    throw new Error(
      "Safari chưa hỗ trợ MIDI. Hãy dùng ứng dụng Piano Sprout iOS hoặc trình duyệt hỗ trợ Web MIDI trên máy tính.",
    );
  const access = await request.call(navigator);
  const refresh = () => {
    const devices: MidiDevice[] = [];
    access.inputs.forEach((input) => {
      if (input.state === "disconnected") {
        input.onmidimessage = null;
        return;
      }
      devices.push({ id: input.id, name: input.name ?? "MIDI keyboard" });
      input.onmidimessage = (e) => {
        const [status, note, velocity] = e.data,
          command = status & 0xf0;
        if (command === 0x90 || command === 0x80)
          onNote({
            note,
            velocity,
            on: command === 0x90 && velocity > 0,
            at: performance.now(),
          });
      };
    });
    onDevices(devices);
  };
  refresh();
  access.onstatechange = refresh;
  return async () => {
    access.onstatechange = null;
    access.inputs.forEach((input) => {
      input.onmidimessage = null;
    });
    onDevices([]);
  };
}

export async function shareNativeProgress(json: string) {
  await native.shareProgress({ json });
}
