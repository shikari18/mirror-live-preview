import { useState, useEffect } from "react";
import logoImg from "@/assets/logo.png";

interface SplashScreenProps {
  onComplete?: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isPopped, setIsPopped] = useState(false);

  useEffect(() => {
    // Stage 1: Immediate pop up on mount (50ms)
    const popTimer = setTimeout(() => {
      setIsPopped(true);
    }, 50);

    // Stage 2: Start fade out at 1.2s
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1250);

    // Stage 3: Complete & unmount under 2s (1.6s total duration)
    const endTimer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 1600);

    return () => {
      clearTimeout(popTimer);
      clearTimeout(fadeTimer);
      clearTimeout(endTimer);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#052615] via-[#0F6236] to-[#03180D] transition-opacity duration-350 ease-out ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Background Subtle Ambient Glow */}
      <div className="absolute w-72 h-72 rounded-full bg-emerald-400/10 blur-3xl animate-pulse" />

      {/* Main Logo Container with Smooth Pop-Up */}
      <div
        className={`flex flex-col items-center gap-4 transform transition-all duration-500 ease-out ${
          isPopped
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-50 opacity-0 translate-y-6"
        }`}
      >
        {/* Glossy Logo Badge */}
        <div className="relative p-4 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl shadow-emerald-950/50 flex items-center justify-center">
          <img
            src={logoImg}
            alt="FishFarm OS Logo"
            className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-xl"
          />
        </div>

        {/* Brand Name & Tagline */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-1.5">
            FishFarm <span className="text-emerald-300">OS</span>
          </h1>
          <p className="text-xs font-semibold text-emerald-100/90 tracking-wide uppercase">
            Ghana's #1 Aquaculture Platform
          </p>
        </div>
      </div>
    </div>
  );
}
