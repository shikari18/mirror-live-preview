import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Settings, Bell, MapPin, Check, ChevronRight, Volume2, Play, Sparkles } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import feedSacks from "@/assets/feed-sacks.jpg";
import fishDecor from "@/assets/fish-decor.jpg";

import iconFeedSack from "@/assets/icons/feed-sack.png";
import iconWaterDrop from "@/assets/icons/water-drop.png";
import iconGrowth from "@/assets/icons/growth.png";
import iconCalendar from "@/assets/icons/calendar-clock.png";
import iconFeedCalc from "@/assets/icons/feed-calculator.png";
import iconAiDoctor from "@/assets/icons/ai-fish-doctor.png";
import iconBuyFeed from "@/assets/icons/buy-feed.png";
import iconSellFish from "@/assets/icons/sell-fish.png";
import iconMarketPrices from "@/assets/icons/market-prices.png";
import iconLoans from "@/assets/icons/loans.png";
import iconSupport from "@/assets/icons/support.png";
import { useLanguage } from "@/lib/languageContext";

export const Route = createFileRoute("/home")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Home — FishFarm OS Ghana" },
      { name: "description", content: "Your fish farm dashboard: today's status, quick actions and community group buys." },
    ],
  }),
});

const quickActions: { img: string; label: string; tint: string; to?: string }[] = [
  { img: iconFeedCalc, label: "Feed Calculator", tint: "bg-secondary/60", to: "/feed-calculator" },
  { img: iconAiDoctor, label: "AI Fish Doctor", tint: "bg-blue-50", to: "/ai-doctor" },
  { img: iconBuyFeed, label: "Buy Feed", tint: "bg-secondary/60", to: "/market" },
  { img: iconSellFish, label: "Sell Fish", tint: "bg-secondary/60", to: "/sell-fish" },
  { img: iconWaterDrop, label: "Water Monitor", tint: "bg-blue-50", to: "/water-quality" },
  { img: iconMarketPrices, label: "Market Prices", tint: "bg-yellow-50", to: "/market" },
  { img: iconLoans, label: "AI Assistant", tint: "bg-secondary/60", to: "/assistant" },
  { img: iconSupport, label: "Extension Support", tint: "bg-yellow-50", to: "/assistant" },
];

