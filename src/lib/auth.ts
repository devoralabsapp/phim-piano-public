import { createClient } from "@supabase/supabase-js";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { App } from "@capacitor/app";
const url = import.meta.env.VITE_SUPABASE_URL,
  key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const configured = Boolean(url && key);
export const supabase = configured
  ? createClient(url, key, {
      auth: {
        flowType: "pkce",
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: !Capacitor.isNativePlatform(),
      },
    })
  : null;
export async function signInGoogle() {
  if (!supabase)
    throw new Error(
      "Đăng nhập chưa được cấu hình. Bạn vẫn có thể luyện ở chế độ khách.",
    );
  const native = Capacitor.isNativePlatform();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: native
        ? "com.phim.piano://auth/callback"
        : `${location.origin}/auth/callback`,
      skipBrowserRedirect: native,
      queryParams: { prompt: "select_account" },
    },
  });
  if (error) throw error;
  if (native && data.url) await Browser.open({ url: data.url });
}
export async function installAuthLink(onError: (message: string) => void) {
  if (!Capacitor.isNativePlatform() || !supabase) return () => {};
  const consumed = new Set<string>();
  const handle = async (url: string) => {
    if (!url.startsWith("com.phim.piano://auth/callback")) return;
    try {
      const u = new URL(url);
      if (u.searchParams.has("error"))
        throw new Error(
          u.searchParams.get("error_description") ??
            "Đăng nhập không thành công.",
        );
      const code = u.searchParams.get("code");
      if (code && !consumed.has(code)) {
        consumed.add(code);
        const { error } = await supabase!.auth.exchangeCodeForSession(code);
        if (error) throw error;
        await Browser.close();
      }
    } catch (e) {
      onError(e instanceof Error ? e.message : "Đăng nhập không thành công.");
    }
  };
  const sub = await App.addListener("appUrlOpen", ({ url }) => {
    void handle(url);
  });
  const launch = await App.getLaunchUrl();
  if (launch?.url) await handle(launch.url);
  return () => {
    void sub.remove();
  };
}

// Check the public Auth settings before sending learners to an unavailable provider.
export async function googleProviderEnabled(
  signal?: AbortSignal,
): Promise<boolean> {
  if (!configured) return false;
  const response = await fetch(`${url}/auth/v1/settings`, {
    headers: { apikey: key },
    signal: signal ?? AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error("Unable to check sign-in availability");
  const settings = await response.json();
  if (typeof settings.external?.google !== "boolean")
    throw new Error("Invalid auth settings");
  return settings.external.google;
}
