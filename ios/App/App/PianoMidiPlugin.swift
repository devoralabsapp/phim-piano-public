import Foundation
import UIKit
import Capacitor
import CoreMIDI

@objc(PianoMidiPlugin)
public class PianoMidiPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "PianoMidiPlugin"
    public let jsName = "PianoMidi"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stop", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "shareProgress", returnType: CAPPluginReturnPromise)
    ]
    private var client = MIDIClientRef()
    private var port = MIDIPortRef()
    private var sources = Set<MIDIEndpointRef>()
    private var parsers: [MIDIEndpointRef: PianoMidiParser] = [:]

    @objc func start(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { call.reject("MIDI không khả dụng."); return }
            if self.client == 0 {
                let result = MIDIClientCreateWithBlock("Phim MIDI" as CFString, &self.client) { [weak self] _ in
                    DispatchQueue.main.async { self?.refreshSources() }
                }
                guard result == noErr else { call.reject("Không tạo được MIDI client: \(result)"); return }
                let portResult = MIDIInputPortCreateWithBlock(self.client, "Piano input" as CFString, &self.port) { [weak self] packetList, sourceContext in
                    let source = MIDIEndpointRef(UInt(bitPattern: sourceContext))
                    var messages: [UInt8] = []
                    // Read variable-sized packets from their original allocation, never copy the packet list.
                    let offset = MemoryLayout<MIDIPacketList>.offset(of: \MIDIPacketList.packet)!
                    var packet = UnsafeRawPointer(packetList).advanced(by: offset).assumingMemoryBound(to: MIDIPacket.self)
                    let dataOffset = MemoryLayout<MIDIPacket>.offset(of: \MIDIPacket.data)!
                    for _ in 0..<packetList.pointee.numPackets {
                        let bytes = UnsafeRawPointer(packet).advanced(by: dataOffset).assumingMemoryBound(to: UInt8.self)
                        messages.append(contentsOf: UnsafeBufferPointer(start: bytes, count: Int(packet.pointee.length)))
                        packet = UnsafePointer(MIDIPacketNext(packet))
                    }
                    DispatchQueue.main.async {
                        guard let self = self, self.client != 0, self.sources.contains(source) else { return }
                        let parser = self.parsers[source] ?? PianoMidiParser()
                        self.parsers[source] = parser
                        parser.feed(messages) { note, velocity, on in
                            self.notifyListeners("note", data: ["note": Int(note), "velocity": Int(velocity), "on": on])
                        }
                    }
                }
                guard portResult == noErr else { self.dispose(); call.reject("Không mở được MIDI input: \(portResult)"); return }
            }
            self.refreshSources()
            call.resolve(["devices": self.devices()])
        }
    }
    @objc func stop(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in self?.dispose(); call.resolve() }
    }
    @objc func shareProgress(_ call: CAPPluginCall) {
        guard let json = call.getString("json"), json.utf8.count <= 2_000_000 else {
            call.reject("Dữ liệu xuất không hợp lệ."); return
        }
        DispatchQueue.main.async { [weak self] in
            guard let controller = self?.bridge?.viewController else { call.reject("Không mở được chia sẻ."); return }
            let file = FileManager.default.temporaryDirectory.appendingPathComponent("phim-tien-do-\(UUID().uuidString).json")
            do {
                try json.write(to: file, atomically: true, encoding: .utf8)
                let activity = UIActivityViewController(activityItems: [file], applicationActivities: nil)
                activity.popoverPresentationController?.sourceView = controller.view
                activity.popoverPresentationController?.sourceRect = CGRect(x: controller.view.bounds.midX, y: controller.view.bounds.midY, width: 1, height: 1)
                activity.completionWithItemsHandler = { _, _, _, error in
                    try? FileManager.default.removeItem(at: file)
                    if let error = error { call.reject(error.localizedDescription) } else { call.resolve() }
                }
                controller.present(activity, animated: true)
            } catch { call.reject("Không xuất được tiến độ: \(error.localizedDescription)") }
        }
    }
    private func refreshSources() {
        guard client != 0, port != 0 else { return }
        var available = Set<MIDIEndpointRef>()
        for i in 0..<MIDIGetNumberOfSources() {
            let source = MIDIGetSource(i)
            guard source != 0 else { continue }
            available.insert(source)
            if !sources.contains(source) {
                let result = MIDIPortConnectSource(port, source, UnsafeMutableRawPointer(bitPattern: Int(source)))
                if result == noErr { sources.insert(source) }
            }
        }
        for source in sources.subtracting(available) {
            MIDIPortDisconnectSource(port, source)
            sources.remove(source)
            parsers.removeValue(forKey: source)
        }
        notifyListeners("devices", data: ["devices": devices()])
    }
    private func devices() -> [[String: String]] {
        sources.sorted().map { source in
            var displayName: Unmanaged<CFString>?
            let result = MIDIObjectGetStringProperty(source, kMIDIPropertyDisplayName, &displayName)
            var name = "MIDI keyboard"
            if result == noErr, let value = displayName { name = value.takeRetainedValue() as String }
            return ["id": String(source), "name": name]
        }
    }
    private func dispose() {
        if port != 0 { MIDIPortDispose(port); port = 0 }
        if client != 0 { MIDIClientDispose(client); client = 0 }
        sources.removeAll()
        parsers.removeAll()
    }
    deinit { dispose() }
}
