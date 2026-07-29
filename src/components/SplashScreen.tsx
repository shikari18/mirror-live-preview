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
    // Stage 1: Immediate pop up (50ms)
    const popTimer = setTimeout(() => {
      setIsPopped(true);
    }, 50);

    // Stage 2: Start fade out at 1.2s
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1250);

    // Stage 3: Complete & unmount under 2s (1.5s total)
    const endTimer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 1500);

    return () => {
      clearTimeout(popTimer);
      clearTimeout(fadeTimer);
      clearTimeout(endTimer);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-300 ease-out ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Centered Logo with Pop-Up Animation */}
      <div
        className={`transform transition-all duration-400 ease-out flex flex-col items-center justify-center ${
          isPopped
            ? "scale-100 opacity-100"
            : "scale-75 opacity-0"
        }`}
      >
        <img
          src={logoImg}
          alt="FishFarm OS Logo"
          className="w-32 h-32 sm:w-40 sm:h-40 object-contain drop-shadow-md"
        />
      </div>
    </div>
  );
}
