import Foundation

/// Mono PCM WAV, playable by AVAudioPlayer without a WebView or microphone.
public enum PianoTone {
    public static func wave(midi: Int, duration: Double, click: Bool) -> Data {
        let sampleRate = 44100
        let seconds = min(15, max(0.02, duration))
        let frames = Int(Double(sampleRate) * seconds)
        let byteCount = frames * 2
        var data = Data(capacity: 44 + byteCount)
        func text(_ value: String) { data.append(contentsOf: value.utf8) }
        func word(_ value: UInt16) {
            data.append(UInt8(value & 255)); data.append(UInt8(value >> 8))
        }
        func long(_ value: UInt32) {
            word(UInt16(value & 65535)); word(UInt16(value >> 16))
        }
        text("RIFF"); long(UInt32(36 + byteCount)); text("WAVEfmt ")
        long(16); word(1); word(1); long(UInt32(sampleRate))
        long(UInt32(sampleRate * 2)); word(2); word(16)
        text("data"); long(UInt32(byteCount))
        let frequency = 440 * pow(2, Double(min(127, max(0, midi)) - 69) / 12)
        for frame in 0..<frames {
            let time = Double(frame) / Double(sampleRate)
            let phase = 2 * Double.pi * frequency * time
            let tone = click ? sin(phase) : (sin(phase) + 0.2 * sin(2 * phase) + 0.08 * sin(3 * phase)) / 1.28
            let attack = min(1, time / 0.008)
            let release = exp(log(0.0001) * max(0, time - 0.008) / max(0.001, seconds - 0.008))
            let sample = Int16(max(-32767, min(32767, tone * attack * release * 32767)))
            word(UInt16(bitPattern: sample))
        }
        return data
    }
}
