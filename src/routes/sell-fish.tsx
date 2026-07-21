import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Bell, MapPin, ShieldCheck, TrendingUp, Zap, Plus, List, MoreVertical, ChevronRight, Users, Clock, Tag, Lightbulb } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import hero from "@/assets/sell-hero.jpg";
import tilapia from "@/assets/harvest-tilapia.jpg";
import catfish from "@/assets/harvest-catfish.jpg";

export const Route = createFileRoute("/sell-fish")({
  component: SellFishPage,
  head: () => ({
    meta: [
      { title: "Sell Fish Marketplace — FishFarm OS Ghana" },
      { name: "description", content: "List your harvests and reach trusted buyers across Ghana." },
      { property: "og:title", content: "Sell Fish — FishFarm OS Ghana" },
      { property: "og:description", content: "Sell your fish. Grow your business." },
      { property: "og:image", content: hero },
    ],
  }),
});

const listings = [
  { name: "Tilapia", size: "500 – 800g", qty: 250, loc: "Ejisu, Ashanti Region", price: "GH¢ 12.50", when: "Today, 8:30 AM", state: "Active", offers: 3, img: tilapia },
  { name: "Catfish", size: "1.0 – 1.5kg", qty: 120, loc: "Mampong, Ashanti Region", price: "GH¢ 18.00", when: "Yesterday, 6:15 PM", state: "Active", offers: 5, img: catfish },
  { name: "Tilapia", size: "300 – 500g", qty: 300, loc: "Kumasi, Ashanti Region", price: "GH¢ 11.00", when: "May 11, 2025", state: "Pending", img: tilapia },
];

