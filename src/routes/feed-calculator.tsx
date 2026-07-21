import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Bell, Lightbulb, X, ChevronDown, Info, Calculator, TrendingUp } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import pondImg from "@/assets/pond.jpg";
import feedBag from "@/assets/feed-bag-illus.png";
import iconFeedSack from "@/assets/icons/feed-sack.png";
import iconCalendar from "@/assets/icons/calendar-clock.png";
import iconWaterDrop from "@/assets/icons/water-drop.png";
import iconGrowth from "@/assets/icons/growth.png";

export const Route = createFileRoute("/feed-calculator")({
  component: FeedCalcPage,
  head: () => ({
    meta: [
      { title: "Feed Calculator — FishFarm OS Ghana" },
      { name: "description", content: "Calculate the right amount of feed for healthy growth and less waste." },
      { property: "og:title", content: "Feed Calculator — FishFarm OS Ghana" },
      { property: "og:description", content: "Right feed, right amount, every day." },
    ],
  }),
});

function FeedCalcPage() {
  return (
    <PhoneFrame>
      <header className="px-5 pt-6 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Link to="/home" className="pt-1"><ArrowLeft className="w-6 h-6 text-foreground" /></Link>
          <div>
            <div className="text-[22px] font-extrabold text-foreground leading-tight">Feed Calculator</div>
            <div className="text-[12px] text-muted-foreground mt-1 max-w-[220px] leading-snug">Calculate the right amount of feed for healthy growth and less waste.</div>
          </div>
        </div>
        <div className="flex items-center gap-3 pt-1">
          <div className="relative"><Bell className="w-6 h-6 text-foreground" /><span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">3</span></div>
          <img src={farmerImg} alt="Kofi" className="w-10 h-10 rounded-full object-cover border-2 border-primary" />
        </div>
      </header>

      <section className="mx-5 mt-5 rounded-2xl bg-secondary/50 p-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0"><Lightbulb className="w-5 h-5 text-primary-foreground" /></div>
        <div className="flex-1 text-[12px]">
          <span className="font-extrabold text-foreground">Tip: Accurate feeding improves growth and saves money. </span>
          <span className="text-muted-foreground">Avoid overfeeding to keep your pond healthy.</span>
        </div>
        <X className="w-4 h-4 text-muted-foreground" />
      </section>

      <section className="mx-5 mt-4 rounded-2xl border border-border p-4">
        <div className="text-[15px] font-extrabold text-foreground">1. Select Pond</div>
        <div className="mt-3 flex items-center gap-3">
          <img src={pondImg} alt="Pond" className="w-16 h-16 rounded-xl object-cover" />
          <div className="flex-1">
            <div className="text-[15px] font-extrabold text-foreground">Pond 1</div>
            <div className="text-[12px] text-muted-foreground">Tilapia Pond • 1,000 fish</div>
          </div>
          <span className="text-[11px] font-bold text-primary bg-secondary rounded-full px-2 py-1">Healthy</span>
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </div>
      </section>

      <section className="mx-5 mt-4">
        <div className="text-[15px] font-extrabold text-foreground">2. Enter Details</div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <InputCard icon={iconFeedSack} label="Average Fish Weight" value="250" unit="g" sub="Enter average weight per fish" />
          <InputCard icon={iconGrowth} label="Total Fish Count" value="1,000" unit="fish" sub="Total number of fish in pond" />
          <InputCard icon={iconFeedSack} label="Feed Type" value="Tilapia Feed (32%)" sub="Select the feed you are using" select />
          <InputCard icon={iconWaterDrop} label="Feeding Rate" value="2.5" unit="%" sub="% of total biomass per day" info />
          <InputCard icon={iconCalendar} label="Feeding Frequency" value="2 times a day" sub="How many times you feed daily" select />
          <InputCard icon={iconWaterDrop} label="Adjust for Temperature" value="28°C (Optimal)" sub="Affects fish appetite and feeding" select />
        </div>
      </section>

      <button className="mx-5 mt-5 h-12 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2">
        <Calculator className="w-5 h-5" /> Calculate Feed Amount
      </button>

      <section className="mx-5 mt-4 rounded-2xl bg-secondary/40 p-4">
        <div className="text-[15px] font-extrabold text-primary">3. Results</div>
        <div className="text-[12px] text-muted-foreground">Recommended daily feed</div>
        <div className="mt-3 flex items-start gap-3">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <img src={feedBag} alt="" className="w-16 h-16 object-contain" />
          </div>
          <div className="flex-1">
            <div className="text-[13px] font-bold text-foreground">Total Feed Needed</div>
            <div className="text-[28px] font-extrabold text-primary leading-tight">6.25 <span className="text-[14px] font-bold text-foreground">kg/day</span></div>
            <div className="text-[11px] text-muted-foreground bg-card border border-border rounded-full px-2 py-0.5 inline-block mt-1">This equals 3.13 kg per feeding</div>
          </div>
          <div className="rounded-xl bg-card border border-border p-2 text-[11px]">
            <div className="font-semibold text-foreground">Weekly Feed</div>
            <div className="font-extrabold text-primary">43.75 kg</div>
            <div className="font-semibold text-foreground mt-1">Monthly Feed</div>
            <div className="font-extrabold text-primary">187.50 kg</div>
          </div>
        </div>
        <div className="mt-3 flex items-start gap-2 text-[12px]">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div><span className="font-bold text-foreground">Note:</span> <span className="text-muted-foreground">Monitor fish behavior and adjust if necessary. Remove uneaten feed after 30 minutes.</span></div>
        </div>
        <div className="mt-3 rounded-xl bg-blue-50 text-blue-700 p-3 text-[12px] flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> Good job! Your feeding rate is optimal for healthy growth.
        </div>
      </section>

      <section className="mx-5 mt-4 mb-6 rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between">
          <div className="text-[15px] font-extrabold text-foreground">Feeding Guide</div>
          <a className="text-primary text-[12px] font-semibold">View Full Guide</a>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center">
          {[
            { size: "Small Fish", w: "< 50g", r: "3 – 5%", tint: "bg-blue-50" },
            { size: "Medium", w: "50g – 200g", r: "2 – 3%", tint: "bg-secondary/60" },
            { size: "Large", w: "200g – 500g", r: "1.5 – 2%", tint: "bg-yellow-50" },
            { size: "Very Large", w: "> 500g", r: "1 – 1.5%", tint: "bg-purple-50" },
          ].map((g) => (
            <div key={g.size} className={`${g.tint} rounded-xl p-2`}>
              <div className="w-8 h-8 rounded-full bg-white mx-auto flex items-center justify-center">🐟</div>
              <div className="text-[11px] font-bold text-foreground mt-1">{g.size}</div>
              <div className="text-[10px] text-muted-foreground">{g.w}</div>
              <div className="text-[11px] font-extrabold text-primary">{g.r}</div>
            </div>
          ))}
        </div>
      </section>

      <BottomNav />
    </PhoneFrame>
  );
}

function InputCard({ icon, label, value, unit, sub, select, info }: { icon: string; label: string; value: string; unit?: string; sub: string; select?: boolean; info?: boolean }) {
  return (
    <div className="rounded-xl border border-border p-3 bg-card">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-secondary/60 flex items-center justify-center overflow-hidden">
          <img src={icon} alt="" className="w-6 h-6 object-contain" />
        </div>
        <div className="text-[12px] font-semibold text-foreground">{label}</div>
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <div className="text-[18px] font-extrabold text-foreground truncate">{value}</div>
        {unit && <div className="text-[11px] text-muted-foreground">{unit}</div>}
        {select && <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </div>
      <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
        {sub}{info && <Info className="w-3 h-3" />}
      </div>
    </div>
  );
}
