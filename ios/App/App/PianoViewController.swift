import Capacitor

class PianoViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(PianoMidiPlugin())
        bridge?.registerPluginInstance(PianoAudioPlugin())
    }
}
