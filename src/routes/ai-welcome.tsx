import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Sparkles, Camera, Stethoscope, Calculator, PhoneCall, ArrowRight, SkipForward, CheckCircle2 } from "lucide-react";
import { PhoneFrame } from "@/components/BottomNav";

export const Route = createFileRoute("/ai-welcome")({
  component: AIWelcomePage,
  head: () => ({
    meta: [
      { title: "Welcome to Fish Doctor AI — App Guide" },
      { name: "description", content: "Learn why Fish Doctor AI is essential for your aquaculture farm." },
    ],
  }),
});

const GUIDE_TEXT = `Hello and welcome to Fish Doctor AI! 

I am your official 24/7 AI Aquaculture Veterinarian & Smart Farm Assistant. 

Here is why you need Fish Doctor AI on your farm:

1. 📐 Live Camera Pond Size Calculator: Measure your pond length, width, depth, and water volume in Liters using real-time camera scanning.
2. 🩺 AI Health & Vision Diagnosis: Snap a photo of sick fish or pond water for instant disease diagnosis and local medicine treatment.
3. 🌾 Smart Feed Calculator: Calculate exact daily feed rations to eliminate feed waste and accelerate fish growth to 1.2kg+ harvest size.
4. 📞 Live Extension Support: Call or message real aquaculture experts directly via WhatsApp whenever you need on-site assistance.

Let's start transforming your fish farm today!`;

export function AIWelcomePage() {
  const navigate = useNavigate();
  const [displayedText, setDisplayedText] = useState("");
  const [isDoneTyping, setIsDoneTyping] = useState(false);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < GUIDE_TEXT.length) {
        setDisplayedText(GUIDE_TEXT.slice(0, index + 1));
        index++;
      } else {
        setIsDoneTyping(true);
        clearInterval(interval);
      }
    }, 15);

    return () => clearInterval(interval);
  }, []);

  const handleProceed = () => {
    localStorage.setItem("user_welcome_seen", "true");
    navigate({ to: "/home" });
  };

  return (
    <PhoneFrame>
      <div className="min-h-screen bg-gradient-to-b from-[#0F6236] via-[#0D522D] to-gray-900 text-white p-6 flex flex-col justify-between relative overflow-hidden">
        
        {/* Decorative Background Elements */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />

        {/* Top Bar with Skip Button */}
        <div className="flex items-center justify-between z-10 pt-2">
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-emerald-300 animate-pulse" />
            <span className="text-xs font-extrabold text-white">Fish Doctor AI Guide</span>
          </div>

          <button
            onClick={handleProceed}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold backdrop-blur-md cursor-pointer transition-all active:scale-95"
          >
            Skip <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* AI Typing Content Box */}
        <div className="my-auto py-6 z-10 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/30 flex items-center justify-center text-emerald-300 shadow-xl backdrop-blur-md">
            <Sparkles className="w-7 h-7 animate-bounce" />
          </div>

          <h1 className="text-2xl font-extrabold text-white leading-tight">
            Why You Need Fish Doctor AI
          </h1>

          <div className="bg-black/30 border border-white/15 rounded-2xl p-4 backdrop-blur-md shadow-2xl max-h-[380px] overflow-y-auto font-mono text-xs text-emerald-100 leading-relaxed space-y-2 whitespace-pre-line">
            {displayedText}
            {!isDoneTyping && <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse ml-0.5" />}
          </div>

          {/* Quick Feature Highlights */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
            <div className="bg-white/10 p-2.5 rounded-xl border border-white/15 flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>AR Camera Scanner</span>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl border border-white/15 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>AI Vision Diagnosis</span>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl border border-white/15 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Smart Feed Ration</span>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl border border-white/15 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Real Officer Support</span>
            </div>
          </div>
        </div>

        {/* Bottom CTA Button */}
        <div className="z-10 pb-4">
          <button
            onClick={handleProceed}
            className="w-full h-13 bg-white text-[#0F6236] hover:bg-emerald-50 font-extrabold text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
          >
            Proceed to Dashboard <ArrowRight className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
}
