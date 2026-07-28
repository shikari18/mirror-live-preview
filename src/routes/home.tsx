import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Settings, Bell, MapPin, Check, Volume2, Play, Sparkles, Plus, CloudRain, Zap, Camera, UserCheck, AlertCircle, Building2, ChevronRight, Activity, ArrowUpRight } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import feedSacks from "@/assets/feed-sacks.jpg";

import iconFeedSack from "@/assets/icons/feed-sack.png";
import iconGrowth from "@/assets/icons/growth.png";
import iconCalendar from "@/assets/icons/calendar-clock.png";
import iconFeedCalc from "@/assets/icons/feed-calculator.png";
import iconAiDoctor from "@/assets/icons/ai-fish-doctor.png";
import iconBuyFeed from "@/assets/icons/buy-feed.png";
import iconSellFish from "@/assets/icons/sell-fish.png";
import iconMarketPrices from "@/assets/icons/market-prices.png";
import iconSupport from "@/assets/icons/support.png";

import { useLanguage } from "@/lib/languageContext";
import { getGeminiLiveVoiceAudio } from "@/lib/gemini";
import { getFarmProfile } from "@/lib/farmMemory";

export const Route = createFileRoute("/home")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Dashboard — Fish Doctor App" },
      { name: "description", content: "Your fish doctor dashboard: today's farm status, quick actions and live market prices." },
    ],
  }),
});

const quickActions: { img: string; label: string; tint: string; to?: string }[] = [
  { img: iconFeedCalc, label: "Feed Calculator", tint: "bg-white", to: "/feed-calculator" },
  { img: iconAiDoctor, label: "Fish Doctor AI", tint: "bg-white", to: "/ai-doctor" },
  { img: iconBuyFeed, label: "Buy Supplies", tint: "bg-white", to: "/market" },
  { img: iconSellFish, label: "Sell Harvest", tint: "bg-white", to: "/sell-fish" },
  { img: iconMarketPrices, label: "Live Market", tint: "bg-white", to: "/market" },
  { img: iconSupport, label: "Extension Support", tint: "bg-white", to: "/extension-support" },
];

