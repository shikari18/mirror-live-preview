import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Globe, Cpu, Volume2, Wifi, LogOut, ChevronRight, MapPin } from "lucide-react";
import { useLanguage } from "@/lib/languageContext";
import { LanguageModal } from "@/components/ui/LanguageModal";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({
    meta: [
      { title: "Settings — FishFarm OS Ghana" },
      { name: "description", content: "Manage your app preferences and farm setup." },
    ],
  }),
});

export function SettingsPage() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  const [userName, setUserName] = useState("Farmer Kofi");
  const [region] = useState("Ashanti Region, Ghana");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [offlineSync, setOfflineSync] = useState(true);

  useEffect(() => {
    const savedName = localStorage.getItem("user_name");
    if (savedName) setUserName(savedName);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_phone");
    localStorage.removeItem("user_ponds");
    navigate({ to: "/login" });
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
          <section className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
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
                <div className="text-xs font-bold text-[#0F6236] uppercase tracking-wider">AI Intelligence</div>
                <div className="text-sm font-extrabold text-gray-900">Smart AI Engine Connected</div>
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
              className="w-full bg-white p-4 rounded-2xl border border-gray-200/80 flex items-center justify-between hover:bg-gray-50 transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">Language / Kasa</div>
                  <div className="text-xs text-gray-500">{language}</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            {/* Voice Assistant Toggle */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">Voice Assistant Response</div>
                  <div className="text-xs text-gray-500">Read AI answers aloud in local accent</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={voiceEnabled}
                onChange={(e) => setVoiceEnabled(e.target.checked)}
                className="w-5 h-5 accent-[#0F6236] cursor-pointer"
              />
            </div>

            {/* Offline Mode Toggle */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Wifi className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">Offline Data Sync</div>
                  <div className="text-xs text-gray-500">Cache feed & water logs for offline use</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={offlineSync}
                onChange={(e) => setOfflineSync(e.target.checked)}
                className="w-5 h-5 accent-[#0F6236] cursor-pointer"
              />
            </div>
          </section>

          {/* Account Actions */}
          <section className="pt-4">
            <button
              onClick={handleLogout}
              className="w-full p-4 rounded-2xl border border-red-200 bg-red-50 text-red-700 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-100 transition-all cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              Log Out
            </button>
          </section>
        </div>

        {/* Language Selection Modal */}
        <LanguageModal
          isOpen={isLangModalOpen}
          onClose={() => setIsLangModalOpen(false)}
        />
      </main>
    </div>
  );
}
