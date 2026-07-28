import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { User, Lock, Eye, EyeOff, ChevronDown, Globe, Info, X } from "lucide-react";
import { useState } from "react";
import { GhanaFlag } from "@/components/ui/GhanaFlag";
import { GoogleLogo } from "@/components/ui/GoogleLogo";
import { FishFarmLogo } from "@/components/ui/FishFarmLogo";
import { LanguageModal } from "@/components/ui/LanguageModal";
import { useLanguage } from "@/lib/languageContext";

export const Route = createFileRoute("/signup")({
  component: SignUpPage,
  head: () => ({
    meta: [
      { title: "Sign Up — Fish Doctor App" },
      { name: "description", content: "Create an account to manage your fish farm." },
    ],
  }),
});

function SignUpPage() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isGoogleInfoOpen, setIsGoogleInfoOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName) {
      localStorage.setItem("user_name", fullName);
    }
    if (phone) {
      localStorage.setItem("user_phone", `+233 ${phone}`);
    }
    navigate({ to: "/onboarding" });
  };

  const handleGoogleSignup = () => {
    localStorage.setItem("user_google_signed_in", "true");
    navigate({ to: "/onboarding" });
  };

  return (
    <div className="min-h-screen bg-[#EAEFEA] flex justify-center items-center font-sans antialiased sm:py-4">
      <main className="w-full max-w-[430px] min-h-screen sm:min-h-[860px] bg-[#FAFCFA] relative flex flex-col justify-between overflow-hidden shadow-2xl sm:rounded-[36px] sm:border sm:border-gray-200">
        
        {/* Header Bar */}
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
        <div className="px-6 pt-3 pb-24 z-10 flex flex-col flex-1 justify-start">
          
          {/* Logo */}
          <div className="flex justify-center mt-1 mb-2">
            <FishFarmLogo className="w-14 h-14" />
          </div>

          {/* Heading */}
          <div className="text-center mb-4">
            <h1 className="text-[24px] font-bold text-gray-900 tracking-tight">
              {t("createAccount")}
            </h1>
            <p className="mt-0.5 text-[13.5px] text-gray-500 font-medium">
              Start your smart aquaculture & AI disease diagnostic journey.
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
                  placeholder="Enter full name"
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
                  placeholder="Enter phone number"
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
                  placeholder="Create password"
                  className="flex-1 bg-transparent pl-2.5 pr-2 text-[14px] text-gray-900 placeholder:text-gray-400 outline-none font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
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
                  placeholder="Confirm password"
                  className="flex-1 bg-transparent pl-2.5 pr-2 text-[14px] text-gray-900 placeholder:text-gray-400 outline-none font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
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
              {t("signUp")} & Proceed to Onboarding
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-1">
              <div className="absolute inset-x-0 h-[1px] bg-gray-200" />
              <span className="relative bg-[#FAFCFA] px-3 text-[12px] font-semibold text-gray-400">
                or
              </span>
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="w-full h-12 bg-white border border-gray-200 hover:bg-gray-50 active:scale-[0.98] transition-all text-gray-900 text-[15px] font-bold rounded-[15px] shadow-xs flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <GoogleLogo className="w-4.5 h-4.5" />
              Sign up with Google
            </button>

            {/* Footer Link */}
            <p className="text-center text-[13px] text-gray-500 font-medium mt-2">
              {t("alreadyAccount")}{" "}
              <Link to="/login" className="text-[#0F6236] font-bold hover:underline">
                {t("login")}
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
                🔑 Google OAuth 2.0 Credentials Info
              </h3>
              <p className="text-xs text-gray-600">
                For Render App: <code className="font-bold text-[#0F6236]">https://fish-t7c0.onrender.com</code>
              </p>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="font-extrabold text-[#0F6236] block mb-1">Authorised JavaScript origins:</span>
                  <code className="text-[11px] block text-gray-800 space-y-0.5">
                    <div>http://localhost:5173</div>
                    <div>http://localhost:3000</div>
                    <div>http://127.0.0.1:5173</div>
                    <div>https://fish-t7c0.onrender.com</div>
                  </code>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="font-extrabold text-[#0F6236] block mb-1">Authorised redirect URIs:</span>
                  <code className="text-[11px] block text-gray-800 space-y-0.5">
                    <div>http://localhost:5173</div>
                    <div>http://localhost:5173/login</div>
                    <div>https://fish-t7c0.onrender.com</div>
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
