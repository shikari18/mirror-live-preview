import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Settings, Camera, Award, Waves, Fish, TrendingUp, Calendar, User, ShieldCheck, HelpCircle, LogOut, ChevronRight, MapPin, Globe, Plus } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import fishDecor from "@/assets/fish-decor.jpg";
import { useLanguage } from "@/lib/languageContext";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({
    meta: [
      { title: "Profile — FishFarm OS Ghana" },
      { name: "description", content: "Manage your account, farm settings and preferences." },
    ],
  }),
});

export function ProfilePage() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [userName, setUserName] = useState("Farmer Kofi");
  const [userPhone, setUserPhone] = useState("+233 24 123 4567");
  const [pondCount, setPondCount] = useState<number>(0);
  const [totalFish, setTotalFish] = useState<number>(0);

  useEffect(() => {
    const savedName = localStorage.getItem("user_name");
    if (savedName) setUserName(savedName);
    const savedPhone = localStorage.getItem("user_phone");
    if (savedPhone) setUserPhone(savedPhone);

    const savedPonds = localStorage.getItem("user_ponds");
    if (savedPonds) {
      const parsed = JSON.parse(savedPonds);
      if (Array.isArray(parsed)) {
        setPondCount(parsed.length);
        setTotalFish(parsed.reduce((sum, p) => sum + (p.count || 0), 0));
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_phone");
    localStorage.removeItem("user_ponds");
    navigate({ to: "/login" });
  };

  return (
    <PhoneFrame>
      {/* Header */}
      <header className="px-5 pt-6 flex items-center justify-between border-b border-gray-100 bg-white pb-3">
        <h1 className="text-[24px] font-extrabold text-gray-900">{t("profile")}</h1>
        <Link to="/settings" className="p-2 text-gray-700 hover:text-[#0F6236] rounded-full hover:bg-gray-100 transition-all">
          <Settings className="w-6 h-6" />
        </Link>
      </header>

      {/* Main Profile Card */}
      <section className="mx-5 mt-4 rounded-3xl bg-[#0F6236] text-white p-5 relative overflow-hidden shadow-lg shadow-[#0F6236]/20">
        <img src={fishDecor} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="relative flex items-center gap-4">
          <div className="relative shrink-0">
            <img src={farmerImg} alt={userName} className="w-20 h-20 rounded-full object-cover border-4 border-white/30 shadow-md" />
            <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-xs">
              <Camera className="w-3.5 h-3.5 text-[#0F6236]" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[20px] font-extrabold truncate leading-tight">{userName}</h2>
            <div className="text-[13px] opacity-90">{userPhone}</div>
            <div className="flex items-center gap-1 text-[12px] opacity-90 mt-0.5">
              <MapPin className="w-3.5 h-3.5" /> Ashanti Region, Ghana
            </div>
            <div className="mt-2 inline-flex items-center gap-1 bg-white/20 text-white font-bold text-[11px] rounded-full px-2.5 py-0.5">
              <Award className="w-3.5 h-3.5 text-yellow-300" /> Ghana Verified Farmer
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Farm Overview */}
      <section className="mx-5 mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-extrabold text-gray-900">Your Farm Metrics</h3>
          <Link to="/my-farm" className="text-xs font-bold text-[#0F6236] hover:underline flex items-center gap-0.5">
            Manage Ponds <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#0F6236]/10 text-[#0F6236] flex items-center justify-center">
              <Waves className="w-5 h-5" />
            </div>
            <div className="text-[15px] font-extrabold text-gray-900 mt-1">{pondCount}</div>
            <div className="text-[10.5px] text-gray-500 font-medium">Ponds</div>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Fish className="w-5 h-5" />
            </div>
            <div className="text-[15px] font-extrabold text-gray-900 mt-1">{totalFish.toLocaleString()}</div>
            <div className="text-[10.5px] text-gray-500 font-medium">Total Fish</div>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-[15px] font-extrabold text-gray-900 mt-1">{pondCount > 0 ? "Good" : "Setup"}</div>
            <div className="text-[10.5px] text-gray-500 font-medium">Growth</div>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="text-[15px] font-extrabold text-gray-900 mt-1">{pondCount > 0 ? "Active" : "None"}</div>
            <div className="text-[10.5px] text-gray-500 font-medium">Status</div>
          </div>
        </div>
      </section>

      {/* Menu Actions */}
      <section className="mx-5 mt-4 mb-6 rounded-2xl border border-gray-200 bg-white divide-y divide-gray-100 shadow-xs">
        <Link to="/my-farm" className="w-full flex items-center gap-3.5 p-4 text-left hover:bg-gray-50 transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0F6236] flex items-center justify-center shrink-0">
            <Waves className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="text-[14px] font-bold text-gray-900">Manage My Ponds & Stock</div>
            <div className="text-[12px] text-gray-500">{pondCount} ponds registered</div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </Link>

        <Link to="/settings" className="w-full flex items-center gap-3.5 p-4 text-left hover:bg-gray-50 transition-all">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="text-[14px] font-bold text-gray-900">{t("chooseLanguage")} & Settings</div>
            <div className="text-[12px] text-gray-500">Current Language: {language}</div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </Link>

        <button onClick={() => navigate({ to: "/onboarding" })} className="w-full flex items-center gap-3.5 p-4 text-left hover:bg-gray-50 transition-all">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="text-[14px] font-bold text-gray-900">Re-run Farm Setup Questionnaire</div>
            <div className="text-[12px] text-gray-500">Update farming goals & language</div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button onClick={handleLogout} className="w-full flex items-center gap-3.5 p-4 text-left hover:bg-red-50 transition-all">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <LogOut className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="text-[14px] font-bold text-red-600">Log Out</div>
            <div className="text-[12px] text-gray-500">Sign out of FishFarm OS</div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </section>

      <BottomNav />
    </PhoneFrame>
  );
}
