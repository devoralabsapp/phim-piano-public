import { appName } from "./lib/brand";
import { useLanguage } from "./lib/i18n";
import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  Home,
  BookOpen,
  Piano,
  ChartNoAxesColumn,
  Settings,
  ArrowRight,
  ChevronRight,
  Clock3,
  Check,
  Music2,
  Flame,
  LogIn,
  LogOut,
  Usb,
  Cloud,
  Download,
  Info,
  X,
} from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { App as NativeApp } from "@capacitor/app";
import AudioCheck from "./components/AudioCheck";
import TechniqueVideos from "./components/TechniqueVideos";
import MusicLibrary from "./components/MusicLibrary";
import SightReading from "./components/SightReading";
import { type MidiMessage } from "./components/RhythmTrainer";
import { libraryPieces } from "./lib/library";
import { recommendLesson } from "./lib/practice";
import { lessons, noteName } from "./lib/curriculum";
import {
  configured,
  googleProviderEnabled,
  installAuthLink,
  signInGoogle,
  supabase,
} from "./lib/auth";
import { stats, localDay } from "./lib/domain";
import { useProgress } from "./lib/useProgress";
import {
  connectMidi,
  shareNativeProgress,
  midiAvailable,
  type MidiDevice,
  type MidiAttack,
} from "./lib/midi";
import Keyboard from "./components/Keyboard";
import LessonBrowser from "./components/LessonBrowser";
import LanguageSwitcher from "./components/LanguageSwitcher";
import Metronome from "./components/Metronome";
import LessonPlayer from "./components/LessonPlayer";
import DailyPractice from "./components/DailyPractice";
const pages = [
  { id: "home", label: "Tổng quan", icon: Home },
  { id: "lessons", label: "Lộ trình học", icon: BookOpen },
  { id: "library", label: "Thư viện bài nhạc", icon: Music2 },
  { id: "practice", label: "Phòng luyện tập", icon: Piano },
  { id: "progress", label: "Tiến độ của bạn", icon: ChartNoAxesColumn },
  { id: "settings", label: "Tài khoản & kết nối", icon: Settings },
];
const titles: Record<string, [string, string]> = {
  home: [
    "Một chút piano, mỗi ngày.",
    "Cùng biến những nốt nhạc đầu tiên thành thói quen nhé.",
  ],
  lessons: [
    "Từ những nốt đầu đến bài luyện nâng cao.",
    "{count} bài học qua 4 cấp độ: Cơ bản, Nền tảng, Trung cấp và Nâng cao.",
  ],
  library: [
    "Những bài nhạc bạn muốn chơi.",
    "Tìm bài, luyện từng đoạn và đưa kỹ thuật vào âm nhạc.",
  ],
  practice: [
    "Không gian cho những nốt nhạc.",
    "Nghe mẫu, luyện nhịp và chơi trên chiếc Yamaha của bạn.",
  ],
  progress: [
    "Mỗi lần luyện, một bước tiến.",
    "Nhìn lại thời gian bạn đã dành cho âm nhạc.",
  ],
  settings: [
    "Một hành trình, nhiều thiết bị.",
    "Đăng nhập để mang tiến độ từ iPad sang iPhone và web.",
  ],
};
export default function App() {
  const { locale, t, dateLocale } = useLanguage();
  const [page, setPage] = useState("home"),
    [user, setUser] = useState<User | null>(null),
    [authReady, setAuthReady] = useState(!configured),
    [lessonId, setLessonId] = useState<string | null>(null),
    [daily, setDaily] = useState(false),
    [message, setMessage] = useState(""),
    [loginBusy, setLoginBusy] = useState(false),
    [googleState, setGoogleState] = useState<
      "checking" | "enabled" | "disabled" | "unavailable"
    >("checking"),
    [googleRetry, setGoogleRetry] = useState(0),
    [midiBusy, setMidiBusy] = useState(false),
    [midiEnabled, setMidiEnabled] = useState(false),
    [devices, setDevices] = useState<MidiDevice[]>([]),
    [pressed, setPressed] = useState<number[]>([]),
    [midiMessages, setMidiMessages] = useState<MidiMessage[]>([]),
    [midiEvents, setMidiEvents] = useState<MidiAttack[]>([]);
  const disconnect = useRef<(() => Promise<void>) | null>(null),
    seq = useRef(0),
    pressedKeys = useRef(new Set<number>()),
    authUserId = useRef<string | null>(null);
  const progress = useProgress(authReady ? (user?.id ?? null) : null),
    s = stats(progress.sessions);
  const allLessons = [...lessons, ...libraryPieces];
  const courseCompleted = lessons.filter((l) => s.completed.has(l.id)).length;
  const recommendation = recommendLesson(lessons, progress.sessions);
  const lesson = allLessons.find((l) => l.id === lessonId),
    next = lessons.find((l) => !s.completed.has(l.id)) ?? lessons[0];
  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    if (supabase) {
      supabase.auth.getSession().then(({ data, error }) => {
        if (cancelled) return;
        if (error)
          setMessage("Không khôi phục được đăng nhập. Hãy đăng nhập lại.");
        authUserId.current = data.session?.user.id ?? null;
        setUser(data.session?.user ?? null);
        setAuthReady(true);
        if (location.pathname === "/auth/callback")
          history.replaceState({}, "", "/");
      });
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (cancelled) return;
        const nextId = session?.user.id ?? null;
        if (authUserId.current !== nextId) {
          setLessonId(null);
          setDaily(false);
        }
        authUserId.current = nextId;
        setUser(session?.user ?? null);
        setLoginBusy(false);
        setAuthReady(true);
      });
      cleanup = () => data.subscription.unsubscribe();
    }
    let linkCleanup: (() => void) | undefined;
    void installAuthLink(setMessage).then((fn) => {
      if (cancelled) fn();
      else linkCleanup = fn;
    });
    return () => {
      cancelled = true;
      cleanup?.();
      linkCleanup?.();
    };
  }, []);
  useEffect(() => {
    if (!configured || page !== "settings" || user) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    let active = true;
    setGoogleState("checking");
    void googleProviderEnabled(controller.signal)
      .then((enabled) => {
        if (active) setGoogleState(enabled ? "enabled" : "disabled");
      })
      .catch(() => {
        if (active) setGoogleState("unavailable");
      })
      .finally(() => clearTimeout(timeout));
    return () => {
      active = false;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [page, user, googleRetry]);
  useEffect(
    () => () => {
      void disconnect.current?.();
    },
    [],
  );
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let removed = false;
    let listener: { remove: () => Promise<void> } | undefined;
    void NativeApp.addListener("appStateChange", ({ isActive }) => {
      if (!isActive) document.dispatchEvent(new Event("phim:pause"));
    }).then((l) => {
      if (removed) void l.remove();
      else listener = l;
    });
    return () => {
      removed = true;
      void listener?.remove();
    };
  }, []);
  async function login() {
    setLoginBusy(true);
    try {
      await signInGoogle();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Không đăng nhập được.");
    } finally {
      setLoginBusy(false);
    }
  }
  async function toggleMidi() {
    if (midiBusy) return;
    setMidiBusy(true);
    try {
      if (disconnect.current) {
        await disconnect.current();
        disconnect.current = null;
        setMidiEnabled(false);
        setDevices([]);
        setPressed([]);
        pressedKeys.current.clear();
        setMidiEvents([]);
        setMidiMessages([]);
      } else {
        disconnect.current = await connectMidi(
          (e) => {
            if (e.on) pressedKeys.current.add(e.note);
            else pressedKeys.current.delete(e.note);
            const held = [...pressedKeys.current];
            setPressed(held);
            const at = e.at ?? performance.now();
            const message: MidiMessage = { ...e, at, seq: ++seq.current };
            setMidiMessages((old) => [...old.slice(-511), message]);
            if (e.on) {
              const attack: MidiAttack = {
                note: e.note,
                seq: message.seq,
                at,
                velocity: e.velocity,
                held,
              };
              setMidiEvents((old) => [...old.slice(-255), attack]);
            }
          },
          (d) => {
            setDevices(d);
            if (!d.length) {
              setPressed([]);
              pressedKeys.current.clear();
            }
          },
        );
        setMidiEnabled(true);
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Không kết nối được MIDI.");
    } finally {
      setMidiBusy(false);
    }
  }
  function go(p: string) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function download() {
    const json = JSON.stringify(
      {
        version: 1,
        exported_at: new Date().toISOString(),
        sessions: progress.sessions,
      },
      null,
      2,
    );
    try {
      if (Capacitor.getPlatform() === "ios") {
        await shareNativeProgress(json);
        return;
      }
      const blob = new Blob([json], { type: "application/json" }),
        url = URL.createObjectURL(blob),
        a = document.createElement("a");
      a.href = url;
      a.download = "phim-tien-do.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setMessage("Không xuất được tiến độ. Hãy thử lại.");
    }
  }
  const lessonList = (
    <LessonBrowser
      lessons={lessons}
      completed={s.completed}
      nextId={next.id}
      onSelect={setLessonId}
    />
  );
  const connection = (
    <section className="card">
      <div className="card-title">
        <h2>Yamaha YDP-163</h2>
        <Usb size={19} />
      </div>
      <p className="muted">
        {devices.length
          ? devices.map((d) => d.name).join(", ")
          : midiEnabled
            ? t("Đang chờ đàn MIDI. Kiểm tra dây USB và bật đàn.")
            : t("Kết nối để hiển thị nốt bạn bấm và luyện có phản hồi.")}
      </p>
      {midiAvailable() ? (
        <button
          className="outline"
          disabled={midiBusy}
          onClick={() => void toggleMidi()}
        >
          <Usb size={16} />
          {midiBusy
            ? t("Đang kết nối…")
            : midiEnabled
              ? t("Ngắt kết nối")
              : t("Kết nối đàn MIDI")}
        </button>
      ) : (
        <div className="notice small">
          <Info size={17} />
          <span>
            {t(
              "Trình duyệt này chưa hỗ trợ MIDI. Trên iPad/iPhone, dùng bản Piano Sprout iOS để kết nối đàn.",
            )}
          </span>
        </div>
      )}
      <p className="small muted">
        {t("iPad Pro M2: USB-B → USB-C truyền dữ liệu.")}
        <br />
        {t("iPhone 11 Pro Max: USB-B → USB-A + Lightning Camera Adapter.")}
      </p>
      {pressed.length > 0 && (
        <p className="live-notes" aria-live="polite">
          {t("Đang bấm: ")}
          {pressed.map((n) => noteName(n, locale)).join(t(" · "))}
        </p>
      )}
    </section>
  );
  return (
    <>
      <aside className="sidebar">
        <button
          className="brand"
          onClick={() => go("home")}
          aria-label={`${appName} — ${t("Tổng quan")}`}
        >
          <span className="brand-mark">
            <i />
            <i />
            <i />
          </span>
          {appName}
          <span>.</span>
        </button>
        <p className="tagline">{t("TỪNG PHÍM ĐÀN, MỘT NIỀM VUI")}</p>
        <nav>
          {pages.map((p) => (
            <button
              key={p.id}
              className={page === p.id ? "active" : ""}
              onClick={() => go(p.id)}
              aria-current={page === p.id ? "page" : undefined}
            >
              <p.icon size={18} />
              {t(p.label)}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="tip">
            <b>{t("✧ Chậm thôi, nhưng đều đặn.")}</b>
            <p>
              {t(
                "15 phút mỗi ngày là khởi đầu tốt để đôi tay làm quen với piano.",
              )}
            </p>
          </div>
          <button className="profile" onClick={() => go("settings")}>
            <span className="avatar">
              {(user?.user_metadata.full_name ?? t("Bạn")).slice(0, 1)}
            </span>
            <span>
              <b>{user?.user_metadata.full_name ?? t("Người yêu piano")}</b>
              <small>
                {user ? t("Tài khoản của bạn") : t("Đang học ở chế độ khách")}
              </small>
            </span>
            <ChevronRight size={15} />
          </button>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <span>
            {t("Không gian học tập / ")}
            {t(pages.find((p) => p.id === page)?.label ?? "")}
          </span>
          <div>
            <LanguageSwitcher />
            <span className="date">
              {new Date().toLocaleDateString(dateLocale, {
                day: "numeric",
                month: "long",
              })}
            </span>
            <span className="streak">
              <Flame size={14} />
              {t("{count} ngày liên tiếp", {
                count: s.streak,
                day: s.streak === 1 ? "day" : "days",
              })}
            </span>
          </div>
        </header>
        <h1>{t(titles[page][0])}</h1>
        <p className="intro">{t(titles[page][1], { count: lessons.length })}</p>
        {(message || progress.error) && (
          <div className="notice error" role="alert">
            <Info size={18} />
            <span>{t(message || progress.error)}</span>
            <button
              className="icon"
              aria-label={t("Ẩn thông báo")}
              onClick={() => setMessage("")}
            >
              <X size={16} />
            </button>
          </div>
        )}
        {!authReady ? (
          <div className="card">{t("Đang khôi phục tài khoản…")}</div>
        ) : (
          <>
            {page === "home" && (
              <div className="dashboard">
                <div>
                  <section className="hero">
                    <div>
                      <span className="eyebrow">
                        {t("HÀNH TRÌNH CỦA BẠN BẮT ĐẦU TỪ ĐÂY")}
                      </span>
                      <h2>
                        {t("Đôi tay làm quen.")}
                        <br />
                        {t("Âm nhạc lên tiếng.")}
                      </h2>
                      <p>
                        {t("Không cần biết nhiều nhạc lý.")}
                        <br />
                        {t("Bắt đầu từ chiếc đàn bạn đang có.")}
                      </p>
                      <button
                        className="primary"
                        onClick={() => setLessonId(next.id)}
                      >
                        {s.completed.size
                          ? t("Tiếp tục bài học")
                          : t("Bắt đầu bài đầu tiên")}
                        <ArrowRight size={16} />
                      </button>
                    </div>
                    <div className="piano-art" aria-hidden="true">
                      <div className="art-black" />
                      <span>{t("♪")}</span>
                    </div>
                  </section>
                  <div className="stats">
                    <Stat
                      icon={Clock3}
                      value={s.totalMinutes}
                      unit={t("phút")}
                      label={t("Thời gian luyện tập")}
                    />
                    <Stat
                      icon={BookOpen}
                      value={courseCompleted}
                      unit={`/ ${lessons.length}`}
                      label={t("Bài học hoàn thành")}
                    />
                    <Stat
                      icon={Music2}
                      value={
                        allLessons.filter(
                          (l) => l.song && s.completed.has(l.id),
                        ).length
                      }
                      label={t("Giai điệu đã học")}
                    />
                  </div>
                  <div className="section-title">
                    <h2>{t("Tiếp tục hành trình")}</h2>
                    <button
                      className="text-button"
                      onClick={() => go("lessons")}
                    >
                      {t("Xem tất cả")}
                      <ArrowRight size={13} />
                    </button>
                  </div>
                  <div className="lesson-list">
                    {lessons
                      .slice(
                        lessons.findIndex((l) => l.id === next.id),
                        lessons.findIndex((l) => l.id === next.id) + 3,
                      )
                      .map((l, i) => (
                        <button
                          className="lesson-row"
                          key={l.id}
                          onClick={() => setLessonId(l.id)}
                        >
                          <span className="lesson-number">
                            {s.completed.has(l.id) ? (
                              <Check size={18} />
                            ) : (
                              String(
                                lessons.findIndex((item) => item.id === l.id) +
                                  1,
                              ).padStart(2, "0")
                            )}
                          </span>
                          <span className="lesson-meta">
                            <b>{t(l.title)}</b>
                            <small>
                              {t(l.topic)}
                              {t(" · ")}
                              {l.minutes}
                              {t(" phút")}
                            </small>
                          </span>
                          <span className="badge">
                            {s.completed.has(l.id)
                              ? t("Đã hoàn thành")
                              : l.id === next.id
                                ? t("Tiếp theo")
                                : t("Bài ") +
                                  (lessons.findIndex(
                                    (item) => item.id === l.id,
                                  ) +
                                    1)}
                          </span>
                          <ChevronRight size={18} />
                        </button>
                      ))}
                  </div>
                  <section className="card recommendation">
                    <h3>{t("Gợi ý cho buổi tiếp theo")}</h3>
                    <p>{t(recommendation.reason)}</p>
                    <button
                      className="outline"
                      onClick={() => setLessonId(recommendation.lesson.id)}
                    >
                      {t(recommendation.lesson.title)}
                    </button>
                  </section>
                  <section className="card keyboard-card">
                    <div className="card-title">
                      <h2>{t("Chạm phím, nghe nốt nhạc")}</h2>
                      <span className="small muted">
                        {t("Một quãng tám đầu tiên")}
                      </span>
                    </div>
                    {!lesson && !daily && <Keyboard pressed={pressed} />}
                  </section>
                </div>
                <div className="right-column">
                  <section className="card">
                    <h2>{t("Một thói quen nhỏ 🌱")}</h2>
                    <div className="week">
                      {Array.from({ length: 7 }, (_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + i);
                        const day = localDay(d),
                          today = day === localDay(new Date()),
                          practiced = progress.sessions.some(
                            (x) =>
                              x.active_seconds > 0 &&
                              localDay(x.started_at) === day,
                          );
                        return (
                          <div key={i} className={today ? "today" : ""}>
                            <small>
                              {
                                (locale === "en"
                                  ? [
                                      "Mon",
                                      "Tue",
                                      "Wed",
                                      "Thu",
                                      "Fri",
                                      "Sat",
                                      "Sun",
                                    ]
                                  : ["T2", "T3", "T4", "T5", "T6", "T7", "CN"])[
                                  i
                                ]
                              }
                            </small>
                            <span>
                              {practiced ? <Check size={12} /> : d.getDate()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="goal-label">
                      <span>{t("Mục tiêu hôm nay")}</span>
                      <span>
                        <b>{s.todayMinutes}</b>
                        {t(" / 15 phút")}
                      </span>
                    </div>
                    <div className="bar">
                      <i
                        style={{
                          width: `${Math.min(100, (s.todayMinutes / 15) * 100)}%`,
                        }}
                      />
                    </div>
                    <button
                      className="outline daily-button"
                      onClick={() => setDaily(true)}
                    >
                      <PlayIcon />
                      {t("Buổi luyện 15 phút")}
                    </button>
                  </section>
                  {!lesson && !daily && <Metronome />}
                  <section className="card quote">
                    <span className="eyebrow">{t("MỘT CHÚT CẢM HỨNG")}</span>
                    <p>
                      {t(
                        "“Bạn không cần chơi thật hay để bắt đầu. Bạn cần bắt đầu để chơi thật hay.”",
                      )}
                    </p>
                    <small>{t("Một lời nhắc cho hôm nay")}</small>
                  </section>
                </div>
              </div>
            )}
            {page === "lessons" && (
              <div className="wide-content">
                <div className="notice">
                  <BookOpen size={19} />
                  <span>
                    {t(
                      "Học theo thứ tự hoặc mở bất kỳ bài nào để ôn tập. Phím được đánh dấu giúp bạn tìm nốt, số ngón hướng dẫn cách chơi.",
                    )}
                  </span>
                </div>
                {lessonList}
              </div>
            )}
            {page === "library" && (
              <MusicLibrary completed={s.completed} onOpen={setLessonId} />
            )}
            {page === "practice" && <TechniqueVideos />}
            {page === "practice" && (
              <div className="practice-layout">
                <div>
                  <section className="hero practice-hero">
                    <div>
                      <span className="eyebrow">
                        {t("MỘT BUỔI LUYỆN TRỌN VẸN")}
                      </span>
                      <h2>{t("15 phút cùng chiếc đàn của bạn.")}</h2>
                      <p>
                        {t(
                          "3 phút khởi động · 5 phút luyện nhịp · 7 phút giai điệu",
                        )}
                      </p>
                      <button
                        className="primary"
                        onClick={() => setDaily(true)}
                      >
                        {t("Bắt đầu buổi luyện")}
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </section>
                  <section className="card keyboard-card">
                    <div className="card-title">
                      <h2>{t("Bàn phím tự do")}</h2>
                      <Music2 size={18} />
                    </div>
                    {!lesson && !daily && <Keyboard pressed={pressed} />}
                  </section>
                  <h2 className="spaced">{t("Chọn bài để luyện lại")}</h2>
                  {lessonList}
                </div>
                <div className="right-column">
                  {connection}
                  {!lesson && !daily && <Metronome />}
                </div>
              </div>
            )}
            {page === "practice" && (
              <SightReading
                key={user?.id ?? "guest"}
                midiMessages={midiMessages}
                midiConnected={devices.length > 0}
                pressed={pressed}
                onSave={progress.add}
                onOpen={setLessonId}
              />
            )}
            {page === "progress" && (
              <>
                <div className="stats">
                  <Stat
                    icon={Clock3}
                    value={s.totalMinutes}
                    unit={t("phút")}
                    label={t("Thời gian luyện tập")}
                  />
                  <Stat
                    icon={BookOpen}
                    value={courseCompleted}
                    unit={`/ ${lessons.length}`}
                    label={t("Bài học hoàn thành")}
                  />
                  <Stat
                    icon={Flame}
                    value={s.streak}
                    unit={locale === "en" && s.streak === 1 ? "day" : t("ngày")}
                    label={t("Chuỗi ngày liên tiếp")}
                  />
                </div>
                <section className="card">
                  <div className="card-title">
                    <h2>{t("Nhật ký luyện tập")}</h2>
                    <button
                      className="text-button"
                      onClick={() => void download()}
                    >
                      <Download size={14} />
                      {t("Xuất tiến độ")}
                    </button>
                  </div>
                  {!progress.sessions.length ? (
                    <div className="empty">
                      <Music2 size={32} />
                      <h3>{t("Những nốt đầu tiên đang chờ bạn.")}</h3>
                      <p>
                        {t(
                          "Luyện một bài để bắt đầu nhật ký âm nhạc của mình.",
                        )}
                      </p>
                      <button
                        className="primary"
                        onClick={() => setLessonId(next.id)}
                      >
                        {t("Bắt đầu học")}
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  ) : (
                    <div className="history">
                      {progress.sessions.map((x) => (
                        <div className="history-row" key={x.id}>
                          <span className="history-icon">
                            {x.completed ? (
                              <Check size={17} />
                            ) : (
                              <Clock3 size={17} />
                            )}
                          </span>
                          <div>
                            <b>
                              {x.lesson_id === "daily"
                                ? t("Buổi luyện 15 phút")
                                : t(
                                    allLessons.find((l) => l.id === x.lesson_id)
                                      ?.title ??
                                      (x.lesson_id === "placement"
                                        ? "Đánh giá đầu vào"
                                        : x.lesson_id === "sight-reading"
                                          ? "Đọc nhạc mới"
                                          : "Bài luyện"),
                                  )}
                            </b>
                            <small>
                              {new Date(x.started_at).toLocaleString(
                                dateLocale,
                                {
                                  day: "numeric",
                                  month: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}{" "}
                              {t("·")}{" "}
                              {x.assessment?.input === "microphone"
                                ? t("Micro · từng nốt")
                                : x.input_mode === "midi"
                                  ? t("Đàn MIDI")
                                  : x.input_mode === "manual"
                                    ? t("Tự luyện trên đàn")
                                    : t("Bàn phím màn hình")}
                            </small>
                          </div>
                          <div className="history-result">
                            {x.assessment && (
                              <small>
                                {t(
                                  "Cao độ {pitch}% · Nhịp {timing}% · Điểm {score}",
                                  {
                                    pitch: x.assessment.pitchAccuracy,
                                    timing: x.assessment.timingAccuracy,
                                    score: x.assessment.score,
                                  },
                                )}
                              </small>
                            )}
                            <b>
                              {Math.floor(x.active_seconds / 60)}
                              {locale === "en" ? "m" : "p"}{" "}
                              {x.active_seconds % 60}s
                            </b>
                            <small>
                              {x.completed
                                ? t("Hoàn thành")
                                : t("Đã lưu buổi luyện")}
                              {x.correct_notes + x.wrong_notes > 0
                                ? t(" · {accuracy}% nốt đúng", {
                                    accuracy: Math.round(
                                      (x.correct_notes /
                                        (x.correct_notes + x.wrong_notes)) *
                                        100,
                                    ),
                                  })
                                : ""}
                            </small>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
            {page === "settings" && (
              <div className="settings-layout">
                <section className="card">
                  <div className="card-title">
                    <h2>{t("Tài khoản của bạn")}</h2>
                    <Cloud size={20} />
                  </div>
                  {user ? (
                    <>
                      <div className="account-profile">
                        <span className="avatar large">
                          {(user.user_metadata.full_name ?? "B").slice(0, 1)}
                        </span>
                        <div>
                          <h3>
                            {user.user_metadata.full_name ??
                              t("Người yêu piano")}
                          </h3>
                          <p className="muted">{user.email}</p>
                        </div>
                      </div>
                      <p className="small muted">
                        {t(progress.sync || "Tiến độ đang lưu trên thiết bị.")}
                      </p>
                      <button
                        className="outline"
                        onClick={() => void progress.importGuest()}
                      >
                        {t("Nhập tiến độ đã học ở chế độ khách")}
                      </button>
                      <button
                        className="text-button"
                        onClick={async () => {
                          const { error } = await supabase!.auth.signOut();
                          if (error)
                            setMessage("Chưa đăng xuất được. Hãy thử lại.");
                        }}
                      >
                        <LogOut size={15} />
                        {t("Đăng xuất")}
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="muted">
                        {t(
                          "Đăng nhập Google để đồng bộ bài học và buổi luyện giữa các thiết bị. Bạn vẫn có thể học ngay ở chế độ khách.",
                        )}
                      </p>
                      <button
                        className="google-button"
                        aria-label={t("Tiếp tục với Google")}
                        disabled={
                          loginBusy || !configured || googleState !== "enabled"
                        }
                        onClick={() => void login()}
                      >
                        <span className="google-g">G</span>
                        {loginBusy
                          ? t("Đang mở Google…")
                          : t("Tiếp tục với Google")}
                      </button>
                      {!configured && (
                        <p className="small muted">
                          {t(
                            "Đăng nhập Google sẽ khả dụng khi hệ thống tài khoản được kết nối.",
                          )}
                        </p>
                      )}
                      {configured && googleState !== "enabled" && (
                        <div className="small muted" role="status">
                          <p>
                            {t(
                              googleState === "checking"
                                ? "Đang kiểm tra đăng nhập…"
                                : googleState === "disabled"
                                  ? "Đăng nhập Google chưa được bật. Bạn vẫn có thể học ở chế độ khách."
                                  : "Chưa kết nối được dịch vụ đăng nhập. Hãy thử lại.",
                            )}
                          </p>
                          {googleState !== "checking" && (
                            <button
                              className="text-button"
                              onClick={() => setGoogleRetry((x) => x + 1)}
                            >
                              {t("Kiểm tra lại đăng nhập")}
                            </button>
                          )}
                        </div>
                      )}
                      <p className="small muted">
                        {t("Chế độ khách lưu tiến độ trên trình duyệt này.")}
                      </p>
                    </>
                  )}
                  <button
                    className="text-button"
                    onClick={() => void download()}
                  >
                    <Download size={15} />
                    {t("Tải bản sao tiến độ")}
                  </button>
                </section>
                {connection}
                <AudioCheck />
                <section className="card device-info">
                  <h2>{t("Được thiết kế cho chiếc đàn của bạn")}</h2>
                  <p className="muted">
                    {t("Yamaha YDP-163 · iPad Pro M2 · iPhone 11 Pro Max")}
                  </p>
                  <ul>
                    <li>
                      {t(
                        "Web: bài học, âm thanh, máy đếm nhịp, tiến độ và đăng nhập.",
                      )}
                    </li>
                    <li>
                      {t("iOS: thêm kết nối USB MIDI để nhận nốt từ đàn.")}
                    </li>
                    <li>
                      {t(
                        "MIDI chấm cao độ, nhóm hợp âm và sớm/trễ trong chế độ Chấm tiết tấu. Tư thế, pedal và sắc thái cần tự đánh giá.",
                      )}
                    </li>
                  </ul>
                  <p className="small muted">
                    {t(
                      "Micro tùy chọn nhận giai điệu từng nốt; xử lý âm thanh trên thiết bị.",
                    )}{" "}
                    {Capacitor.isNativePlatform()
                      ? t("Bạn đang dùng bản ứng dụng iOS.")
                      : t("Bạn đang dùng phiên bản web.")}
                  </p>
                </section>
              </div>
            )}
          </>
        )}
        <footer>
          {t("Đặt tay lên phím đàn. Dành một chút thời gian cho chính mình.")}
          <span>
            {user ? (
              <>
                <Cloud size={12} />
                {t(progress.sync)}
              </>
            ) : (
              <>
                <LogIn size={12} />
                <button onClick={() => go("settings")}>
                  {t("Đăng nhập để đồng bộ tiến độ")}
                </button>
              </>
            )}
          </span>
        </footer>
      </main>
      {lesson && authReady && (
        <LessonPlayer
          key={`${user?.id ?? "guest"}:${lesson.id}`}
          lesson={lesson}
          onSave={progress.add}
          onClose={() => setLessonId(null)}
          midiEvents={midiEvents}
          midiMessages={midiMessages}
          midiConnected={devices.length > 0}
          pressed={pressed}
        />
      )}{" "}
      {daily && authReady && (
        <DailyPractice onSave={progress.add} onClose={() => setDaily(false)} />
      )}
    </>
  );
}
function Stat({
  icon: Icon,
  value,
  unit,
  label,
}: {
  icon: typeof Clock3;
  value: number;
  unit?: string;
  label: string;
}) {
  return (
    <div className="stat">
      <span>
        <Icon size={20} />
      </span>
      <div>
        <strong>{value}</strong> <em>{unit}</em>
        <small>{label}</small>
      </div>
    </div>
  );
}
function PlayIcon() {
  return <Music2 size={15} />;
}
