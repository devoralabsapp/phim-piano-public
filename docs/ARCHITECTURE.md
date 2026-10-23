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
| Auth | `src/lib/auth.ts` | Optional Supabase client, Google PKCE, native callback |
| iOS | `ios/App/App/` | CoreMIDI, AVAudioPlayer, share/export, app lifecycle |
| Native unit packages | `native/MidiParser/`, `native/PianoAudio/` | Parser and PCM checks without a device |
| Database | `supabase/migrations/`, `setup/` | Session schema, ownership policies and privileges |

## Data flow

Guest sessions are stored separately from each authenticated user's local history. Supabase sync runs only when configured and signed in; the database must enforce ownership through RLS. Guest progress is imported by explicit user action, not silently merged across accounts. Stable IDs and deterministic merging prevent duplicate imports.

Google login uses PKCE. Web redirects return to the current origin's `/auth/callback`; native redirects use `com.phim.piano://auth/callback`. Client environment variables are bundled into the app and must never hold administrator secrets.

Microphone pitch detection processes samples on the device rather than uploading recordings. Screen keys and web playback use browser audio; iOS playback uses AVAudioPlayer with synthesized PCM notes. MIDI note-on/off events feed the practice logic, and device latency affects rhythm feedback.

## Test boundaries

Unit tests cover domain, practice, course, localization, and audio logic. Playwright covers web flows with synthetic input and mocked auth; its iPad/iPhone projects are browser viewport/touch configurations, not physical devices. Swift packages test parsing and PCM generation. CI performs an unsigned iOS Simulator build.

Real-device sound routes, permission prompts, microphone behavior, USB cabling, timing latency, actual OAuth return-to-app, and cross-device synchronization need manual validation on deployments/devices the tester owns. See [iOS guidance](IOS.md).

## What is not included

No shared production credentials, hosted database account, payment/Premium system, teacher assessment, or automatic OpenAI API integration is part of the public repository. AI coding tools may assist development; the application itself does not require Codex or an OpenAI API key.
