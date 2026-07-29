import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Settings, Bell, MapPin, Volume2, Play, Stethoscope, CloudRain, Zap, Camera, AlertCircle, Building2, ChevronRight, Clock, ShieldCheck } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import feedSacks from "@/assets/feed-sacks.jpg";
import fishDecor from "@/assets/fish-decor.jpg";

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
import { getSubscriptionStatus, SubscriptionStatus, PRO_MONTHLY_PRICE_GHC } from "@/lib/subscription";
import { PaymentModal } from "@/components/PaymentModal";

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
  { img: iconFeedCalc, label: "Feed Calculator", tint: "bg-emerald-50/80 border-emerald-100 text-emerald-900", to: "/feed-calculator" },
  { img: iconAiDoctor, label: "Fish Doctor AI", tint: "bg-emerald-500/10 border-emerald-500/20 text-emerald-900", to: "/ai-doctor" },
  { img: iconBuyFeed, label: "Buy Supplies", tint: "bg-[#0F6236]/10 border-[#0F6236]/20 text-[#0F6236]", to: "/market" },
  { img: iconSellFish, label: "Sell Harvest", tint: "bg-emerald-50/80 border-emerald-100 text-emerald-900", to: "/sell-fish" },
  { img: iconMarketPrices, label: "Live Market", tint: "bg-amber-50/80 border-amber-200 text-amber-900", to: "/market" },
  { img: iconSupport, label: "Extension Support", tint: "bg-emerald-500/10 border-emerald-500/20 text-[#0F6236]", to: "/extension-support" },
];

