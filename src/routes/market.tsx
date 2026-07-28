import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { MapPin, ShoppingCart, Tag, Sparkles, Loader2, MessageSquare, Phone, ArrowLeft, Search, RefreshCw, Fish } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import { getAIMarketInsights } from "@/lib/gemini";
import { useLanguage } from "@/lib/languageContext";

export const Route = createFileRoute("/market")({
  component: MarketPage,
  head: () => ({
    meta: [
      { title: "Live Fish Market & Real-Time Prices — Fish Doctor" },
      { name: "description", content: "Comprehensive live fish catalog of 30+ fish species with real-time online prices." },
    ],
  }),
});

interface FishSpecies {
  id: string;
  name: string;
  scientificName: string;
  category: "Freshwater" | "Saltwater" | "Fingerlings" | "Ornamental" | "Commercial";
  price: string;
  unit: string;
  trend: "Up" | "Stable" | "Down";
  origin: string;
  description: string;
  inStock: boolean;
}

const FISH_CATALOG: FishSpecies[] = [
  { id: "f-1", name: "African Catfish", scientificName: "Clarias gariepinus", category: "Freshwater", price: "GH₵ 48.00", unit: "per kg", trend: "Up", origin: "Local Ghana Ponds", description: "High-protein fast-growing freshwater catfish suitable for smoking or fresh sale.", inStock: true },
  { id: "f-2", name: "Nile Tilapia", scientificName: "Oreochromis niloticus", category: "Freshwater", price: "GH₵ 45.00", unit: "per kg", trend: "Stable", origin: "Volta Lake & Cage Farms", description: "Premium table-size Nile Tilapia with tender white meat.", inStock: true },
  { id: "f-3", name: "Heterotis", scientificName: "Heterotis niloticus", category: "Freshwater", price: "GH₵ 52.00", unit: "per kg", trend: "Up", origin: "Earthen Ponds", description: "Large freshwater bony tongue fish highly prized in local cuisine.", inStock: true },
  { id: "f-4", name: "Common Carp", scientificName: "Cyprinus carpio", category: "Freshwater", price: "GH₵ 38.00", unit: "per kg", trend: "Stable", origin: "Aquaculture Hatcheries", description: "Hardy omnivorous carp ideal for polyculture farming.", inStock: true },
  { id: "f-5", name: "Rainbow Trout", scientificName: "Oncorhynchus mykiss", category: "Freshwater", price: "GH₵ 85.00", unit: "per kg", trend: "Up", origin: "Cold Water Farms / Import", description: "Rich omega-3 fillet quality trout for hotels and high-end restaurants.", inStock: true },
  { id: "f-6", name: "Atlantic Salmon", scientificName: "Salmo salar", category: "Saltwater", price: "GH₵ 110.00", unit: "per kg", trend: "Up", origin: "Chilled Import", description: "Grade-A fresh Atlantic Salmon fillets and whole fish.", inStock: true },
  { id: "f-7", name: "Sea Bass", scientificName: "Dicentrarchus labrax", category: "Saltwater", price: "GH₵ 75.00", unit: "per kg", trend: "Stable", origin: "Coastal Marine Catch", description: "Lean, flaky white-fleshed marine bass.", inStock: true },
  { id: "f-8", name: "Koi Carp", scientificName: "Cyprinus rubrofuscus", category: "Ornamental", price: "GH₵ 60.00", unit: "per pair", trend: "Stable", origin: "Ornamental Hatchery", description: "Vibrant colored Japanese ornamental Koi for garden ponds.", inStock: true },
  { id: "f-9", name: "Goldfish", scientificName: "Carassius auratus", category: "Ornamental", price: "GH₵ 25.00", unit: "per pair", trend: "Stable", origin: "Ornamental Breeding", description: "Classic Fantail and Comet goldfish species for home aquariums.", inStock: true },
  { id: "f-10", name: "Silver Carp", scientificName: "Hypophthalmichthys molitrix", category: "Freshwater", price: "GH₵ 35.00", unit: "per kg", trend: "Down", origin: "Phytoplankton Ponds", description: "Filter-feeding silver carp, low production cost fish.", inStock: true },
  { id: "f-11", name: "Grass Carp", scientificName: "Ctenopharyngodon idella", category: "Freshwater", price: "GH₵ 40.00", unit: "per kg", trend: "Stable", origin: "Weed Control Ponds", description: "Herbivorous carp great for aquatic weed management.", inStock: true },
  { id: "f-12", name: "Guppy Fish", scientificName: "Poecilia reticulata", category: "Ornamental", price: "GH₵ 15.00", unit: "per pair", trend: "Stable", origin: "Local Breeder", description: "Colorful active live-bearer aquarium fish.", inStock: true },
  { id: "f-13", name: "Siamese Fighting Fish (Betta)", scientificName: "Betta splendens", category: "Ornamental", price: "GH₵ 30.00", unit: "per pair", trend: "Up", origin: "Show Bettas", description: "Gorgeous long-finned male and female Betta pairs.", inStock: true },
  { id: "f-14", name: "Red Snapper", scientificName: "Lutjanus campechanus", category: "Saltwater", price: "GH₵ 90.00", unit: "per kg", trend: "Up", origin: "Tema Deep Sea Harbor", description: "Fresh wild-caught Red Snapper with sweet firm meat.", inStock: true },
  { id: "f-15", name: "Yellowfin Tuna", scientificName: "Thunnus albacares", category: "Saltwater", price: "GH₵ 120.00", unit: "per kg", trend: "Up", origin: "Offshore Marine Fishery", description: "Sashimi-grade fresh Yellowfin Tuna loins and whole fish.", inStock: true },
  { id: "f-16", name: "Mackerel", scientificName: "Scomber scombrus", category: "Commercial", price: "GH₵ 42.00", unit: "per kg", trend: "Stable", origin: "Atlantic Marine Catch", description: "Popular oily fish high in natural EPA/DHA fatty acids.", inStock: true },
  { id: "f-17", name: "Halibut", scientificName: "Hippoglossus hippoglossus", category: "Saltwater", price: "GH₵ 105.00", unit: "per kg", trend: "Up", origin: "Imported Chilled", description: "Thick firm white flatfish fillets.", inStock: true },
  { id: "f-18", name: "Grouper", scientificName: "Epinephelus marginatus", category: "Saltwater", price: "GH₵ 95.00", unit: "per kg", trend: "Up", origin: "Coastal Reef Harvest", description: "Moist, mild flavor reef fish for grilling and stews.", inStock: true },
  { id: "f-19", name: "Sea Bream", scientificName: "Sparus aurata", category: "Saltwater", price: "GH₵ 70.00", unit: "per kg", trend: "Stable", origin: "Mediterranean & Atlantic", description: "Whole cleaned sea bream perfect for roasting.", inStock: true },
  { id: "f-20", name: "Freshwater Angelfish", scientificName: "Pterophyllum scalare", category: "Ornamental", price: "GH₵ 35.00", unit: "per pair", trend: "Stable", origin: "Aquarium Nursery", description: "Elegant cichlid angelfish for community aquariums.", inStock: true },
  { id: "f-21", name: "Neon Tetra", scientificName: "Paracheirodon innesi", category: "Ornamental", price: "GH₵ 20.00", unit: "per 5-pack", trend: "Stable", origin: "Schooling Fish Nursery", description: "Bright iridescent blue-and-red schooling fish.", inStock: true },
  { id: "f-22", name: "Discus Fish", scientificName: "Symphysodon", category: "Ornamental", price: "GH₵ 120.00", unit: "per pair", trend: "Up", origin: "High-End Breeder", description: "King of aquariums - vibrant disc-shaped show fish.", inStock: true },
  { id: "f-23", name: "Barramundi", scientificName: "Lates calcarifer", category: "Commercial", price: "GH₵ 65.00", unit: "per kg", trend: "Stable", origin: "Brackish Water Farms", description: "Asian Sea Bass / Barramundi, fast growing commercial species.", inStock: true },
  { id: "f-24", name: "Pangasius Basa", scientificName: "Pangasianodon hypophthalmus", category: "Commercial", price: "GH₵ 38.00", unit: "per kg", trend: "Down", origin: "Freshwater River Farms", description: "Boneless mild white fish fillets.", inStock: true },
  { id: "f-25", name: "Snakehead", scientificName: "Channa striata", category: "Freshwater", price: "GH₵ 50.00", unit: "per kg", trend: "Stable", origin: "Freshwater Swamps", description: "Medicinal & high protein freshwater predator fish.", inStock: true },
  { id: "f-26", name: "Tilapia Fingerlings (100 Pack)", scientificName: "Oreochromis niloticus (Fry)", category: "Fingerlings", price: "GH₵ 150.00", unit: "per 100 pack", trend: "Stable", origin: "Certified Hatchery", description: "High-survival sex-reversed male Tilapia fingerlings (5g).", inStock: true },
  { id: "f-27", name: "Catfish Fingerlings (100 Pack)", scientificName: "Clarias gariepinus (Fry)", category: "Fingerlings", price: "GH₵ 160.00", unit: "per 100 pack", trend: "Stable", origin: "Certified Hatchery", description: "Dutch strain fast-growing Catfish fingerlings (6g).", inStock: true },
  { id: "f-28", name: "European Eel", scientificName: "Anguilla anguilla", category: "Commercial", price: "GH₵ 95.00", unit: "per kg", trend: "Up", origin: "Specialty Aquaculture", description: "Rich fatty eel prized for unagi and smoked delicacies.", inStock: true },
  { id: "f-29", name: "Sturgeon", scientificName: "Acipenser sturio", category: "Commercial", price: "GH₵ 140.00", unit: "per kg", trend: "Up", origin: "Cold Water Tank Farm", description: "Premium boneless cartilaginous fish.", inStock: true },
  { id: "f-30", name: "Bluegill Sunfish", scientificName: "Lepomis macrochirus", category: "Freshwater", price: "GH₵ 35.00", unit: "per kg", trend: "Stable", origin: "Pond Stocking", description: "Tasty panfish suitable for small farm ponds.", inStock: true },
];

