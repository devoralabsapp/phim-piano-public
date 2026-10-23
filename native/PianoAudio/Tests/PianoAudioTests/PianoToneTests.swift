import XCTest
@testable import PianoAudio

final class PianoToneTests: XCTestCase {
    func testWaveHasValidPCMHeaderAndAudibleSamples() {
        let wave = PianoTone.wave(midi: 69, duration: 0.7, click: false)
        XCTAssertEqual(String(data: wave[0..<4], encoding: .ascii), "RIFF")
        XCTAssertEqual(String(data: wave[8..<12], encoding: .ascii), "WAVE")
        XCTAssertEqual(wave.count, 44 + Int(44100.0 * 0.7) * 2)
        let bytes = [UInt8](wave)
        let samples = stride(from: 44, to: bytes.count, by: 2).map {
            Int16(bitPattern: UInt16(bytes[$0]) | UInt16(bytes[$0 + 1]) << 8)
        }
        XCTAssertGreaterThan(samples.map { abs(Int($0)) }.max()!, 5000)
        XCTAssertEqual(samples.first, 0)
        XCTAssertLessThan(abs(Int(samples.last!)), 10)
        // A4 should cross zero approximately 880 times per second.
        let crossings = zip(samples, samples.dropFirst()).filter { ($0 < 0) != ($1 < 0) }.count
        XCTAssertEqual(Double(crossings) / 0.7, 880, accuracy: 10)
    }
    func testInvalidRangeIsBoundedAndClickIsPlayable() {
        XCTAssertEqual(PianoTone.wave(midi: -100, duration: -1, click: true).count, 44 + 882 * 2)
        XCTAssertEqual(PianoTone.wave(midi: 500, duration: 100, click: true).count, 44 + 44100 * 15 * 2)
    }
}
