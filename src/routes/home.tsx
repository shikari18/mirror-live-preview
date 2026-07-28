import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Settings, Bell, MapPin, Check, Volume2, Play, Sparkles, Plus, CloudRain, Zap, Camera, UserCheck, AlertCircle, Building2 } from "lucide-react";
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
  { img: iconFeedCalc, label: "Feed Calculator", tint: "bg-gray-100", to: "/feed-calculator" },
  { img: iconAiDoctor, label: "Fish Doctor AI", tint: "bg-gray-100", to: "/ai-doctor" },
  { img: iconBuyFeed, label: "Buy Supplies", tint: "bg-gray-100", to: "/market" },
  { img: iconSellFish, label: "Sell Harvest", tint: "bg-gray-100", to: "/sell-fish" },
  { img: iconMarketPrices, label: "Live Market", tint: "bg-gray-100", to: "/market" },
  { img: iconSupport, label: "Extension Support", tint: "bg-gray-100", to: "/extension-support" },
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
      {/* Location Completion Prompt if location is empty */}
      {!userLocation && (
        <div className="mx-5 mt-3 p-3 rounded-2xl bg-gray-100 border border-gray-300 text-black flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-black shrink-0" />
            <span>Almost done! Add your farm location to complete setup</span>
          </div>
          <Link to="/profile" className="px-2.5 py-1 rounded-xl bg-black text-white font-extrabold shrink-0">
            Complete
          </Link>
        </div>
      )}

      {/* Header */}
      <header className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <Link to="/settings" className="p-1.5 text-black hover:bg-gray-100 rounded-full transition-all cursor-pointer">
            <Settings className="w-5.5 h-5.5" />
          </Link>
          <div>
            <div className="text-[19px] font-extrabold text-black leading-tight">
              {userName ? `Welcome, ${userName} 👋` : "Welcome, Farmer 👋"}
            </div>
            <div className="flex items-center gap-1.5 text-black text-[12px] font-bold mt-0.5">
              <Building2 className="w-3.5 h-3.5" /> {farmName} {userLocation ? `• ${userLocation}` : ""}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/notifications" className="relative p-1 cursor-pointer">
            <Bell className="w-6 h-6 text-black" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-black border-2 border-white animate-pulse" />
          </Link>
          <Link to="/profile" className="cursor-pointer">
            <img
              src={userProfilePic || farmerImg}
              alt="User profile"
              className="w-9.5 h-9.5 rounded-full object-cover border-2 border-black"
            />
          </Link>
        </div>
      </header>

      {/* Live Farm Status Banner - Black & White Aesthetic */}
      <section className="mx-5 mt-4 rounded-2xl bg-black text-white p-4.5 relative overflow-hidden shadow-xl">
        <div className="relative z-10">
          <div className="flex items-center gap-1.5 text-[11.5px] opacity-80 font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> {farmName} Status
          </div>
          <div className="mt-1.5 text-[22px] font-extrabold leading-tight">
            {pondsCount > 0 ? `${pondsCount} Active Ponds Monitored` : "Farm Profile Ready"}
          </div>
          <div className="mt-0.5 text-[12.5px] opacity-90 font-medium">
            {pondsCount > 0 ? `Total Stock: ${totalFish.toLocaleString()} Fish • AI Doctor Synced` : "Measure your pond with camera to sync stats"}
          </div>
          <div className="mt-3.5 flex gap-2">
            <Link to="/my-farm" className="px-3.5 py-2 rounded-xl bg-white text-black font-extrabold text-xs shadow-md flex items-center gap-1.5 hover:bg-gray-100 transition-all">
              <Camera className="w-3.5 h-3.5" /> AR Camera Measure
            </Link>
          </div>
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
          <Check className="w-6 h-6 text-white" strokeWidth={3} />
        </div>
      </section>

      {/* Dynamic Farm Stats Cards */}
      <section className="px-5 mt-4 grid grid-cols-2 gap-2.5">
        <StatCard tint="bg-white" img={iconFeedSack} label="Daily Feed Estimate" value={totalFish > 0 ? `${(totalFish * 0.03 * 0.05).toFixed(1)} kg` : "0.0 kg"} sub="AI Calculated" />
        <StatCard tint="bg-white" img={iconGrowth} label="Active Ponds" value={`${pondsCount} Ponds`} sub="In Production" />
        <StatCard tint="bg-white" img={iconCalendar} label="Total Fish Stock" value={`${totalFish.toLocaleString()} Fish`} sub="Live Count" />
        <StatCard tint="bg-white" img={iconAiDoctor} label="AI Doctor Status" value="Online" sub="AI Vision Ready" />
      </section>

      {/* Daily Voice Advice Card - Black & White */}
      <section className="mx-5 mt-4 rounded-2xl bg-white border-2 border-black p-4 text-black shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-black text-white rounded-lg">
              <CloudRain className="w-4 h-4 text-white" />
            </span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-black">
              Live Weather & Farm Advisory
            </span>
          </div>
          <span className="text-[10px] font-extrabold bg-black text-white px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Zap className="w-3 h-3 fill-white" /> Weather Sync
          </span>
        </div>

        <div className="mt-2.5">
          <h3 className="text-sm font-extrabold leading-tight text-black">
            🌊 {weatherAlert.summary}
          </h3>
          <p className="text-[11.5px] text-gray-600 mt-1 leading-normal font-medium">
            Tap below to listen to Fish Doctor AI voice advisory in {language}.
          </p>
        </div>

        {/* Voice Play Button */}
        <div className="mt-3 flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center gap-1.5">
            {audioStatusText && (
              <span className="text-[10.5px] font-bold text-black animate-pulse truncate max-w-[150px]">
                {audioStatusText}
              </span>
            )}
          </div>

          <button
            onClick={handlePlayDailyVoiceAdvice}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
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

      {/* Features Grid */}
      <section className="px-5 mt-4">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-[16px] font-extrabold text-black">Farm Features</h2>
          <Link to="/settings" className="text-black font-bold text-xs hover:underline">
            Settings
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {quickActions.map(({ img, label, tint, to }) => {
            const inner = (
              <>
                <div className={`w-full aspect-square rounded-2xl border border-gray-200 flex items-center justify-center bg-white shadow-xs hover:border-black transition-all`}>
                  <img src={img} alt="" loading="lazy" className="w-8.5 h-8.5 object-contain" />
                </div>
                <div className="text-[10.5px] font-bold text-center mt-1.5 text-black leading-tight">{label}</div>
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

      {/* Community Feed Buy Card - Black & White */}
      <section className="mx-5 mt-4 mb-6 rounded-2xl bg-white p-4 relative overflow-hidden border-2 border-black shadow-md">
        <div className="max-w-[60%]">
          <div className="text-[15px] font-extrabold text-black">Community Feed Buy</div>
          <div className="text-black font-extrabold text-xs mt-0.5">Save up to 15% on Raanan & Aller Aqua</div>
          <div className="text-[11px] text-gray-600 mt-1 font-medium">Order high quality feeds at wholesale market rates</div>
          <Link to="/market" className="mt-3 inline-block bg-black text-white font-extrabold rounded-xl px-4 py-2 text-[12px] shadow-sm">
            Join Group Buy
          </Link>
        </div>
        <img src={feedSacks} alt="Feed sacks" loading="lazy" className="absolute right-0 bottom-0 w-32 h-32 object-cover rounded-tl-3xl opacity-80" />
      </section>

      <BottomNav />
    </PhoneFrame>
  );
}

function StatCard({ tint, img, label, value, sub }: { tint: string; img: string; label: string; value: string; sub: string }) {
  return (
    <div className={`bg-white rounded-2xl p-3 flex items-center gap-2.5 border border-gray-200 shadow-xs`}>
      <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
        <img src={img} alt="" loading="lazy" className="w-7.5 h-7.5 object-contain" />
      </div>
      <div className="min-w-0">
        <div className="text-[10.5px] text-gray-500 font-medium">{label}</div>
        <div className="text-[13.5px] font-extrabold text-black leading-tight">{value}</div>
        <div className="text-[10px] text-black font-extrabold">{sub}</div>
      </div>
    </div>
  );
}