export function MarketPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [marketInsight, setMarketInsight] = useState<any | null>(null);
  const [loadingAI, setLoadingAI] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<string>("Accra & Kumasi, Ghana");

  useEffect(() => {
    fetchMarketInsights("Catfish & Tilapia");
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation(`GPS (${pos.coords.latitude.toFixed(2)}°, ${pos.coords.longitude.toFixed(2)}°)`),
        () => {}
      );
    }
  }, []);

  const fetchMarketInsights = async (fishType: string) => {
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

  const handleOrderWhatsapp = (fish: FishSpecies) => {
    const text = encodeURIComponent(`hello, im messaging from the fish doctor app to order ${fish.name} (${fish.price} ${fish.unit})`);
    window.open(`https://wa.me/233248785807?text=${text}`, "_blank");
  };

  const handleOrderCall = () => {
    window.location.href = "tel:+233248785807";
  };

  const filteredFish = FISH_CATALOG.filter((f) => {
    const matchesCategory = selectedCategory === "All" || f.category === selectedCategory;
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <PhoneFrame>
      {/* Header */}
      <header className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-sky-100 bg-white shadow-xs">
        <div className="flex items-center gap-3">
          <Link to="/home" className="p-1 cursor-pointer hover:bg-sky-50 rounded-full">
            <ArrowLeft className="w-5 h-5 text-slate-800" />
          </Link>
          <div>
            <h1 className="text-[19px] font-extrabold text-slate-900 leading-tight">Live Fish Market</h1>
            <div className="flex items-center gap-1 text-[#0284C7] text-[12px] font-semibold mt-0.5">
              <MapPin className="w-3.5 h-3.5" /> {userLocation}
            </div>
          </div>
        </div>
        <img src={farmerImg} alt="Kofi" className="w-9 h-9 rounded-full object-cover border-2 border-[#0284C7]" />
      </header>

      {/* AI Real-Time Price Ticker */}
      <section className="mx-5 mt-4 rounded-2xl bg-[#0284C7]/10 p-3.5 border border-[#0284C7]/20 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#0284C7]/20 pb-2">
          <div className="flex items-center gap-1.5 font-extrabold text-xs text-[#0284C7]">
            <Sparkles className="w-4 h-4 text-[#0284C7]" /> Real-Time Groq Market Pricing
          </div>
          <button
            onClick={() => fetchMarketInsights("Catfish & Tilapia")}
            className="flex items-center gap-1 text-[10px] font-extrabold text-[#0284C7] bg-white px-2 py-1 rounded-full border border-sky-200 cursor-pointer hover:bg-sky-50"
          >
            <RefreshCw className={`w-3 h-3 ${loadingAI ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>

        {loadingAI ? (
          <div className="flex items-center justify-center p-3 text-xs font-bold text-[#0284C7]">
            <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> Fetching Live Prices & Demand...
          </div>
        ) : marketInsight ? (
          <div className="mt-2.5 space-y-1 text-xs">
            <div className="flex items-baseline justify-between">
              <span className="text-slate-600 font-medium">Market Average Price:</span>
              <span className="text-sm font-extrabold text-[#0284C7]">{marketInsight.currentPricePerKg}</span>
            </div>
            <p className="text-slate-700 font-medium text-[11.5px] pt-1">
              📈 <span className="font-bold">Demand: </span>{marketInsight.buyerDemand}
            </p>
          </div>
        ) : null}
      </section>

      {/* Search Input Bar */}
      <section className="px-5 mt-4">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 30+ fish species by name or type..."
            className="w-full h-11 pl-10 pr-4 bg-white border border-sky-100 rounded-xl text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#0284C7]/30 shadow-xs"
          />
        </div>
      </section>

      {/* Category Pills */}
      <section className="px-5 mt-3">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {["All", "Freshwater", "Saltwater", "Fingerlings", "Commercial", "Ornamental"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                selectedCategory === cat
                  ? "bg-[#0284C7] text-white shadow-xs"
                  : "bg-white text-slate-700 border border-sky-100 hover:bg-sky-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Fish Grid List (30 Species) */}
      <section className="px-5 mt-4 space-y-3 pb-6">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Available Species ({filteredFish.length})</span>
          <span className="text-[#0284C7] font-semibold">Live Stock Available</span>
        </div>

        {filteredFish.map((fish) => (
          <div
            key={fish.id}
            className="bg-white rounded-2xl p-4 border border-sky-100 shadow-xs hover:border-[#0284C7]/40 transition-all space-y-2.5"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-xl shrink-0">
                  🐟
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-slate-900">{fish.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-[#0284C7]">
                      {fish.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 italic font-medium">{fish.scientificName}</p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-extrabold text-[#0284C7]">{fish.price}</div>
                <div className="text-[10px] text-slate-500 font-semibold">{fish.unit}</div>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              {fish.description}
            </p>

            <div className="flex items-center justify-between pt-1 border-t border-sky-100">
              <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                📍 {fish.origin}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => handleOrderWhatsapp(fish)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Order
                </button>
                <button
                  onClick={handleOrderCall}
                  className="px-3 py-1.5 rounded-xl bg-[#0284C7] hover:bg-sky-600 text-white font-extrabold text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                >
                  <Phone className="w-3.5 h-3.5" /> Call
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>

      <BottomNav />
    </PhoneFrame>
  );
}
