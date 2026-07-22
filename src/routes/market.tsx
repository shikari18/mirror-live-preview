import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { MapPin, Search, ShoppingCart, Tag, Package, Fish, FlaskConical, Wrench, ChevronRight, ShieldCheck, Sparkles, TrendingUp, Loader2 } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import basket from "@/assets/market-basket.jpg";
import feedSacks from "@/assets/feed-sacks.jpg";
import pondImg from "@/assets/pond.jpg";
import sickFish from "@/assets/sick-fish.jpg";
import { getAIMarketInsights } from "@/lib/gemini";
import { useLanguage } from "@/lib/languageContext";

export const Route = createFileRoute("/market")({
  component: MarketPage,
  head: () => ({
    meta: [
      { title: "Market — FishFarm OS Ghana" },
      { name: "description", content: "Buy and sell fish farming products with trusted farmers in Ghana." },
    ],
  }),
});

const products = [
  { name: "Premium Fish Feed (32% Protein)", price: "GH₵ 280.00", seller: "Aqua Feed Ghana", rating: "4.8 (56)", loc: "Kumasi", img: feedSacks },
  { name: "Tilapia Fingerlings (1-2 inches)", price: "GH₵ 150.00 / 100 pcs", seller: "FreshFish Farms", rating: "4.7 (34)", loc: "Ejisu", img: pondImg },
  { name: "Aquaculture Salt (25kg Bag)", price: "GH₵ 120.00", seller: "WaterCare Ltd.", rating: "4.6 (28)", loc: "Accra", img: sickFish },
  { name: "Paddle Wheel Aerator (2HP)", price: "GH₵ 1,850.00", seller: "FarmTech Solutions", rating: "4.9 (18)", loc: "Takoradi", img: basket },
];

export function MarketPage() {
  const { t } = useLanguage();
  const [selectedFish, setSelectedFish] = useState<string>("Catfish");
  const [marketInsight, setMarketInsight] = useState<any | null>(null);
  const [loadingAI, setLoadingAI] = useState<boolean>(false);

  useEffect(() => {
    fetchInsights(selectedFish);
  }, [selectedFish]);

  const fetchInsights = async (fishType: string) => {
    setLoadingAI(true);
    try {
      const res = await getAIMarketInsights(fishType);
      setMarketInsight(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <PhoneFrame>
      {/* Header */}
      <header className="px-5 pt-6 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-extrabold text-foreground">{t("market")}</h1>
          <div className="flex items-center gap-1 text-[#0F6236] text-[13px] font-medium mt-0.5">
            <MapPin className="w-4 h-4" /> Greater Accra & Ashanti, Ghana
          </div>
        </div>
        <img src={farmerImg} alt="Kofi" className="w-10 h-10 rounded-full object-cover border-2 border-[#0F6236]" />
      </header>

      {/* Buy & Sell Quick Action Bar */}
      <section className="px-5 mt-4 grid grid-cols-2 gap-2.5">
        <Link to="/harvest" className="h-12 rounded-2xl bg-[#0F6236] text-white font-bold flex items-center justify-center gap-2 shadow-md shadow-[#0F6236]/20">
          <ShoppingCart className="w-5 h-5" /> Buy Inputs & Feed
        </Link>
        <Link to="/sell-fish" className="h-12 rounded-2xl bg-white border border-gray-200 text-gray-900 font-bold flex items-center justify-center gap-2 shadow-xs hover:bg-gray-50">
          <Tag className="w-5 h-5 text-[#0F6236]" /> Sell My Fish
        </Link>
      </section>

      {/* Gemini AI Live Market Price Forecast */}
      <section className="mx-5 mt-4 rounded-2xl bg-[#0F6236]/10 p-4 border border-[#0F6236]/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-extrabold text-xs text-[#0F6236]">
            <Sparkles className="w-4 h-4" /> AI Market Price & Demand (Ghana)
          </div>
          <div className="flex gap-1">
            {["Catfish", "Tilapia"].map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFish(f)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full cursor-pointer transition-all ${
                  selectedFish === f ? "bg-[#0F6236] text-white" : "bg-white text-gray-700 border border-gray-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loadingAI ? (
          <div className="flex items-center justify-center p-4 text-xs font-bold text-[#0F6236]">
            <Loader2 className="w-4 h-4 animate-spin mr-2" /> Fetching Gemini Market Analysis...
          </div>
        ) : marketInsight ? (
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex items-baseline justify-between">
              <span className="text-gray-600 font-medium">Estimated Live Price:</span>
              <span className="text-lg font-extrabold text-[#0F6236]">{marketInsight.currentPricePerKg}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-500">Market Trend:</span>
              <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {marketInsight.trend}
              </span>
            </div>
            <p className="text-gray-700 font-medium pt-2 border-t border-[#0F6236]/20">
              💡 <span className="font-bold">Advice: </span>{marketInsight.advice}
            </p>
          </div>
        ) : null}
      </section>

      {/* Recommended Products Feed */}
      <section className="px-5 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[16px] font-extrabold text-foreground">Verified Inputs & Equipment</h2>
          <span className="text-[#0F6236] font-semibold text-xs">Ghana Farmers Market</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {products.map((p) => (
            <div key={p.name} className="rounded-2xl border border-gray-200 bg-white p-3 shadow-xs flex flex-col justify-between">
              <div>
                <img src={p.img} alt={p.name} className="w-full h-24 object-cover rounded-xl mb-2" />
                <div className="text-xs font-bold text-gray-900 line-clamp-2">{p.name}</div>
                <div className="text-sm font-extrabold text-[#0F6236] mt-1">{p.price}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">{p.seller} • {p.loc}</div>
              </div>
              <button className="mt-3 w-full h-8 rounded-xl bg-[#0F6236]/10 hover:bg-[#0F6236] hover:text-white text-[#0F6236] text-xs font-bold transition-all cursor-pointer">
                Contact Seller
              </button>
            </div>
          ))}
        </div>
      </section>

      <BottomNav />
    </PhoneFrame>
  );
}
