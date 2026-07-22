import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Bell, CheckCircle, Droplet, ShoppingCart, Sparkles, Trash2 } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";

export const Route = createFileRoute("/notifications")({
  component: NotificationsPage,
  head: () => ({
    meta: [
      { title: "Notifications — FishFarm OS Ghana" },
      { name: "description", content: "Farm alerts, market updates, and daily recommendations." },
    ],
  }),
});

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "water" | "feed" | "market" | "ai";
  read: boolean;
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      title: "Water Parameter Check",
      message: "Dissolved Oxygen in Pond 1 is 5.8 mg/L (Optimal). Next test recommended tomorrow morning.",
      time: "Today, 8:30 AM",
      type: "water",
      read: false,
    },
    {
      id: "2",
      title: "Ghana Market Price Rise",
      message: "Catfish prices increased to GH₵ 48/kg in Kumasi and Malata markets.",
      time: "Today, 7:15 AM",
      type: "market",
      read: false,
    },
    {
      id: "3",
      title: "Community Group Buy Alert",
      message: "15% discount unlocked on 32% Raanan Feed. Join 340+ farmers in Ashanti Region.",
      time: "Yesterday, 4:20 PM",
      type: "feed",
      read: true,
    },
    {
      id: "4",
      title: "Daily AI Health Report",
      message: "All registered ponds are showing normal growth rate (↑ 14% this week).",
      time: "May 10, 6:00 PM",
      type: "ai",
      read: true,
    },
  ]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <PhoneFrame>
      {/* Header */}
      <header className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link to="/home" className="p-1">
            <ArrowLeft className="w-5 h-5 text-gray-800" />
          </Link>
          <div>
            <h1 className="text-base font-extrabold text-gray-900">Notifications</h1>
            <p className="text-[11px] text-gray-500 font-medium">Alerts & Market Updates</p>
          </div>
        </div>

        <img src={farmerImg} alt="Kofi" className="w-9 h-9 rounded-full object-cover border-2 border-[#0F6236]" />
      </header>

      {/* Action Bar */}
      <div className="px-5 pt-3.5 pb-2 flex items-center justify-between text-xs border-b border-gray-100 bg-gray-50">
        <span className="font-bold text-gray-700">
          {notifications.filter((n) => !n.read).length} Unread Alerts
        </span>
        <div className="flex items-center gap-3">
          <button onClick={markAllRead} className="text-[#0F6236] font-bold hover:underline cursor-pointer">
            Mark All Read
          </button>
          <button onClick={clearAll} className="text-red-500 font-bold hover:underline cursor-pointer flex items-center gap-1">
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="px-5 py-4 space-y-3 flex-1 overflow-y-auto mb-6">
        {notifications.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 shadow-xs">
            <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h3 className="font-bold text-gray-800 text-sm">No new notifications</h3>
            <p className="text-xs text-gray-400 mt-1">You're all caught up with your farm alerts.</p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                item.read ? "bg-white border-gray-200 opacity-80" : "bg-[#0F6236]/5 border-[#0F6236]/30 shadow-xs"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  item.type === "water"
                    ? "bg-blue-100 text-blue-700"
                    : item.type === "market"
                    ? "bg-emerald-100 text-emerald-800"
                    : item.type === "feed"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-[#0F6236] text-white"
                }`}
              >
                {item.type === "water" && <Droplet className="w-4 h-4" />}
                {item.type === "market" && <ShoppingCart className="w-4 h-4" />}
                {item.type === "feed" && <CheckCircle className="w-4 h-4" />}
                {item.type === "ai" && <Sparkles className="w-4 h-4" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-gray-900">{item.title}</h4>
                  <span className="text-[10px] text-gray-400">{item.time}</span>
                </div>
                <p className="text-xs text-gray-600 font-medium mt-1 leading-relaxed">{item.message}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </PhoneFrame>
  );
}
