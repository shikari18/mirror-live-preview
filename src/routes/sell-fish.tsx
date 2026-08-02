import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Plus, Phone, MessageSquare, ImageIcon, CheckCircle, Tag, Package } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import { useLanguage } from "@/lib/languageContext";
import { publishMarketItem } from "@/lib/sharedMarket";

export const Route = createFileRoute("/sell-fish")({
  component: SellFishPage,
  head: () => ({
    meta: [
      { title: "Sell Fish & Supplies — Fish Doctor" },
      { name: "description", content: "List your harvests, feed, or equipment for sale." },
    ],
  }),
});

export interface MarketplaceItem {
  id: string;
  category: "Fish" | "Feed" | "Fingerlings" | "Chemicals" | "Equipment";
  title: string;
  price: string;
  description: string;
  location: string;
  phone: string;
  contactMethod: "whatsapp" | "phone";
  imageUrl?: string;
  sellerName: string;
  createdAt: string;
}

export function SellFishPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userListings, setUserListings] = useState<MarketplaceItem[]>([]);

  // Form State
  const [category, setCategory] = useState<MarketplaceItem["category"]>("Fish");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("Accra, Ghana");
  const [phone, setPhone] = useState("+233 248785807");
  const [contactMethod, setContactMethod] = useState<"whatsapp" | "phone">("whatsapp");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    loadListings();
    const savedPhone = localStorage.getItem("user_phone");
    if (savedPhone) setPhone(savedPhone);
  }, []);

  const loadListings = () => {
    const saved = localStorage.getItem("user_marketplace_items");
    if (saved) {
      setUserListings(JSON.parse(saved));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: MarketplaceItem = {
      id: Date.now().toString(),
      category,
      title,
      price: price.startsWith("GH₵") ? price : `GH₵ ${price}`,
      description,
      location,
      phone,
      contactMethod,
      imageUrl: imagePreview || undefined,
      sellerName: localStorage.getItem("user_name") || "Aquaculture Farmer",
      createdAt: new Date().toLocaleDateString(),
    };

    const existing = JSON.parse(localStorage.getItem("user_marketplace_items") || "[]");
    const updated = [newItem, ...existing];
    localStorage.setItem("user_marketplace_items", JSON.stringify(updated));

    // Also publish to global shared cloud store
    try {
      const numPrice = parseFloat(price.replace(/[^0-9.]/g, "")) || 35;
      const catKey = category.toLowerCase() === "fish" || category.toLowerCase() === "harvest" ? "harvest" : category.toLowerCase() === "feed" ? "feeds" : "equipment";
      await publishMarketItem({
        category: catKey as any,
        title,
        priceGHS: numPrice,
        unit: "Harvest Batch",
        seller: newItem.sellerName,
        phone,
        location,
        tag: "Direct Farm Sale",
        image: imagePreview || undefined,
      });
    } catch (err) {
      console.warn("Global publish error from sell-fish", err);
    }

    setUserListings(updated);
    setIsModalOpen(false);
    setTitle("");
    setPrice("");
    setDescription("");
    setImagePreview(null);
    alert("🎉 Your harvest listing has been published to the shared marketplace!");
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
            <h1 className="text-[20px] font-extrabold text-gray-900 leading-tight">Sell Fish & Supplies</h1>
            <p className="text-xs text-gray-500 font-medium">Post your harvest directly to buyers</p>
          </div>
        </div>
        <img src={farmerImg} alt="Kofi" className="w-9 h-9 rounded-full object-cover border-2 border-[#0F6236]" />
      </header>

      {/* Hero Banner */}
      <section className="mx-5 mt-4 p-4 rounded-2xl bg-[#0F6236] text-white shadow-lg shadow-[#0F6236]/20 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wide text-emerald-200 block">Direct Farm Sales</span>
          <h2 className="text-base font-extrabold leading-tight">List Your Fish Harvest</h2>
          <p className="text-xs text-emerald-100 mt-0.5">Reach hotels, restaurants & fresh fish vendors across Ghana.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2.5 rounded-xl bg-white text-[#0F6236] text-xs font-extrabold shadow-md shrink-0 cursor-pointer hover:bg-gray-100 transition-all active:scale-95 flex items-center gap-1"
        >
          <Plus className="w-4 h-4 text-[#0F6236]" /> Post Item
        </button>
      </section>

      {/* User Listings */}
      <section className="px-5 mt-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-extrabold text-gray-900">Your Active Listings ({userListings.length})</h3>
          <button onClick={() => setIsModalOpen(true)} className="text-xs font-bold text-[#0F6236] hover:underline cursor-pointer">
            + New Listing
          </button>
        </div>

        {userListings.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 shadow-xs">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h4 className="font-bold text-gray-800 text-sm">No items listed yet</h4>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
              Tap below to post your catfish, tilapia, feed sacks, or fingerlings for sale.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-4 py-2.5 rounded-xl bg-[#0F6236] text-white text-xs font-bold shadow-md cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create First Marketplace Listing
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {userListings.map((item) => (
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
                  <h4 className="text-sm font-bold text-gray-900 truncate mt-1">{item.title}</h4>
                  <div className="text-base font-extrabold text-[#0F6236]">{item.price}</div>
                  <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#0F6236]" /> {item.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
              <h3 className="font-extrabold text-base text-gray-900">Post Item For Sale</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 font-bold hover:text-gray-600 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full h-11 rounded-xl border border-gray-200 px-3 text-xs font-semibold bg-gray-50 outline-none"
                >
                  <option value="Fish">Fresh Fish Harvest</option>
                  <option value="Fingerlings">Fingerlings / Fry</option>
                  <option value="Feed">Fish Feed Sacks</option>
                  <option value="Equipment">Pond Equipment & Nets</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Title / Listing Name</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 500kg Fresh Catfish (1.2kg size)"
                  className="w-full h-11 rounded-xl border border-gray-200 px-3 text-xs font-semibold bg-gray-50 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Asking Price</label>
                <input
                  type="text"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. GH₵ 48 per kg"
                  className="w-full h-11 rounded-xl border border-gray-200 px-3 text-xs font-semibold bg-gray-50 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Contact Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 rounded-xl border border-gray-200 px-3 text-xs font-semibold bg-gray-50 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Item Photo</label>
                <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-xs" />
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-[#0F6236] text-white font-bold rounded-xl text-xs shadow-md cursor-pointer mt-2"
              >
                Publish Marketplace Listing
              </button>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </PhoneFrame>
  );
}
