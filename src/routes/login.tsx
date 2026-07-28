import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Lock, Eye, EyeOff, ChevronDown, Globe, Info, X } from "lucide-react";
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

  const googleClientId = "452065425715-minmjhca07v6102q8al1ephe2l6sdvds.apps.googleusercontent.com";

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
    <div className="min-h-screen bg-[#EAEFEA] flex justify-center items-center font-sans antialiased sm:py-4">
      <main className="w-full max-w-[430px] min-h-screen sm:min-h-[820px] bg-[#FAFCFA] relative flex flex-col justify-between overflow-hidden shadow-2xl sm:rounded-[36px] sm:border sm:border-gray-200">
        
        {/* Header */}
        <div className="px-5 pt-5 z-20 flex items-center justify-between">
          <button
            onClick={() => setIsLangOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-bold text-[#0F6236] shadow-xs cursor-pointer hover:bg-gray-50"
          >
            <Globe className="w-3.5 h-3.5" /> Language: {language}
          </button>

          <button
            onClick={() => setIsGoogleInfoOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0F6236]/10 text-xs font-bold text-[#0F6236] cursor-pointer hover:bg-[#0F6236]/20"
          >
            <Info className="w-3.5 h-3.5" /> Google Auth Info
          </button>
        </div>

        {/* Content Container */}
        <div className="px-6 pt-4 pb-24 z-10 flex flex-col flex-1 justify-start">
          
          {/* Logo */}
          <div className="flex justify-center mt-2 mb-3">
            <FishFarmLogo className="w-16 h-16" />
          </div>

          {/* Heading */}
          <div className="text-center mb-5">
            <h1 className="text-[24px] font-bold text-gray-900 tracking-tight">
              {t("welcomeBack")}
            </h1>
            <p className="mt-1 text-[13.5px] text-gray-500 font-medium">
              Log in to manage your fish farm & AI Doctor assessments.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            
            {/* Phone Field */}
            <div>
              <label className="block text-[13px] font-bold text-gray-900 mb-1">
                {t("phoneNumber")}
              </label>
              <div className="flex items-center h-13 bg-white border border-gray-200 rounded-[16px] px-3.5 shadow-xs focus-within:border-[#0F6236] focus-within:ring-2 focus-within:ring-[#0F6236]/20 transition-all">
                <div className="flex items-center gap-1.5 pr-2.5 border-r border-gray-200 cursor-pointer select-none">
                  <GhanaFlag className="w-5.5 h-3.5" />
                  <span className="font-bold text-gray-900 text-[14.5px]">+233</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="flex-1 bg-transparent pl-3 text-[14.5px] text-gray-900 placeholder:text-gray-400 outline-none font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[13px] font-bold text-gray-900 mb-1">
                {t("password")}
              </label>
              <div className="relative flex items-center h-13 bg-white border border-gray-200 rounded-[16px] px-3.5 shadow-xs focus-within:border-[#0F6236] focus-within:ring-2 focus-within:ring-[#0F6236]/20 transition-all">
                <Lock className="w-4.5 h-4.5 text-gray-400 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="flex-1 bg-transparent pl-3 pr-2 text-[14.5px] text-gray-900 placeholder:text-gray-400 outline-none font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full h-13 bg-[#0F6236] hover:bg-[#0B502B] active:scale-[0.98] transition-all text-white text-[16px] font-bold rounded-[16px] shadow-md shadow-[#0F6236]/20 flex items-center justify-center mt-1 cursor-pointer"
            >
              {t("login")}
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-1.5">
              <div className="absolute inset-x-0 h-[1px] bg-gray-200" />
              <span className="relative bg-[#FAFCFA] px-3 text-[12.5px] font-semibold text-gray-400">
                or
              </span>
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full h-13 bg-white border border-gray-200 hover:bg-gray-50 active:scale-[0.98] transition-all text-gray-900 text-[15.5px] font-bold rounded-[16px] shadow-xs flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <GoogleLogo className="w-4.5 h-4.5" />
              {t("continueGoogle")}
            </button>

            {/* Footer Link */}
            <p className="text-center text-[13.5px] text-gray-500 font-medium mt-3">
              {t("noAccount")}{" "}
              <Link to="/signup" className="text-[#0F6236] font-bold hover:underline">
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
            <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-gray-100 relative space-y-3">
              <button
                onClick={() => setIsGoogleInfoOpen(false)}
                className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                🔑 Google OAuth 2.0 Client ID Active
              </h3>
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                <span className="font-extrabold text-[#0F6236] block">Client ID Configured:</span>
                <code className="text-[10px] break-all font-mono text-emerald-900">{googleClientId}</code>
              </div>

              <p className="text-xs text-gray-600">
                Render Domain: <code className="font-bold text-[#0F6236]">https://fish-t7c0.onrender.com</code>
              </p>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="font-extrabold text-[#0F6236] block mb-1">Authorised JavaScript origins:</span>
                  <code className="text-[10.5px] block text-gray-800 space-y-0.5">
                    <div>http://localhost:5173</div>
                    <div>https://fish-t7c0.onrender.com</div>
                  </code>
                </div>

                <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="font-extrabold text-[#0F6236] block mb-1">Authorised redirect URIs:</span>
                  <code className="text-[10.5px] block text-gray-800 space-y-0.5">
                    <div>http://localhost:5173/login</div>
                    <div>https://fish-t7c0.onrender.com/login</div>
                  </code>
                </div>
              </div>

              <button
                onClick={() => setIsGoogleInfoOpen(false)}
                className="w-full h-11 bg-[#0F6236] text-white font-bold text-xs rounded-xl cursor-pointer"
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