function SellFishPage() {
  return (
    <PhoneFrame>
      <header className="px-5 pt-6 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Link to="/market" className="pt-1"><ArrowLeft className="w-6 h-6 text-foreground" /></Link>
          <div>
            <div className="text-[20px] font-extrabold text-foreground leading-tight">Sell Fish Marketplace</div>
            <div className="flex items-center gap-1 text-primary text-[13px] font-medium mt-1"><MapPin className="w-4 h-4" /> Ashanti Region ▾</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative"><Bell className="w-6 h-6 text-foreground" /><span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">3</span></div>
          <img src={farmerImg} alt="Kofi" className="w-10 h-10 rounded-full object-cover border-2 border-primary" />
        </div>
      </header>

      <section className="mx-5 mt-4 rounded-2xl bg-secondary/50 p-4 relative overflow-hidden">
        <div className="max-w-[55%]">
          <div className="text-[16px] font-extrabold text-primary leading-tight">Sell Your Fish. Grow Your Business.</div>
          <div className="text-[11px] text-muted-foreground mt-1">Connect with trusted buyers and get the best prices for your fish.</div>
          <div className="mt-3 flex gap-2 flex-wrap">
            <Pill Icon={ShieldCheck} label="Trusted Buyers" />
            <Pill Icon={TrendingUp} label="Best Prices" />
            <Pill Icon={Zap} label="Fast Payment" />
          </div>
        </div>
        <img src={hero} alt="" className="absolute right-0 bottom-0 w-40 h-full object-cover" />
      </section>

      <section className="mx-5 mt-4 grid grid-cols-2 rounded-2xl bg-primary text-primary-foreground overflow-hidden">
        <button className="p-4 text-left flex items-center gap-2">
          <Plus className="w-5 h-5" />
          <div>
            <div className="font-extrabold text-[14px]">List New Fish</div>
            <div className="text-[11px] opacity-80">Create a new listing</div>
          </div>
        </button>
        <button className="p-4 text-left flex items-center gap-2 border-l border-white/20">
          <List className="w-5 h-5" />
          <div>
            <div className="font-extrabold text-[14px]">My Listings</div>
            <div className="text-[11px] opacity-80">Manage your listings</div>
          </div>
        </button>
      </section>

      <section className="mx-5 mt-4 rounded-2xl border border-border p-4">
        <div className="text-[14px] font-extrabold text-foreground">Quick Sell <span className="text-[11px] font-normal text-muted-foreground">(Post in minutes)</span></div>
        <div className="mt-3 flex items-start justify-between">
          {["Add Details", "Set Price", "Find Buyers", "Get Paid"].map((s, i) => (
            <div key={s} className="flex-1 flex flex-col items-center text-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold ${i === 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{i + 1}</div>
              <div className="text-[11px] font-bold text-foreground mt-1">{s}</div>
              <div className="text-[9px] text-muted-foreground leading-tight px-1">{["Fish type, size, quantity","Choose your price","Buyers see your listing","Secure & fast payment"][i]}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-5 mt-4 rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between">
          <div className="text-[15px] font-extrabold text-foreground">Recent Listings</div>
          <a className="text-primary text-[12px] font-semibold flex items-center">View All <ChevronRight className="w-3 h-3" /></a>
        </div>
        {listings.map((l, i) => (
          <div key={i} className="mt-3 flex gap-3 border-t border-border pt-3 first:border-0 first:pt-0">
            <div className="relative">
              <img src={l.img} alt="" className="w-20 h-20 rounded-lg object-cover" />
              <span className={`absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded ${l.state === "Active" ? "bg-secondary text-primary" : "bg-yellow-100 text-yellow-700"}`}>{l.state}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[14px] font-extrabold text-foreground">{l.name}</div>
                  <div className="text-[11px] text-muted-foreground">{l.size}</div>
                  <div className="text-[11px] text-muted-foreground">Quantity: {l.qty} fish</div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3 text-primary" />{l.loc}</div>
                </div>
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[14px] font-extrabold text-primary">{l.price}<span className="text-[10px] text-muted-foreground">/kg</span></div>
              <div className="text-[10px] text-muted-foreground">Posted: {l.when}</div>
              <button className="mt-2 text-primary text-[11px] font-bold border border-primary rounded-md px-2 py-1">{l.offers ? `View Offers (${l.offers})` : "Edit Listing"}</button>
            </div>
          </div>
        ))}
      </section>

      <section className="mx-5 mt-4 rounded-2xl bg-secondary/40 p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-primary-foreground" /></div>
        <div className="flex-1">
          <div className="text-[13px] font-extrabold text-primary">Safe. Secure. Reliable.</div>
          <div className="text-[11px] text-muted-foreground">All transactions are protected. Get paid securely after delivery confirmation.</div>
        </div>
        <a className="text-primary text-[11px] font-semibold flex items-center">Learn More <ChevronRight className="w-3 h-3" /></a>
      </section>

      <section className="mx-5 mt-4 rounded-2xl border border-border p-4">
        <div className="text-[14px] font-extrabold text-foreground">Market Insights</div>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center">
          {[
            { Icon: TrendingUp, t: "High Demand", d: "Tilapia, Catfish", sub: "This Week", tint: "bg-blue-50 text-blue-700" },
            { Icon: Tag, t: "Best Price", d: "GH¢ 18.00/kg", sub: "Catfish", tint: "bg-secondary text-primary" },
            { Icon: Users, t: "Active Buyers", d: "24", sub: "In your region", tint: "bg-purple-100 text-purple-700" },
            { Icon: Clock, t: "Avg. Response", d: "2.5 hours", sub: "From buyers", tint: "bg-yellow-100 text-yellow-700" },
          ].map((m, i) => (
            <div key={i} className="rounded-xl p-2">
              <div className={`w-9 h-9 rounded-full mx-auto flex items-center justify-center ${m.tint}`}><m.Icon className="w-4 h-4" /></div>
              <div className="text-[11px] font-bold text-foreground mt-1">{m.t}</div>
              <div className="text-[10px] font-extrabold text-primary">{m.d}</div>
              <div className="text-[9px] text-muted-foreground">{m.sub}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-5 mt-4 mb-6 rounded-xl bg-yellow-50 p-3 text-[11px] flex items-start gap-2">
        <Lightbulb className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
        <div><span className="font-bold text-foreground">Tip:</span> <span className="text-muted-foreground">Clear photos and accurate details help you get better offers faster.</span></div>
      </section>

      <BottomNav />
    </PhoneFrame>
  );
}

function Pill({ Icon, label }: { Icon: any; label: string }) {
  return (
    <div className="flex items-center gap-1 bg-white rounded-full px-2 py-1 text-[10px] font-semibold text-foreground border border-border">
      <Icon className="w-3 h-3 text-primary" /> {label}
    </div>
  );
}
