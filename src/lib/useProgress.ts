import { useEffect, useState, useRef } from "react";
import { configured } from "./firebase";
import { loadCloudSessions, saveCloudSessions } from "./cloud-progress";
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
    if (!configured || !userId) return;
    let cancelled = false;
    async function run() {
      setSync("Đang đồng bộ…");
      let data: PracticeSession[];
      try {
        data = await loadCloudSessions(userId!);
      } catch {
        if (cancelled || g !== generation.current) return;
        setError("Chưa đồng bộ được. Tiến độ vẫn được lưu trên thiết bị.");
        setSync("Chưa đồng bộ");
        return;
      }
      if (cancelled || g !== generation.current) return;
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
      const remoteById = new Map(data.map((s) => [s.id, s]));
      const pending = merged.filter((s) => {
        const remote = remoteById.get(s.id);
        return (
          !remote ||
          s.active_seconds !== remote.active_seconds ||
          s.correct_notes !== remote.correct_notes ||
          s.wrong_notes !== remote.wrong_notes ||
          s.completed !== remote.completed ||
          JSON.stringify(s.assessment) !== JSON.stringify(remote.assessment)
        );
      });
      if (pending.length) {
        try {
          await saveCloudSessions(userId!, pending);
        } catch {
          if (cancelled || g !== generation.current) return;
          setSync("Chưa đồng bộ");
          setError("Không tải được tiến độ lên tài khoản.");
          return;
        }
      }
      if (cancelled || g !== generation.current) return;
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
    if (configured && targetUser) {
      setSync("Đang đồng bộ…");
      setError("");
      try {
        await saveCloudSessions(targetUser, [session]);
        if (currentKey.current === targetKey) setSync("Đã đồng bộ");
      } catch {
        if (currentKey.current !== targetKey) return;
        setSync("Chưa đồng bộ");
        setError(
          "Tiến độ đã lưu trên thiết bị; sẽ thử đồng bộ ở lần mở tiếp theo.",
        );
      }
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
    if (configured && merged.length) {
      setSync("Đang đồng bộ…");
      setError("");
      try {
        await saveCloudSessions(targetUser, merged);
        if (currentKey.current === targetKey) setSync("Đã đồng bộ");
      } catch {
        if (currentKey.current !== targetKey) return;
        setSync("Chưa đồng bộ");
        setError("Chưa đồng bộ được dữ liệu nhập.");
      }
    }
  }
  return { sessions, add, importGuest, sync, error, ready };
}
