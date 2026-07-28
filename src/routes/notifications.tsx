import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Trash2, Volume2, ShieldCheck, Moon } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import { useLanguage } from "@/lib/languageContext";
import { getGeminiLiveVoiceAudio } from "@/lib/gemini";

export const Route = createFileRoute("/notifications")({
  component: NotificationsPage,
  head: () => ({
    meta: [
      { title: "Notifications & Offline Alerts — Fish Doctor" },
      { name: "description", content: "Farm alerts sent only when you are offline / away from the app." },
    ],
  }),
});

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "weather" | "water" | "feed" | "market" | "ai";
  read: boolean;
}

export function NotificationsPage() {
  const { language } = useLanguage();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isOnlineInApp, setIsOnlineInApp] = useState<boolean>(true);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      title: "⛈️ Rain & Dissolved Oxygen Alert",
      message: "Heavy rainfall predicted in your area. Reduce feed by 40% and ensure overflow outlets are clear.",
      time: "Today, 11:45 AM",
      type: "weather",
      read: false,
    },
    {
      id: "2",
      title: "Fish Doctor Memory Synced",
      message: "AR camera pond measurements updated to unified farm memory. Optimal capacity calculated.",
      time: "Today, 8:30 AM",
      type: "ai",
      read: false,
    },
    {
      id: "3",
      title: "Ghana Fish Market Price Update",
      message: "African Catfish average price rose to GH₵ 48/kg across major regional markets.",
      time: "Today, 7:15 AM",
      type: "market",
      read: false,
    },
  ]);

  useEffect(() => {
    const handleVisibility = () => {
      setIsOnlineInApp(document.visibilityState === "visible");
    };
    window.addEventListener("visibilitychange", handleVisibility);
    return () => window.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const playNotificationAudio = async (id: string, text: string) => {
    if (playingId === id) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      setPlayingId(null);
      return;
    }

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    setPlayingId(id);

    const audioUrl = await getGeminiLiveVoiceAudio(text, language);

    if (audioUrl) {
      try {
        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;
        audio.onended = () => setPlayingId(null);
        audio.onerror = () => setPlayingId(null);
        await audio.play();
        return;
      } catch (e) {
        console.warn("Audio error", e);
      }
    }

    setPlayingId(null);
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <PhoneFrame>
      {/* Header */}
      <header className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-sky-100 bg-white sticky top-0 z-20 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link to="/home" className="p-1 cursor-pointer hover:bg-sky-50 rounded-full">
            <ArrowLeft className="w-5.5 h-5.5 text-slate-800" />
          </Link>
          <div>
            <h1 className="text-base font-extrabold text-slate-900">Notifications</h1>
            <p className="text-[11px] text-slate-500 font-medium">Offline & Background Alerts</p>
          </div>
        </div>

        <img src={farmerImg} alt="Kofi" className="w-9 h-9 rounded-full object-cover border-2 border-[#0284C7]" />
      </header>

      {/* Online Status Banner */}
      <section className="mx-5 mt-4 p-3 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-extrabold text-[#0284C7]">
          <Moon className="w-4 h-4 text-[#0284C7]" />
          <span>Notifications Muted While In-App</span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
          Only Sent When Offline
        </span>
      </section>

      {/* Action Bar */}
      <div className="px-5 pt-3.5 pb-2 flex items-center justify-between text-xs border-b border-sky-100 bg-slate-50">
        <span className="font-bold text-slate-700">
          {notifications.filter((n) => !n.read).length} Unread Alerts
        </span>
        <div className="flex items-center gap-3">
          <button onClick={markAllRead} className="text-[#0284C7] font-bold hover:underline cursor-pointer">
            Mark All Read
          </button>
          <button onClick={clearAll} className="text-red-500 font-bold hover:underline cursor-pointer flex items-center gap-1">
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="px-5 pt-3 pb-6 space-y-3">
        {notifications.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold">
            No notifications right now.
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all space-y-2 ${
                item.read ? "bg-white border-sky-100" : "bg-sky-50/70 border-sky-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  {item.title}
                </h3>
                <span className="text-[10px] text-slate-400 font-medium">{item.time}</span>
              </div>

              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                {item.message}
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-sky-100">
                <span className="text-[10px] text-[#0284C7] font-bold uppercase">
                  {item.type} notification
                </span>
                <button
                  onClick={() => playNotificationAudio(item.id, item.message)}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#0284C7] hover:underline cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Read Aloud
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </PhoneFrame>
  );
}
