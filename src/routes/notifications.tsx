import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Bell, CheckCircle2, AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";

export const Route = createFileRoute("/notifications")({
  component: NotificationsPage,
  head: () => ({
    meta: [
      { title: "Notifications — Fish Doctor" },
      { name: "description", content: "Notifications and alerts status." },
    ],
  }),
});

export function NotificationsPage() {
  const [isAppActive, setIsAppActive] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsAppActive(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return (
    <PhoneFrame>
      <header className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-gray-100 bg-white shadow-xs">
        <div className="flex items-center gap-3">
          <Link to="/home" className="p-1 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5.5 h-5.5 text-gray-800" />
          </Link>
          <h1 className="text-[19px] font-extrabold text-gray-900 leading-tight">Notifications</h1>
        </div>
      </header>

      <section className="p-5 space-y-4">
        {/* In-app active notification status banner */}
        <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
          isAppActive
            ? "bg-emerald-50 border-emerald-200 text-emerald-900"
            : "bg-amber-50 border-amber-200 text-amber-900"
        }`}>
          <div className="w-10 h-10 rounded-xl bg-[#0F6236] text-white flex items-center justify-center font-bold">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider">In-App Notification Status</div>
            <div className="text-sm font-extrabold">
              {isAppActive ? "Notifications Muted (In-App Session Active)" : "Offline Notifications Enabled"}
            </div>
            <p className="text-[11px] opacity-80 mt-0.5">
              {isAppActive
                ? "You are currently online inside the app. Notification popups are muted while in app."
                : "Background notification push alerts will send when you leave the app."}
            </p>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          <div className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-xs flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#0F6236] flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-gray-900">Unified Farm Memory Synced</h4>
              <p className="text-xs text-gray-600 font-medium mt-0.5">Pond dimensions and stock numbers are synced with Fish Doctor AI.</p>
              <span className="text-[10px] text-gray-400 font-bold block mt-1">Today 08:30 AM</span>
            </div>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-xs flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-gray-900">Water Exchange Advisory</h4>
              <p className="text-xs text-gray-600 font-medium mt-0.5">Schedule a 25% fresh water exchange before afternoon feeding.</p>
              <span className="text-[10px] text-gray-400 font-bold block mt-1">Yesterday 04:15 PM</span>
            </div>
          </div>
        </div>
      </section>

      <BottomNav />
    </PhoneFrame>
  );
}