export function HomePage() {
  const { language } = useLanguage();
  const [userName, setUserName] = useState("");
  const [farmName, setFarmName] = useState("Green Aqua Farm");
  const [userProfilePic, setUserProfilePic] = useState<string | null>(null);
  const [pondsCount, setPondsCount] = useState<number>(0);
  const [totalFish, setTotalFish] = useState<number>(0);
  const [userLocation, setUserLocation] = useState<string>("");

  // Subscription & Payment State
  const [subStatus, setSubStatus] = useState<SubscriptionStatus>(getSubscriptionStatus());
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Audio Playback State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioStatusText, setAudioStatusText] = useState("");
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const weatherAlert = {
    summary: "Tropical Climate (29°C) • Feeding Schedule Optimal"
  };

  // Real-Time Open-Meteo Live Weather State
  const [liveWeather, setLiveWeather] = useState<{
    isRaining: boolean;
    temp: number;
    description: string;
    adviceText: string;
  }>({
    isRaining: false,
    temp: 28,
    description: "Tropical Climate (28°C)",
    adviceText: "Optimal feeding window. Ensure evening aerator runs during peak heat."
  });

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

    // Fetch live weather from Open-Meteo API
    const fetchLiveWeather = async (lat: number, lon: number) => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        if (res.ok) {
          const data = await res.json();
          const code = data.current_weather?.weathercode ?? 0;
          const temp = Math.round(data.current_weather?.temperature ?? 28);
          
          const isRainingNow = code >= 51; // Codes 51-99 are drizzle/rain/thunderstorm
          
          if (isRainingNow) {
            setLiveWeather({
              isRaining: true,
              temp,
              description: `Rain & Thunderstorm (${temp}°C)`,
              adviceText: `🌧️ RAINING CURRENTLY (${temp}°C): Stop or delay feeding! Fish feeding activity drops during rainfall, and uneaten pellets pollute water & deplete oxygen.`
            });
          } else if (code >= 1 && code <= 3) {
            setLiveWeather({
              isRaining: false,
              temp,
              description: `Overcast & Overcast (${temp}°C)`,
              adviceText: `☁️ Overcast Weather (${temp}°C): Reduce feed ration by 20% due to reduced photosynthesis oxygen levels.`
            });
          } else {
            setLiveWeather({
              isRaining: false,
              temp,
              description: `Clear & Sunny (${temp}°C)`,
              adviceText: `☀️ Clear Climate (${temp}°C): Optimal feeding window. Maintain regular feeding schedule.`
            });
          }
        }
      } catch (e) {
        console.warn("Open-Meteo live weather fetch error", e);
      }
    };

    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchLiveWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchLiveWeather(5.60, -0.18)
      );
    } else {
      fetchLiveWeather(5.60, -0.18);
    }

    // Refresh Subscription Status every 1 second for live countdown
    const subInterval = setInterval(() => {
      setSubStatus(getSubscriptionStatus());
    }, 1000);

    return () => clearInterval(subInterval);
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
        <div className="mx-5 mt-3 p-3.5 rounded-2xl bg-[#0F6236]/10 border border-[#0F6236]/30 text-[#0F6236] flex items-center justify-between text-xs animate-in fade-in shadow-xs">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="w-4 h-4 text-[#0F6236] shrink-0" />
            <span>Almost done! Add your farm location to complete setup</span>
          </div>
          <Link to="/profile" className="px-3 py-1.5 rounded-xl bg-[#0F6236] hover:bg-[#0B4A28] text-white font-extrabold shrink-0 shadow-xs cursor-pointer">
            Complete
          </Link>
        </div>
      )}

      {/* Header Bar */}
      <header className="px-5 pt-4 pb-3.5 flex items-center justify-between border-b border-[#0F6236]/10 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link to="/settings" className="p-2 text-gray-700 hover:text-[#0F6236] hover:bg-emerald-50 rounded-2xl transition-all cursor-pointer">
            <Settings className="w-5.5 h-5.5" />
          </Link>
          <div>
            <div className="text-[19px] font-extrabold text-gray-900 leading-tight flex items-center gap-1.5">
              {userName ? `Welcome, ${userName} 👋` : "Welcome, Farmer 👋"}
            </div>
            <div className="flex items-center gap-1.5 text-[#0F6236] text-[12px] font-bold mt-0.5">
              <Building2 className="w-3.5 h-3.5" /> {farmName} {userLocation ? `• ${userLocation}` : ""}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/notifications" className="relative p-2 rounded-2xl hover:bg-emerald-50 transition-all cursor-pointer">
            <Bell className="w-5.5 h-5.5 text-gray-800" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#0F6236] border-2 border-white animate-pulse" />
          </Link>
          <Link to="/profile" className="cursor-pointer">
            <img
              src={userProfilePic || farmerImg}
              alt="User profile"
              className="w-10 h-10 rounded-2xl object-cover border-2 border-[#0F6236] shadow-md hover:scale-105 transition-all"
            />
          </Link>
        </div>
      </header>

      {/* Subscription / 23-Hour Free Trial Banner */}
      {subStatus.isPro ? (
        <div className="mx-5 mt-3 p-3 rounded-2xl bg-gradient-to-r from-[#08301B] to-[#0F6236] text-white flex items-center justify-between text-xs font-extrabold shadow-sm border border-emerald-400/20">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>Pro Member • GH₵ {PRO_MONTHLY_PRICE_GHC}/mo Active</span>
          </div>
          <span className="px-2.5 py-1 rounded-xl bg-white/20 text-white text-[10.5px] uppercase tracking-wider font-extrabold">
            Pro Plan
          </span>
        </div>
      ) : subStatus.isTrialActive ? (
        <div
          onClick={() => setIsPaymentModalOpen(true)}
          className="mx-5 mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between text-xs font-bold shadow-xs cursor-pointer hover:bg-amber-100/80 transition-all"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-700 shrink-0" />
            <div>
              <span className="font-extrabold text-amber-950">23h Free Access: </span>
              <span className="font-mono text-amber-900 font-extrabold">{subStatus.formattedTimeLeft}</span>
            </div>
          </div>
          <button className="px-3 py-1 rounded-xl bg-[#0F6236] text-white text-[11px] font-extrabold shrink-0 shadow-xs cursor-pointer">
            Upgrade GH₵ 100
          </button>
        </div>
      ) : (
        <div
          onClick={() => setIsPaymentModalOpen(true)}
          className="mx-5 mt-3 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-center justify-between text-xs font-bold shadow-xs cursor-pointer hover:bg-red-100/80 transition-all animate-pulse"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>23-Hour Free Access Expired</span>
          </div>
          <button className="px-3 py-1 rounded-xl bg-red-600 text-white text-[11px] font-extrabold shrink-0 shadow-xs cursor-pointer">
            Subscribe GH₵ 100
          </button>
        </div>
      )}

      {/* Rich Emerald Hero Status Card */}
      <section className="mx-5 mt-4 rounded-3xl bg-gradient-to-br from-[#09341D] via-[#0F6236] to-[#082917] text-white p-5 relative overflow-hidden shadow-2xl shadow-[#0F6236]/30 border border-emerald-500/20">
        <img src={fishDecor} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover opacity-15" />
        <div className="relative z-10">
          <div className="text-[23px] font-extrabold leading-tight tracking-tight">
            {pondsCount > 0 ? `${pondsCount} Active Ponds Monitored` : "Farm Profile Ready"}
          </div>

          <div className="mt-1 text-[13px] text-emerald-100 font-medium leading-relaxed">
            {pondsCount > 0 ? `Total Stock: ${totalFish.toLocaleString()} Fish • AI Doctor Synced` : "Measure your pond with camera scanner to sync metrics"}
          </div>

          <div className="mt-4 flex gap-2.5">
            <Link to="/my-farm" className="px-4 py-2.5 rounded-2xl bg-white text-[#0F6236] hover:bg-emerald-50 font-extrabold text-xs shadow-lg shadow-black/20 flex items-center gap-2 transition-all active:scale-95">
              <Camera className="w-4 h-4 text-[#0F6236]" /> AR Camera Measure
            </Link>
            <Link to="/ai-doctor" className="px-4 py-2.5 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-white font-extrabold text-xs backdrop-blur-md border border-white/20 flex items-center gap-1.5 transition-all">
              <Stethoscope className="w-3.5 h-3.5 text-emerald-300" /> Diagnose Fish
            </Link>
          </div>
        </div>
      </section>

      {/* Location-Based Weather & Rain Advisory Card */}
      <section className={`mx-5 mt-3 p-4 rounded-3xl text-white border shadow-lg relative overflow-hidden transition-all ${
        liveWeather.isRaining
          ? "bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 border-blue-400/40 shadow-blue-950/50 animate-pulse"
          : "bg-gradient-to-r from-blue-950 via-[#0A324D] to-[#082338] border-blue-400/20"
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
              <CloudRain className={`w-5.5 h-5.5 ${liveWeather.isRaining ? "text-sky-200 animate-bounce" : "text-sky-300"}`} />
            </div>
            <div>
              <div className="text-[10.5px] font-extrabold text-sky-300 uppercase tracking-wider">
                Weather & Feeding Advisory
              </div>
              <div className="text-sm font-extrabold text-white mt-0.5">
                {userLocation || "Ghana"} • {liveWeather.description}
              </div>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
            liveWeather.isRaining
              ? "bg-red-500 text-white animate-pulse shadow-md"
              : "bg-sky-500/20 border border-sky-400/30 text-sky-200"
          }`}>
            {liveWeather.isRaining ? "🌧️ Rain Alert" : "Live Weather"}
          </span>
        </div>

        <div className="mt-2.5 p-3 rounded-2xl bg-white/10 text-xs font-medium text-sky-100 border border-white/10 leading-relaxed">
          {liveWeather.adviceText}
        </div>
      </section>

      {/* Dynamic Farm Stats Cards */}
      <section className="px-5 mt-4 grid grid-cols-2 gap-3">
        <StatCard tint="bg-white" img={iconFeedSack} label="Daily Feed Estimate" value={totalFish > 0 ? `${(totalFish * 0.03 * 0.05).toFixed(1)} kg` : "0.0 kg"} sub="AI Calculated" />
        <StatCard tint="bg-white" img={iconGrowth} label="Active Ponds" value={`${pondsCount} Ponds`} sub="In Production" />
        <StatCard tint="bg-white" img={iconCalendar} label="Total Fish Stock" value={`${totalFish.toLocaleString()} Fish`} sub="Live Count" />
        <StatCard tint="bg-white" img={iconAiDoctor} label="AI Doctor Status" value="Online" sub="AI Vision Ready" />
      </section>

      {/* Daily Voice Advisory Card */}
      <section className="mx-5 mt-4 rounded-3xl bg-gradient-to-r from-[#0F6236] via-[#12723F] to-[#0A4827] p-4.5 text-white shadow-xl shadow-[#0F6236]/25 relative overflow-hidden border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-white/15 rounded-xl backdrop-blur-md">
              <CloudRain className="w-4 h-4 text-yellow-300 animate-bounce" />
            </span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-200">
              Live Weather & Advisory
            </span>
          </div>
          <span className="text-[10px] font-extrabold bg-amber-400 text-gray-950 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
            <Zap className="w-3 h-3 fill-gray-950" /> Weather Sync
          </span>
        </div>

        <div className="mt-3">
          <h3 className="text-sm font-extrabold leading-tight text-white">
            🌊 {weatherAlert.summary}
          </h3>
          <p className="text-[11.5px] text-emerald-100 mt-1 leading-normal font-medium">
            Tap below to listen to Fish Doctor AI voice advisory in {language}.
          </p>
        </div>

        {/* Voice Play Button */}
        <div className="mt-3.5 flex items-center justify-between pt-3 border-t border-white/15">
          <div className="flex items-center gap-1.5">
            {audioStatusText && (
              <span className="text-[10.5px] font-bold text-yellow-300 animate-pulse truncate max-w-[150px]">
                {audioStatusText}
              </span>
            )}
          </div>

          <button
            onClick={handlePlayDailyVoiceAdvice}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
              isPlayingAudio
                ? "bg-amber-400 text-gray-950"
                : "bg-white text-[#0F6236] hover:bg-emerald-50"
            }`}
          >
            {isPlayingAudio ? (
              <>
                <Volume2 className="w-4 h-4 animate-spin" /> Stop Voice
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-[#0F6236]" /> Listen Voice ({language})
              </>
            )}
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-5 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[17px] font-extrabold text-gray-900 tracking-tight">Farm Applications</h2>
          <Link to="/settings" className="text-[#0F6236] font-extrabold text-xs hover:underline flex items-center gap-0.5">
            Settings <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map(({ img, label, tint, to }) => {
            const inner = (
              <>
                <div className={`w-full aspect-square rounded-2xl border border-[#0F6236]/15 flex items-center justify-center ${tint} shadow-xs hover:scale-105 transition-all duration-300`}>
                  <img src={img} alt="" loading="lazy" className="w-9 h-9 object-contain" />
                </div>
                <div className="text-[11px] font-extrabold text-center mt-1.5 text-gray-900 leading-tight">{label}</div>
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

      {/* Community Feed Group Buy Card */}
      <section className="mx-5 mt-5 mb-6 rounded-3xl bg-gradient-to-br from-[#0F6236]/15 via-[#0F6236]/10 to-emerald-50 p-5 relative overflow-hidden border border-[#0F6236]/25 shadow-md">
        <div className="max-w-[62%]">
          <div className="text-[16px] font-extrabold text-gray-900 leading-tight">Community Feed Buy</div>
          <div className="text-[#0F6236] font-extrabold text-xs mt-1">Save up to 15% on Raanan & Aller Aqua</div>
          <div className="text-[11.5px] text-gray-600 mt-1 font-medium leading-relaxed">Order high quality feeds at wholesale market rates with direct delivery.</div>
          <Link to="/market" className="mt-3.5 inline-flex items-center gap-1 bg-[#0F6236] hover:bg-[#0B4A28] text-white font-extrabold rounded-2xl px-4 py-2.5 text-[12px] shadow-md shadow-[#0F6236]/25 cursor-pointer transition-all active:scale-95">
            Join Group Buy <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <img src={feedSacks} alt="Feed sacks" loading="lazy" className="absolute right-0 bottom-0 w-34 h-34 object-cover rounded-tl-3xl shadow-lg border-t border-l border-white/50" />
      </section>

      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} />
      <BottomNav />
    </PhoneFrame>
  );
}

function StatCard({ tint, img, label, value, sub }: { tint: string; img: string; label: string; value: string; sub: string }) {
  return (
    <div className="emerald-card rounded-2xl p-3.5 flex items-center gap-3">
      <div className="w-11 h-11 rounded-2xl bg-[#0F6236]/10 border border-[#0F6236]/20 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
        <img src={img} alt="" loading="lazy" className="w-8 h-8 object-contain" />
      </div>
      <div className="min-w-0">
        <div className="text-[10.5px] text-gray-500 font-semibold">{label}</div>
        <div className="text-[14px] font-extrabold text-gray-900 leading-tight">{value}</div>
        <div className="text-[10px] text-[#0F6236] font-extrabold">{sub}</div>
      </div>
    </div>
  );
}
