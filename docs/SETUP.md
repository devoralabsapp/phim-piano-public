# Google sign-in and deployment setup

**English** | [Tiếng Việt](SETUP.vi.md)

Guest practice requires only Node.js 22.12+ and npm. Run `npm ci` and `npm run dev`; no cloud accounts are required.

## Optional Firebase sync

Follow [Firebase setup](FIREBASE.md) to register your Web app, enable Google Authentication, create Firestore, deploy Security Rules and configure `.env.local`. Each fork/deployment must use its own project. Never put admin credentials in client configuration.

Required client variables: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`. Set `VITE_FIREBASE_DATABASE_ID` when using a named database.

## Vercel

Use Vite, build command `npm run build`, output directory `dist`, and the checked-in SPA rewrite. Add your Firebase client variables for each deployment environment and rebuild after changes. Authorize your hostname in Firebase Authentication. Keep the Google helper and Firebase domains allowed by the checked-in CSP.

## iOS

Follow [iOS setup](IOS.md) and [Firebase native sign-in](FIREBASE.md#ios). Supply your own ignored `GoogleService-Info.plist`, then run `npm run ios:sync`. Preserve the existing URL scheme and your local signing settings.
