import { createFileRoute, Link } from "@tanstack/react-router";
import { Menu, Bell, MapPin, Check, ChevronRight, Volume2, Play } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import feedSacks from "@/assets/feed-sacks.jpg";
import fishDecor from "@/assets/fish-decor.jpg";

import iconFeedSack from "@/assets/icons/feed-sack.png";
import iconWaterDrop from "@/assets/icons/water-drop.png";
import iconGrowth from "@/assets/icons/growth.png";
import iconCalendar from "@/assets/icons/calendar-clock.png";
import iconFeedCalc from "@/assets/icons/feed-calculator.png";
import iconAiDoctor from "@/assets/icons/ai-fish-doctor.png";
import iconBuyFeed from "@/assets/icons/buy-feed.png";
import iconSellFish from "@/assets/icons/sell-fish.png";
import iconMarketPrices from "@/assets/icons/market-prices.png";
import iconLoans from "@/assets/icons/loans.png";
import iconSupport from "@/assets/icons/support.png";

export const Route = createFileRoute("/home")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Home — FishFarm OS Ghana" },
      { name: "description", content: "Your fish farm dashboard: today's status, quick actions and community group buys." },
      { property: "og:title", content: "Home — FishFarm OS Ghana" },
      { property: "og:description", content: "Your fish farm dashboard for Ghana." },
    ],
  }),
});

const quickActions: { img: string; label: string; tint: string; to?: string }[] = [
  { img: iconFeedCalc, label: "Feed Calculator", tint: "bg-secondary/60" },
  { img: iconAiDoctor, label: "AI Fish Doctor", tint: "bg-blue-50", to: "/ai-doctor" },
  { img: iconBuyFeed, label: "Buy Feed", tint: "bg-secondary/60" },
  { img: iconSellFish, label: "Sell Fish", tint: "bg-secondary/60" },
  { img: iconWaterDrop, label: "Water Monitor", tint: "bg-blue-50" },
  { img: iconMarketPrices, label: "Market Prices", tint: "bg-yellow-50" },
  { img: iconLoans, label: "Loans & Credit", tint: "bg-secondary/60" },
  { img: iconSupport, label: "Extension Support", tint: "bg-yellow-50" },
];

function HomePage() {
  return (
    <PhoneFrame>
      <header className="px-5 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Menu className="w-6 h-6 text-foreground" />
          <div>
            <div className="text-[20px] font-extrabold text-foreground">Akwaaba, Kofi 👋</div>
            <div className="flex items-center gap-1 text-primary text-[13px] font-medium">
              <MapPin className="w-4 h-4" /> Ashanti Region ▾
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-6 h-6 text-foreground" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-background" />
          </div>
          <img src={farmerImg} alt="Kofi" className="w-10 h-10 rounded-full object-cover border-2 border-primary" />
        </div>
      </header>

      <section className="mx-5 mt-5 rounded-2xl bg-primary text-primary-foreground p-5 relative overflow-hidden">
        <img src={fishDecor} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover opacity-25" />
        <div className="relative">
          <div className="text-[13px] opacity-90">Today's Farm Status</div>
          <div className="mt-1 text-[22px] font-extrabold leading-tight">All systems normal</div>
          <div className="mt-1 text-[13px] opacity-90">Great job! Keep it up.</div>
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/25 flex items-center justify-center">
          <Check className="w-8 h-8 text-white" strokeWidth={3} />
        </div>
      </section>

      <section className="px-5 mt-4 grid grid-cols-2 gap-3">
        <StatCard tint="bg-secondary/60" img={iconFeedSack} label="Feed Today" value="4 Bags" sub="Recommended" />
        <StatCard tint="bg-blue-50" img={iconWaterDrop} label="Water Quality" value="Good" sub="No issues" />
        <StatCard tint="bg-yellow-50" img={iconGrowth} label="Fish Growth" value="On Track" sub="↑ 12%" />
        <StatCard tint="bg-purple-50" img={iconCalendar} label="Days to Harvest" value="21 Days" sub="Estimated" />
      </section>

      <section className="mx-5 mt-4 rounded-2xl border border-border bg-card p-3 flex items-center gap-3">
        <button className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shrink-0">
          <Volume2 className="w-5 h-5 text-primary-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-extrabold text-primary">Daily Voice Assistant</div>
          <div className="mt-1 flex items-end gap-[2px] h-5">
            {Array.from({ length: 32 }).map((_, i) => {
              const h = 4 + Math.abs(Math.sin(i * 0.6)) * 14;
              return <span key={i} className="w-[3px] bg-primary/70 rounded-full" style={{ height: `${h}px` }} />;
            })}
          </div>
          <div className="mt-1 text-[11px] text-primary font-semibold inline-flex items-center gap-1"><Play className="w-3 h-3 fill-primary" /> Tap to listen in Twi</div>
        </div>
        <div className="text-[11px] font-bold text-muted-foreground">00:45</div>
      </section>

      <section className="px-5 mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-extrabold text-foreground">Quick Actions</h2>
          <a href="#" className="text-primary font-semibold text-[14px] flex items-center gap-0.5">View All <ChevronRight className="w-4 h-4" /></a>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-3">
          {quickActions.map(({ img, label, tint, to }) => {
            const inner = (
              <>
                <div className={`w-full aspect-square rounded-xl border border-border flex items-center justify-center ${tint}`}>
                  <img src={img} alt="" loading="lazy" width={512} height={512} className="w-9 h-9 object-contain" />
                </div>
                <div className="text-[11px] font-semibold text-center mt-1.5 text-foreground leading-tight">{label}</div>
              </>
            );
            return to ? (
              <Link key={label} to={to as any} className="flex flex-col items-center">{inner}</Link>
            ) : (
              <button key={label} className="flex flex-col items-center">{inner}</button>
            );
          })}
        </div>
      </section>

      <section className="mx-5 mt-6 rounded-2xl bg-secondary/50 p-5 relative overflow-hidden">
        <div className="max-w-[55%]">
          <div className="text-[18px] font-extrabold text-foreground">Community Feed Buy</div>
          <div className="text-primary font-bold mt-1">Save up to 15%</div>
          <div className="text-[13px] text-muted-foreground mt-1">300+ farmers in your area buying together</div>
          <button className="mt-4 bg-primary text-primary-foreground font-bold rounded-full px-5 py-2 text-[14px]">Join Group Buy</button>
        </div>
        <img src={feedSacks} alt="Feed sacks" loading="lazy" className="absolute right-0 bottom-0 w-40 h-40 object-cover" />
      </section>

      <div className="flex-1" />
      <BottomNav />
    </PhoneFrame>
  );
}

function StatCard({ tint, img, label, value, sub }: { tint: string; img: string; label: string; value: string; sub: string }) {
  return (
    <div className={`${tint} rounded-2xl p-3 flex items-center gap-3`}>
      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 overflow-hidden">
        <img src={img} alt="" loading="lazy" width={512} height={512} className="w-9 h-9 object-contain" />
      </div>
      <div className="min-w-0">
        <div className="text-[12px] text-muted-foreground">{label}</div>
        <div className="text-[16px] font-extrabold text-foreground leading-tight">{value}</div>
        <div className="text-[11px] text-muted-foreground">{sub}</div>
      </div>
    </div>
  );
}