export function HomePage() {
  const { language } = useLanguage();
  const [userName, setUserName] = useState("");
  const [farmName, setFarmName] = useState("Green Aqua Farm");
  const [userProfilePic, setUserProfilePic] = useState<string | null>(null);
  const [pondsCount, setPondsCount] = useState<number>(0);
  const [totalFish, setTotalFish] = useState<number>(0);
  const [userLocation, setUserLocation] = useState<string>("");

  // Audio Playback State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioStatusText, setAudioStatusText] = useState("");
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const weatherAlert = {
    summary: "Tropical Climate (29°C) • Feeding Schedule Optimal"
  };

  useEffect(() => {
    const savedName = localStorage.getItem("user_name");
    if (savedName) setUserName(savedName);

    const savedFarmName = localStorage.getItem("user_farm_name");
    if (savedFarmName) setFarmName(savedFarmName);

    const savedPic = localStorage.getItem("user_profile_image");
    if (savedPic) setUserProfilePic(savedPic);

    const profile = getFarmProfile();
    if (profile.ponds && profile.ponds.length > 0) {
      setPondsCount(profile.ponds.length);
      setTotalFish(profile.ponds.reduce((sum, p) => sum + (p.fishCount || 0), 0));
    }
    if (profile.location) {
      setUserLocation(profile.location);
    }
  }, []);

  const handlePlayDailyVoiceAdvice = async () => {
    if (isPlayingAudio) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      setIsPlayingAudio(false);
      setAudioStatusText("");
      return;
    }

    setIsPlayingAudio(true);
    setAudioStatusText("Downloading Voice 30%...");

    const adviceText = `Welcome farmer! Live Weather & Farm Advisory: ${weatherAlert.summary}. Maintain optimal feeding schedules and use Fish Doctor AI for instant photo diagnosis.`;

    const audioUrl = await getGeminiLiveVoiceAudio(adviceText, language);

    if (audioUrl) {
      setAudioStatusText("Downloading Voice 100%!");
      try {
        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;
        audio.onplay = () => setAudioStatusText("Playing Voice Advice...");
        audio.onended = () => {
          setIsPlayingAudio(false);
          setAudioStatusText("");
          currentAudioRef.current = null;
        };
        audio.onerror = () => {
          setIsPlayingAudio(false);
          setAudioStatusText("");
          currentAudioRef.current = null;
        };
        await audio.play();
        return;
      } catch (e) {
        console.warn("Audio play error", e);
      }
    }

    setIsPlayingAudio(false);
    setAudioStatusText("");
  };

  return (
    <PhoneFrame>
      {/* Location Completion Prompt */}
      {!userLocation && (
        <div className="mx-5 mt-3 p-3.5 rounded-[22px] bg-black text-white flex items-center justify-between text-xs animate-in fade-in shadow-lg">
          <div className="flex items-center gap-2 font-semibold">
            <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Almost done! Add your farm location to complete setup</span>
          </div>
          <Link to="/profile" className="px-3 py-1.5 rounded-full bg-white text-black font-extrabold shrink-0 active:scale-95 transition-all">
            Complete
          </Link>
        </div>
      )}

      {/* Apple Dynamic Header Bar */}
      <header className="px-5 pt-3 pb-3 flex items-center justify-between border-b border-black/5 bg-white/70 backdrop-blur-2xl sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link to="/settings" className="p-2 text-black hover:bg-black/5 rounded-full transition-all cursor-pointer">
            <Settings className="w-5.5 h-5.5" />
          </Link>
          <div>
            <div className="text-[19px] font-extrabold text-black leading-tight tracking-tight">
              {userName ? `Welcome, ${userName}` : "Welcome, Farmer"}
            </div>
            <div className="flex items-center gap-1.5 text-gray-500 text-[12px] font-semibold mt-0.5">
              <Building2 className="w-3.5 h-3.5 text-black" /> {farmName} {userLocation ? `• ${userLocation}` : ""}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Link to="/notifications" className="p-2 rounded-full hover:bg-black/5 transition-all cursor-pointer relative">
            <Bell className="w-5.5 h-5.5 text-black" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
          </Link>
          <Link to="/profile" className="cursor-pointer">
            <img
              src={userProfilePic || farmerImg}
              alt="User profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-black/10 shadow-md hover:scale-105 transition-all"
            />
          </Link>
        </div>
      </header>

      {/* Billion-Dollar Apple Intelligence Hero Card */}
      <section className="mx-5 mt-4 rounded-[32px] bg-black text-white p-5.5 relative overflow-hidden shadow-2xl shadow-black/25">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-gray-300 bg-white/10 px-3 py-1 rounded-full backdrop-blur-xl border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Apple Intelligence Aquaculture
            </div>
            <span className="flex items-center gap-1 text-[10.5px] font-extrabold bg-emerald-500 text-black px-2.5 py-0.5 rounded-full shadow-xs">
              <Activity className="w-3 h-3" /> Live Sync
            </span>
          </div>

          <div className="mt-4 text-[25px] font-extrabold leading-tight tracking-tight">
            {pondsCount > 0 ? `${pondsCount} Active Ponds Monitored` : "Farm System Ready"}
          </div>

          <div className="mt-1 text-[13px] text-gray-300 font-medium leading-relaxed">
            {pondsCount > 0 ? `Total Stock: ${totalFish.toLocaleString()} Fish • AI Doctor Synced` : "Scan your pond perimeter with camera to sync metrics"}
          </div>

          <div className="mt-5 flex gap-2.5">
            <Link to="/my-farm" className="px-4 py-2.5 rounded-full bg-white text-black font-extrabold text-xs shadow-lg flex items-center gap-1.5 hover:bg-gray-100 transition-all active:scale-95">
              <Camera className="w-4 h-4 text-black" /> AR Camera Measure
            </Link>
            <Link to="/ai-doctor" className="px-4 py-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs backdrop-blur-xl border border-white/20 flex items-center gap-1.5 transition-all">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Diagnose Fish
            </Link>
          </div>
        </div>
      </section>

      {/* Apple Dynamic Metric Cards (2x2) */}
      <section className="px-5 mt-4 grid grid-cols-2 gap-3">
        <AppleStatCard img={iconFeedSack} label="Daily Feed Ration" value={totalFish > 0 ? `${(totalFish * 0.03 * 0.05).toFixed(1)} kg` : "0.0 kg"} sub="AI Optimized" />
        <AppleStatCard img={iconGrowth} label="Active Ponds" value={`${pondsCount} Ponds`} sub="In Production" />
        <AppleStatCard img={iconCalendar} label="Total Stock" value={`${totalFish.toLocaleString()} Fish`} sub="Live Inventory" />
        <AppleStatCard img={iconAiDoctor} label="AI Doctor" value="Online" sub="Vision Engine Ready" />
      </section>

      {/* Apple Weather Widget */}
      <section className="mx-5 mt-4 rounded-[28px] bg-white border border-black/5 p-4.5 text-black shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-black text-white rounded-2xl shadow-xs">
              <CloudRain className="w-4 h-4 text-white" />
            </span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
              Live Weather & Advisory
            </span>
          </div>
          <span className="text-[10px] font-extrabold bg-black text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
            <Zap className="w-3 h-3 fill-white" /> Weather Sync
          </span>
        </div>

        <div className="mt-3">
          <h3 className="text-sm font-extrabold leading-tight text-black tracking-tight">
            🌊 {weatherAlert.summary}
          </h3>
          <p className="text-[11.5px] text-gray-500 mt-1 leading-normal font-medium">
            Tap below to listen to Fish Doctor AI voice advisory in {language}.
          </p>
        </div>

        {/* Voice Play Button */}
        <div className="mt-3.5 flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            {audioStatusText && (
              <span className="text-[10.5px] font-extrabold text-black animate-pulse truncate max-w-[150px]">
                {audioStatusText}
              </span>
            )}
          </div>

          <button
            onClick={handlePlayDailyVoiceAdvice}
            className={`px-4.5 py-2.5 rounded-full text-xs font-extrabold flex items-center gap-2 shadow-md transition-all cursor-pointer ${
              isPlayingAudio
                ? "bg-black text-white"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            {isPlayingAudio ? (
              <>
                <Volume2 className="w-4 h-4 animate-spin" /> Stop Voice
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" /> Listen Voice ({language})
              </>
            )}
          </button>
        </div>
      </section>

      {/* Apple Launchpad Grid */}
      <section className="px-5 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[18px] font-extrabold text-black tracking-tight">Applications</h2>
          <Link to="/settings" className="text-gray-500 font-bold text-xs hover:text-black flex items-center gap-0.5">
            Settings <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map(({ img, label, to }) => {
            const inner = (
              <div className="apple-card p-3 flex flex-col items-center justify-center w-full aspect-square relative group">
                <img src={img} alt="" loading="lazy" className="w-9 h-9 object-contain group-hover:scale-110 transition-transform duration-300" />
                <div className="text-[11px] font-extrabold text-center mt-2 text-black leading-tight tracking-tight">{label}</div>
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            );
            return to ? (
              <Link key={label} to={to as any} className="flex flex-col items-center">{inner}</Link>
            ) : (
              <button key={label} className="flex flex-col items-center w-full">{inner}</button>
            );
          })}
        </div>
      </section>

      {/* Community Feed Group Buy Card */}
      <section className="mx-5 mt-5 mb-6 apple-card p-5 relative overflow-hidden border border-black/5">
        <div className="max-w-[62%]">
          <div className="text-[16px] font-extrabold text-black leading-tight tracking-tight">Community Feed Buy</div>
          <div className="text-black font-extrabold text-xs mt-1">Save up to 15% on Raanan & Aller Aqua</div>
          <div className="text-[11.5px] text-gray-500 mt-1 font-medium leading-relaxed">Order high quality feeds at wholesale market rates with direct delivery.</div>
          <Link to="/market" className="mt-4 inline-flex items-center gap-1 bg-black hover:bg-gray-800 text-white font-extrabold rounded-full px-4 py-2.5 text-[12px] shadow-md cursor-pointer transition-all active:scale-95">
            Join Group Buy <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <img src={feedSacks} alt="Feed sacks" loading="lazy" className="absolute right-0 bottom-0 w-36 h-36 object-cover rounded-tl-[32px] shadow-xl border-t border-l border-black/5" />
      </section>

      <BottomNav />
    </PhoneFrame>
  );
}

function AppleStatCard({ img, label, value, sub }: { img: string; label: string; value: string; sub: string }) {
  return (
    <div className="apple-card p-3.5 flex items-center gap-3">
      <div className="w-11 h-11 rounded-[20px] bg-gray-100 flex items-center justify-center shrink-0 border border-black/5">
        <img src={img} alt="" loading="lazy" className="w-8 h-8 object-contain" />
      </div>
      <div className="min-w-0">
        <div className="text-[10.5px] text-gray-500 font-semibold">{label}</div>
        <div className="text-[14px] font-extrabold text-black leading-tight tracking-tight">{value}</div>
        <div className="text-[10px] text-black font-extrabold">{sub}</div>
      </div>
    </div>
  );
}
