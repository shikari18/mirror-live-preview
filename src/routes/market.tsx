import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { MapPin, ShoppingCart, Tag, Sparkles, Loader2, MessageSquare, Phone, ArrowLeft, Search, RefreshCw, Fish, Package, Wrench, ShieldAlert } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import { getAIMarketInsights } from "@/lib/gemini";
import { useLanguage } from "@/lib/languageContext";

export const Route = createFileRoute("/market")({
  component: MarketPage,
  head: () => ({
    meta: [
      { title: "Live Market & Farm Supplies — Fish Doctor" },
      { name: "description", content: "Buy live fish, feeds, aeration equipment, and water treatment supplies." },
    ],
  }),
});

interface MarketItem {
  id: string;
  name: string;
  subtitle: string;
  section: "Fish" | "Feeds" | "Equipment" | "Supplies";
  category: string;
  price: string;
  unit: string;
  origin: string;
  description: string;
  icon: string;
  inStock: boolean;
}

const MARKET_ITEMS: MarketItem[] = [
  // --- FEEDS SECTION ---
  { id: "feed-1", name: "Raanan 42% High Protein Starter Crumble", subtitle: "0.5mm - 1.2mm Fry Feed", section: "Feeds", category: "Starter Feed", price: "GH₵ 340.00", unit: "per 15kg Bag", origin: "Raanan Ghana", description: "Premium micro-pellets formulated for maximum fry survival rate and early growth.", icon: "🌾", inStock: true },
  { id: "feed-2", name: "Raanan 3mm Floating Growth Feed", subtitle: "40% Crude Protein", section: "Feeds", category: "Grower Feed", price: "GH₵ 295.00", unit: "per 15kg Bag", origin: "Raanan Ghana", description: "Floating pellets engineered for fast biomass conversion in catfish & tilapia.", icon: "🌾", inStock: true },
  { id: "feed-3", name: "Raanan 4.5mm Commercial Finisher Feed", subtitle: "35% Crude Protein", section: "Feeds", category: "Finisher Feed", price: "GH₵ 275.00", unit: "per 15kg Bag", origin: "Raanan Ghana", description: "High-digestibility finisher feed for reaching 1.2kg+ harvest weight.", icon: "🌾", inStock: true },
  { id: "feed-4", name: "Aller Aqua 3mm Tilapia Feed", subtitle: "Imported Danish Quality", section: "Feeds", category: "Grower Feed", price: "GH₵ 310.00", unit: "per 15kg Bag", origin: "Aller Aqua Denmark", description: "Low-FCR premium floating feed with natural immunostimulants.", icon: "🌾", inStock: true },
  { id: "feed-5", name: "Coppens 2mm Premium Catfish Feed", subtitle: "45% Protein & Omega-3", section: "Feeds", category: "Starter Feed", price: "GH₵ 360.00", unit: "per 15kg Bag", origin: "Coppens Netherlands", description: "Super-intensive nursery feed for fingerlings 10g-50g.", icon: "🌾", inStock: true },
  { id: "feed-6", name: "Skretting 6mm Large Pellet Finisher", subtitle: "32% Crude Protein", section: "Feeds", category: "Finisher Feed", price: "GH₵ 260.00", unit: "per 20kg Bag", origin: "Skretting Nigeria", description: "Large floating pellets designed for adult broodstock & big catfish.", icon: "🌾", inStock: true },

  // --- EQUIPMENT & TOOLS SECTION ---
  { id: "eq-1", name: "Dual-Impeller Paddlewheel Aerator 1.5HP", subtitle: "220V Solar / Grid Powered", section: "Equipment", category: "Aeration", price: "GH₵ 3,850.00", unit: "per Unit", origin: "High-Efficiency Taiwan Import", description: "Increases dissolved oxygen levels rapidly in earthen & concrete ponds.", icon: "⚙️", inStock: true },
  { id: "eq-[#eq-2]", name: "Heavy Duty Tarpaulin Tank (5m Diameter x 1.2m)", subtitle: "Galvanized Mesh Frame", section: "Equipment", category: "Tanks & Cages", price: "GH₵ 2,900.00", unit: "per Set", origin: "Local Fabrication", description: "Complete ready-to-assemble mobile fish pond with drainage valve.", icon: "🌊", inStock: true },
  { id: "eq-3", name: "Submersible Water Transfer Pump 2HP", subtitle: "High Discharge Volume", section: "Equipment", category: "Pumps", price: "GH₵ 1,450.00", unit: "per Unit", origin: "Shimge Duty Pump", description: "Drains or fills 50,000L ponds in under 2 hours.", icon: "⚡", inStock: true },
  { id: "eq-4", name: "Digital Dissolved Oxygen (DO) & Temp Meter", subtitle: "Handheld Water Tester", section: "Equipment", category: "Testing Instruments", price: "GH₵ 680.00", unit: "per Device", origin: "Precision Lab Instrument", description: "Instant real-time DO mg/L and temperature digital readout.", icon: "🧪", inStock: true },
  { id: "eq-5", name: "5-in-1 Water Quality Test Kit (pH, Ammonia, Nitrite)", subtitle: "100 Test Strips + Reagents", section: "Equipment", category: "Testing Instruments", price: "GH₵ 240.00", unit: "per Kit", origin: "API Fish Care", description: "Essential water chemistry kit for monitoring toxic ammonia & pH spikes.", icon: "📊", inStock: true },
  { id: "eq-6", name: "Heavy Duty Seine Harvest Net (15m x 2.5m)", subtitle: "Weighted Bottom Chain", section: "Equipment", category: "Nets & Cages", price: "GH₵ 520.00", unit: "per Net", origin: "Custom Mesh", description: "Knotless durable net for harvesting fish without skin abrasion.", icon: "🕸️", inStock: true },

  // --- SUPPLIES & WATER MEDICATIONS SECTION ---
  { id: "sup-1", name: "Aquaculture Pure Sea Salt (50kg Bag)", subtitle: "Uniodized Natural Rock Salt", section: "Supplies", category: "Water Treatment", price: "GH₵ 110.00", unit: "per 50kg Bag", origin: "Ada Salt Works Ghana", description: "Prevents osmotic shock, reduces nitrite toxicity, and cures slime disease.", icon: "🧂", inStock: true },
  { id: "sup-2", name: "Oxytetracycline Veterinary Powder 500g", subtitle: "Broad-Spectrum Antibiotic", section: "Supplies", category: "Medication", price: "GH₵ 140.00", unit: "per Pack", origin: "Vetmed Pharma", description: "Treats bacterial fin rot, ulcer disease, and abdominal dropsy in fish.", icon: "💊", inStock: true },
  { id: "sup-3", name: "Probiotic Bio-Clean Bacteria Solution (5L)", subtitle: "Sludge & Odor Eater", section: "Supplies", category: "Bio-Treatment", price: "GH₵ 320.00", unit: "per 5L Gallon", origin: "BioTech Ghana", description: "Breaks down fish feces & unconsumed feed to eliminate toxic ammonia.", icon: "🧪", inStock: true },
  { id: "sup-4", name: "Hydrated Agricultural Lime (Calcium Hydroxide)", subtitle: "50kg Bag", section: "Supplies", category: "Water Treatment", price: "GH₵ 85.00", unit: "per 50kg Bag", origin: "Local Lime Quarry", description: "Disinfects pond bottom soil and stabilizes low pH acid water.", icon: "⚪", inStock: true },
  { id: "sup-5", name: "Emergency Oxygen Granules (1kg)", subtitle: "Instant Oxygen Boost", section: "Supplies", category: "Emergency Care", price: "GH₵ 95.00", unit: "per Pack", origin: "Aquatic Relief", description: "Releases pure dissolved oxygen instantly during power outages.", icon: "🫧", inStock: true },

  // --- LIVE FISH SECTION (30 SPECIES) ---
  { id: "f-1", name: "African Catfish", subtitle: "Clarias gariepinus", section: "Fish", category: "Freshwater", price: "GH₵ 48.00", unit: "per kg", origin: "Local Ghana Ponds", description: "High-protein fast-growing freshwater catfish suitable for smoking or fresh sale.", icon: "🐟", inStock: true },
  { id: "f-2", name: "Nile Tilapia", subtitle: "Oreochromis niloticus", section: "Fish", category: "Freshwater", price: "GH₵ 45.00", unit: "per kg", origin: "Volta Lake & Cage Farms", description: "Premium table-size Nile Tilapia with tender white meat.", icon: "🐠", inStock: true },
  { id: "f-3", name: "Heterotis", subtitle: "Heterotis niloticus", section: "Fish", category: "Freshwater", price: "GH₵ 52.00", unit: "per kg", origin: "Earthen Ponds", description: "Large freshwater bony tongue fish highly prized in local cuisine.", icon: "🐟", inStock: true },
  { id: "f-4", name: "Tilapia Fingerlings (100 Pack)", subtitle: "Sex-Reversed Male Fry", section: "Fish", category: "Fingerlings", price: "GH₵ 150.00", unit: "per 100 pack", origin: "Certified Hatchery", description: "High-survival sex-reversed male Tilapia fingerlings (5g).", icon: "🐠", inStock: true },
  { id: "f-5", name: "Catfish Fingerlings (100 Pack)", subtitle: "Dutch Strain Fry", section: "Fish", category: "Fingerlings", price: "GH₵ 160.00", unit: "per 100 pack", origin: "Certified Hatchery", description: "Dutch strain fast-growing Catfish fingerlings (6g).", icon: "🐟", inStock: true },
  { id: "f-6", name: "Red Snapper", subtitle: "Lutjanus campechanus", section: "Fish", category: "Saltwater", price: "GH₵ 90.00", unit: "per kg", origin: "Tema Deep Sea Harbor", description: "Fresh wild-caught Red Snapper with sweet firm meat.", icon: "🐟", inStock: true },
  { id: "f-7", name: "Rainbow Trout", subtitle: "Oncorhynchus mykiss", section: "Fish", category: "Freshwater", price: "GH₵ 85.00", unit: "per kg", origin: "Cold Water Import", description: "Rich omega-3 fillet quality trout for hotels and high-end restaurants.", icon: "🐟", inStock: true },
  { id: "f-8", name: "Atlantic Salmon", subtitle: "Salmo salar", section: "Fish", category: "Saltwater", price: "GH₵ 110.00", unit: "per kg", origin: "Chilled Import", description: "Grade-A fresh Atlantic Salmon fillets and whole fish.", icon: "🐟", inStock: true },
  { id: "f-9", name: "Koi Carp Pair", subtitle: "Cyprinus rubrofuscus", section: "Fish", category: "Ornamental", price: "GH₵ 60.00", unit: "per pair", origin: "Ornamental Hatchery", description: "Vibrant colored Japanese ornamental Koi for garden ponds.", icon: "🐠", inStock: true },
];

