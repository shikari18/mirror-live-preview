import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, HelpCircle, Camera, Video, Mic, X, ShieldPlus, Check, Phone, Lightbulb, ChevronRight, Bug } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import sickFish from "@/assets/sick-fish.jpg";

export const Route = createFileRoute("/ai-doctor")({
  component: AIDoctorPage,
  head: () => ({
    meta: [
      { title: "AI Fish Doctor — FishFarm OS Ghana" },
      { name: "description", content: "Diagnose fish health issues instantly with the AI Fish Doctor." },
      { property: "og:title", content: "AI Fish Doctor — FishFarm OS Ghana" },
      { property: "og:description", content: "Instant AI diagnosis for your fish." },
    ],
  }),
});

function AIDoctorPage() {
  return (
    <PhoneFrame>
      <header className="px-5 pt-6 flex items-center justify-between">
        <Link to="/home"><ArrowLeft className="w-6 h-6 text-foreground" /></Link>
        <div className="text-[18px] font-extrabold text-foreground">AI Fish Doctor</div>
        <HelpCircle className="w-6 h-6 text-primary" />
      </header>

      <section className="px-5 mt-6">
        <div className="text-[15px] font-bold text-foreground">Send Your Observation</div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {[
            { Icon: Camera, label: "Photo", sub: "Take a clear photo" },
            { Icon: Video, label: "Video", sub: "Record a short video" },
            { Icon: Mic, label: "Voice", sub: "Send a voice note" },
          ].map(({ Icon, label, sub }) => (
            <button key={label} className="rounded-2xl border border-border p-3 flex flex-col items-center gap-1 bg-card">
              <Icon className="w-6 h-6 text-primary" />
              <div className="text-[14px] font-bold text-foreground">{label}</div>
              <div className="text-[10px] text-muted-foreground text-center leading-tight">{sub}</div>
            </button>
          ))}
        </div>

        <div className="mt-4 relative rounded-2xl overflow-hidden">
          <img src={sickFish} alt="Sick tilapia" loading="lazy" className="w-full h-52 object-cover" />
          <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow">
            <X className="w-4 h-4 text-foreground" />
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <div className="text-[15px] font-extrabold text-foreground">AI Diagnosis</div>
            <span className="text-[11px] font-bold text-primary bg-secondary rounded-full px-2 py-0.5">Moderate Risk</span>
            <ShieldPlus className="w-6 h-6 text-primary ml-auto" />
          </div>
          <div className="mt-3 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
              <Bug className="w-5 h-5 text-purple-700" />
            </div>
            <div>
              <div className="text-[17px] font-extrabold text-primary">Bacterial Infection</div>
              <div className="text-[13px] text-muted-foreground mt-1">Signs of bacterial infection likely caused by poor water quality or stress.</div>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-card p-4">
          <div className="text-[15px] font-extrabold text-foreground">What You Should Do</div>
          <div className="mt-3 flex flex-col gap-3">
            {[
              { t: "Apply salt at 3ppt", d: "Mix and apply evenly in the pond.", emoji: "🧂" },
              { t: "Reduce feeding for 2 days", d: "Allow fish to recover.", emoji: "🌾" },
              { t: "Improve aeration", d: "Increase oxygen levels in the pond.", emoji: "💧" },
              { t: "Monitor water quality", d: "Check oxygen, pH and ammonia levels.", emoji: "🧪" },
            ].map((s) => (
              <div key={s.t} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-primary-foreground" strokeWidth={3} />
                </div>
                <div className="flex-1">
                  <div className="text-[14px] font-bold text-foreground leading-tight">{s.t}</div>
                  <div className="text-[12px] text-muted-foreground">{s.d}</div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-secondary/60 flex items-center justify-center text-lg">{s.emoji}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-secondary/40 p-4">
          <div className="text-[14px] font-bold text-foreground">Buy Medicine Nearby</div>
          <div className="mt-2 flex items-center gap-3 bg-card rounded-xl p-3 border border-border">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-lg">💊</div>
            <div className="flex-1">
              <div className="text-[14px] font-bold text-foreground">Aqua Vet Pharmacy</div>
              <div className="text-[12px] text-muted-foreground">2.3 km away</div>
              <div className="text-[12px] text-primary font-semibold">Open now</div>
            </div>
            <button className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Phone className="w-5 h-5 text-primary" />
            </button>
          </div>
        </div>

        <div className="mt-4 mb-6 rounded-2xl bg-secondary/40 p-4 flex items-center gap-3">
          <Lightbulb className="w-6 h-6 text-primary" />
          <div className="flex-1">
            <div className="text-[14px] font-extrabold text-primary">Prevention Tip</div>
            <div className="text-[12px] text-muted-foreground">Maintain good water quality and do not overcrowd your pond.</div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </section>

      <BottomNav />
    </PhoneFrame>
  );
}
