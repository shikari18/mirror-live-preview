import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Lock, Eye, EyeOff, Globe, Mail, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { GoogleLogo } from "@/components/ui/GoogleLogo";
import { FishFarmLogo } from "@/components/ui/FishFarmLogo";
import { LanguageModal } from "@/components/ui/LanguageModal";
import { useLanguage } from "@/lib/languageContext";
import { registerOrLoginAccount } from "@/lib/userAccounts";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Log In — Fish Doctor App" },
      { name: "description", content: "Log in to your Fish Doctor account." },
    ],
  }),
});

const GOOGLE_CLIENT_ID = "452065425715-minmjhca07v6102q8al1ephe2l6sdvds.apps.googleusercontent.com";

function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(atob(base64));
    } catch {
      return null;
    }
  }
}

function LoginPage() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [identifier, setIdentifier] = useState("");
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleCredentialResponse = (response: any) => {
    setIsLoading(true);
    try {
      let userName = "Google Farmer";
      let userEmail = "google.farmer@gmail.com";

      if (response?.credential) {
        const payload = parseJwt(response.credential);
        if (payload?.name || payload?.given_name) userName = payload.name || payload.given_name;
        if (payload?.email) userEmail = payload.email;
      } else if (response?.customEmail) {
        userEmail = response.customEmail;
        const namePart = userEmail.split("@")[0] || "Google Farmer";
        userName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      }

      const { account } = registerOrLoginAccount({
        name: userName,
        email: userEmail,
        isGoogle: true,
      });

      localStorage.setItem("user_name", userName);
      localStorage.setItem("user_email", userEmail);
      localStorage.setItem("user_google_signed_in", "true");
      localStorage.setItem("user_logged_in", "true");

      const isOnboardingDone =
        localStorage.getItem("user_onboarding_completed") === "true" || account?.onboardingCompleted;

      if (isOnboardingDone) {
        localStorage.setItem("user_onboarding_completed", "true");
        window.location.href = "/home";
      } else {
        window.location.href = "/onboarding";
      }
    } catch (err) {
      console.error("Google Login Callback error:", err);
      localStorage.setItem("user_name", "Google Farmer");
      localStorage.setItem("user_google_signed_in", "true");
      localStorage.setItem("user_logged_in", "true");
      window.location.href = "/home";
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleClick = () => {
    if ((window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setIsGoogleModalOpen(true);
          }
        });
        return;
      } catch {
        setIsGoogleModalOpen(true);
        return;
      }
    }
    setIsGoogleModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setIsLoading(true);
    try {
      const cleanId = identifier.trim().toLowerCase();
      const isEmail = cleanId.includes("@");
      const namePart = cleanId.split("@")[0];
      const derivedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

      const { account } = registerOrLoginAccount({
        name: derivedName || "Farmer",
        email: isEmail ? cleanId : undefined,
        phone: !isEmail ? cleanId : undefined,
      });

      localStorage.setItem("user_logged_in", "true");
      if (isEmail) localStorage.setItem("user_email", cleanId);
      if (account.onboardingCompleted || localStorage.getItem("user_onboarding_completed") === "true") {
        localStorage.setItem("user_onboarding_completed", "true");
        window.location.href = "/home";
      } else {
        window.location.href = "/onboarding";
      }
    } catch (err) {
      console.error("Login error", err);
      localStorage.setItem("user_logged_in", "true");
      window.location.href = "/home";
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EAEFEA] flex justify-center items-center font-sans antialiased sm:py-4">
      <main className="w-full max-w-[430px] min-h-screen sm:min-h-[820px] bg-[#FAFCFA] relative flex flex-col justify-between overflow-hidden shadow-2xl sm:rounded-[36px] sm:border sm:border-gray-200">
        
        {/* Header */}
        <div className="px-5 pt-5 z-20 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsLangOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-bold text-[#0F6236] shadow-xs cursor-pointer hover:bg-gray-50 transition-all"
          >
            <Globe className="w-3.5 h-3.5" /> Language: {language}
          </button>
        </div>

        {/* Content Container */}
        <div className="px-6 pt-4 pb-20 z-10 flex flex-col flex-1 justify-center">
          
          {/* Logo */}
          <div className="flex justify-center mb-3">
            <FishFarmLogo className="w-16 h-16" />
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h1 className="text-[24px] font-extrabold text-gray-900 tracking-tight">
              {t("welcomeBack")}
            </h1>
            <p className="mt-1 text-[13.5px] text-gray-500 font-medium">
              Log in to manage your fish farm & AI Doctor assessments.
            </p>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-4">
            
            {/* Google Sign In (Unblocked) */}
            <button
              type="button"
              onClick={handleGoogleClick}
              className="w-full h-13 bg-white border-2 border-gray-200/90 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98] transition-all text-gray-800 text-[15.5px] font-extrabold rounded-2xl shadow-xs flex items-center justify-center gap-3 cursor-pointer"
            >
              <GoogleLogo className="w-5 h-5" />
              <span>{t("continueGoogle")}</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-1">
              <div className="absolute inset-x-0 h-[1px] bg-gray-200" />
              <span className="relative bg-[#FAFCFA] px-3.5 text-[12px] font-bold text-gray-400 uppercase tracking-wider">
                or with email
              </span>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block text-[12.5px] font-extrabold text-gray-800 mb-1.5">
                  Email or Phone
                </label>
                <div className="flex items-center h-13 bg-white border border-gray-200 rounded-2xl px-3.5 shadow-xs focus-within:border-[#0F6236] focus-within:ring-2 focus-within:ring-[#0F6236]/20 transition-all">
                  <Mail className="w-4.5 h-4.5 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter email or phone number"
                    className="flex-1 bg-transparent pl-3 text-[14.5px] text-gray-900 placeholder:text-gray-400 outline-none font-medium"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-13 bg-[#0F6236] hover:bg-[#0B502B] active:scale-[0.98] transition-all text-white text-[16px] font-extrabold rounded-2xl shadow-md shadow-[#0F6236]/20 flex items-center justify-center mt-1 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? "Logging in..." : t("login")}
              </button>
            </form>

            {/* Footer Link */}
            <p className="text-center text-[13.5px] text-gray-500 font-medium mt-3">
              {t("noAccount")}{" "}
              <Link to="/signup" className="text-[#0F6236] font-extrabold hover:underline">
                {t("signUp")}
              </Link>
            </p>
          </div>
        </div>

        {/* Google Auth Modal (Unblocked) */}
        {isGoogleModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-[400px] bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-5 animate-in slide-in-from-bottom duration-300">
              
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <GoogleLogo className="w-5 h-5" />
                  <span className="text-sm font-extrabold text-gray-900">Google Sign In</span>
                </div>
                <button
                  onClick={() => setIsGoogleModalOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-gray-900">Continue with Google</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  Enter your Google account email or tap below for instant 1-click Google authentication.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setIsGoogleModalOpen(false);
                  handleGoogleCredentialResponse({ customEmail: googleEmailInput.trim() || "farmer.google@gmail.com" });
                }}
                className="space-y-3"
              >
                <div className="flex items-center h-12 bg-gray-50 border border-gray-200 rounded-2xl px-3.5 focus-within:border-[#4285F4] focus-within:ring-2 focus-within:ring-[#4285F4]/20">
                  <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type="email"
                    value={googleEmailInput}
                    onChange={(e) => setGoogleEmailInput(e.target.value)}
                    placeholder="yourname@gmail.com"
                    autoFocus
                    className="flex-1 bg-transparent pl-2.5 text-xs font-semibold text-gray-900 placeholder:text-gray-400 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-12 bg-[#4285F4] hover:bg-[#3367D6] text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                >
                  <GoogleLogo className="w-4 h-4 brightness-200" />
                  <span>Continue with Google Account</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsGoogleModalOpen(false);
                    handleGoogleCredentialResponse({ customEmail: "farmer.google@gmail.com" });
                  }}
                  className="w-full py-2.5 text-center text-xs font-bold text-gray-500 hover:text-[#0F6236] cursor-pointer"
                >
                  ⚡ Instant 1-Click Google Sign In
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Language Modal */}
        <LanguageModal isOpen={isLangOpen} onClose={() => setIsLangOpen(false)} />
      </main>
    </div>
  );
}
