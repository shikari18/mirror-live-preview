import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ShoppingCart, ArrowLeft, Search, Plus, Check, Phone, MessageSquare, Tag, ShieldCheck, X, Store, Sparkles } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import buyFeedImg from "@/assets/icons/buy-feed.png";
import sellFishImg from "@/assets/icons/sell-fish.png";
import marketPricesImg from "@/assets/icons/market-prices.png";

export const Route = createFileRoute("/market")({
  component: MarketPage,
  head: () => ({
    meta: [
      { title: "Farmer Marketplace & Trading Board — Fish Doctor" },
      { name: "description", content: "Buy and sell fish harvest, feed bags, fingerlings, and aeration tools directly via WhatsApp." },
    ],
  }),
});

import { fetchGlobalMarketItems, publishMarketItem, MarketItem } from "@/lib/sharedMarket";

export function MarketPage() {
  const [activeCategory, setActiveCategory] = useState<"all" | "harvest" | "feeds" | "equipment" | "fish">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<MarketItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // New Listing Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<"harvest" | "feeds" | "equipment" | "fish">("harvest");
  const [newPrice, setNewPrice] = useState<number>(38);
  const [newUnit, setNewUnit] = useState("per kg");
  const [newSeller, setNewSeller] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newLocation, setNewLocation] = useState("Kumasi, Ghana");

  const loadSharedItems = async () => {
    try {
      const data = await fetchGlobalMarketItems();
      setItems(data);
    } catch (e) {
      console.warn("Market sync error", e);
    }
  };

  useEffect(() => {
    const savedName = localStorage.getItem("user_name");
    const savedPhone = localStorage.getItem("user_phone");
    if (savedName) setNewSeller(savedName);
    if (savedPhone) setNewPhone(savedPhone);

    loadSharedItems();

    // Poll every 3 seconds for real-time cloud sync across devices
    const interval = setInterval(loadSharedItems, 3000);
    window.addEventListener("storage", loadSharedItems);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", loadSharedItems);
    };
  }, []);

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPhone.trim()) {
      alert("Please enter a title and phone number for your listing!");
      return;
    }

    setIsSyncing(true);
    try {
      const updated = await publishMarketItem({
        category: newCategory,
        title: newTitle.trim(),
        priceGHS: Number(newPrice) || 0,
        unit: newUnit.trim() || "per unit",
        seller: newSeller.trim() || "Farmer",
        phone: newPhone.trim(),
        location: newLocation.trim() || "Ghana",
        tag: "Verified Farmer",
        image: newCategory === "feeds" ? buyFeedImg : newCategory === "equipment" ? marketPricesImg : sellFishImg,
      });

      setItems(updated);
      setIsModalOpen(false);
      setNewTitle("");
      alert("🎉 Your item has been published globally to the shared marketplace!");
    } catch (err) {
      console.error("Listing publish error:", err);
      alert("Listing saved locally.");
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesCat = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.seller.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <PhoneFrame>
      {/* Header */}
      <header className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-gray-200 bg-white sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <Link to="/home" className="p-1 hover:bg-gray-100 rounded-full cursor-pointer">
            <ArrowLeft className="w-5.5 h-5.5 text-gray-900" />
          </Link>
          <div>
            <h1 className="text-[19px] font-extrabold text-gray-900 leading-tight">Farmer Marketplace</h1>
            <p className="text-[11.5px] text-gray-500 font-medium">Buy & sell harvests, feed, and tools</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-2 rounded-2xl bg-[#0F6236] text-white text-xs font-extrabold shadow-md hover:bg-[#0B4D29] transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Post Listing
        </button>
      </header>

      <section className="p-5 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4.5 h-4.5 text-gray-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search catfish, tilapia, feed, aerators, location..."
            className="w-full h-11 pl-10 pr-4 text-xs font-bold border border-gray-200 rounded-2xl bg-white outline-none focus:ring-2 focus:ring-[#0F6236]/20 shadow-2xs"
          />
        </div>

        {/* Category Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "all", label: "All Items" },
            { id: "harvest", label: "🐟 Fish Harvest" },
            { id: "feeds", label: "🌾 Feeds" },
            { id: "fish", label: "🐠 Fingerlings" },
            { id: "equipment", label: "⚙️ Equipment" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-[#0F6236] text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Listings Grid */}
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-3xl border border-gray-200/90 shadow-sm space-y-3 hover:shadow-md transition-shadow">
              <div className="flex gap-3">
                <img src={item.image} alt={item.title} className="w-16 h-16 rounded-2xl object-cover border border-gray-100 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-[#0F6236] bg-emerald-50 px-2 py-0.5 rounded-md">
                      {item.tag || "Verified"}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">{item.location}</span>
                  </div>
                  <h3 className="text-xs font-extrabold text-gray-900 mt-1 leading-snug truncate">{item.title}</h3>
                  <div className="text-[11px] text-gray-600 font-medium mt-0.5">Seller: {item.seller}</div>
                  <div className="text-sm font-black text-[#0F6236] mt-1">
                    GH₵ {item.priceGHS.toLocaleString()} <span className="text-[11px] text-gray-500 font-semibold">{item.unit}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: WhatsApp & Direct Call */}
              <div className="flex gap-2 pt-1 border-t border-gray-100">
                <a
                  href={`https://api.whatsapp.com/send?phone=233${item.phone.replace(/^0/, "")}&text=${encodeURIComponent(`Hi ${item.seller}, I saw your listing for "${item.title}" on FishFarm OS Marketplace.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Order WhatsApp
                </a>
                <a
                  href={`tel:${item.phone}`}
                  className="flex-1 h-10 rounded-xl bg-gray-900 hover:bg-black text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Seller
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Post New Listing Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-[#0F6236]" /> Post Harvest or Supplies
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-3 text-xs">
              <div>
                <label className="block font-extrabold text-gray-800 mb-1">Listing Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fresh Catfish Harvest (1.5kg size)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full h-11 px-3 border border-gray-300 rounded-xl bg-gray-50 outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-extrabold text-gray-800 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full h-11 px-3 border border-gray-300 rounded-xl bg-gray-50 outline-none font-bold"
                >
                  <option value="harvest">🐟 Fish Harvest</option>
                  <option value="feeds">🌾 Feed Bags</option>
                  <option value="fish">🐠 Fingerlings / Seed</option>
                  <option value="equipment">⚙️ Equipment / Tools</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-extrabold text-gray-800 mb-1">Price (GH₵)</label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value) || 0)}
                    className="w-full h-11 px-3 border border-gray-300 rounded-xl bg-gray-50 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block font-extrabold text-gray-800 mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. per kg, per bag"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full h-11 px-3 border border-gray-300 rounded-xl bg-gray-50 outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-extrabold text-gray-800 mb-1">Seller Name</label>
                  <input
                    type="text"
                    required
                    value={newSeller}
                    onChange={(e) => setNewSeller(e.target.value)}
                    className="w-full h-11 px-3 border border-gray-300 rounded-xl bg-gray-50 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block font-extrabold text-gray-800 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="0241234567"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full h-11 px-3 border border-gray-300 rounded-xl bg-gray-50 outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-gray-800 mb-1">Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kumasi, Ashanti Region"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full h-11 px-3 border border-gray-300 rounded-xl bg-gray-50 outline-none font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-[#0F6236] hover:bg-[#0B4D29] text-white font-extrabold text-xs rounded-2xl shadow-md cursor-pointer mt-2"
              >
                Publish to Marketplace Board
              </button>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </PhoneFrame>
  );
}
