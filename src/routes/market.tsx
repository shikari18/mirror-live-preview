import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { MapPin, ShoppingCart, Tag, Sparkles, Loader2, MessageSquare, Phone, Package, ArrowLeft } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import { getAIMarketInsights } from "@/lib/gemini";
import { useLanguage } from "@/lib/languageContext";
import { MarketplaceItem } from "./sell-fish";

export const Route = createFileRoute("/market")({
  component: MarketPage,
  head: () => ({
    meta: [
      { title: "Marketplace — FishFarm OS Ghana" },
      { name: "description", content: "Buy and sell fish farming products with trusted farmers in Ghana." },
    ],
  }),
});

export function MarketPage() {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [marketItems, setMarketItems] = useState<MarketplaceItem[]>([]);
  const [selectedFish, setSelectedFish] = useState<string>("Catfish");
  const [marketInsight, setMarketInsight] = useState<any | null>(null);
  const [loadingAI, setLoadingAI] = useState<boolean>(false);

  useEffect(() => {
    loadMarketItems();
    fetchInsights(selectedFish);
  }, [selectedFish]);

  const loadMarketItems = () => {
    const saved = localStorage.getItem("user_marketplace_items");
    if (saved) {
      setMarketItems(JSON.parse(saved));
    }
  };

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

  const handleContactSeller = (item: MarketplaceItem) => {
    const cleanPhone = item.phone.replace(/[^0-9]/g, "");
    if (item.contactMethod === "whatsapp") {
      window.open(`https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(item.sellerName)},%20I%20am%20interested%20in%20your%20listing:%20${encodeURIComponent(item.title)}`, "_blank");
    } else {
      window.open(`tel:${item.phone}`, "_self");
    }
  };

  const filteredItems = selectedCategory === "All" 
    ? marketItems 
    : marketItems.filter((i) => i.category === selectedCategory);

  return (
    <PhoneFrame>
      {/* Header - Aligned & Pushed Down */}
      <header className="px-5 pt-6 pb-3 flex items-center justify-between border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3">
          <Link to="/home" className="p-1 cursor-pointer">
            <ArrowLeft className="w-5 h-5 text-gray-800" />
          </Link>
          <div>
            <h1 className="text-[19px] font-extrabold text-foreground leading-tight">{t("market")}</h1>
            <div className="flex items-center gap-1 text-[#0F6236] text-[12px] font-medium mt-0.5">
              <MapPin className="w-3.5 h-3.5" /> Greater Accra & Ashanti, Ghana
            </div>
          </div>
        </div>
        <img src={farmerImg} alt="Kofi" className="w-9 h-9 rounded-full object-cover border-2 border-[#0F6236]" />
      </header>

      {/* Buy & Sell Action Bar */}
      <section className="px-5 mt-4 grid grid-cols-2 gap-2.5">
        <Link to="/harvest" className="h-11 rounded-2xl bg-[#0F6236] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#0F6236]/20">
          <ShoppingCart className="w-4 h-4" /> Buy Supplies
        </Link>
        <Link to="/sell-fish" className="h-11 rounded-2xl bg-white border border-gray-200 text-gray-900 font-bold text-xs flex items-center justify-center gap-2 shadow-xs hover:bg-gray-50">
          <Tag className="w-4 h-4 text-[#0F6236]" /> + Sell Produce
        </Link>
      </section>

      {/* AI Market Forecast */}
      <section className="mx-5 mt-4 rounded-2xl bg-[#0F6236]/10 p-3.5 border border-[#0F6236]/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 font-extrabold text-xs text-[#0F6236]">
            <Sparkles className="w-3.5 h-3.5" /> Live Market Forecast
          </div>
          <div className="flex gap-1">
            {["Catfish", "Tilapia"].map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFish(f)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-all ${
                  selectedFish === f ? "bg-[#0F6236] text-white" : "bg-white text-gray-700 border border-gray-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loadingAI ? (
          <div className="flex items-center justify-center p-3 text-xs font-bold text-[#0F6236]">
            <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> Analyzing Market Trends...
          </div>
        ) : marketInsight ? (
          <div className="mt-2.5 space-y-1.5 text-xs">
            <div className="flex items-baseline justify-between">
              <span className="text-gray-600 font-medium">Estimated Live Price:</span>
              <span className="text-base font-extrabold text-[#0F6236]">{marketInsight.currentPricePerKg}</span>
            </div>
            <p className="text-gray-700 font-medium text-[11px] pt-1.5 border-t border-[#0F6236]/20">
              💡 <span className="font-bold">Advice: </span>{marketInsight.advice}
            </p>
          </div>
        ) : null}
      </section>

      {/* Filter Categories */}
      <section className="px-5 mt-4">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {["All", "Fish", "Feed", "Fingerlings", "Equipment", "Chemicals"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                selectedCategory === cat
                  ? "bg-[#0F6236] text-white shadow-xs"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Dynamic Marketplace Listings */}
      <section className="px-5 mt-4 mb-6">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 shadow-xs">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h4 className="font-bold text-gray-800 text-sm">No listings available in this category</h4>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
              Be the first to sell fish, feeds, or equipment on FishFarm OS!
            </p>
            <Link to="/sell-fish" className="mt-4 inline-block px-4 py-2 rounded-xl bg-[#0F6236] text-white text-xs font-bold shadow-md">
              + Post First Listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredItems.map((item) => (
              <div key={item.id} className="rounded-2xl border border-gray-200 bg-white p-3 shadow-xs flex flex-col justify-between">
                <div>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="w-full h-24 object-cover rounded-xl mb-2" />
                  ) : (
                    <div className="w-full h-24 rounded-xl bg-[#0F6236]/10 text-[#0F6236] flex items-center justify-center font-bold text-2xl mb-2">
                      🐟
                    </div>
                  )}
                  <div className="text-[10px] font-bold text-[#0F6236] uppercase">{item.category}</div>
                  <h4 className="text-xs font-bold text-gray-900 line-clamp-2 mt-0.5">{item.title}</h4>
                  <div className="text-sm font-extrabold text-[#0F6236] mt-1">{item.price}</div>
                  <div className="text-[10.5px] text-gray-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#0F6236]" /> {item.location}
                  </div>
                </div>

                <button
                  onClick={() => handleContactSeller(item)}
                  className={`mt-3 w-full h-8 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs ${
                    item.contactMethod === "whatsapp"
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {item.contactMethod === "whatsapp" ? (
                    <>
                      <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Seller
                    </>
                  ) : (
                    <>
                      <Phone className="w-3.5 h-3.5" /> Call Seller
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <BottomNav />
    </PhoneFrame>
  );
}
