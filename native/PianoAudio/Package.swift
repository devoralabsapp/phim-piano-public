// swift-tools-version: 5.9
import PackageDescription
let package = Package(name: "PianoAudio", products: [.library(name: "PianoAudio", targets: ["PianoAudio"])], targets: [.target(name: "PianoAudio"), .testTarget(name: "PianoAudioTests", dependencies: ["PianoAudio"])])
