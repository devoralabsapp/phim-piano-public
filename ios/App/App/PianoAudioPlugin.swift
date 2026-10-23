import AVFoundation
import Capacitor
import UIKit

@objc(PianoAudioPlugin)
public class PianoAudioPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "PianoAudioPlugin"
    public let jsName = "PianoAudio"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "prepare", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "play", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "status", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setMicrophone", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stop", returnType: CAPPluginReturnPromise)
    ]
    private let audioQueue = DispatchQueue(label: "org.phimpiano.audio")
    private var players: [(player: AVAudioPlayer, until: TimeInterval)] = []
    private var microphone = false
    private let tones = NSCache<NSString, NSData>()
    private var pauseObserver: NSObjectProtocol?

    public override func load() {
        tones.totalCostLimit = 8 * 1024 * 1024
        pauseObserver = NotificationCenter.default.addObserver(
            forName: UIApplication.willResignActiveNotification, object: nil, queue: nil
        ) { [weak self] _ in
            self?.audioQueue.async { [weak self] in self?.stopPlayers() }
        }
    }
    deinit {
        if let observer = pauseObserver { NotificationCenter.default.removeObserver(observer) }
    }
    private func activate() throws {
        let session = AVAudioSession.sharedInstance()
        let category: AVAudioSession.Category = microphone ? .playAndRecord : .playback
        let options: AVAudioSession.CategoryOptions = microphone
            ? [.defaultToSpeaker, .allowBluetooth, .mixWithOthers]
            : [.mixWithOthers]
        if session.category != category || session.mode != .default || session.categoryOptions != options {
            try session.setCategory(category, mode: .default, options: options)
        }
        try session.setActive(true)
    }
    private func snapshot() -> JSObject {
        let session = AVAudioSession.sharedInstance()
        return [
            "backend": "ios-native-v2",
            "volume": session.outputVolume,
            "route": session.currentRoute.outputs.map { $0.portName }.joined(separator: ", "),
            "category": session.category.rawValue,
            "microphone": microphone
        ]
    }
    @objc func prepare(_ call: CAPPluginCall) {
        audioQueue.async {
            do { try self.activate(); call.resolve(self.snapshot()) }
            catch { call.reject("Unable to activate native audio", nil, error) }
        }
    }
    @objc func status(_ call: CAPPluginCall) {
        audioQueue.async { call.resolve(self.snapshot()) }
    }
    @objc func setMicrophone(_ call: CAPPluginCall) {
        audioQueue.async {
            self.microphone = call.getBool("active") ?? false
            do { try self.activate(); call.resolve() }
            catch { call.reject("Unable to configure microphone audio", nil, error) }
        }
    }
    @objc func play(_ call: CAPPluginCall) {
        let received = ProcessInfo.processInfo.systemUptime
        let midi = min(127, max(0, call.getInt("midi") ?? 60))
        let duration = min(15, max(0.02, call.getDouble("duration") ?? 0.7))
        let click = call.getBool("click") ?? false
        let volume = Float(min(1, max(0, call.getDouble("volume") ?? 0.22)))
        let delay = min(1, max(0, call.getDouble("delay") ?? 0))
        audioQueue.async {
            do {
                try self.activate()
                // Retain scheduled and playing voices for chords; release finished ones.
                self.players.removeAll { $0.until < ProcessInfo.processInfo.systemUptime }
                if self.players.count >= 32 { self.players.removeFirst().player.stop() }
                let key = "\(midi):\(duration):\(click)" as NSString
                let data: Data
                if let cached = self.tones.object(forKey: key) { data = cached as Data }
                else {
                    data = PianoTone.wave(midi: midi, duration: duration, click: click)
                    self.tones.setObject(data as NSData, forKey: key, cost: data.count)
                }
                let player = try AVAudioPlayer(data: data)
                player.volume = volume
                guard player.prepareToPlay() else {
                    call.reject("Unable to prepare piano tone"); return
                }
                let remaining = max(0, delay - (ProcessInfo.processInfo.systemUptime - received))
                let started = remaining > 0
                    ? player.play(atTime: player.deviceCurrentTime + remaining)
                    : player.play()
                guard started else { call.reject("Unable to play piano tone"); return }
                self.players.append((player: player, until: ProcessInfo.processInfo.systemUptime + remaining + duration + 0.1))
                call.resolve()
            } catch { call.reject("Native piano playback failed", nil, error) }
        }
    }
    private func stopPlayers() {
        players.forEach { $0.player.stop() }
        players.removeAll()
    }
    @objc func stop(_ call: CAPPluginCall) {
        audioQueue.async { self.stopPlayers(); call.resolve() }
    }
}
