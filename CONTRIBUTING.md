# Contributing to Phím

Thanks for helping make piano practice more accessible. Contributions are welcome in English or Vietnamese. English is the default language of the app and repository documentation; keep Vietnamese support intact.

## Start here

- Read [README.md](README.md), [architecture](docs/ARCHITECTURE.md), and the [roadmap](docs/ROADMAP.md).
- Try guest mode: Node 22.12+, `npm ci`, then `npm run dev`. No cloud account is required.
- For a substantial feature, open an issue describing the user problem and proposed scope before writing a large patch.
- Useful first contributions include documentation corrections, keyboard/screen-reader checks, translation improvements, and reproducible bug reports. See the roadmap for specific starting points.

## Development map

- `src/components/`: React interface and practice flows.
- `src/lib/`: musical content, localization, timing, audio, pitch detection, storage, and optional authentication/sync.
- `tests/`: unit tests and browser scenarios; `native/`: isolated Swift parser/audio packages.
- `ios/`: native app and plugins; `supabase/`: schema and RLS policies for your own backend.

## Make a focused change

1. Fork the repository and create a feature branch.
2. Keep changes focused and explain the problem being solved. Avoid dependency/framework upgrades unrelated to the fix.
3. Preserve lesson/session IDs and progress compatibility. Never silently merge one account's history into another.
4. Keep both languages working. Vietnamese source strings are translation keys; add/update matching English entries rather than replacing keys indiscriminately.
5. Add a meaningful regression test when behavior changes. Documentation-only updates can be checked for working links and accurate instructions.
6. Open a pull request with a clear description, validation, and relevant limitations. Follow the PR template and [Code of Conduct](CODE_OF_CONDUCT.md).

## Validation

For web changes:

```sh
npm test
npm run build
npx playwright install chromium
CI=1 npm run test:e2e
CI=1 npm run test:auth
```

Keep ports 5173 and 5174 free. Most existing scenarios explicitly select Vietnamese; default-language scenarios verify English and saved Vietnamese preferences. Auth tests are mocked and do not prove real Google login.

For Swift/native changes on macOS, run relevant package tests and sync/build:

```sh
swift test --package-path native/MidiParser
swift test --package-path native/PianoAudio
npm run ios:sync
xcodebuild -project ios/App/App.xcodeproj -scheme App -sdk iphonesimulator \
  -configuration Debug -destination 'generic/platform=iOS Simulator' \
  CODE_SIGNING_ALLOWED=NO build
```

Report whether validation used a simulator or real hardware. Sound, microphone, MIDI cables, latency, and OAuth return-to-app require real-device checks. Do not claim those work based solely on compilation.

## Secrets, privacy, and security

Do not commit `.env.local`, signing files, personal handover notes, user practice logs, or private deployment identifiers. Use synthetic data in tests and screenshots. Do not run setup/migrations against a backend you do not own. Read [SECURITY.md](SECURITY.md) before reporting a vulnerability; never post credentials or exploit details in a public issue.

## AI-assisted contributions

Codex and other development tools may help with scoped tasks. Contributors remain responsible for understanding and reviewing every change, checking licenses, and providing real test evidence. Do not fabricate usage metrics, test results, issue activity, or hardware validation. [AGENTS.md](AGENTS.md) describes repository-specific boundaries and commands.

## License

By contributing, you agree that your contributions may be distributed under the repository's MIT license. Dependencies retain their original licenses. Do not add music, recordings, fonts, or artwork without compatible rights and attribution.

There is no guaranteed review or response time. Repository administrators coordinate review, merges, and releases through GitHub.
