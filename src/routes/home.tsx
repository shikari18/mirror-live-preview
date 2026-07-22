import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Settings, Bell, MapPin, Check, Volume2, Play, Sparkles, AlertCircle, Plus } from "lucide-react";
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
      { name: "description", content: "Your fish farm dashboard: today's status, quick actions and market prices." },
    ],
  }),
});

const quickActions: { img: string; label: string; tint: string; to?: string }[] = [
  { img: iconFeedCalc, label: "Feed Calculator", tint: "bg-secondary/60", to: "/feed-calculator" },
  { img: iconAiDoctor, label: "AI Fish Doctor", tint: "bg-blue-50", to: "/ai-doctor" },
  { img: iconBuyFeed, label: "Buy Supplies", tint: "bg-secondary/60", to: "/market" },
  { img: iconSellFish, label: "Sell Harvest", tint: "bg-secondary/60", to: "/sell-fish" },
  { img: iconWaterDrop, label: "Water Monitor", tint: "bg-blue-50", to: "/water-quality" },
  { img: iconMarketPrices, label: "Market Prices", tint: "bg-yellow-50", to: "/market" },
  { img: iconLoans, label: "AI Assistant", tint: "bg-secondary/60", to: "/assistant" },
  { img: iconSupport, label: "Extension Support", tint: "bg-yellow-50", to: "/assistant" },
];

