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
      <div className="w-full max-w-[430px] flex flex-col bg-background relative overflow-hidden">
        <header className="pt-10 pb-6 flex justify-center">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="FishFarm OS logo" width={56} height={56} className="w-14 h-14 object-contain" />
            <div className="flex flex-col leading-none">
              <span className="text-[32px] font-extrabold text-[#0F6236] tracking-tight">FishFarm OS</span>
              <span className="text-[13px] font-bold tracking-[0.4em] text-[#0F6236] mt-1 pl-1">GHANA</span>
            </div>
          </div>
        </header>

        <section className="px-6 text-center">
          <h1 className="text-[28px] leading-[1.15] font-extrabold text-foreground">
            The Operating System<br />
            for <span className="text-[#0F6236]">Fish Farming</span> in Ghana
          </h1>
          <p className="mt-4 text-[15px] font-bold text-foreground/80">
            Smart. Simple. Local. Profitable.
          </p>
          <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
            Empowering every fish farmer with AI tools,
            knowledge, and community support in local languages.
          </p>
        </section>

        <section className="relative mt-6 mx-4 rounded-2xl overflow-hidden shadow-lg">
          <img
            src={farmerImg}
            alt="Ghanaian fish farmer using a smartphone by a pond"
            width={1024}
            height={1024}
            className="w-full h-[380px] object-cover"
          />
          <div className="absolute inset-y-0 right-0 w-[62%] flex flex-col justify-center gap-4 pr-4">
            {features.map(({ Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white shadow-md flex items-center justify-center shrink-0">
                  <Icon className="w-5.5 h-5.5 text-[#0F6236]" strokeWidth={2.4} />
                </div>
                <div className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  <div className="text-[14px] font-bold leading-tight">{title}</div>
                  <div className="text-[11px] leading-tight opacity-95">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="px-5 mt-6 pb-8 flex flex-col gap-3">
          <Link to="/login" className="w-full h-14 rounded-full bg-[#0F6236] text-white text-[17px] font-bold shadow-lg shadow-[#0F6236]/20 transition-transform active:scale-[0.98] flex items-center justify-center">
            Get Started
          </Link>
          <button
            onClick={() => setIsLangOpen(true)}
            className="w-full h-14 rounded-full bg-card text-[#0F6236] text-[16px] font-bold border border-gray-200 shadow-sm transition-transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Globe className="w-5 h-5" /> Choose Language ({language})
          </button>
          <p className="text-center text-[13px] text-muted-foreground mt-1 font-medium">
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
