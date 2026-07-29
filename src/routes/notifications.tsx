import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Bell, CheckCircle2, AlertTriangle, Info, Clock, Volume2, Save, Sparkles } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";

export const Route = createFileRoute("/notifications")({
  component: NotificationsPage,
  head: () => ({
    meta: [
      { title: "Daily Feeding Alarms & Notifications — Fish Doctor" },
      { name: "description", content: "Set daily morning and evening feeding alarm times and push notifications." },
    ],
  }),
});

export function NotificationsPage() {
  const [isAppActive, setIsAppActive] = useState(true);
  const [morningTime, setMorningTime] = useState<string>("07:30");
  const [eveningTime, setEveningTime] = useState<string>("17:00");
  const [enableSound, setEnableSound] = useState<boolean>(true);
  const [savedStatus, setSavedStatus] = useState<string>("");

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsAppActive(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const m = localStorage.getItem("alarm_morning_time");
    const e = localStorage.getItem("alarm_evening_time");
    if (m) setMorningTime(m);
    if (e) setEveningTime(e);

    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const handleSaveAlarms = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("alarm_morning_time", morningTime);
    localStorage.setItem("alarm_evening_time", eveningTime);
    setSavedStatus("Feeding alarms saved successfully!");
    setTimeout(() => setSavedStatus(""), 3000);
  };

  const handleTestSound = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const text = "Feeding Time Alert! Please measure and feed your fish ponds now.";
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <PhoneFrame>
      <header className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-gray-200 bg-white shadow-xs">
        <div className="flex items-center gap-3">
          <Link to="/home" className="p-1 hover:bg-gray-100 rounded-full cursor-pointer">
            <ArrowLeft className="w-5.5 h-5.5 text-gray-900" />
          </Link>
          <h1 className="text-[19px] font-extrabold text-gray-900 leading-tight">Feeding Alarms & Alerts</h1>
        </div>
      </header>

      <section className="p-5 space-y-4">
        {/* Daily Feeding Alarm Configuration */}
        <form onSubmit={handleSaveAlarms} className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#0F6236]" />
              <h2 className="text-sm font-extrabold text-gray-900">Daily Feeding Schedule Alarms</h2>
            </div>
            <button
              type="button"
              onClick={handleTestSound}
              className="px-2.5 py-1 rounded-xl bg-emerald-50 text-[#0F6236] hover:bg-emerald-100 text-[11px] font-extrabold border border-emerald-200 flex items-center gap-1 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" /> Test Sound
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-gray-800 mb-1">Morning Feed Alarm</label>
              <input
                type="time"
                value={morningTime}
                onChange={(e) => setMorningTime(e.target.value)}
                className="w-full h-11 px-3 border border-gray-300 rounded-2xl bg-gray-50 text-xs font-extrabold outline-none text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-gray-800 mb-1">Evening Feed Alarm</label>
              <input
                type="time"
                value={eveningTime}
                onChange={(e) => setEveningTime(e.target.value)}
                className="w-full h-11 px-3 border border-gray-300 rounded-2xl bg-gray-50 text-xs font-extrabold outline-none text-gray-900"
              />
            </div>
          </div>

          {savedStatus && (
            <div className="p-3 bg-emerald-50 text-emerald-900 rounded-2xl text-xs font-extrabold border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {savedStatus}
            </div>
          )}

          <button
            type="submit"
            className="w-full h-12 bg-[#0F6236] hover:bg-[#0B4D29] text-white font-extrabold text-xs rounded-2xl shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Alarm Schedule
          </button>
        </form>

        {/* Live System Alerts */}
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold text-gray-900">Recent Farm Alerts</h2>

          <div className="p-3.5 bg-white rounded-3xl border border-gray-200 shadow-2xs flex items-start gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-[#0F6236] flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-gray-900">Unified Farm Memory Synced</h4>
              <p className="text-xs text-gray-600 font-medium mt-0.5">Pond dimensions and stock numbers are synced with Fish Doctor AI.</p>
              <span className="text-[10px] text-gray-400 font-bold block mt-1">Today 08:30 AM</span>
            </div>
          </div>

          <div className="p-3.5 bg-white rounded-3xl border border-gray-200 shadow-2xs flex items-start gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-gray-900">Water Exchange Advisory</h4>
              <p className="text-xs text-gray-600 font-medium mt-0.5">Schedule a 25% fresh water exchange before afternoon feeding.</p>
              <span className="text-[10px] text-gray-400 font-bold block mt-1">Yesterday 05:15 PM</span>
            </div>
          </div>
        </div>
      </section>

      <BottomNav />
    </PhoneFrame>
  );
}
