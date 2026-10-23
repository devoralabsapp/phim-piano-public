// swift-tools-version: 5.9
import PackageDescription
let package = Package(name: "MidiParser", products: [.library(name:"MidiParser", targets:["MidiParser"])], targets: [.target(name:"MidiParser"), .testTarget(name:"MidiParserTests",dependencies:["MidiParser"])])
