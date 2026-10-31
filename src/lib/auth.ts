import { Capacitor } from "@capacitor/core";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { auth } from "./firebase";
export { configured } from "./firebase";
export type AuthUser = Pick<User, "uid" | "displayName" | "email">;
export function observeAuth(
  next: (user: AuthUser | null) => void,
  error: () => void,
) {
  if (!auth) {
    next(null);
    return () => {};
  }
  return onAuthStateChanged(auth, next, error);
}
export async function signInGoogle() {
  if (!auth)
    throw new Error(
      "Đăng nhập chưa được cấu hình. Bạn vẫn có thể luyện ở chế độ khách.",
    );
  if (Capacitor.isNativePlatform()) {
    const { FirebaseAuthentication } =
      await import("@capacitor-firebase/authentication");
    const result = await FirebaseAuthentication.signInWithGoogle({
      skipNativeAuth: true,
    });
    if (!result.credential?.idToken) throw new Error("Không đăng nhập được.");
    await signInWithCredential(
      auth,
      GoogleAuthProvider.credential(result.credential.idToken),
    );
  } else {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    await signInWithPopup(auth, provider);
  }
}
export async function signOut() {
  if (!auth) return;
  // Clear the JS session first: it is the identity used for Firestore requests.
  await firebaseSignOut(auth);
  if (Capacitor.isNativePlatform()) {
    const { FirebaseAuthentication } =
      await import("@capacitor-firebase/authentication");
    await FirebaseAuthentication.signOut();
  }
}
