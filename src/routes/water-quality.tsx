import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Bell, MapPin, ChevronDown, Calendar, ShieldCheck, ChevronRight, FlaskConical } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import pondImg from "@/assets/pond.jpg";

export const Route = createFileRoute("/water-quality")({
  component: WaterQualityPage,
  head: () => ({
    meta: [
      { title: "Water Quality — FishFarm OS Ghana" },
      { name: "description", content: "Monitor pond water quality: temperature, pH, oxygen and more." },
      { property: "og:title", content: "Water Quality — FishFarm OS Ghana" },
      { property: "og:description", content: "Real-time pond water quality monitoring." },
    ],
  }),
});

const tabs = ["Overview", "Parameters", "History", "Insights", "Recommendations"] as const;

const params = [
  { label: "Temperature", value: "28", unit: "°C", status: "Optimal", range: "26 – 30°C", tint: "bg-orange-50 text-orange-600" },
  { label: "pH Level", value: "7.2", unit: "", status: "Good", range: "6.5 – 8.5", tint: "bg-purple-100 text-purple-700" },
  { label: "Dissolved Oxygen", value: "5.8", unit: "mg/L", status: "Good", range: "> 5 mg/L", tint: "bg-blue-100 text-blue-700" },
  { label: "Ammonia (NH₃)", value: "0.02", unit: "mg/L", status: "Good", range: "< 0.05 mg/L", tint: "bg-secondary text-primary" },
  { label: "Nitrite (NO₂)", value: "0.01", unit: "mg/L", status: "Good", range: "< 0.1 mg/L", tint: "bg-yellow-100 text-yellow-700" },
  { label: "Nitrate (NO₃)", value: "2.5", unit: "mg/L", status: "Good", range: "< 50 mg/L", tint: "bg-red-100 text-red-600" },
  { label: "Alkalinity", value: "120", unit: "mg/L", status: "Good", range: "80 – 200 mg/L", tint: "bg-blue-100 text-blue-700" },
  { label: "Turbidity", value: "25", unit: "NTU", status: "Good", range: "< 50 NTU", tint: "bg-secondary/60 text-foreground" },
];

const trend = [65, 76, 68, 78, 88, 60, 72, 85];

