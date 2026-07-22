import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Lock, Eye, EyeOff, ChevronDown } from "lucide-react";
import { useState } from "react";
import { GhanaFlag } from "@/components/ui/GhanaFlag";
import { GoogleLogo } from "@/components/ui/GoogleLogo";
import { FishFarmLogo } from "@/components/ui/FishFarmLogo";
import { WavyFishBackground } from "@/components/ui/WavyFishBackground";
import { useLanguage } from "@/lib/languageContext";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Log In — FishFarm OS Ghana" },
      { name: "description", content: "Log in to continue your fish farming journey." },
    ],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone) {
      localStorage.setItem("user_phone", `+233 ${phone}`);
    }

    const isOnboardingComplete = localStorage.getItem("user_onboarding_completed");
    if (isOnboardingComplete === "true") {
      navigate({ to: "/home" });
    } else {
      navigate({ to: "/onboarding" });
    }
  };

  const handleGoogleLogin = () => {
    const isOnboardingComplete = localStorage.getItem("user_onboarding_completed");
    if (isOnboardingComplete === "true") {
      navigate({ to: "/home" });
    } else {
      navigate({ to: "/onboarding" });
    }
  };

  return (
    <div className="min-h-screen bg-[#EAEFEA] flex justify-center items-center font-sans antialiased sm:py-4">
      <main className="w-full max-w-[430px] min-h-screen sm:min-h-[820px] bg-[#FAFCFA] relative flex flex-col justify-between overflow-hidden shadow-2xl sm:rounded-[36px] sm:border sm:border-gray-200">
        
        {/* Content Container - Compact & Elevated */}
        <div className="px-6 pt-6 pb-28 z-10 flex flex-col flex-1 justify-start">
          
          {/* Logo Section */}
          <div className="flex justify-center mt-2 mb-3">
            <FishFarmLogo className="w-16 h-16" />
          </div>

          {/* Heading */}
          <div className="text-center mb-5">
            <h1 className="text-[24px] font-bold text-gray-900 tracking-tight">
              {t("welcomeBack")}
            </h1>
            <p className="mt-1 text-[14px] text-gray-500 leading-snug font-normal">
              {t("loginSubtitle")}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            
            {/* Phone Field */}
            <div>
              <label className="block text-[13.5px] font-bold text-gray-900 mb-1">
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
                  placeholder="Enter your phone number"
                  className="flex-1 bg-transparent pl-3 text-[14.5px] text-gray-900 placeholder:text-gray-400 outline-none font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[13.5px] font-bold text-gray-900 mb-1">
                {t("password")}
              </label>
              <div className="relative flex items-center h-13 bg-white border border-gray-200 rounded-[16px] px-3.5 shadow-xs focus-within:border-[#0F6236] focus-within:ring-2 focus-within:ring-[#0F6236]/20 transition-all">
                <Lock className="w-4.5 h-4.5 text-gray-400 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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

            {/* Footer Sign Up Link */}
            <p className="text-center text-[13.5px] text-gray-500 font-medium mt-3">
              {t("noAccount")}{" "}
              <Link to="/signup" className="text-[#0F6236] font-bold hover:underline">
                {t("signup")}
              </Link>
            </p>
          </form>
        </div>

        <WavyFishBackground />
      </main>
    </div>
  );
}
