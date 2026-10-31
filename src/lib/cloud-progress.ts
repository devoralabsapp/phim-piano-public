import {
  collection,
  doc,
  getDocsFromServer,
  runTransaction,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { mergeSessions, validSession, type PracticeSession } from "./domain";

export function sessionDocument(session: PracticeSession) {
  if (!validSession(session) || !/^[a-zA-Z0-9_-]{1,128}$/.test(session.id))
    throw new Error("Invalid practice session");
  // Strip undefined and legacy SQL-only columns; never copy arbitrary fields.
  const {
    id,
    lesson_id,
    active_seconds,
    correct_notes,
    wrong_notes,
    completed,
    input_mode,
    assessment,
  } = session;
  return {
    id,
    lesson_id,
    started_at: Timestamp.fromDate(new Date(session.started_at)),
    active_seconds,
    correct_notes,
    wrong_notes,
    completed,
    input_mode,
    ...(assessment
      ? { assessment: JSON.parse(JSON.stringify(assessment)) }
      : {}),
  };
}
export function sessionFromDocument(
  data: Record<string, unknown>,
  id: string,
): PracticeSession | null {
  if (!(data.started_at instanceof Timestamp) || data.id !== id) return null;
  const session = {
    ...data,
    started_at: data.started_at.toDate().toISOString(),
  };
  return validSession(session) ? session : null;
}
function requireAccount(uid: string) {
  if (!db || auth?.currentUser?.uid !== uid) throw new Error("Account changed");
  return db;
}
export async function loadCloudSessions(
  uid: string,
): Promise<PracticeSession[]> {
  const snapshot = await getDocsFromServer(
    collection(requireAccount(uid), "users", uid, "sessions"),
  );
  return snapshot.docs.flatMap((d) => {
    const session = sessionFromDocument(d.data(), d.id);
    return session ? [session] : [];
  });
}
export async function saveCloudSessions(
  uid: string,
  sessions: PracticeSession[],
) {
  // Transactions preserve the greatest counters/completion across concurrent devices.
  // Skip identical documents to avoid rewriting the entire history on every visit.
  for (const session of sessions) {
    const database = requireAccount(uid);
    const ref = doc(database, "users", uid, "sessions", session.id);
    await runTransaction(database, async (transaction) => {
      const snapshot = await transaction.get(ref);
      requireAccount(uid);
      const remote = snapshot.exists()
        ? sessionFromDocument(snapshot.data(), snapshot.id)
        : null;
      const merged = mergeSessions([session], remote ? [remote] : [])[0];
      const value = sessionDocument(merged);
      if (
        !snapshot.exists() ||
        !remote ||
        JSON.stringify(sessionDocument(remote)) !== JSON.stringify(value)
      )
        transaction.set(ref, value);
    });
  }
}
