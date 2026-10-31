# Architecture and trust boundaries

## Overview

The web UI runs locally or as a static single-page application. A Capacitor shell bundles the same UI for iOS and supplies native audio/MIDI plugins. Cloud authentication and progress sync are optional; guest practice needs no backend account.

| Area | Entry points | Responsibility |
| --- | --- | --- |
| UI | `src/App.tsx`, `src/components/` | Navigation, lessons, practice, account controls |
| Musical content | `src/lib/course.ts`, `curriculum.ts`, `library.ts` | Stable lesson IDs, note groups, practice arrangements |
| Localization | `src/lib/locale.ts`, `i18n.tsx`, `locales/` | English default, Vietnamese support, persisted choice |
| Practice logic | `src/lib/practice.ts`, `training.ts`, `pitch.ts` | Timing, assessment, pitch detection |
| Sound/MIDI | `src/lib/audio.ts`, `native-audio.ts`, `midi.ts` | Browser/native playback and input adapters |
| Progress | `src/lib/domain.ts`, `storage.ts`, `useProgress.ts` | Validation, local storage, merge/deduplication, optional sync |
| Auth | `src/lib/auth.ts` | Optional Firebase client, Google login, native callback |
| iOS | `ios/App/App/` | CoreMIDI, AVAudioPlayer, share/export, app lifecycle |
| Native unit packages | `native/MidiParser/`, `native/PianoAudio/` | Parser and PCM checks without a device |
| Database | `firestore.rules`, `firebase.json` | Owner-scoped sessions and schema validation |

## Appearance themes

`src/lib/theme.ts` defines theme IDs and labels. `ThemeProvider` in `theme-context.tsx` persists `piano-sprout:theme` independently of language and progress; `public/theme-init.js` applies the validated choice before React renders. `ThemeSwitcher` uses the shared keyboard-accessible `PreferenceMenu`.

Palettes live in `src/styles.css` under `:root[data-theme="..."]`. Playful Retro Neo-Brutalism adds reusable `--retro-*` colors, border, radius, and hard-shadow tokens, then maps them to the existing semantic palette. Its component overrides stay scoped to `playful-retro`. Fredoka/Nunito are optional Google Fonts with local fallbacks. Reduced-motion preferences disable transitions and hover movement.

To add a theme, register its ID in the catalog and bootstrap allowlist, add scoped tokens/styles and a preview swatch, translate its description, and extend `tests/e2e/themes.spec.ts`. Preserve the Sprout fallback and existing saved preferences.

## Data flow

Guest sessions are stored separately from each authenticated user's local history. Firebase sync runs only when configured and signed in; the database must enforce ownership through Firestore Security Rules. Guest progress is imported by explicit user action, not silently merged across accounts. Stable IDs and deterministic merging prevent duplicate imports.

Google login uses Firebase Auth popups on web and a native Google credential on iOS. The old `com.phim.piano` scheme is retained alongside Google's reversed client ID scheme. Client environment variables are bundled into the app and must never hold administrator secrets.

Microphone pitch detection processes samples on the device rather than uploading recordings. Screen keys and web playback use browser audio; iOS playback uses AVAudioPlayer with synthesized PCM notes. MIDI note-on/off events feed the practice logic, and device latency affects rhythm feedback.

## Test boundaries

Unit tests cover domain, practice, course, localization, and audio logic. Playwright covers web flows with synthetic input and mocked auth; its iPad/iPhone projects are browser viewport/touch configurations, not physical devices. Swift packages test parsing and PCM generation. CI performs an unsigned iOS Simulator build.

Real-device sound routes, permission prompts, microphone behavior, USB cabling, timing latency, actual OAuth return-to-app, and cross-device synchronization need manual validation on deployments/devices the tester owns. See [iOS guidance](IOS.md).

## What is not included

No shared production credentials, hosted database account, payment/Premium system, teacher assessment, or automatic OpenAI API integration is part of the public repository. AI coding tools may assist development; the application itself does not require Codex or an OpenAI API key.

See [Firebase configuration](FIREBASE.md) for the active backend and emulator tests. SQL migrations in `supabase/` are historical.
