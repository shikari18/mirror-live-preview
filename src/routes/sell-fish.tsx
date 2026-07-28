import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Plus, Phone, MessageSquare, ImageIcon, CheckCircle, Tag, Package } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import { useLanguage } from "@/lib/languageContext";

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
  const [phone, setPhone] = useState("+233 ");
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

  const handleSubmit = (e: React.FormEvent) => {
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

    setUserListings(updated);
    setIsModalOpen(false);
    setTitle("");
    setPrice("");
    setDescription("");
    setImagePreview(null);
  };

  return (
    <PhoneFrame>
      {/* Header */}
      <header className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-sky-100 bg-white">
        <div className="flex items-center gap-3">
          <Link to="/market" className="p-1 hover:bg-sky-50 rounded-full">
            <ArrowLeft className="w-5.5 h-5.5 text-slate-800" />
          </Link>
          <div>
            <h1 className="text-[20px] font-extrabold text-slate-900 leading-tight">Sell Items & Harvests</h1>
            <p className="text-xs text-slate-500 font-medium">List fish, feed, or equipment</p>
          </div>
        </div>
        <img src={farmerImg} alt="Kofi" className="w-9 h-9 rounded-full object-cover border-2 border-[#0284C7]" />
      </header>

      {/* Action Banner */}
      <section className="mx-5 mt-4 p-4 rounded-2xl bg-[#0284C7] text-white flex items-center justify-between shadow-lg shadow-[#0284C7]/20">
        <div>
          <h2 className="text-lg font-extrabold">Sell Your Fish & Supplies</h2>
          <p className="text-xs text-sky-100 mt-0.5">Reach hundreds of fish buyers</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-white text-[#0284C7] font-bold text-xs shadow-md hover:bg-sky-50 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" /> + Post Item
        </button>
      </section>

      {/* User Active Listings */}
      <section className="px-5 mt-5 pb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-extrabold text-slate-900">Your Active Listings</h3>
          <span className="text-xs font-bold text-[#0284C7]">{userListings.length} Active</span>
        </div>

        {userListings.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-sky-100 shadow-xs">
            <Tag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-slate-800 text-sm">No items listed yet</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Click "+ Post Item" to list your fresh fish, fingerlings, feed, or equipment for sale!
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-[#0284C7] text-white text-xs font-bold shadow-md cursor-pointer"
            >
              + Create First Listing
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {userListings.map((item) => (
              <div key={item.id} className="p-3.5 bg-white rounded-2xl border border-sky-100 shadow-xs flex items-center gap-3">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="w-16 h-16 rounded-xl object-cover shrink-0 border border-sky-100" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-sky-50 text-[#0284C7] flex items-center justify-center font-bold text-xl shrink-0">
                    🐟
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#0284C7] uppercase bg-sky-100 px-2 py-0.5 rounded-full">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-slate-400">{item.createdAt}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 truncate mt-1">{item.title}</h4>
                  <div className="text-sm font-extrabold text-[#0284C7]">{item.price}</div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#0284C7]" /> {item.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Listing Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-sky-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3 mb-3">
              <h3 className="font-extrabold text-base text-slate-900">Post Item for Sale</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 font-bold hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Item Category</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["Fish", "Feed", "Fingerlings", "Chemicals", "Equipment"] as const).map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`p-2 rounded-xl border font-bold text-[11px] ${
                        category === cat ? "border-[#0284C7] bg-[#0284C7]/10 text-[#0284C7]" : "border-slate-200 text-slate-600"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Title / Item Name</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Fresh Catfish (1.2kg), 32% Feed"
                  className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs font-semibold bg-slate-50 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Price (GH₵)</label>
                <input
                  type="text"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. GH₵ 50 / kg"
                  className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs font-semibold bg-slate-50 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Accra, Kumasi"
                  className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs font-semibold bg-slate-50 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs font-semibold bg-slate-50 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Preferred Contact Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setContactMethod("whatsapp")}
                    className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 ${
                      contactMethod === "whatsapp" ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-600"
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" /> WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactMethod("phone")}
                    className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 ${
                      contactMethod === "phone" ? "border-[#0284C7] bg-sky-50 text-[#0284C7]" : "border-slate-200 text-slate-600"
                    }`}
                  >
                    <Phone className="w-4 h-4" /> Phone Call
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Upload Item Photo</label>
                <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-xs" />
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="mt-2 w-full h-24 object-cover rounded-xl border" />
                )}
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-[#0284C7] text-white font-bold rounded-xl text-sm shadow-md shadow-[#0284C7]/20 cursor-pointer mt-2"
              >
                Publish Listing
              </button>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </PhoneFrame>
  );
}
