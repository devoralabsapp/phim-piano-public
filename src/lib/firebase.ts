import { initializeApp } from "firebase/app";
import { Capacitor } from "@capacitor/core";
import {
  initializeAuth,
  browserLocalPersistence,
  indexedDBLocalPersistence,
  connectAuthEmulator,
  browserPopupRedirectResolver,
} from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
export const configured = Object.values(config).every(Boolean);
const app = configured ? initializeApp(config) : null;
export const auth = app
  ? initializeAuth(app, {
      ...(Capacitor.isNativePlatform()
        ? {}
        : { popupRedirectResolver: browserPopupRedirectResolver }),
      persistence: Capacitor.isNativePlatform()
        ? indexedDBLocalPersistence
        : browserLocalPersistence,
    })
  : null;
export const db = app
  ? getFirestore(app, import.meta.env.VITE_FIREBASE_DATABASE_ID || "(default)")
  : null;
// Test/development emulators are never enabled in a production build.
if (
  import.meta.env.DEV &&
  import.meta.env.VITE_FIREBASE_EMULATORS === "true" &&
  ["localhost", "127.0.0.1"].includes(location.hostname)
) {
  if (auth)
    connectAuthEmulator(auth, "http://127.0.0.1:9099", {
      disableWarnings: true,
    });
  if (db) connectFirestoreEmulator(db, "127.0.0.1", 8080);
}
