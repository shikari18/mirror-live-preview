import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, MessageSquare, Phone, Package, Tag } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import { useLanguage } from "@/lib/languageContext";
import { MarketplaceItem } from "./sell-fish";

export const Route = createFileRoute("/harvest")({
  component: HarvestPage,
  head: () => ({
    meta: [
      { title: "Buy Harvests & Feeds — Fish Doctor" },
      { name: "description", content: "Buy quality fish, feeds, and equipment directly from farmers." },
    ],
  }),
});

export function HarvestPage() {
  const { t } = useLanguage();
  const [items, setItems] = useState<MarketplaceItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("user_marketplace_items");
    if (saved) {
      setItems(JSON.parse(saved));
    }
  }, []);

  const handleContactSeller = (item: MarketplaceItem) => {
    const cleanPhone = item.phone.replace(/[^0-9]/g, "");
    if (item.contactMethod === "whatsapp") {
      window.open(`https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(item.sellerName)},%20I%20am%20interested%20in%20your%20listing:%20${encodeURIComponent(item.title)}`, "_blank");
    } else {
      window.open(`tel:${item.phone}`, "_self");
    }
  };

  return (
    <PhoneFrame>
      {/* Header */}
      <header className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3">
          <Link to="/market" className="p-1 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5.5 h-5.5 text-gray-800" />
          </Link>
          <div>
            <h1 className="text-[20px] font-extrabold text-gray-900 leading-tight">Buy Harvests & Feeds</h1>
            <p className="text-xs text-gray-500 font-medium">Direct listings from farmers</p>
          </div>
        </div>
        <img src={farmerImg} alt="Kofi" className="w-9 h-9 rounded-full object-cover border-2 border-[#0F6236]" />
      </header>

      {/* Banner */}
      <section className="mx-5 mt-4 p-4 rounded-2xl bg-[#0F6236]/10 border border-[#0F6236]/20 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-extrabold text-[#0F6236]">Want to sell your own produce?</h2>
          <p className="text-xs text-gray-600">List fresh fish, fingerlings, or feeds today</p>
        </div>
        <Link to="/sell-fish" className="px-3 py-2 rounded-xl bg-[#0F6236] hover:bg-emerald-800 text-white text-xs font-bold shadow-xs flex items-center gap-1 shrink-0">
          <Tag className="w-3.5 h-3.5" /> Sell Item
        </Link>
      </section>

      {/* Listings */}
      <section className="px-5 mt-4 mb-6">
        {items.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 shadow-xs">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h3 className="font-bold text-gray-800 text-sm">No marketplace items listed yet</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
              When farmers post fish, feeds, or equipment for sale, they will appear here live!
            </p>
            <Link to="/sell-fish" className="mt-4 inline-block px-4 py-2 rounded-xl bg-[#0F6236] text-white text-xs font-bold shadow-md">
              + Post First Listing
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3.5">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="w-20 h-20 rounded-xl object-cover shrink-0 border border-gray-100" />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-[#0F6236]/10 text-[#0F6236] flex items-center justify-center font-bold text-2xl shrink-0">
                    🐟
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#0F6236] uppercase bg-[#0F6236]/10 px-2 py-0.5 rounded-full">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-gray-400">{item.createdAt}</span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 truncate mt-1">{item.title}</h3>
                  <div className="text-base font-extrabold text-[#0F6236]">{item.price}</div>
                  <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#0F6236]" /> {item.location} • Seller: {item.sellerName}
                  </div>
                </div>
                <button
                  onClick={() => handleContactSeller(item)}
                  className="px-3 py-2 rounded-xl bg-[#0F6236] text-white text-xs font-bold shadow-xs shrink-0 cursor-pointer"
                >
                  Contact
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
