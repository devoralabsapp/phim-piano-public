# Google sign-in and deployment setup

**English** | [Tiếng Việt](SETUP.vi.md)

Create your own Supabase project and hosting accounts. No shared production backend or account is included. Guest mode works without cloud services.

## Supabase

1. Create a project in your own Supabase account.
2. For a new database, run `supabase/setup/new-project.sql` once in SQL Editor, **or** apply the four files in `supabase/migrations/` in filename order. For an existing database, apply only missing migrations. The schema enables Row Level Security so users can access only their own practice sessions. The later migrations add lesson/assessment IDs and restrict table privileges.
3. Copy `.env.example` to `.env.local`. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your project URL and anon/publishable key. Never use a service-role key in the client.
4. Under Authentication → URL Configuration, set Site URL to your deployment URL. Allow your web callback (`https://YOUR-DOMAIN/auth/callback`), `http://localhost:5173/auth/callback`, and `com.phim.piano://auth/callback`. Allow only the preview deployments you actually use.

`supabase/config.toml` contains local callback examples. Before applying it to your own cloud project, review Site URL and redirect settings for your deployment. Do not apply it to someone else's project.

## Google Cloud

1. Select or create a Google Cloud project. Configure Google Auth Platform branding/audience, and add test users while the app is in Testing.
2. Create an OAuth client of type **Web application**.
3. Use `https://YOUR-PROJECT.supabase.co/auth/v1/callback` as the authorized redirect URI; copy the exact URL from your Supabase Google provider settings.
4. Enter the Google Client ID and Client Secret directly in Supabase's Google provider settings and enable it. Keep the secret in Supabase, outside Git and `VITE_` variables.
5. Test sign-in, sign-out, and account switching. The app uses PKCE on web and iOS. The iOS app opens OAuth in an external browser and returns through its URL scheme.

## GitHub and Vercel

1. Fork this repository or create your own. Never push local environment files or tokens.
2. Import it into Vercel using the Vite preset, `npm run build`, `dist`, and Node 22.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for the environments you use. These are build-time values; rebuild after changing them.
4. Add the exact deployed callback URL to your Supabase redirect allowlist.
5. Verify Google sign-in with a real account. A successful build does not prove OAuth or cross-device sync works.

References: [Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google), [native deep links](https://supabase.com/docs/guides/auth/native-mobile-deep-linking), [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite).
