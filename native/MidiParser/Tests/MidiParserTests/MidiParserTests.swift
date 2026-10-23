import XCTest
@testable import MidiParser

final class MidiParserTests: XCTestCase {
    func testRunningStatusAndVelocityZero() {
        let parser = PianoMidiParser()
        var events: [(UInt8, UInt8, Bool)] = []
        parser.feed([0x90,60,100,62,0,0x80,64,50]) { events.append(($0,$1,$2)) }
        XCTAssertEqual(events.count,3)
        XCTAssertEqual(events[0].0,60)
        XCTAssertTrue(events[0].2)
        XCTAssertFalse(events[1].2)
        XCTAssertFalse(events[2].2)
    }
    func testFragmentedMessageAndRealtime() {
        let parser = PianoMidiParser()
        var notes: [UInt8] = []
        parser.feed([0x90,60]) { note,_,_ in notes.append(note) }
        XCTAssertTrue(notes.isEmpty)
        parser.feed([0xF8,100,62,0xFE,70]) { note,_,_ in notes.append(note) }
        XCTAssertEqual(notes,[60,62])
    }
    func testSysExAndControlChangesAreIgnored() {
        let parser = PianoMidiParser()
        var notes: [UInt8] = []
        parser.feed([0xF0,1,2,0xF8,3,0xF7,0xB0,64,127,0xC0,2,0x90,67,80]) { note,_,_ in notes.append(note) }
        XCTAssertEqual(notes,[67])
    }
    func testParserStateIsIsolatedPerDevice() {
        let a=PianoMidiParser(),b=PianoMidiParser()
        var notes:[UInt8]=[]
        a.feed([0x90,60]) { note,_,_ in notes.append(note) }
        b.feed([100]) { note,_,_ in notes.append(note) }
        XCTAssertTrue(notes.isEmpty)
        a.feed([100]) { note,_,_ in notes.append(note) }
        XCTAssertEqual(notes,[60])
    }
}
