# Security policy

## Scope and support

This is an early-stage open-source application. Security fixes are developed on the current `main` branch; there is no separate supported long-term release series or guaranteed response time.

Each deployment is responsible for its own hosting, Firebase project, OAuth configuration, access controls, and credentials. This repository does not provide a shared production backend. Public source code does not authorize testing someone else's deployment or database.

## Report a vulnerability privately

Use [GitHub private vulnerability reporting](https://github.com/devoralabsapp/piano-sprout/security/advisories/new). Include the affected commit, minimal reproduction using synthetic data, expected/actual behavior, impact, and a suggested fix if available.

Do not open a public issue containing exploit details, credentials, personal data, or practice logs. If the private reporting form is unavailable, do not publish sensitive details; use GitHub's reporting/support channels to resolve access first. Ordinary non-security bugs belong in Issues.

## Important boundaries

- Values prefixed `VITE_` are public client configuration. Never place service-role keys, OAuth client secrets, administrator tokens, or passwords in them.
- Use Row Level Security to restrict authenticated users to their own practice data. Keep guest and account histories separate and require an explicit guest import.
- Keep `.env*` (except `.env.example`), signing material, backups, and local exports out of Git.
- Microphone processing is local; raw microphone audio must not be recorded/uploaded as part of a bug report or feature without a separate explicit design and consent flow.
- Test authorization changes on a backend you own. Mock auth tests and an anon-denied request do not prove all authenticated access controls are correct.
- A secret scanner finding no leaks is not a complete security audit. Review changes, dependencies, and deployment permissions separately.

If a real secret is exposed, revoke/rotate it with its issuer and assess its usage. Removing it from a new commit alone does not invalidate the leaked credential or remove it from older Git history.
