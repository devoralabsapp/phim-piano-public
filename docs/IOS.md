# Run Piano Sprout on iPad or iPhone with Xcode

**English** | [Tiếng Việt](IOS.vi.md)

Project: `ios/App/App.xcodeproj`; scheme: **App**; minimum iOS: 15.0. Web assets are bundled locally; the app does not depend on a hosted website to render. MIDI uses native Swift CoreMIDI.

## Set up on your Mac

1. Install Xcode compatible with your device's iOS version and Node.js 22.12+.
2. Run `npm ci`. If you want cloud features, configure `.env.local` using [SETUP.md](SETUP.md). Run `npm run ios:sync`.
3. Run `npm run ios:open` or open the project directly.
4. In Signing & Capabilities, choose your Apple Team and automatic signing. Replace the sample bundle ID `org.example.phimpiano` in both `capacitor.config.ts` and the Xcode target with your own ID.
5. Keep the OAuth scheme `com.phim.piano` unless you also update the auth code, Info.plist, and Supabase allowlist. Its callback is `com.phim.piano://auth/callback`; it intentionally differs from the bundle ID.
6. Connect your device, enable Developer Mode when requested, select it, and Run. Personal Apple accounts have signing limitations; TestFlight requires Apple Developer Program membership.
7. After web or environment changes, run `npm run ios:sync` before rebuilding.

The app starts in English on a new installation. Choose **Tiếng Việt** from the language selector to use Vietnamese; the preference is saved.

## Connect a Yamaha YDP-163

- USB-C iPad: connect the piano's USB TO HOST (USB-B) port with a data-capable USB-C cable/adapter.
- Lightning iPhone: use USB-B to USB-A plus an appropriate Lightning USB camera adapter, with power if needed.
- Open **Practice room** or **Account & connections**, then connect MIDI. Start a lesson in MIDI mode.
- Match the note and octave. For chords, press and hold every note together, then release before the next group. Velocity-zero messages are treated as note-off; the parser supports running status, fragmented packets, and hot-plugging.
- Rhythm scoring includes a count-in and early/late, missing/extra-note, and MIDI hold-time feedback. It does not assess pedal, posture, or expression.

The microphone is optional single-note input, processed on the device without recording/uploading audio. Permission is requested when enabled. Test permission behavior on a real device and use MIDI for chords.

## Build and hardware checks

```sh
xcodebuild -project ios/App/App.xcodeproj -scheme App -sdk iphonesimulator \
  -configuration Debug -destination 'generic/platform=iOS Simulator' \
  CODE_SIGNING_ALLOWED=NO build
swift test --package-path native/MidiParser
swift test --package-path native/PianoAudio
```

Test Google OAuth returning to the app, progress after restart, cross-device sync, note-on/off, cable disconnect/reconnect, rhythm latency, microphone release in the background, and technique video playback. A simulator build or unit test does not replace these physical-device checks.

## Native sound check

iOS keys, playback, and the metronome use AVAudioPlayer with synthesized PCM notes. Listening does not require microphone permission. The app enables recording/playback mode only when microphone practice is enabled; the web version uses Web Audio.

After syncing and installing the current build:

1. Open **Account & connections → Sound check** and play the test sound.
2. Confirm the backend is **ios-native-v2** and check the volume and output route.
3. Listen for C–E–G, then test screen keys, playback, chords, and the metronome. Test speakers/headphones, silent mode, background/foreground transitions, and microphone on/off.
4. If audio is silent, include the backend, volume, output route, and diagnostic error when reporting it. Never include account tokens or user practice data.

References: [Capacitor iOS](https://capacitorjs.com/docs/ios), [custom native code](https://capacitorjs.com/docs/ios/custom-code), [CoreMIDI](https://developer.apple.com/documentation/coremidi).