function WaterQualityPage() {
  const max = 100;
  const w = 220, h = 90;
  const pts = trend.map((v, i) => `${(i / (trend.length - 1)) * w},${h - (v / max) * h}`).join(" ");
  return (
    <PhoneFrame>
      <header className="px-5 pt-6 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Link to="/home" className="pt-1"><ArrowLeft className="w-6 h-6 text-foreground" /></Link>
          <div>
            <div className="text-[22px] font-extrabold text-foreground leading-tight">Water Quality</div>
            <div className="flex items-center gap-1 text-primary text-[13px] font-medium mt-1"><MapPin className="w-4 h-4" /> Ashanti Region ▾</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative"><Bell className="w-6 h-6 text-foreground" /><span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">3</span></div>
          <img src={farmerImg} alt="Kofi" className="w-10 h-10 rounded-full object-cover border-2 border-primary" />
        </div>
      </header>

      <section className="mx-5 mt-4 rounded-2xl border border-border p-3 flex items-center gap-3">
        <img src={pondImg} alt="Pond" className="w-16 h-16 rounded-xl object-cover" />
        <div className="flex-1">
          <div className="text-[16px] font-extrabold text-foreground">Pond 1</div>
          <div className="text-[12px] text-muted-foreground">Tilapia Pond • 1,000 fish</div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1"><Calendar className="w-3 h-3 text-primary" /> Last checked: Today, 8:30 AM</div>
        </div>
        <span className="text-[11px] font-bold text-primary bg-secondary rounded-full px-2 py-1">Healthy</span>
        <ChevronDown className="w-5 h-5 text-muted-foreground" />
      </section>

      <div className="mt-4 px-5 flex gap-4 overflow-x-auto text-[13px] border-b border-border">
        {tabs.map((t, i) => (
          <button key={t} className={`pb-2 whitespace-nowrap ${i === 0 ? "text-primary border-b-2 border-primary font-bold" : "text-muted-foreground"}`}>{t}</button>
        ))}
      </div>

      <section className="mx-5 mt-4 rounded-2xl border border-border p-4 flex gap-3">
        <div className="w-24 shrink-0">
          <div className="text-[13px] font-extrabold text-foreground">Water Quality Score</div>
          <div className="mt-2 relative w-20 h-20 mx-auto">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15" strokeWidth="4" className="stroke-secondary" fill="none" />
              <circle cx="18" cy="18" r="15" strokeWidth="4" strokeDasharray="85 100" pathLength={100} className="stroke-primary" fill="none" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-[20px] font-extrabold text-foreground leading-none">85</div>
              <div className="text-[9px] text-muted-foreground">/100</div>
            </div>
          </div>
          <div className="text-center text-primary font-extrabold mt-1">Good</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="text-[13px] font-extrabold text-foreground">Score Trend <span className="text-muted-foreground font-normal">(7 Days)</span></div>
            <a className="text-primary text-[11px] font-semibold">View History</a>
          </div>
          <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-24 mt-1">
            <polyline fill="none" className="stroke-primary" strokeWidth="2" points={pts} />
            <polygon fill="currentColor" className="text-primary/10" points={`${pts} ${w},${h} 0,${h}`} />
          </svg>
          <div className="flex justify-between text-[9px] text-muted-foreground">
            <span>May 6</span><span>May 8</span><span>May 10</span><span>May 12</span>
          </div>
        </div>
      </section>

      <section className="mx-5 mt-4 grid grid-cols-2 gap-3">
        {params.map((p) => (
          <div key={p.label} className="rounded-xl border border-border p-3 bg-card">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${p.tint}`}><FlaskConical className="w-4 h-4" /></div>
              <div className="text-[12px] font-semibold text-foreground">{p.label}</div>
            </div>
            <div className="mt-1 text-[18px] font-extrabold text-foreground">{p.value} <span className="text-[11px] font-semibold text-muted-foreground">{p.unit}</span></div>
            <div className="text-[12px] font-bold text-primary">{p.status}</div>
            <div className="text-[10px] text-muted-foreground">{p.range}</div>
          </div>
        ))}
      </section>

      <section className="mx-5 mt-4 rounded-2xl bg-secondary/40 p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-primary-foreground" /></div>
        <div className="flex-1">
          <div className="text-[13px] font-extrabold text-primary">All parameters are within the good range.</div>
          <div className="text-[11px] text-muted-foreground">Keep monitoring regularly to maintain water quality.</div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </section>

      <section className="mx-5 mt-4 mb-6 rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between">
          <div className="text-[15px] font-extrabold text-foreground">Recent Tests</div>
          <a className="text-primary text-[12px] font-semibold flex items-center">View All <ChevronRight className="w-3 h-3" /></a>
        </div>
        {[
          { t: "Water quality checked", d: "All parameters normal", when: "Today, 8:30 AM", by: "Kwame Mensah", tint: "bg-blue-100 text-blue-700" },
          { t: "Water quality checked", d: "All parameters normal", when: "May 10, 7:45 AM", by: "Kwame Mensah", tint: "bg-secondary text-primary" },
          { t: "High temperature alert", d: "Temperature was 31°C", when: "May 8, 2:10 PM", by: "", tint: "bg-orange-100 text-orange-600" },
        ].map((r, i) => (
          <div key={i} className="mt-3 flex items-center gap-3 border-t border-border pt-3 first:border-0 first:pt-0">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${r.tint}`}>💧</div>
            <div className="flex-1">
              <div className="text-[13px] font-bold text-foreground">{r.t}</div>
              <div className="text-[11px] text-muted-foreground">{r.d}</div>
            </div>
            <div className="text-right text-[10px] text-muted-foreground">
              <div>{r.when}</div>
              {r.by && <div>By {r.by}</div>}
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        ))}
      </section>

      <BottomNav />
    </PhoneFrame>
  );
}
