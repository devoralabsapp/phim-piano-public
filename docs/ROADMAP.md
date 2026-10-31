# Roadmap and ways to help

Piano Sprout is an early-stage open-source project. These are proposed areas of work, not completed features or release-date commitments. Start with a small issue describing the expected behavior and how to validate it.

## Small, self-contained contributions

- **Documentation:** reproduce a fresh guest-mode setup and report unclear steps; check English/Vietnamese guide parity.
- **Accessibility:** audit keyboard focus, modal controls, screen-reader labels, and contrast; include browser/version and concrete reproduction steps.
- **Localization:** find missing English mappings or inconsistent Vietnamese musical terms; preserve saved preferences and lesson IDs.
- **Browser compatibility:** reproduce a practice flow in Safari/WebKit or Firefox and document gaps; Chromium viewport tests do not cover these engines.

## Reliability and device validation

- Document a repeatable physical-device test matrix for audio routes, silent mode, background/foreground transitions, microphone permissions, and MIDI cable reconnects.
- Measure MIDI/rhythm latency with real equipment and explain measurement conditions before changing tolerances.
- Verify real Google login sign-in, restart recovery, explicit guest import, and progress sync across devices using your own Firebase project.
- Review deployment-specific microphone policy and document an intentional opt-in configuration without weakening unrelated browser protections.

## Maintenance and learning quality

- Extend meaningful regression coverage for account separation, idempotent progress merge, and boundary cases in rhythm/pitch input.
- Review development dependency security advisories in focused updates, preserving reproducible builds and testing compatibility.
- Improve practice explanations and original exercises with clear music-source attribution and compatible licensing.

## Codex-assisted maintainer work

Codex has been used during development and public-repository preparation. Future useful tasks include proposing focused regression tests, explaining unfamiliar Swift/TypeScript paths, reviewing proposed localization changes, and preparing documentation patches. See [the maintainer workflow](MAINTAINER-WORKFLOW.md).

These are development workflows, not a claim of an installed API integration, funded grant, program acceptance, or established external adoption. No API-key-based bot is enabled by this roadmap.
