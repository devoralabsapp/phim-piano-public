import type { CapacitorConfig } from "@capacitor/cli";
const config: CapacitorConfig = {
  appId: "org.example.phimpiano",
  appName: "Piano Sprout",
  webDir: "dist",
  ios: { contentInset: "never" },
  plugins: {
    FirebaseAuthentication: { skipNativeAuth: true, providers: ["google.com"] },
  },
  experimental: {
    ios: {
      spm: {
        swiftToolsVersion: "6.1",
        packageTraits: { "@capacitor-firebase/authentication": ["Google"] },
        packageOptions: {
          "@capacitor-firebase/authentication": { symlink: true },
        },
      },
    },
  },
};
export default config;