export function HomePage() {
  const { language, t } = useLanguage();
  const [userName, setUserName] = useState("Kofi");

  useEffect(() => {
    const savedName = localStorage.getItem("user_name");
    if (savedName) setUserName(savedName);
  }, []);

  return (
    <PhoneFrame>
      {/* Header */}
      <header className="px-5 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/settings" className="p-1.5 text-gray-700 hover:text-[#0F6236] rounded-full hover:bg-gray-100 transition-all">
            <Settings className="w-6 h-6" />
          </Link>
          <div>
            <div className="text-[20px] font-extrabold text-foreground">Akwaaba, {userName} 👋</div>
            <div className="flex items-center gap-1 text-[#0F6236] text-[12.5px] font-medium">
              <MapPin className="w-3.5 h-3.5" /> Ashanti Region, Ghana • {language}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/settings" className="relative p-1">
            <Bell className="w-6 h-6 text-foreground" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-background" />
          </Link>
          <Link to="/profile">
            <img src={farmerImg} alt={userName} className="w-10 h-10 rounded-full object-cover border-2 border-[#0F6236]" />
          </Link>
        </div>
      </header>

      {/* Today's Farm Status Banner */}
      <section className="mx-5 mt-5 rounded-2xl bg-[#0F6236] text-white p-5 relative overflow-hidden shadow-lg shadow-[#0F6236]/20">
        <img src={fishDecor} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="relative">
          <div className="flex items-center gap-1.5 text-[12px] opacity-90 font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Today's Gemini AI Status
          </div>
          <div className="mt-1 text-[22px] font-extrabold leading-tight">All Ponds Healthy</div>
          <div className="mt-1 text-[13px] opacity-95">Water DO: 5.8 mg/L • Temp: 28°C • Optimal Growth</div>
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-13 h-13 rounded-full bg-white/20 flex items-center justify-center">
          <Check className="w-7 h-7 text-white" strokeWidth={3} />
        </div>
      </section>

      {/* Farm Stats Cards */}
      <section className="px-5 mt-4 grid grid-cols-2 gap-3">
        <StatCard tint="bg-secondary/60" img={iconFeedSack} label="Feed Today" value="6.25 kg" sub="Recommended" />
        <StatCard tint="bg-blue-50" img={iconWaterDrop} label="Water Quality" value="94 / 100" sub="Optimal DO & pH" />
        <StatCard tint="bg-yellow-50" img={iconGrowth} label="Fish Growth" value="On Track" sub="↑ 14% this week" />
        <StatCard tint="bg-purple-50" img={iconCalendar} label="Harvest Date" value="21 Days" sub="Target: 1.4kg" />
      </section>

      {/* Daily Voice Assistant Teaser */}
      <section className="mx-5 mt-4 rounded-2xl border border-gray-200 bg-white p-3.5 flex items-center gap-3 shadow-xs">
        <Link to="/assistant" className="w-11 h-11 rounded-full bg-[#0F6236] flex items-center justify-center shrink-0 text-white shadow-xs">
          <Volume2 className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-extrabold text-gray-900">Daily Voice Advice ({language})</div>
          <div className="mt-1 flex items-end gap-[2px] h-4">
            {Array.from({ length: 30 }).map((_, i) => {
              const h = 4 + Math.abs(Math.sin(i * 0.6)) * 12;
              return <span key={i} className="w-[3px] bg-[#0F6236]/70 rounded-full" style={{ height: `${h}px` }} />;
            })}
          </div>
          <Link to="/assistant" className="mt-1 text-[11px] text-[#0F6236] font-bold inline-flex items-center gap-1">
            <Play className="w-3 h-3 fill-[#0F6236]" /> Listen to Kofi's Daily Tip
          </Link>
        </div>
      </section>

      {/* Quick Actions Grid */}
      <section className="px-5 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[17px] font-extrabold text-gray-900">Farm Features</h2>
          <Link to="/settings" className="text-[#0F6236] font-bold text-xs">
            Settings & Lang
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map(({ img, label, tint, to }) => {
            const inner = (
              <>
                <div className={`w-full aspect-square rounded-2xl border border-gray-200/80 flex items-center justify-center ${tint} shadow-xs`}>
                  <img src={img} alt="" loading="lazy" className="w-9 h-9 object-contain" />
                </div>
                <div className="text-[11px] font-bold text-center mt-1.5 text-gray-800 leading-tight">{label}</div>
              </>
            );
            return to ? (
              <Link key={label} to={to as any} className="flex flex-col items-center">{inner}</Link>
            ) : (
              <button key={label} className="flex flex-col items-center">{inner}</button>
            );
          })}
        </div>
      </section>

      {/* Community Feed Buy Card */}
      <section className="mx-5 mt-5 mb-6 rounded-2xl bg-[#0F6236]/10 p-4 relative overflow-hidden border border-[#0F6236]/20">
        <div className="max-w-[60%]">
          <div className="text-[16px] font-extrabold text-gray-900">Ghana Community Feed Buy</div>
          <div className="text-[#0F6236] font-extrabold text-xs mt-0.5">Save up to 15% on Raanan & Aller Aqua</div>
          <div className="text-[11px] text-gray-600 mt-1">340+ farmers in Ashanti & Accra buying together</div>
          <Link to="/market" className="mt-3 inline-block bg-[#0F6236] text-white font-bold rounded-xl px-4 py-2 text-[12px] shadow-sm">
            Join Group Buy
          </Link>
        </div>
        <img src={feedSacks} alt="Feed sacks" loading="lazy" className="absolute right-0 bottom-0 w-36 h-36 object-cover rounded-tl-3xl opacity-90" />
      </section>

      <BottomNav />
    </PhoneFrame>
  );
}

function StatCard({ tint, img, label, value, sub }: { tint: string; img: string; label: string; value: string; sub: string }) {
  return (
    <div className={`${tint} rounded-2xl p-3 flex items-center gap-3 border border-gray-200/60 shadow-xs`}>
      <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
        <img src={img} alt="" loading="lazy" className="w-8 h-8 object-contain" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] text-gray-500 font-medium">{label}</div>
        <div className="text-[15px] font-extrabold text-gray-900 leading-tight">{value}</div>
        <div className="text-[10px] text-[#0F6236] font-bold">{sub}</div>
      </div>
    </div>
  );
}
