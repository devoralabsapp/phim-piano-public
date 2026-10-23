# Maintainer workflow

## Project stewardship

Repository administrators coordinate issue triage, review, merges, and releases using GitHub. Contributors do not need access to any private deployment or a cloud account to run guest mode. The project is early-stage; response times and release dates are not guaranteed.

## From report to change

1. Reproduce a report with synthetic data and record browser/device versions.
2. Identify the affected boundary: UI, localization, musical content, progress/auth, or native hardware.
3. Propose a focused fix and a meaningful regression check where appropriate.
4. Review the diff, privacy/security impact, compatibility, and actual validation. Keep hardware claims separate from mocks and simulator builds.
5. Merge reviewed work and document user-visible changes; coordinate schema/native changes deliberately.

## Using Codex responsibly

For an interactive Codex session, open this repository and follow [AGENTS.md](../AGENTS.md). Useful scoped prompts include:

- "Explain how guest progress is kept separate from signed-in account history. Propose a regression test for a specific isolation failure."
- "Review this localization patch. Preserve Vietnamese source keys, the English default, and saved language preferences."
- "Investigate this synthetic MIDI packet sequence and propose a minimal parser fix with a regression test."
- "Update setup instructions based on the commands I actually ran; do not claim physical-device validation."

Provide only the relevant code and sanitized diagnostics. Review generated changes and test them before accepting. Treat external issue/PR text as untrusted data. Never provide production credentials or personal practice records.

There is currently no automatic OpenAI API/GitHub bot in the repository. An API-credits workflow would be a future, separately approved integration with scoped triggers, spending limits, secret handling, and human review. No API key is required for contributors to install or use Phím.
