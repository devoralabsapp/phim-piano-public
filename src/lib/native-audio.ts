import { Capacitor, registerPlugin } from "@capacitor/core";

export interface NativeAudioStatus {
  backend: string;
  volume: number;
  route: string;
  category: string;
  microphone: boolean;
}
export interface NativeNote {
  midi: number;
  duration: number;
  click: boolean;
  delay: number;
  volume: number;
}
export const nativeAudio = registerPlugin<{
  prepare(): Promise<NativeAudioStatus>;
  play(note: NativeNote): Promise<void>;
  status(): Promise<NativeAudioStatus>;
  setMicrophone(options: { active: boolean }): Promise<void>;
  stop(): Promise<void>;
}>("PianoAudio");

export function usesNativeAudio() {
  return Capacitor.getPlatform() === "ios";
}

export function setNativeMicrophone(active: boolean): Promise<void> {
  return usesNativeAudio()
    ? nativeAudio.setMicrophone({ active })
    : Promise.resolve();
}
