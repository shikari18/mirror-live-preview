import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { User, Lock, Eye, EyeOff, ChevronDown } from "lucide-react";
import { useState } from "react";
import { GhanaFlag } from "@/components/ui/GhanaFlag";
import { GoogleLogo } from "@/components/ui/GoogleLogo";
import { FishFarmLogo } from "@/components/ui/FishFarmLogo";
import { WavyFishBackground } from "@/components/ui/WavyFishBackground";
import { useLanguage } from "@/lib/languageContext";

export const Route = createFileRoute("/signup")({
  component: SignUpPage,
  head: () => ({
    meta: [
      { title: "Sign Up — FishFarm OS Ghana" },
      { name: "description", content: "Create an account to start your fish farming journey." },
    ],
  }),
});

function SignUpPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save user info to localStorage
    if (fullName) {
      localStorage.setItem("user_name", fullName);
    }
    if (phone) {
      localStorage.setItem("user_phone", phone);
    }
    // Navigate to Onboarding
    navigate({ to: "/onboarding" });
  };

  return (
    <div className="min-h-screen bg-[#EAEFEA] flex justify-center items-center font-sans antialiased sm:py-4">
      <main className="w-full max-w-[430px] min-h-screen sm:min-h-[860px] bg-[#FAFCFA] relative flex flex-col justify-between overflow-hidden shadow-2xl sm:rounded-[36px] sm:border sm:border-gray-200">
        
        {/* Content Container - Compact & Elevated */}
        <div className="px-6 pt-5 pb-28 z-10 flex flex-col flex-1 justify-start">
          
          {/* Logo Section */}
          <div className="flex justify-center mt-1 mb-2">
            <FishFarmLogo className="w-14 h-14" />
          </div>

          {/* Heading */}
          <div className="text-center mb-4">
            <h1 className="text-[24px] font-bold text-gray-900 tracking-tight">
              {t("createAccount")}
            </h1>
            <p className="mt-0.5 text-[13.5px] text-gray-500 leading-snug font-normal">
              {t("signupSubtitle")}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
            
            {/* Full Name Field */}
            <div>
              <label className="block text-[13px] font-bold text-gray-900 mb-1">
                Full Name
              </label>
              <div className="relative flex items-center h-12 bg-white border border-gray-200 rounded-[15px] px-3 shadow-xs focus-within:border-[#0F6236] focus-within:ring-2 focus-within:ring-[#0F6236]/20 transition-all">
                <User className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="flex-1 bg-transparent pl-2.5 text-[14px] text-gray-900 placeholder:text-gray-400 outline-none font-medium"
                />
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-[13px] font-bold text-gray-900 mb-1">
                {t("phoneNumber")}
              </label>
              <div className="flex items-center h-12 bg-white border border-gray-200 rounded-[15px] px-3 shadow-xs focus-within:border-[#0F6236] focus-within:ring-2 focus-within:ring-[#0F6236]/20 transition-all">
                <div className="flex items-center gap-1.5 pr-2 border-r border-gray-200 cursor-pointer select-none">
                  <GhanaFlag className="w-5 h-3.5" />
                  <span className="font-bold text-gray-900 text-[14px]">+233</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="flex-1 bg-transparent pl-2.5 text-[14px] text-gray-900 placeholder:text-gray-400 outline-none font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[13px] font-bold text-gray-900 mb-1">
                {t("password")}
              </label>
              <div className="relative flex items-center h-12 bg-white border border-gray-200 rounded-[15px] px-3 shadow-xs focus-within:border-[#0F6236] focus-within:ring-2 focus-within:ring-[#0F6236]/20 transition-all">
                <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="flex-1 bg-transparent pl-2.5 pr-2 text-[14px] text-gray-900 placeholder:text-gray-400 outline-none font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-[13px] font-bold text-gray-900 mb-1">
                Confirm Password
              </label>
              <div className="relative flex items-center h-12 bg-white border border-gray-200 rounded-[15px] px-3 shadow-xs focus-within:border-[#0F6236] focus-within:ring-2 focus-within:ring-[#0F6236]/20 transition-all">
                <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="flex-1 bg-transparent pl-2.5 pr-2 text-[14px] text-gray-900 placeholder:text-gray-400 outline-none font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full h-12 bg-[#0F6236] hover:bg-[#0B502B] active:scale-[0.98] transition-all text-white text-[15.5px] font-bold rounded-[15px] shadow-md shadow-[#0F6236]/20 flex items-center justify-center mt-1 cursor-pointer"
            >
              {t("signup")}
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-1">
              <div className="absolute inset-x-0 h-[1px] bg-gray-200" />
              <span className="relative bg-[#FAFCFA] px-3 text-[12px] font-semibold text-gray-400">
                or
              </span>
            </div>

            {/* Google Sign Up Button */}
            <button
              type="button"
              onClick={() => navigate({ to: "/onboarding" })}
              className="w-full h-12 bg-white border border-gray-200 hover:bg-gray-50 active:scale-[0.98] transition-all text-gray-900 text-[15px] font-bold rounded-[15px] shadow-xs flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <GoogleLogo className="w-4 h-4" />
              {t("continueGoogle")}
            </button>

            {/* Footer Log In Link */}
            <p className="text-center text-[13px] text-gray-500 font-medium mt-2">
              {t("alreadyAccount")}{" "}
              <Link to="/login" className="text-[#0F6236] font-bold hover:underline">
                {t("login")}
              </Link>
            </p>
          </form>
        </div>

        {/* Wavy Fish Background Decor */}
        <WavyFishBackground />
      </main>
    </div>
  );
}
