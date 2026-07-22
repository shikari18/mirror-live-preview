import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Settings, Camera, Award, Waves, Fish, TrendingUp, Calendar, User, ShieldCheck, HelpCircle, LogOut, ChevronRight, MapPin, Globe } from "lucide-react";
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

  useEffect(() => {
    const savedName = localStorage.getItem("user_name");
    if (savedName) setUserName(savedName);
    const savedPhone = localStorage.getItem("user_phone");
    if (savedPhone) setUserPhone(savedPhone);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_phone");
    navigate({ to: "/login" });
  };

  return (
    <PhoneFrame>
      <header className="px-5 pt-6 flex items-center justify-between">
        <h1 className="text-[26px] font-extrabold text-foreground">{t("profile")}</h1>
        <Link to="/settings" className="p-2 text-gray-700 hover:text-[#0F6236] rounded-full hover:bg-gray-100">
          <Settings className="w-6 h-6" />
        </Link>
      </header>

      {/* Profile Card */}
      <section className="mx-5 mt-4 rounded-2xl bg-[#0F6236] text-white p-5 relative overflow-hidden shadow-lg shadow-[#0F6236]/20">
        <img src={fishDecor} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="relative flex items-center gap-4">
          <div className="relative shrink-0">
            <img src={farmerImg} alt={userName} className="w-20 h-20 rounded-full object-cover border-4 border-white/30" />
            <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-xs">
              <Camera className="w-3.5 h-3.5 text-[#0F6236]" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[19px] font-extrabold truncate">{userName}</div>
            <div className="text-[13px] opacity-90">{userPhone}</div>
            <div className="flex items-center gap-1 text-[12px] opacity-90 mt-0.5">
              <MapPin className="w-3.5 h-3.5" /> Ashanti Region, Ghana
            </div>
            <div className="mt-2 inline-flex items-center gap-1 bg-white/20 text-white font-bold text-[11px] rounded-full px-2.5 py-0.5">
              <Award className="w-3.5 h-3.5 text-yellow-300" /> Certified Farmer
            </div>
          </div>
        </div>
      </section>

      {/* Farm Overview Stats */}
      <section className="mx-5 mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-xs">
        <div className="text-[14px] font-extrabold text-gray-900">Farm Overview</div>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center">
          {[
            { Icon: Waves, value: "4", label: "Ponds" },
            { Icon: Fish, value: "3,250", label: "Total Fish" },
            { Icon: TrendingUp, value: "14%", label: "Avg. Growth" },
            { Icon: Calendar, value: "21 Days", label: "To Harvest" },
          ].map(({ Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-[#0F6236]/10 flex items-center justify-center text-[#0F6236]">
                <Icon className="w-4.5 h-4.5" />
              </div>
              <div className="text-[15px] font-extrabold text-gray-900 mt-1">{value}</div>
              <div className="text-[10.5px] text-gray-500 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Navigation List */}
      <section className="mx-5 mt-4 mb-6 rounded-2xl border border-gray-200 bg-white divide-y divide-gray-100 shadow-xs">
        <Link to="/settings" className="w-full flex items-center gap-3.5 p-4 text-left hover:bg-gray-50 transition-all">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="text-[14px] font-bold text-gray-900">{t("chooseLanguage")} & Settings</div>
            <div className="text-[12px] text-gray-500">Current: {language} • App Preferences</div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </Link>

        <button onClick={() => navigate({ to: "/onboarding" })} className="w-full flex items-center gap-3.5 p-4 text-left hover:bg-gray-50 transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0F6236] flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="text-[14px] font-bold text-gray-900">Re-run Farm Setup Questionnaire</div>
            <div className="text-[12px] text-gray-500">Update fish type & goals</div>
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