export function MarketPage() {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState<"Fish" | "Feeds" | "Equipment" | "Supplies">("Feeds");
  const [searchQuery, setSearchQuery] = useState<string>("");
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

  const fetchMarketInsights = async (type: string) => {
    setLoadingAI(true);
    try {
      const res = await getAIMarketInsights(type);
      setMarketInsight(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleOrderWhatsapp = (item: MarketItem) => {
    const text = encodeURIComponent(`hello, im messaging from the fish doctor app to order ${item.name} (${item.price} ${item.unit})`);
    window.open(`https://wa.me/233248785807?text=${text}`, "_blank");
  };

  const handleOrderCall = () => {
    window.location.href = "tel:+233248785807";
  };

  const filteredItems = MARKET_ITEMS.filter((item) => {
    const matchesSection = item.section === activeSection;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSection && matchesSearch;
  });

  return (
    <PhoneFrame>
      {/* Header */}
      <header className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-gray-100 bg-white shadow-xs">
        <div className="flex items-center gap-3">
          <Link to="/home" className="p-1 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-800" />
          </Link>
          <div>
            <h1 className="text-[19px] font-extrabold text-gray-900 leading-tight">Live Market & Farm Store</h1>
            <div className="flex items-center gap-1 text-[#0F6236] text-[12px] font-semibold mt-0.5">
              <MapPin className="w-3.5 h-3.5" /> {userLocation}
            </div>
          </div>
        </div>
        <img src={farmerImg} alt="Kofi" className="w-9 h-9 rounded-full object-cover border-2 border-[#0F6236]" />
      </header>

      {/* Main Section Selector Tabs (Feeds, Equipment, Medications, Fish) */}
      <section className="px-5 mt-4">
        <div className="grid grid-cols-4 gap-1.5 p-1.5 bg-gray-100 rounded-2xl">
          {[
            { id: "Feeds", label: "🌾 Feeds", count: "6 Types" },
            { id: "Equipment", label: "⚙️ Tools", count: "6 Items" },
            { id: "Supplies", label: "🧪 Water", count: "5 Items" },
            { id: "Fish", label: "🐟 Fish", count: "30 Species" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`py-2 px-1 rounded-xl text-center cursor-pointer transition-all ${
                activeSection === tab.id
                  ? "bg-[#0F6236] text-white font-extrabold shadow-md"
                  : "text-gray-700 font-bold hover:bg-gray-200"
              }`}
            >
              <div className="text-xs leading-tight">{tab.label}</div>
              <div className="text-[9.5px] opacity-80 font-normal">{tab.count}</div>
            </button>
          ))}
        </div>
      </section>

      {/* AI Real-Time Price Ticker */}
      <section className="mx-5 mt-3.5 rounded-2xl bg-[#0F6236]/10 p-3.5 border border-[#0F6236]/20 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#0F6236]/20 pb-2">
          <div className="flex items-center gap-1.5 font-extrabold text-xs text-[#0F6236]">
            <Sparkles className="w-4 h-4 text-[#0F6236]" /> Real-Time Groq AI Price Monitor
          </div>
          <button
            onClick={() => fetchMarketInsights(activeSection)}
            className="flex items-center gap-1 text-[10px] font-extrabold text-[#0F6236] bg-white px-2 py-1 rounded-full border border-gray-200 cursor-pointer hover:bg-gray-50"
          >
            <RefreshCw className={`w-3 h-3 ${loadingAI ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>

        {loadingAI ? (
          <div className="flex items-center justify-center p-3 text-xs font-bold text-[#0F6236]">
            <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> Fetching Market Rates for {activeSection}...
          </div>
        ) : marketInsight ? (
          <div className="mt-2.5 space-y-1 text-xs">
            <div className="flex items-baseline justify-between">
              <span className="text-gray-600 font-medium">Regional Market Trend:</span>
              <span className="text-sm font-extrabold text-[#0F6236]">{marketInsight.currentPricePerKg}</span>
            </div>
            <p className="text-gray-700 font-medium text-[11.5px] pt-0.5">
              💡 <span className="font-bold">Advice: </span>{marketInsight.advice}
            </p>
          </div>
        ) : null}
      </section>

      {/* Search Input Bar */}
      <section className="px-5 mt-3.5">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeSection} catalog by name or brand...`}
            className="w-full h-11 pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-800 outline-none focus:ring-2 focus:ring-[#0F6236]/20 shadow-xs"
          />
        </div>
      </section>

      {/* Store Items List */}
      <section className="px-5 mt-4 space-y-3 pb-6">
        <div className="flex items-center justify-between text-xs font-bold text-gray-700">
          <span>{activeSection} Catalog ({filteredItems.length})</span>
          <span className="text-[#0F6236] font-semibold">Official Wholesale Prices</span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 shadow-xs">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h3 className="font-bold text-gray-800 text-sm">No items found</h3>
            <p className="text-xs text-gray-400 mt-1">Try clearing your search terms.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs hover:border-[#0F6236]/40 transition-all space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#0F6236]/10 border border-[#0F6236]/20 flex items-center justify-center text-xl shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-gray-900">{item.name}</h3>
                    </div>
                    <p className="text-[11px] text-[#0F6236] font-extrabold">{item.subtitle}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-extrabold text-[#0F6236]">{item.price}</div>
                  <div className="text-[10px] text-gray-500 font-semibold">{item.unit}</div>
                </div>
              </div>

              <p className="text-xs text-gray-600 font-medium leading-relaxed bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                {item.description}
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                <span className="text-[11px] text-gray-500 font-semibold flex items-center gap-1">
                  📍 Origin: {item.origin}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOrderWhatsapp(item)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Order
                  </button>
                  <button
                    onClick={handleOrderCall}
                    className="px-3.5 py-1.5 rounded-xl bg-[#0F6236] hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      <BottomNav />
    </PhoneFrame>
  );
}
