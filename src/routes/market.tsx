import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ShoppingCart, ArrowLeft, Search, Filter, ShoppingBag, ShieldCheck, Tag, Plus, Check, Truck, Zap } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import feedSacks from "@/assets/feed-sacks.jpg";
import buyFeedImg from "@/assets/icons/buy-feed.png";
import sellFishImg from "@/assets/icons/sell-fish.png";
import marketPricesImg from "@/assets/icons/market-prices.png";

export const Route = createFileRoute("/market")({
  component: MarketPage,
  head: () => ({
    meta: [
      { title: "Marketplace & Supplies Store — Fish Doctor" },
      { name: "description", content: "Buy fish feeds, tools, water test kits, and live fingerlings." },
    ],
  }),
});

interface MarketItem {
  id: string;
  category: "feeds" | "equipment" | "supplies" | "fish";
  title: string;
  priceGHS: number;
  unit: string;
  rating: number;
  seller: string;
  tag?: string;
  image: string;
}

const marketCatalog: MarketItem[] = [
  {
    id: "f1",
    category: "feeds",
    title: "Raanan Catfish Feed (45% Protein)",
    priceGHS: 245,
    unit: "15kg Bag",
    rating: 4.9,
    seller: "Raanan Official Feed Ghana",
    tag: "Wholesale Group Buy",
    image: buyFeedImg,
  },
  {
    id: "f2",
    category: "feeds",
    title: "Aller Aqua Tilapia Pellets (3mm)",
    priceGHS: 230,
    unit: "15kg Bag",
    rating: 4.8,
    seller: "Aller Aqua Ghana Ltd",
    tag: "15% Off Wholesale",
    image: buyFeedImg,
  },
  {
    id: "e1",
    category: "equipment",
    title: "Solar Surface Aerator (1.5 HP)",
    priceGHS: 3400,
    unit: "Unit",
    rating: 5.0,
    seller: "AquaTech Solar Ghana",
    tag: "Top Rated",
    image: marketPricesImg,
  },
  {
    id: "s1",
    category: "supplies",
    title: "Aquaculture Salt (99% Pure)",
    priceGHS: 65,
    unit: "25kg Sack",
    rating: 4.9,
    seller: "Ghana Salt & Chemicals",
    tag: "Disease Prevention",
    image: sellFishImg,
  },
  {
    id: "f3",
    category: "fish",
    title: "High-Growth Catfish Fingerlings",
    priceGHS: 1.8,
    unit: "Piece (Min 500)",
    rating: 4.9,
    seller: "Akosombo Hatcheries",
    tag: "Fast Grower",
    image: sellFishImg,
  },
];

export function MarketPage() {
  const [activeCategory, setActiveCategory] = useState<"all" | "feeds" | "equipment" | "supplies" | "fish">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);

  const filteredItems = marketCatalog.filter((item) => {
    const matchesCat = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.seller.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <PhoneFrame>
      {/* Header */}
      <header className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-[#0F6236]/10 bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <Link to="/home" className="p-1 hover:bg-emerald-50 rounded-full">
            <ArrowLeft className="w-5.5 h-5.5 text-gray-900" />
          </Link>
          <h1 className="text-[19px] font-extrabold text-gray-900 leading-tight">Fish Farm Marketplace</h1>
        </div>
        <div className="relative p-2 rounded-2xl bg-[#0F6236]/10 text-[#0F6236]">
          <ShoppingBag className="w-5.5 h-5.5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#0F6236] text-white text-[10px] font-extrabold flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </div>
      </header>

      {/* Hero Banner */}
      <section className="mx-5 mt-4 rounded-3xl bg-gradient-to-br from-[#09341D] via-[#0F6236] to-[#082917] text-white p-5 shadow-xl shadow-[#0F6236]/30 border border-emerald-500/20 relative overflow-hidden">
        <div className="max-w-[70%]">
          <span className="text-[10.5px] font-extrabold bg-amber-400 text-gray-950 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Direct Farm Wholesale
          </span>
          <h2 className="text-lg font-extrabold mt-1.5 leading-tight">Verified Feeds & Tools Store</h2>
          <p className="text-xs text-emerald-100 mt-1 font-medium leading-relaxed">Save up to 15% on wholesale feed group buys with free delivery across Ghana.</p>
        </div>
        <img src={feedSacks} alt="Feed sacks" className="absolute right-0 bottom-0 w-28 h-28 object-cover rounded-tl-3xl opacity-90 shadow-lg" />
      </section>

      {/* Category Tabs */}
      <section className="px-5 mt-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { id: "all", label: "All Items" },
            { id: "feeds", label: "🌾 Feeds" },
            { id: "equipment", label: "⚙️ Equipment" },
            { id: "supplies", label: "🧪 Supplies" },
            { id: "fish", label: "🐟 Live Fish" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold shrink-0 transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-[#0F6236] text-white shadow-md shadow-[#0F6236]/25"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-emerald-50/50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Search Bar */}
      <section className="px-5 mt-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search feeds, aerators, salt, fingerlings..."
            className="w-full h-11 pl-10 pr-4 text-xs font-semibold bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#0F6236]/20 shadow-2xs"
          />
        </div>
      </section>

      {/* Catalog Grid */}
      <section className="px-5 mt-4 space-y-3 mb-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="emerald-card p-4 rounded-3xl flex items-center justify-between gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#0F6236]/10 border border-[#0F6236]/20 flex items-center justify-center shrink-0">
              <img src={item.image} alt="" className="w-10 h-10 object-contain" />
            </div>

            <div className="flex-1 min-w-0">
              {item.tag && (
                <span className="text-[9.5px] font-extrabold text-[#0F6236] bg-[#0F6236]/10 px-2 py-0.5 rounded-full inline-block mb-1">
                  {item.tag}
                </span>
              )}
              <h3 className="text-xs font-extrabold text-gray-900 truncate">{item.title}</h3>
              <div className="text-[11px] text-gray-500 font-semibold">{item.seller}</div>
              <div className="text-sm font-extrabold text-gray-900 mt-1">
                GHS {item.priceGHS} <span className="text-[10.5px] text-gray-400 font-medium">/ {item.unit}</span>
              </div>
            </div>

            <button
              onClick={() => setCartCount((prev) => prev + 1)}
              className="px-3.5 py-2.5 rounded-2xl bg-[#0F6236] hover:bg-[#0B4D29] text-white text-xs font-extrabold shadow-md shrink-0 cursor-pointer transition-all active:scale-95 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Order
            </button>
          </div>
        ))}
      </section>

      <BottomNav />
    </PhoneFrame>
  );
}
