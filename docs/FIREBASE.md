# Firebase setup and migration

Piano Sprout uses **Firebase Authentication (Google)** and **Cloud Firestore**. Vercel remains the web host. Guest practice works without a cloud account, and progress remains in local storage. No Firebase Analytics, Storage, Functions, or paid integrations are required.

## Configure your own deployment

1. Create/select your own Firebase project. Register a Web app and enable Google in Authentication. Authorize your website hostname and `localhost` (hostnames only, no scheme/port).
2. Create Firestore in the desired region. The app supports the default or a named database via `VITE_FIREBASE_DATABASE_ID`. Choose edition/region deliberately; existing databases are not converted by this repository.
3. Copy `.env.example` to `.env.local`. Fill `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`, and the database ID. These are Firebase client config values, bundled into the app. Never add service-account/admin credentials to `VITE_*` or Git.
4. Update `firebase.json` database/location/edition for your instance. Deploy the checked-in rules and indexes with `npx -y firebase-tools@latest deploy --only firestore --project YOUR_PROJECT_ID`. No Hosting deployment is needed.
5. Add the same client config variables to your Vercel project and rebuild. Keep the Firebase Auth domain in the CSP `frame-src`/`connect-src` allowlist. The repository allows the Firebase Google APIs and `*.firebaseapp.com`. Custom auth domains need an explicit matching CSP entry.

Firestore stores sessions at `users/{firebaseUid}/sessions/{sessionId}`. Started time is a Firestore Timestamp; local sessions and JSON exports keep ISO strings. Rules enforce owner-only reads/writes, allowed fields/types, bounded results, immutable lesson/start time and nondecreasing counters. Client deletion and all other collections are denied. The checked-in rules are a prototype with emulator attack tests; review them before a broad launch.

The app uses Core queries/transactions rather than Pipeline analytics because existing local/offline practice and deterministic cross-device merging are required. Cloud reads run on sign-in/open, without a persistent snapshot listener. Only pending local records upload; transactions merge counters/completion so concurrent devices cannot lower existing progress. Network failures leave local progress available and report pending sync.

## iOS

Register an iOS app using **your bundle ID**, then download its own `GoogleService-Info.plist` using `npx -y firebase-tools@latest apps:sdkconfig IOS YOUR_APP_ID --project YOUR_PROJECT_ID` and save the plist at `ios/App/App/GoogleService-Info.plist` (ignored). Do not place CLI status text around the XML.

`npm run ios:sync` prepares the Google reversed-client URL scheme alongside the existing `com.phim.piano` scheme. It never changes the existing scheme, bundle ID, or signing team. If no real plist is supplied, it copies a demo plist to permit guest/CI builds; Google sign-in needs real matching web/iOS Firebase project configuration. The Google sign-in plugin uses `skipNativeAuth: true` and passes a Google credential to Firebase JS Auth, which owns the Firestore identity and session persistence. This is required because native Firebase Auth state is separate from JS Auth state.

The Firebase plugin is configured with only the `Google` Swift Package trait, not Facebook. Keep generated SPM symlinks out of Git. The tracked Xcode project includes the plist resource and `-ObjC`. Simulator compilation does not verify physical-device Google sign-in, sound, microphone, or MIDI.

## Local verification

```sh
npm ci
npm test
npm run build
npx playwright install chromium
CI=1 npm run test:e2e
# Java 21+ is required. Only demo-piano-sprout emulator data is used:
npm run test:firebase
```

`test:firebase` starts Auth/Firestore emulators, exercises ownership and validation rules, then browser sign-in/sync/account-isolation flows. `test:auth` alone requires those emulators to already be running. Emulator support is gated to development builds on localhost; production builds cannot enable it.

## Moving an existing Supabase deployment

1. Export the old database sessions and verified Google identities into a private, access-restricted backup. Do not commit user data or auth exports.
2. Before allowing Firebase login, import verified Google provider identities into Firebase Auth with the **same UID** as the old Supabase user UUID. Match by Google's stable provider subject, not by a client-supplied email. Check for preexisting Firebase accounts/UID collisions first. Do not overwrite an existing account without an explicit mapping/review.
3. Write each validated session into the corresponding UID's subcollection with a Timestamp. Strip SQL-only `user_id`/`created_at` fields, preserve session IDs and assessment results, and verify every field against the backup.
4. Verify rules, auth domains, provider configuration and deployment variables before switching the site. Users must sign in again; Supabase access/refresh tokens cannot become Firebase sessions. Existing `phim:sessions:{uid}` keys continue to work when UIDs are preserved. Guest import remains explicit.
5. Keep the old backend/backup until real sign-in and cross-device sync are verified. This repository never deletes an old project automatically. Historical SQL migrations in `supabase/` are retained for reference and rollback; the runtime no longer depends on Supabase.

If source data is unavailable, do not claim it was migrated. Preserve device exports and obtain a verified server-side identity mapping before importing any former account's history. A browser must never auto-import arbitrary other account caches.
