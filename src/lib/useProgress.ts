import { useEffect, useState, useRef } from "react";
import { supabase } from "./auth";
import {
  mergeSessions,
  validSession,
  accountImportId,
  type PracticeSession,
} from "./domain";
import { readSessions as read, migratePrototype } from "./storage";
migratePrototype();
export function useProgress(userId: string | null) {
  const key = `phim:sessions:${userId ?? "guest"}`,
    generation = useRef(0);
  const [sessions, setSessions] = useState<PracticeSession[]>([]),
    [sync, setSync] = useState(""),
    [error, setError] = useState(""),
    [ready, setReady] = useState(false);
  const currentKey = useRef(key);
  currentKey.current = key;
  useEffect(() => {
    const g = ++generation.current;
    setReady(false);
    setError("");
    setSync("");
    setSessions(read(key));
    setReady(true);
    if (!supabase || !userId) return;
    let cancelled = false;
    async function run() {
      setSync("Đang đồng bộ…");
      const { data, error } = await supabase!
        .from("practice_sessions")
        .select("*")
        .eq("user_id", userId);
      if (cancelled || g !== generation.current) return;
      if (error) {
        setError("Chưa đồng bộ được. Tiến độ vẫn được lưu trên thiết bị.");
        setSync("Chưa đồng bộ");
        return;
      }
      const merged = mergeSessions(
        read(key),
        (data ?? []).filter(validSession),
      );
      try {
        localStorage.setItem(key, JSON.stringify(merged));
      } catch {
        setError("Thiết bị không cho phép lưu tiến độ.");
      }
      setSessions(merged);
      if (merged.length) {
        const { error: pushError } = await supabase!
          .from("practice_sessions")
          .upsert(
            merged.map((s) => ({ ...s, user_id: userId })),
            { onConflict: "id" },
          );
        if (cancelled) return;
        if (pushError) {
          setSync("Chưa đồng bộ");
          setError("Không tải được tiến độ lên tài khoản.");
          return;
        }
      }
      setSync("Đã đồng bộ");
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [key, userId]);
  async function add(session: PracticeSession) {
    const targetKey = key,
      targetUser = userId;
    const merged = mergeSessions(read(targetKey), [session]);
    try {
      localStorage.setItem(targetKey, JSON.stringify(merged));
    } catch {
      setError("Không lưu được trên thiết bị. Hãy bật lưu trữ trình duyệt.");
    }
    if (currentKey.current === targetKey) setSessions(merged);
    if (supabase && targetUser) {
      const { error } = await supabase
        .from("practice_sessions")
        .upsert({ ...session, user_id: targetUser }, { onConflict: "id" });
      if (currentKey.current !== targetKey) return;
      setSync(error ? "Chưa đồng bộ" : "Đã đồng bộ");
      if (error)
        setError(
          "Tiến độ đã lưu trên thiết bị; sẽ thử đồng bộ ở lần mở tiếp theo.",
        );
    }
  }
  async function importGuest() {
    if (!userId) return;
    const targetKey = key,
      targetUser = userId;
    const imported = await Promise.all(
      read("phim:sessions:guest").map(async (s) => ({
        ...s,
        id: await accountImportId(targetUser, s.id),
      })),
    );
    if (currentKey.current !== targetKey) return;
    const merged = mergeSessions(read(targetKey), imported);
    try {
      localStorage.setItem(key, JSON.stringify(merged));
    } catch {
      setError("Không lưu được tiến độ.");
      return;
    }
    setSessions(merged);
    if (supabase && merged.length) {
      const { error } = await supabase.from("practice_sessions").upsert(
        merged.map((s) => ({ ...s, user_id: userId })),
        { onConflict: "id" },
      );
      if (currentKey.current !== targetKey) return;
      setSync(error ? "Chưa đồng bộ" : "Đã đồng bộ");
      if (error) setError("Chưa đồng bộ được dữ liệu nhập.");
    }
  }
  return { sessions, add, importGuest, sync, error, ready };
}