export function HomePage() {
  const { language } = useLanguage();
  const [userName, setUserName] = useState("");
  const [pondsCount, setPondsCount] = useState<number>(0);
  const [totalFish, setTotalFish] = useState<number>(0);
  const [isSetupComplete, setIsSetupComplete] = useState<boolean>(false);

  useEffect(() => {
    const savedName = localStorage.getItem("user_name");
    if (savedName) setUserName(savedName);

    const onboardingDone = localStorage.getItem("user_onboarding_completed") === "true";
    const savedPonds = localStorage.getItem("user_ponds");
    let hasPonds = false;
    if (savedPonds) {
      const parsed = JSON.parse(savedPonds);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setPondsCount(parsed.length);
        setTotalFish(parsed.reduce((sum: number, p: any) => sum + (p.count || 0), 0));
        hasPonds = true;
      }
    }

    if (onboardingDone || hasPonds) {
      setIsSetupComplete(true);
    }
  }, []);

  return (
    <PhoneFrame>
      {/* Header - Compact & Aligned */}
      <header className="px-5 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/settings" className="p-1.5 text-gray-700 hover:text-[#0F6236] rounded-full hover:bg-gray-100 transition-all cursor-pointer">
            <Settings className="w-5.5 h-5.5" />
          </Link>
          <div>
            <div className="text-[19px] font-extrabold text-foreground leading-tight">
              {userName ? `Akwaaba, ${userName} 👋` : "Akwaaba, Farmer 👋"}
            </div>
            <div className="flex items-center gap-1 text-[#0F6236] text-[12px] font-medium">
              <MapPin className="w-3.5 h-3.5" /> Ashanti Region, Ghana • {language}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/notifications" className="relative p-1 cursor-pointer">
            <Bell className="w-6 h-6 text-foreground" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-background" />
          </Link>
          <Link to="/profile" className="cursor-pointer">
            <img src={farmerImg} alt="User" className="w-9 h-9 rounded-full object-cover border-2 border-[#0F6236]" />
          </Link>
        </div>
      </header>

      {/* Dynamic Banner: Shows Setup Alert IF User has not completed onboarding or added ponds */}
      {!isSetupComplete ? (
        <section className="mx-5 mt-4 rounded-2xl bg-amber-500 text-white p-4 relative overflow-hidden shadow-lg shadow-amber-500/20">
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 text-[11.5px] opacity-95 font-bold uppercase">
              <AlertCircle className="w-4 h-4" /> Setup Incomplete
            </div>
            <div className="mt-1 text-[19px] font-extrabold leading-tight">Complete Your Farm Setup</div>
            <div className="mt-0.5 text-[12.5px] opacity-95">Record your pond video and answer 4 quick questions.</div>
            <div className="mt-3 flex gap-2">
              <Link to="/onboarding" className="px-3.5 py-1.5 rounded-xl bg-white text-amber-800 font-bold text-xs shadow-xs">
                Start Setup & Video
              </Link>
              <Link to="/my-farm" className="px-3.5 py-1.5 rounded-xl bg-amber-700 text-white font-bold text-xs shadow-xs flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Add Pond
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="mx-5 mt-4 rounded-2xl bg-[#0F6236] text-white p-4 relative overflow-hidden shadow-lg shadow-[#0F6236]/20">
          <img src={fishDecor} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover opacity-20" />
          <div className="relative">
            <div className="flex items-center gap-1.5 text-[11.5px] opacity-90 font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Live Farm Status
            </div>
            <div className="mt-1 text-[21px] font-extrabold leading-tight">
              {pondsCount > 0 ? `${pondsCount} Active Ponds Healthy` : "Farm Profile Registered"}
            </div>
            <div className="mt-0.5 text-[12.5px] opacity-95">
              {pondsCount > 0 ? `Total Stock: ${totalFish.toLocaleString()} Fish • Water Quality: Optimal` : "Ready to add your first pond and stock"}
            </div>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <Check className="w-6 h-6 text-white" strokeWidth={3} />
          </div>
        </section>
      )}

      {/* Dynamic Farm Stats Cards */}
      <section className="px-5 mt-4 grid grid-cols-2 gap-2.5">
        <StatCard tint="bg-secondary/60" img={iconFeedSack} label="Feed Needed Today" value={totalFish > 0 ? `${(totalFish * 0.03 * 0.05).toFixed(1)} kg` : "0.0 kg"} sub="Calculated" />
        <StatCard tint="bg-blue-50" img={iconWaterDrop} label="Water Status" value={isSetupComplete ? "Good" : "No Data"} sub="Pond Health" />
        <StatCard tint="bg-yellow-50" img={iconGrowth} label="Active Ponds" value={`${pondsCount} Ponds`} sub="In Production" />
        <StatCard tint="bg-purple-50" img={iconCalendar} label="Total Stocked" value={`${totalFish.toLocaleString()} Fish`} sub="Live Count" />
      </section>

      {/* Voice Assistant Section */}
      <section className="mx-5 mt-4 rounded-2xl border border-gray-200 bg-white p-3 flex items-center gap-3 shadow-xs">
        <Link to="/assistant" className="w-10 h-10 rounded-full bg-[#0F6236] flex items-center justify-center shrink-0 text-white shadow-xs">
          <Volume2 className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-extrabold text-gray-900">Daily Voice Advice ({language})</div>
          <div className="mt-1 flex items-end gap-[2px] h-3.5">
            {Array.from({ length: 30 }).map((_, i) => {
              const h = 3 + Math.abs(Math.sin(i * 0.6)) * 10;
              return <span key={i} className="w-[3px] bg-[#0F6236]/70 rounded-full" style={{ height: `${h}px` }} />;
            })}
          </div>
          <Link to="/assistant" className="mt-1 text-[11px] text-[#0F6236] font-bold inline-flex items-center gap-1">
            <Play className="w-3 h-3 fill-[#0F6236]" /> Listen to Daily Farming Tip
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-5 mt-4">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-[16px] font-extrabold text-gray-900">Farm Features</h2>
          <Link to="/settings" className="text-[#0F6236] font-bold text-xs">
            Settings
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-2.5">
          {quickActions.map(({ img, label, tint, to }) => {
            const inner = (
              <>
                <div className={`w-full aspect-square rounded-2xl border border-gray-200/80 flex items-center justify-center ${tint} shadow-xs`}>
                  <img src={img} alt="" loading="lazy" className="w-8.5 h-8.5 object-contain" />
                </div>
                <div className="text-[10.5px] font-bold text-center mt-1 text-gray-800 leading-tight">{label}</div>
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
      <section className="mx-5 mt-4 mb-6 rounded-2xl bg-[#0F6236]/10 p-4 relative overflow-hidden border border-[#0F6236]/20">
        <div className="max-w-[60%]">
          <div className="text-[15px] font-extrabold text-gray-900">Ghana Community Feed Buy</div>
          <div className="text-[#0F6236] font-extrabold text-xs mt-0.5">Save up to 15% on Raanan & Aller Aqua</div>
          <div className="text-[11px] text-gray-600 mt-1">340+ farmers in Ashanti & Accra buying together</div>
          <Link to="/market" className="mt-3 inline-block bg-[#0F6236] text-white font-bold rounded-xl px-4 py-2 text-[12px] shadow-sm">
            Join Group Buy
          </Link>
        </div>
        <img src={feedSacks} alt="Feed sacks" loading="lazy" className="absolute right-0 bottom-0 w-32 h-32 object-cover rounded-tl-3xl opacity-90" />
      </section>

      <BottomNav />
    </PhoneFrame>
  );
}

function StatCard({ tint, img, label, value, sub }: { tint: string; img: string; label: string; value: string; sub: string }) {
  return (
    <div className={`${tint} rounded-2xl p-2.5 flex items-center gap-2.5 border border-gray-200/60 shadow-xs`}>
      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
        <img src={img} alt="" loading="lazy" className="w-7.5 h-7.5 object-contain" />
      </div>
      <div className="min-w-0">
        <div className="text-[10.5px] text-gray-500 font-medium">{label}</div>
        <div className="text-[13.5px] font-extrabold text-gray-900 leading-tight">{value}</div>
        <div className="text-[10px] text-[#0F6236] font-bold">{sub}</div>
      </div>
    </div>
  );
}
