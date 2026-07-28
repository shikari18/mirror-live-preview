import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Lock, Eye, EyeOff, ChevronDown, Globe, Info, X, Check } from "lucide-react";
import { useState } from "react";
import { GhanaFlag } from "@/components/ui/GhanaFlag";
import { GoogleLogo } from "@/components/ui/GoogleLogo";
import { FishFarmLogo } from "@/components/ui/FishFarmLogo";
import { LanguageModal } from "@/components/ui/LanguageModal";
import { useLanguage } from "@/lib/languageContext";
import { getFarmProfile } from "@/lib/farmMemory";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Log In — Fish Doctor App" },
      { name: "description", content: "Log in to your Fish Doctor account." },
    ],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isGoogleInfoOpen, setIsGoogleInfoOpen] = useState(false);

  const checkRedirect = () => {
    const profile = getFarmProfile();
    const hasPonds = profile.ponds && profile.ponds.length > 0;
    const isOnboardingComplete = localStorage.getItem("user_onboarding_completed");
    if (isOnboardingComplete === "true" && hasPonds) {
      navigate({ to: "/home" });
    } else {
      navigate({ to: "/onboarding" });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone) {
      localStorage.setItem("user_phone", `+233 ${phone}`);
    }
    checkRedirect();
  };

  const handleGoogleLogin = () => {
    localStorage.setItem("user_google_signed_in", "true");
    checkRedirect();
  };

  return (
    <div className="min-h-screen bg-[#E0F2FE] flex justify-center items-center font-sans antialiased sm:py-4">
      <main className="w-full max-w-[430px] min-h-screen sm:min-h-[820px] bg-[#F0F9FF] relative flex flex-col justify-between overflow-hidden shadow-2xl sm:rounded-[36px] sm:border sm:border-blue-200">
        
        {/* Top Header: Language & Google Credentials Info Buttons */}
        <div className="px-5 pt-5 z-20 flex items-center justify-between">
          <button
            onClick={() => setIsLangOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-sky-200 text-xs font-bold text-[#0284C7] shadow-xs cursor-pointer hover:bg-sky-50"
          >
            <Globe className="w-3.5 h-3.5" /> Language: {language}
          </button>

          <button
            onClick={() => setIsGoogleInfoOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0284C7]/10 text-xs font-bold text-[#0284C7] cursor-pointer hover:bg-[#0284C7]/20"
          >
            <Info className="w-3.5 h-3.5" /> Google Auth Info
          </button>
        </div>

        {/* Content Container */}
        <div className="px-6 pt-4 pb-24 z-10 flex flex-col flex-1 justify-start">
          
          {/* Logo */}
          <div className="flex justify-center mt-2 mb-3">
            <FishFarmLogo className="w-16 h-16 text-[#0284C7]" />
          </div>

          {/* Heading */}
          <div className="text-center mb-5">
            <h1 className="text-[24px] font-bold text-slate-900 tracking-tight">
              {t("welcomeBack")}
            </h1>
            <p className="mt-1 text-[13.5px] text-slate-500 font-medium">
              Log in to manage your fish farm & AI Doctor assessments.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            
            {/* Phone Field */}
            <div>
              <label className="block text-[13px] font-bold text-slate-900 mb-1">
                {t("phoneNumber")}
              </label>
              <div className="flex items-center h-13 bg-white border border-slate-200 rounded-[16px] px-3.5 shadow-xs focus-within:border-[#0284C7] focus-within:ring-2 focus-within:ring-[#0284C7]/20 transition-all">
                <div className="flex items-center gap-1.5 pr-2.5 border-r border-slate-200 cursor-pointer select-none">
                  <GhanaFlag className="w-5.5 h-3.5" />
                  <span className="font-bold text-slate-900 text-[14.5px]">+233</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="flex-1 bg-transparent pl-3 text-[14.5px] text-slate-900 placeholder:text-slate-400 outline-none font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[13px] font-bold text-slate-900 mb-1">
                {t("password")}
              </label>
              <div className="relative flex items-center h-13 bg-white border border-slate-200 rounded-[16px] px-3.5 shadow-xs focus-within:border-[#0284C7] focus-within:ring-2 focus-within:ring-[#0284C7]/20 transition-all">
                <Lock className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="flex-1 bg-transparent pl-3 pr-2 text-[14.5px] text-slate-900 placeholder:text-slate-400 outline-none font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full h-13 bg-[#0284C7] hover:bg-sky-600 active:scale-[0.98] transition-all text-white text-[16px] font-bold rounded-[16px] shadow-md shadow-[#0284C7]/20 flex items-center justify-center mt-1 cursor-pointer"
            >
              {t("login")}
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-1.5">
              <div className="absolute inset-x-0 h-[1px] bg-slate-200" />
              <span className="relative bg-[#F0F9FF] px-3 text-[12.5px] font-semibold text-slate-400">
                or
              </span>
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full h-13 bg-white border border-slate-200 hover:bg-slate-50 active:scale-[0.98] transition-all text-slate-900 text-[15.5px] font-bold rounded-[16px] shadow-xs flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <GoogleLogo className="w-4.5 h-4.5" />
              {t("continueGoogle")}
            </button>

            {/* Footer Link */}
            <p className="text-center text-[13.5px] text-slate-500 font-medium mt-3">
              {t("noAccount")}{" "}
              <Link to="/signup" className="text-[#0284C7] font-bold hover:underline">
                {t("signUp")}
              </Link>
            </p>
          </form>
        </div>

        {/* Modals */}
        <LanguageModal isOpen={isLangOpen} onClose={() => setIsLangOpen(false)} />

        {/* Google OAuth Credentials Instructions Modal */}
        {isGoogleInfoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-sky-100 relative space-y-3">
              <button
                onClick={() => setIsGoogleInfoOpen(false)}
                className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                🔑 Google OAuth 2.0 Credentials Info
              </h3>
              <p className="text-xs text-slate-600">
                To complete real Google Authentication in Google Cloud Console:
              </p>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-extrabold text-[#0284C7] block mb-1">Authorised JavaScript origins:</span>
                  <code className="text-[11px] block text-slate-800 space-y-0.5">
                    <div>http://localhost:5173</div>
                    <div>http://localhost:3000</div>
                    <div>http://127.0.0.1:5173</div>
                    <div>https://&lt;your-render-app-name&gt;.onrender.com</div>
                  </code>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-extrabold text-[#0284C7] block mb-1">Authorised redirect URIs:</span>
                  <code className="text-[11px] block text-slate-800 space-y-0.5">
                    <div>http://localhost:5173</div>
                    <div>http://localhost:5173/login</div>
                    <div>https://&lt;your-render-app-name&gt;.onrender.com</div>
                    <div>https://&lt;your-render-app-name&gt;.onrender.com/login</div>
                  </code>
                </div>
              </div>

              <button
                onClick={() => setIsGoogleInfoOpen(false)}
                className="w-full h-11 bg-[#0284C7] text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
