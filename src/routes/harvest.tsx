import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Bell, MapPin, Leaf, ShieldCheck, Truck, SlidersHorizontal, ChevronDown, Star, BadgeCheck, Headphones, CreditCard, ChevronRight } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import hero from "@/assets/harvest-hero.jpg";
import tilapia from "@/assets/harvest-tilapia.jpg";
import catfish from "@/assets/harvest-catfish.jpg";

export const Route = createFileRoute("/harvest")({
  component: HarvestPage,
  head: () => ({
    meta: [
      { title: "Harvest Marketplace — FishFarm OS Ghana" },
      { name: "description", content: "Buy quality fish directly from trusted farmers in Ghana." },
      { property: "og:title", content: "Harvest Marketplace — FishFarm OS Ghana" },
      { property: "og:description", content: "Fresh harvests. Ready for you." },
      { property: "og:image", content: hero },
    ],
  }),
});

const cats = [
  { label: "All Fish", tint: "bg-secondary text-primary" },
  { label: "Tilapia", tint: "bg-blue-100 text-blue-700" },
  { label: "Catfish", tint: "bg-purple-100 text-purple-700" },
  { label: "Clarias", tint: "bg-yellow-100 text-yellow-700" },
  { label: "Mixed", tint: "bg-secondary/60 text-primary" },
  { label: "Other", tint: "bg-muted text-foreground" },
];

const items = [
  { img: tilapia, name: "Tilapia", size: "500g – 1kg", loc: "Ejisu, Ashanti Region", farm: "Kwame Mensah Farms", rating: "4.8 (32)", price: "GH¢ 14.50", avail: 200, harvest: "Today, 6:00 AM" },
  { img: catfish, name: "Catfish", size: "1 – 1.5kg", loc: "Mampong, Ashanti Region", farm: "Baffour Aquafarm", rating: "4.7 (28)", price: "GH¢ 17.00", avail: 150, harvest: "Today, 7:30 AM" },
  { img: catfish, name: "Clarias (Konkonte)", size: "1.5 – 2kg", loc: "Bekwai, Ashanti Region", farm: "Osei Fish Farms", rating: "4.6 (18)", price: "GH¢ 19.00", avail: 100, harvest: "Yesterday, 5:00 PM" },
  { img: tilapia, name: "Mixed Fish", size: "300g – 1kg", loc: "Kumasi, Ashanti Region", farm: "Yaa Adwoa Farms", rating: "4.9 (41)", price: "GH¢ 13.00", avail: 250, harvest: "Yesterday, 8:00 AM" },
];

function HarvestPage() {
  return (
    <PhoneFrame>
      <header className="px-5 pt-6 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Link to="/market" className="pt-1"><ArrowLeft className="w-6 h-6 text-foreground" /></Link>
          <div>
            <div className="text-[20px] font-extrabold text-foreground leading-tight">Harvest Marketplace</div>
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
          <div className="text-[16px] font-extrabold text-primary leading-tight">Fresh Harvests. Ready for You.</div>
          <div className="text-[11px] text-muted-foreground mt-1">Buy quality fish directly from trusted farmers and get the best value.</div>
          <div className="mt-3 flex gap-2 flex-wrap">
            <Pill Icon={Leaf} label="Fresh & Healthy" />
            <Pill Icon={ShieldCheck} label="Verified" />
            <Pill Icon={Truck} label="Fast Delivery" />
          </div>
        </div>
        <img src={hero} alt="" className="absolute right-0 bottom-0 w-44 h-full object-cover" />
      </section>

      <section className="px-5 mt-4 flex gap-2 overflow-x-auto -mx-1 px-6 pb-1">
        {cats.map((c, i) => (
          <button key={c.label} className={`shrink-0 rounded-xl px-3 py-2 text-[12px] font-bold flex items-center gap-2 border ${i === 0 ? "border-primary" : "border-border bg-card"}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${c.tint}`}>🐟</span>
            {c.label}
          </button>
        ))}
      </section>

      <section className="px-5 mt-3 flex items-center justify-between">
        <button className="rounded-lg border border-border px-3 py-1.5 text-[12px] font-bold flex items-center gap-1"><SlidersHorizontal className="w-4 h-4" /> Filters</button>
        <div className="text-[12px] text-muted-foreground">120+ harvests available</div>
        <button className="rounded-lg border border-border px-3 py-1.5 text-[12px] font-bold flex items-center gap-1">Newest <ChevronDown className="w-4 h-4" /></button>
      </section>

      <section className="mx-5 mt-4 rounded-2xl border border-border divide-y divide-border">
        {items.map((it, i) => (
          <div key={i} className="p-3 flex gap-3">
            <div className="relative shrink-0">
              <img src={it.img} alt="" className="w-24 h-24 rounded-lg object-cover" />
              <span className="absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-secondary text-primary">Fresh</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-extrabold text-foreground">{it.name}</div>
              <div className="text-[11px] text-muted-foreground">{it.size}</div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3 text-primary" />{it.loc}</div>
              <div className="mt-1 flex items-center gap-1">
                <img src={farmerImg} alt="" className="w-5 h-5 rounded-full object-cover" />
                <span className="text-[11px] font-bold text-foreground truncate">{it.farm}</span>
                <BadgeCheck className="w-3 h-3 text-primary" />
              </div>
              <div className="text-[10px] flex items-center gap-1 text-muted-foreground">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {it.rating} reviews
              </div>
            </div>
            <div className="text-right shrink-0 flex flex-col justify-between">
              <div>
                <div className="text-[14px] font-extrabold text-primary">{it.price}<span className="text-[10px] text-muted-foreground">/kg</span></div>
                <div className="text-[10px] text-muted-foreground">Available: {it.avail} kg</div>
                <div className="text-[10px] text-muted-foreground">Harvested: {it.harvest}</div>
              </div>
              <button className="mt-2 bg-primary text-primary-foreground text-[11px] font-bold rounded-md px-3 py-1.5">View Details</button>
            </div>
          </div>
        ))}
      </section>

      <section className="mx-5 mt-4 rounded-2xl bg-secondary/40 p-3 grid grid-cols-4 gap-2 text-center">
        {[
          { Icon: ShieldCheck, t: "Quality Assured", d: "Inspected for quality" },
          { Icon: CreditCard, t: "Secure Payment", d: "Escrow protection" },
          { Icon: Truck, t: "Reliable Delivery", d: "Fast to your location" },
          { Icon: Headphones, t: "Support", d: "We're here to help" },
        ].map((f, i) => (
          <div key={i}>
            <f.Icon className="w-5 h-5 text-primary mx-auto" />
            <div className="text-[10px] font-bold text-foreground mt-1">{f.t}</div>
            <div className="text-[9px] text-muted-foreground leading-tight">{f.d}</div>
          </div>
        ))}
      </section>

      <section className="mx-5 mt-4 mb-6 rounded-2xl bg-secondary/50 p-4 flex items-center gap-3">
        <img src={farmerImg} alt="" className="w-12 h-12 rounded-full object-cover" />
        <div className="flex-1">
          <div className="text-[13px] font-extrabold text-primary">Are you a farmer?</div>
          <div className="text-[11px] text-muted-foreground">List your harvests and reach more buyers across Ghana.</div>
        </div>
        <Link to="/sell-fish" className="text-primary border border-primary rounded-lg px-3 py-1.5 text-[12px] font-bold flex items-center gap-1">Start Selling <ChevronRight className="w-3 h-3" /></Link>
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
