import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Bell, MapPin, Camera, Image as ImageIcon, Video, ClipboardList, ChevronDown, Send, ShieldCheck, X, Headphones, MessageSquare, ChevronRight } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import pondImg from "@/assets/pond.jpg";
import ulcers from "@/assets/disease-ulcers.jpg";
import gasping from "@/assets/disease-gasping.jpg";
import whitespots from "@/assets/disease-whitespots.jpg";

export const Route = createFileRoute("/ai-doctor")({
  component: DiseasePage,
  head: () => ({
    meta: [
      { title: "Disease Report — FishFarm OS Ghana" },
      { name: "description", content: "Report signs of disease and get expert AI help fast." },
      { property: "og:title", content: "Disease Report — FishFarm OS Ghana" },
      { property: "og:description", content: "Early detection saves your fish." },
    ],
  }),
});

const signs = [
  { label: "Red Spots / Ulcers", tint: "bg-red-50" },
  { label: "White Spots", tint: "bg-secondary/60" },
  { label: "Frayed Fins", tint: "bg-yellow-50" },
  { label: "Erratic Swimming", tint: "bg-blue-50" },
  { label: "Loss of Appetite", tint: "bg-secondary/60" },
];

const reports = [
  { img: ulcers, t: "Ulcers on body", meta: "Pond 1 • Tilapia", status: "Under Review", stColor: "bg-yellow-100 text-yellow-700", date: "May 12, 2025", time: "8:30 AM" },
  { img: gasping, t: "Fish gasping at surface", meta: "Pond 2 • Catfish", status: "Resolved", stColor: "bg-secondary text-primary", date: "May 9, 2025", time: "10:15 AM" },
  { img: whitespots, t: "White spots on skin", meta: "Pond 3 • Tilapia", status: "Resolved", stColor: "bg-secondary text-primary", date: "May 6, 2025", time: "9:40 AM" },
];

function DiseasePage() {
  return (
    <PhoneFrame>
      <header className="px-5 pt-6 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Link to="/home" className="pt-1"><ArrowLeft className="w-6 h-6 text-foreground" /></Link>
          <div>
            <div className="text-[22px] font-extrabold text-foreground leading-tight">Disease Report</div>
            <div className="flex items-center gap-1 text-primary text-[13px] font-medium mt-1"><MapPin className="w-4 h-4" /> Ashanti Region ▾</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative"><Bell className="w-6 h-6 text-foreground" /><span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">3</span></div>
          <img src={farmerImg} alt="Kofi" className="w-10 h-10 rounded-full object-cover border-2 border-primary" />
        </div>
      </header>

      <section className="mx-5 mt-4 rounded-2xl bg-secondary/50 p-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0"><ShieldCheck className="w-5 h-5 text-primary-foreground" /></div>
        <div className="flex-1 text-[12px]">
          <div className="font-extrabold text-primary">Early detection saves your fish.</div>
          <div className="text-muted-foreground">Report any signs of disease to get expert help.</div>
        </div>
        <X className="w-4 h-4 text-muted-foreground" />
      </section>

      <section className="mx-5 mt-4 rounded-2xl border border-border p-4">
        <div className="text-[15px] font-extrabold text-foreground">1. Report New Case</div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {[
            { Icon: Camera, label: "Take Photo", sub: "Capture signs of disease", tint: "bg-secondary text-primary", active: true },
            { Icon: ImageIcon, label: "Gallery", sub: "Upload from gallery", tint: "bg-purple-100 text-purple-700" },
            { Icon: Video, label: "Record Video", sub: "Record fish behavior", tint: "bg-yellow-100 text-yellow-700" },
            { Icon: ClipboardList, label: "Describe", sub: "Describe the symptoms", tint: "bg-blue-100 text-blue-700" },
          ].map(({ Icon, label, sub, tint, active }) => (
            <button key={label} className={`rounded-xl border ${active ? "border-primary bg-secondary/40" : "border-border"} p-2 flex flex-col items-center text-center`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tint}`}><Icon className="w-5 h-5" /></div>
              <div className="text-[11px] font-bold mt-1 text-foreground leading-tight">{label}</div>
              <div className="text-[9px] text-muted-foreground leading-tight mt-0.5">{sub}</div>
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-border divide-y divide-border">
          <div className="p-3 flex items-center gap-3">
            <img src={pondImg} alt="" className="w-10 h-10 rounded-lg object-cover" />
            <div className="flex-1">
              <div className="text-[11px] text-muted-foreground">Select Pond</div>
              <div className="text-[14px] font-extrabold text-foreground">Pond 1</div>
            </div>
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/60 flex items-center justify-center text-lg">🐟</div>
            <div className="flex-1">
              <div className="text-[11px] text-muted-foreground">Affected Fish Type</div>
              <div className="text-[14px] font-extrabold text-foreground">Tilapia</div>
            </div>
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>

        <button className="mt-4 w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2">
          <Send className="w-5 h-5" /> Submit Report
        </button>
      </section>

      <section className="mx-5 mt-4 rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between">
          <div className="text-[15px] font-extrabold text-foreground">2. Common Signs to Look For</div>
          <a className="text-primary text-[12px] font-semibold">View All</a>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto -mx-1 px-1 pb-1">
          {signs.map((s) => (
            <div key={s.label} className="w-20 shrink-0 text-center">
              <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${s.tint}`}>🐟</div>
              <div className="text-[10px] font-bold text-foreground mt-1 leading-tight">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-5 mt-4 rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between">
          <div className="text-[15px] font-extrabold text-foreground">3. Recent Reports</div>
          <a className="text-primary text-[12px] font-semibold">View All</a>
        </div>
        {reports.map((r, i) => (
          <div key={i} className="mt-3 flex items-center gap-3 border-t border-border pt-3 first:border-0 first:pt-0">
            <img src={r.img} alt="" className="w-14 h-14 rounded-lg object-cover" />
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold text-foreground truncate">{r.t}</div>
              <div className="text-[11px] text-muted-foreground">{r.meta}</div>
              <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${r.stColor}`}>{r.status}</span>
            </div>
            <div className="text-right text-[10px] text-muted-foreground">
              <div>{r.date}</div>
              <div>{r.time}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        ))}
      </section>

      <section className="mx-5 mt-4 mb-6 rounded-2xl bg-secondary/40 p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center"><Headphones className="w-5 h-5 text-primary-foreground" /></div>
        <div className="flex-1">
          <div className="text-[13px] font-extrabold text-primary">Need urgent help?</div>
          <div className="text-[11px] text-muted-foreground">Chat with our fish health experts.</div>
        </div>
        <button className="text-primary border border-primary rounded-lg px-3 py-1.5 text-[12px] font-bold flex items-center gap-1"><MessageSquare className="w-4 h-4" /> Chat Now</button>
      </section>

      <BottomNav />
    </PhoneFrame>
  );
}
