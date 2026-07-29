import { useState, useEffect } from "react";
import { Download, X, Smartphone, Check } from "lucide-react";
import logoImg from "@/assets/logo.png";

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    // Check if user dismissed banner recently
    const dismissed = localStorage.getItem("pwa_banner_dismissed_v1");
    if (dismissed && Date.now() - parseInt(dismissed, 10) < 3 * 24 * 3600 * 1000) {
      return;
    }

    // Detect iOS Safari
    const ua = window.navigator.userAgent;
    const iosDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(iosDevice);

    if (iosDevice) {
      setShowBanner(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      alert("To install FishFarm OS on iPhone/iPad: tap the Share button at the bottom of Safari, then select 'Add to Home Screen'.");
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa_banner_dismissed_v1", Date.now().toString());
  };

  if (!showBanner || isInstalled) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 max-w-[400px] mx-auto animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[#08301B]/95 backdrop-blur-xl border border-emerald-500/30 text-white p-3.5 rounded-3xl shadow-2xl shadow-emerald-950/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/10 p-1.5 border border-white/20 shrink-0 flex items-center justify-center">
            <img src={logoImg} alt="FishFarm OS" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
              <span>Install FishFarm OS</span>
              <span className="bg-emerald-500 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md text-white">App</span>
            </div>
            <p className="text-[11px] text-emerald-200/90 font-medium leading-tight mt-0.5">
              Instant offline access on your home screen
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3 py-2 rounded-xl bg-white text-[#0F6236] hover:bg-emerald-50 font-extrabold text-xs shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5 text-[#0F6236]" /> Install
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-xl hover:bg-white/10 text-emerald-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
