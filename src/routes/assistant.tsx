import { createFileRoute } from "@tanstack/react-router";
import { Menu, Bell, MapPin, Mic, Stethoscope, Droplet, Package, BarChart3, Lightbulb, Play, MessageCircle, ChevronRight, Headphones, RotateCw } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import fishDecor from "@/assets/fish-decor.jpg";

export const Route = createFileRoute("/assistant")({
  component: AssistantPage,
  head: () => ({
    meta: [
      { title: "Assistant — FishFarm OS Ghana" },
      { name: "description", content: "Talk to your voice-first fish farming assistant." },
      { property: "og:title", content: "Assistant — FishFarm OS Ghana" },
      { property: "og:description", content: "Voice-first fish farming assistant." },
    ],
  }),
});

const quickActions = [
  { Icon: Stethoscope, label: "Fish Doctor", sub: "Diagnose fish health issues", tint: "bg-secondary/60 text-primary" },
  { Icon: Droplet, label: "Water Check", sub: "Check water quality", tint: "bg-blue-100 text-blue-700" },
  { Icon: Package, label: "Feeding Advice", sub: "Get feeding recommendations", tint: "bg-yellow-50 text-primary" },
  { Icon: BarChart3, label: "Farm Summary", sub: "Get an overview of your farm", tint: "bg-purple-50 text-purple-700" },
];

const askMe = [
  "How can I improve fish growth?",
  "What should I do if my fish are not eating?",
  "What is the best feed for tilapia?",
  "How do I maintain good water quality?",
];

function AssistantPage() {
  return (
    <PhoneFrame>
      <header className="px-5 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Menu className="w-6 h-6 text-foreground" />
          <div>
            <div className="text-[22px] font-extrabold text-foreground leading-tight">Assistant</div>
            <div className="flex items-center gap-1 text-primary text-[13px] font-medium">
              <MapPin className="w-4 h-4" /> Ashanti Region ▾
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-6 h-6 text-foreground" />
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">3</span>
          </div>
          <img src={farmerImg} alt="Kofi" className="w-10 h-10 rounded-full object-cover border-2 border-primary" />
        </div>
      </header>

      <section className="mx-5 mt-5 rounded-2xl bg-primary text-primary-foreground p-5 relative overflow-hidden">
        <img src={fishDecor} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover opacity-25" />
        <div className="relative flex items-center gap-4">
          <div className="flex-1">
            <div className="text-[20px] font-extrabold">Hi Kofi! 👋</div>
            <p className="mt-2 text-[14px] opacity-95 leading-snug">I'm your FishFarm OS Assistant. How can I help you today?</p>
            <div className="mt-6 flex items-center gap-2 text-[13px] opacity-90">
              <span className="inline-flex gap-[2px] items-end h-4">
                {[3, 6, 4, 8, 5, 7].map((h, i) => (
                  <span key={i} className="w-[2px] bg-white/80 rounded-full" style={{ height: `${h * 2}px` }} />
                ))}
              </span>
              Tap the mic and speak
            </div>
          </div>
          <button className="relative w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-xl shrink-0">
            <span className="absolute inset-0 rounded-full border-4 border-white/40 animate-pulse" />
            <Mic className="w-9 h-9 text-primary" />
          </button>
        </div>
      </section>

      <section className="px-5 mt-6">
        <h2 className="text-[18px] font-extrabold text-foreground">Quick Actions</h2>
        <div className="mt-3 grid grid-cols-4 gap-3">
          {quickActions.map(({ Icon, label, sub, tint }) => (
            <button key={label} className="flex flex-col items-center text-center">
              <div className={`w-full aspect-square rounded-xl border border-border flex items-center justify-center ${tint}`}>
                <Icon className="w-7 h-7" />
              </div>
              <div className="text-[11px] font-bold text-foreground mt-1.5 leading-tight">{label}</div>
              <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">{sub}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="mx-5 mt-5 rounded-2xl bg-secondary/50 p-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shrink-0">
          <Lightbulb className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <div className="text-[14px] font-extrabold text-primary">Listen to Daily Tips</div>
          <div className="text-[12px] text-muted-foreground">Get helpful tips to improve your fish farming.</div>
        </div>
        <button className="inline-flex items-center gap-1 text-primary font-bold text-[13px] border border-primary/30 rounded-full px-3 py-1.5">
          <Play className="w-4 h-4 fill-primary" /> Listen
        </button>
      </section>

      <section className="px-5 mt-6">
        <h2 className="text-[18px] font-extrabold text-foreground">You Can Ask Me</h2>
        <div className="mt-3 rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
          {askMe.map((q) => (
            <button key={q} className="w-full flex items-center gap-3 px-4 py-3 text-left">
              <div className="w-8 h-8 rounded-full bg-secondary/60 flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 text-[13px] font-semibold text-foreground">{q}</div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
          <button className="w-full flex items-center justify-center gap-2 py-3 text-primary font-bold text-[13px]">
            <RotateCw className="w-4 h-4" /> Refresh Questions
          </button>
        </div>
      </section>

      <section className="mx-5 mt-4 mb-6 rounded-2xl bg-secondary/40 p-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center shrink-0">
          <Headphones className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="text-[14px] font-extrabold text-foreground">Need to talk to a human?</div>
          <div className="text-[12px] text-muted-foreground">Our support team is ready to help you.</div>
        </div>
        <button className="inline-flex items-center gap-1 text-primary font-bold text-[13px] border border-primary/30 rounded-full px-3 py-1.5">
          <Headphones className="w-4 h-4" /> Contact
        </button>
      </section>

      <BottomNav />
    </PhoneFrame>
  );
}
