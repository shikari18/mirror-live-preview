import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Globe, Cpu, Volume2, Wifi, LogOut, ChevronRight, MapPin, ShieldAlert } from "lucide-react";
import { useLanguage } from "@/lib/languageContext";
import { LanguageModal } from "@/components/ui/LanguageModal";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({
    meta: [
      { title: "Settings — Fish Doctor App" },
      { name: "description", content: "Manage app preferences and language options." },
    ],
  }),
});

export function SettingsPage() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  const [userName, setUserName] = useState("Farmer Kofi");
  const [region] = useState("Accra & Ashanti Region, Ghana");
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  useEffect(() => {
    const savedName = localStorage.getItem("user_name");
    if (savedName) setUserName(savedName);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user_logged_in");
    localStorage.removeItem("user_onboarding_completed");
    localStorage.removeItem("user_welcome_seen");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_farm_name");
    localStorage.removeItem("user_phone");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_google_signed_in");
    localStorage.removeItem("user_profile_image");
    localStorage.removeItem("fish_doctor_unified_farm_memory_v2");
    
    // Redirect cleanly to login screen
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-[#EAEFEA] flex justify-center items-center font-sans antialiased sm:py-4">
      <main className="w-full max-w-[430px] min-h-screen sm:min-h-[820px] bg-[#FAFCFA] relative flex flex-col justify-between overflow-hidden shadow-2xl sm:rounded-[36px] sm:border sm:border-gray-200 pb-10">
        
        {/* Header */}
        <header className="px-5 pt-6 pb-4 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Link to="/home" className="p-1 text-gray-700 hover:text-gray-900 rounded-full hover:bg-gray-100">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-xl font-extrabold text-gray-900">{t("settings")}</h1>
          </div>
        </header>

        {/* Settings Options */}
        <div className="p-5 space-y-6 flex-1 overflow-y-auto">
          
          {/* User Profile Card */}
          <section className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#0F6236] text-white flex items-center justify-center font-bold text-lg">
                {userName.charAt(0)}
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-base">{userName}</h2>
                <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#0F6236]" />
                  {region}
                </div>
              </div>
            </div>
            <Link to="/profile" className="text-xs font-bold text-[#0F6236] hover:underline">
              Edit
            </Link>
          </section>

          {/* AI Status Banner */}
          <section className="bg-[#0F6236]/10 p-4 rounded-2xl border border-[#0F6236]/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0F6236] text-white flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#0F6236] uppercase tracking-wider">Fish Doctor AI Engine</div>
                <div className="text-sm font-extrabold text-gray-900">Unified Farm Memory Synced</div>
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </section>

          {/* General Preferences */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">App Preferences</h3>
            
            {/* Language Selector */}
            <button
              onClick={() => setIsLangModalOpen(true)}
              className="w-full bg-white p-4 rounded-2xl border border-gray-200 flex items-center justify-between hover:bg-gray-50 transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#0F6236]/10 text-[#0F6236] flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">{t("chooseLanguage")}</div>
                  <div className="text-xs text-gray-500">Active: {language} (Audio translation active)</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            {/* Admin Console Link */}
            <Link
              to="/admin"
              className="w-full bg-[#0F6236]/10 p-4 rounded-2xl border border-[#0F6236]/20 flex items-center justify-between hover:bg-[#0F6236]/15 transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#0F6236] text-white flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-gray-900">Admin Console</div>
                  <div className="text-xs text-[#0F6236] font-bold">View Accounts Database & System Keys</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#0F6236]" />
            </Link>

            {/* Voice Readout Toggle */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#0F6236]/10 text-[#0F6236] flex items-center justify-center">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">Voice Audio Output</div>
                  <div className="text-xs text-gray-500">Read AI advice in selected language audio</div>
                </div>
              </div>
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`w-12 h-6.5 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  voiceEnabled ? "bg-[#0F6236]" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    voiceEnabled ? "translate-x-5.5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </section>

          {/* Logout Button */}
          <section className="pt-2">
            <button
              onClick={handleLogout}
              className="w-full h-12 bg-white border border-red-200 text-red-600 font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 hover:bg-red-50 cursor-pointer shadow-xs active:scale-95 transition-all"
            >
              <LogOut className="w-4.5 h-4.5" />
              Log Out
            </button>
          </section>
        </div>

        <LanguageModal isOpen={isLangModalOpen} onClose={() => setIsLangModalOpen(false)} />
      </main>
    </div>
  );
}
