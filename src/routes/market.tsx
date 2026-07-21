import { createFileRoute } from "@tanstack/react-router";
import { Menu, Bell, MapPin, Search, SlidersHorizontal, ShoppingCart, Tag, Package, Fish, FlaskConical, Wrench, MoreHorizontal, Star, ChevronRight, ShieldCheck } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import basket from "@/assets/market-basket.jpg";
import feedSacks from "@/assets/feed-sacks.jpg";
import pondImg from "@/assets/pond.jpg";
import sickFish from "@/assets/sick-fish.jpg";

export const Route = createFileRoute("/market")({
  component: MarketPage,
  head: () => ({
    meta: [
      { title: "Market — FishFarm OS Ghana" },
      { name: "description", content: "Buy and sell fish farming products with trusted farmers in Ghana." },
      { property: "og:title", content: "Market — FishFarm OS Ghana" },
      { property: "og:description", content: "Quality products. Fair prices. Trusted community." },
    ],
  }),
});

const categories = [
  { Icon: Package, label: "Fish Feed", tint: "bg-secondary text-primary" },
  { Icon: Fish, label: "Fingerlings", tint: "bg-blue-100 text-blue-700" },
  { Icon: FlaskConical, label: "Chemicals", tint: "bg-purple-100 text-purple-700" },
  { Icon: Wrench, label: "Equipment", tint: "bg-yellow-100 text-yellow-800" },
  { Icon: MoreHorizontal, label: "Other", tint: "bg-secondary text-primary" },
];

const products = [
  { name: "Premium Fish Feed (32% Protein)", price: "GHS 280.00", seller: "Aqua Feed Ghana", rating: "4.8 (56)", loc: "Kumasi", img: feedSacks },
  { name: "Tilapia Fingerlings (1-2 inches)", price: "GHS 150.00", seller: "FreshFish Farms", rating: "4.7 (34)", loc: "Ejisu", img: pondImg },
  { name: "Aquaculture Salt (25kg)", price: "GHS 120.00", seller: "WaterCare Ltd.", rating: "4.6 (28)", loc: "Accra", img: sickFish },
  { name: "Paddle Wheel Aerator (2HP)", price: "GHS 1,850.00", seller: "FarmTech Solutions", rating: "4.9 (18)", loc: "Takoradi", img: basket },
];

function MarketPage() {
  return (
    <PhoneFrame>
      <header className="px-5 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Menu className="w-6 h-6 text-foreground" />
          <div>
            <div className="text-[20px] font-extrabold text-foreground">Market</div>
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

      <section className="px-5 mt-4 flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input placeholder="Search for products, feed, equipment..." className="w-full h-12 rounded-xl bg-muted pl-10 pr-4 text-[14px] outline-none" />
        </div>
        <button className="w-12 h-12 rounded-xl border border-border bg-card flex items-center justify-center">
          <SlidersHorizontal className="w-5 h-5 text-foreground" />
        </button>
      </section>

      <section className="mx-5 mt-4 rounded-2xl bg-primary text-primary-foreground p-5 relative overflow-hidden">
        <div className="max-w-[60%]">
          <div className="text-[18px] font-extrabold leading-tight">Buy and Sell with Fellow Farmers</div>
          <div className="text-[13px] opacity-90 mt-2">Quality products. Fair prices. Trusted community.</div>
        </div>
        <img src={basket} alt="" loading="lazy" className="absolute right-0 bottom-0 w-36 h-36 object-cover" />
      </section>

      <section className="px-5 mt-4 grid grid-cols-2 gap-2">
        <button className="h-12 rounded-xl bg-secondary text-primary font-bold flex items-center justify-center gap-2">
          <ShoppingCart className="w-5 h-5" /> Buy
        </button>
        <button className="h-12 rounded-xl bg-card border border-border text-foreground font-bold flex items-center justify-center gap-2">
          <Tag className="w-5 h-5" /> Sell
        </button>
      </section>

      <section className="px-5 mt-5 flex justify-between">
        {categories.map(({ Icon, label, tint }) => (
          <button key={label} className="flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${tint}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="text-[11px] font-semibold text-foreground mt-1">{label}</div>
          </button>
        ))}
      </section>

      <section className="px-5 mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-extrabold text-foreground">Recommended for You</h2>
          <a href="#" className="text-primary font-semibold text-[14px] flex items-center gap-0.5">View All <ChevronRight className="w-4 h-4" /></a>
        </div>
        <div className="mt-3 flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {products.map((p) => (
            <div key={p.name} className="w-40 shrink-0 rounded-2xl border border-border bg-card p-2">
              <img src={p.img} alt={p.name} loading="lazy" className="w-full h-28 object-cover rounded-xl" />
              <div className="mt-2 text-[13px] font-bold text-foreground leading-tight line-clamp-2 min-h-[36px]">{p.name}</div>
              <div className="text-[14px] font-extrabold text-primary mt-1">{p.price}</div>
              <div className="text-[11px] text-muted-foreground">{p.seller}</div>
              <div className="text-[11px] flex items-center gap-1 mt-0.5">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {p.rating}
              </div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{p.loc}</div>
              <button className="mt-2 w-full h-8 rounded-lg bg-secondary text-primary text-[12px] font-bold flex items-center justify-center gap-1">
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-5 mt-4 mb-6 rounded-2xl bg-secondary/40 p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <div className="text-[14px] font-extrabold text-foreground">Buy with Confidence</div>
          <div className="text-[12px] text-muted-foreground">Trusted sellers. Quality guaranteed. Secure payments.</div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </section>

      <BottomNav />
    </PhoneFrame>
  );
}
