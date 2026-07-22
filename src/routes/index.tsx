import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Phone, Wifi, Users, ShieldCheck, Globe } from "lucide-react";
import farmerImg from "@/assets/farmer.jpg";
import logoImg from "@/assets/logo.png";
import { LanguageModal } from "@/components/ui/LanguageModal";
import { useLanguage } from "@/lib/languageContext";

export const Route = createFileRoute("/")({
  component: Index,
});

const features = [
  { Icon: Phone, title: "Voice First", desc: "Works in local languages" },
  { Icon: Wifi, title: "Offline Friendly", desc: "Works with low internet" },
  { Icon: Users, title: "Built for Everyone", desc: "For all farmers, everywhere" },
  { Icon: ShieldCheck, title: "Secure & Private", desc: "Your data is your own" },
];

function Index() {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const { language } = useLanguage();

  return (
    <main className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[430px] flex flex-col bg-background relative overflow-hidden pb-6">
        
        {/* Header - Compact */}
        <header className="pt-6 pb-4 flex justify-center">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="FishFarm OS logo" className="w-12 h-12 object-contain" />
            <div className="flex flex-col leading-none">
              <span className="text-[28px] font-extrabold text-[#0F6236] tracking-tight">FishFarm OS</span>
              <span className="text-[12px] font-bold tracking-[0.4em] text-[#0F6236] mt-0.5 pl-0.5">GHANA</span>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="px-6 text-center">
          <h1 className="text-[26px] leading-[1.18] font-extrabold text-foreground">
            The Operating System<br />
            for <span className="text-[#0F6236]">Fish Farming</span> in Ghana
          </h1>
          <p className="mt-2 text-[14px] font-bold text-foreground/80">
            Smart. Simple. Local. Profitable.
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
            Empowering fish farmers with smart tools, market access, and advice in local languages.
          </p>
        </section>

        {/* Features Card - Text shifted to the LEFT side */}
        <section className="relative mt-4 mx-4 rounded-3xl overflow-hidden shadow-lg border border-gray-200">
          <img
            src={farmerImg}
            alt="Ghanaian fish farmer"
            className="w-full h-[360px] object-cover"
          />
          {/* Gradient Overlay for dark left contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          
          {/* Left Aligned Text Content */}
          <div className="absolute inset-y-0 left-0 w-[80%] flex flex-col justify-center gap-3.5 pl-5 pr-2 z-10">
            {features.map(({ Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-xs shadow-md flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[#0F6236]" strokeWidth={2.4} />
                </div>
                <div className="text-white text-left">
                  <div className="text-[14px] font-extrabold leading-tight">{title}</div>
                  <div className="text-[11px] leading-tight text-gray-200 font-medium">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA Buttons */}
        <div className="px-5 mt-5 flex flex-col gap-2.5">
          <Link to="/login" className="w-full h-13 rounded-full bg-[#0F6236] text-white text-[16px] font-bold shadow-lg shadow-[#0F6236]/20 transition-transform active:scale-[0.98] flex items-center justify-center">
            Get Started
          </Link>
          <button
            onClick={() => setIsLangOpen(true)}
            className="w-full h-13 rounded-full bg-card text-[#0F6236] text-[15px] font-bold border border-gray-200 shadow-sm transition-transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Globe className="w-4.5 h-4.5" /> Choose Language ({language})
          </button>
          <p className="text-center text-[12.5px] text-muted-foreground mt-0.5 font-medium">
            Already have an account? <Link to="/login" className="text-[#0F6236] font-bold">Log in</Link>
          </p>
        </div>

        {/* Language Modal */}
        <LanguageModal
          isOpen={isLangOpen}
          onClose={() => setIsLangOpen(false)}
        />
      </div>
    </main>
  );
}
