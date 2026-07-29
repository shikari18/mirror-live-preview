import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Lock, Eye, EyeOff, ChevronDown, Globe } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { GhanaFlag } from "@/components/ui/GhanaFlag";
import { GoogleLogo } from "@/components/ui/GoogleLogo";
import { FishFarmLogo } from "@/components/ui/FishFarmLogo";
import { LanguageModal } from "@/components/ui/LanguageModal";
import { useLanguage } from "@/lib/languageContext";
import { getFarmProfile } from "@/lib/farmMemory";

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
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isGisRendered, setIsGisRendered] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initGoogleGsi = () => {
      if ((window as any).google?.accounts?.id) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredentialResponse,
          });

          if (googleBtnRef.current) {
            (window as any).google.accounts.id.renderButton(googleBtnRef.current, {
              theme: "outline",
              size: "large",
              width: "350",
              text: "continue_with",
              shape: "pill",
            });
            setIsGisRendered(true);
          }
        } catch (e) {
          console.warn("Google button render warning", e);
        }
      }
    };

    if ((window as any).google?.accounts?.id) {
      initGoogleGsi();
    } else {
      const existingScript = document.getElementById("google-gsi-script");
      if (existingScript) {
        existingScript.addEventListener("load", initGoogleGsi);
      } else {
        const script = document.createElement("script");
        script.id = "google-gsi-script";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = initGoogleGsi;
        document.head.appendChild(script);
      }
    }
  }, []);

  const handleGoogleCredentialResponse = (response: any) => {
    try {
      let userName = "Google User";
      let userEmail = `farmer_${Date.now().toString(36).slice(-4)}@google.com`;

      if (response?.credential) {
        const payload = parseJwt(response.credential);
        if (payload?.name || payload?.given_name) userName = payload.name || payload.given_name;
        if (payload?.email) userEmail = payload.email;
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

      const isOnboardingDone = localStorage.getItem("user_onboarding_completed") === "true" || account?.onboardingCompleted;

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
    }
  };

  const triggerGooglePrompt = () => {
    if ((window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            handleGoogleCredentialResponse({ isFallback: true });
          }
        });
      } catch {
        handleGoogleCredentialResponse({ isFallback: true });
      }
    } else {
      handleGoogleCredentialResponse({ isFallback: true });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedPhone = phone ? `+233 ${phone}` : undefined;
    const { account } = registerOrLoginAccount({
      name: "Farmer",
      phone: formattedPhone,
    });

    if (account.onboardingCompleted) {
      navigate({ to: "/home" });
    } else {
      navigate({ to: "/onboarding" });
    }
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

            {/* SINGLE Google Sign In Button Container */}
            <div className="w-full min-h-[50px] flex items-center justify-center">
              <div ref={googleBtnRef} className={isGisRendered ? "block" : "hidden"} />

              {!isGisRendered && (
                <button
                  type="button"
                  onClick={triggerGooglePrompt}
                  className="w-full h-13 bg-white border border-gray-200 hover:bg-gray-50 active:scale-[0.98] transition-all text-gray-900 text-[15.5px] font-bold rounded-[16px] shadow-xs flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <GoogleLogo className="w-4.5 h-4.5" />
                  {t("continueGoogle")}
                </button>
              )}
            </div>

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
      </main>
    </div>
  );
}
