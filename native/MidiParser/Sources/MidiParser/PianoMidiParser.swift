import Foundation

// MIDI 1.0 stream parser: preserves running status and split messages per source.
final class PianoMidiParser {
    private var status: UInt8 = 0
    private var data: [UInt8] = []
    private var inSysEx = false
    func feed(_ bytes: [UInt8], emit: (UInt8, UInt8, Bool) -> Void) {
        for byte in bytes {
            if byte >= 0xF8 { continue } // Real-time messages can appear inside any message.
            if byte == 0xF0 { inSysEx = true; status = 0; data.removeAll(); continue }
            if byte == 0xF7 { inSysEx = false; status = 0; data.removeAll(); continue }
            if inSysEx { continue }
            if byte & 0x80 != 0 {
                status = byte < 0xF0 ? byte : 0
                data.removeAll()
                continue
            }
            guard status != 0 else { continue }
            data.append(byte)
            let command = status & 0xF0
            let length = command == 0xC0 || command == 0xD0 ? 1 : 2
            if data.count == length {
                if command == 0x90 || command == 0x80 {
                    emit(data[0], data[1], command == 0x90 && data[1] > 0)
                }
                data.removeAll(keepingCapacity: true)
            }
        }
    }
}
