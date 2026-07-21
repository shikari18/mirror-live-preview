import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone, Wifi, Users, ShieldCheck } from "lucide-react";
import farmerImg from "@/assets/farmer.jpg";
import logoImg from "@/assets/logo.png";

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
  return (
    <main className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[430px] flex flex-col bg-background">
        <header className="pt-10 pb-6 flex justify-center">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="FishFarm OS logo" width={56} height={56} className="w-14 h-14 object-contain" />
            <div className="flex flex-col leading-none">
              <span className="text-[32px] font-extrabold text-primary tracking-tight">FishFarm OS</span>
              <span className="text-[13px] font-medium tracking-[0.35em] text-primary/80 mt-1">GHANA</span>
            </div>
          </div>
        </header>

        <section className="px-6 text-center">
          <h1 className="text-[28px] leading-[1.15] font-extrabold text-foreground">
            The Operating System<br />
            for <span className="text-primary">Fish Farming</span> in Ghana
          </h1>
          <p className="mt-4 text-[15px] font-medium text-foreground/80">
            Smart. Simple. Local. Profitable.
          </p>
          <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
            Empowering every fish farmer with the tools,
            knowledge and support to grow more,
            earn more and build a better future.
          </p>
        </section>

        <section className="relative mt-6 mx-4 rounded-2xl overflow-hidden">
          <img
            src={farmerImg}
            alt="Ghanaian fish farmer using a smartphone by a pond"
            width={1024}
            height={1024}
            className="w-full h-[420px] object-cover"
          />
          <div className="absolute inset-y-0 right-0 w-[62%] flex flex-col justify-center gap-4 pr-4">
            {features.map(({ Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-primary" strokeWidth={2.4} />
                </div>
                <div className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                  <div className="text-[15px] font-bold leading-tight">{title}</div>
                  <div className="text-[12px] leading-tight opacity-95">{desc}</div>
                </div>
              </div>
            ))}
          </div>
          <svg
            className="absolute bottom-0 left-0 w-full"
            viewBox="0 0 430 60"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0,40 C120,10 260,60 430,25 L430,60 L0,60 Z" fill="oklch(0.93 0.04 145)" opacity="0.85" />
            <path d="M0,50 C140,25 280,65 430,40 L430,60 L0,60 Z" fill="var(--background)" />
          </svg>
        </section>

        <div className="flex justify-center gap-2 mt-6">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="w-2 h-2 rounded-full bg-primary/25" />
          <span className="w-2 h-2 rounded-full bg-primary/25" />
          <span className="w-2 h-2 rounded-full bg-primary/25" />
        </div>

        <div className="px-5 mt-5 pb-8 flex flex-col gap-3">
          <Link to="/login" className="w-full h-14 rounded-full bg-primary text-primary-foreground text-[17px] font-semibold shadow-lg shadow-primary/20 transition-transform active:scale-[0.98] flex items-center justify-center">
            Get Started
          </Link>
          <button className="w-full h-14 rounded-full bg-card text-primary text-[17px] font-semibold border border-border shadow-sm transition-transform active:scale-[0.98]">
            Choose Language
          </button>
          <p className="text-center text-[13px] text-muted-foreground mt-1">
            Already have an account? <Link to="/login" className="text-primary font-semibold">Log in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
