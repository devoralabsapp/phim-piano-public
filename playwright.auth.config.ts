import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/auth",
  outputDir: "test-results/auth",
  use: { baseURL: "http://127.0.0.1:5174", ...devices["Desktop Chrome"] },
  webServer: {
    command: "npm run dev -- --port 5174",
    url: "http://127.0.0.1:5174",
    env: {
      VITE_SUPABASE_URL: "https://auth-test.supabase.co",
      VITE_SUPABASE_ANON_KEY: "test-public-key",
    },
  },
  workers: 1,
});
