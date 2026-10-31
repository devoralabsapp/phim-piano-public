import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/auth",
  outputDir: "test-results/auth",
  use: { baseURL: "http://127.0.0.1:5174", ...devices["Desktop Chrome"] },
  webServer: {
    command: "npm run dev -- --port 5174",
    url: "http://127.0.0.1:5174",
    env: {
      VITE_FIREBASE_API_KEY: "demo-key",
      VITE_FIREBASE_AUTH_DOMAIN: "demo-piano-sprout.firebaseapp.com",
      VITE_FIREBASE_PROJECT_ID: "demo-piano-sprout",
      VITE_FIREBASE_APP_ID: "demo-app",
      VITE_FIREBASE_DATABASE_ID: "(default)",
      VITE_FIREBASE_EMULATORS: "true",
    },
  },
  workers: 1,
});
