import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, TrendingUp, Plus, DollarSign, Calendar, Scale, Award, Trash2, X, Sparkles } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import { useLanguage } from "@/lib/languageContext";

export const Route = createFileRoute("/harvest")({
  component: HarvestPage,
  head: () => ({
    meta: [
      { title: "Harvest Ledger & Net Profit Tracker — Fish Doctor" },
      { name: "description", content: "Record fish harvests, calculate net profits, and track return on investment (ROI)." },
    ],
  }),
});

interface HarvestBatch {
  id: string;
  pondName: string;
  species: string;
  weightKg: number;
  pricePerKgGhc: number;
  feedExpenseGhc: number;
  harvestDate: string;
}

const DEFAULT_HARVESTS: HarvestBatch[] = [
  {
    id: "h1",
    pondName: "Catfish Pond 1",
    species: "African Catfish",
    weightKg: 1450,
    pricePerKgGhc: 38,
    feedExpenseGhc: 22000,
    harvestDate: "2026-07-15",
  },
  {
    id: "h2",
    pondName: "Tilapia Pond 2",
    species: "Nile Tilapia",
    weightKg: 950,
    pricePerKgGhc: 35,
    feedExpenseGhc: 14500,
    harvestDate: "2026-06-28",
  },
];

const STORAGE_HARVESTS_KEY = "user_farm_harvest_ledger_v1";

export function HarvestPage() {
  const { t } = useLanguage();
  const [harvests, setHarvests] = useState<HarvestBatch[]>(DEFAULT_HARVESTS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [pondName, setPondName] = useState("Catfish Pond 1");
  const [species, setSpecies] = useState("African Catfish");
  const [weightKg, setWeightKg] = useState<number>(1000);
  const [pricePerKgGhc, setPricePerKgGhc] = useState<number>(38);
  const [feedExpenseGhc, setFeedExpenseGhc] = useState<number>(16000);
  const [harvestDate, setHarvestDate] = useState<string>(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_HARVESTS_KEY);
      if (raw) setHarvests(JSON.parse(raw));
    } catch (e) {
      console.warn("Harvest ledger load error", e);
    }
  }, []);

  const handleAddHarvest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightKg || weightKg <= 0) return;

    const newBatch: HarvestBatch = {
      id: "h_" + Date.now().toString(36),
      pondName: pondName.trim() || "Pond",
      species,
      weightKg,
      pricePerKgGhc,
      feedExpenseGhc,
      harvestDate,
    };

    const updated = [newBatch, ...harvests];
    setHarvests(updated);
    localStorage.setItem(STORAGE_HARVESTS_KEY, JSON.stringify(updated));
    setIsModalOpen(false);
  };

  const handleDeleteHarvest = (id: string) => {
    if (confirm("Delete this harvest record?")) {
      const updated = harvests.filter((h) => h.id !== id);
      setHarvests(updated);
      localStorage.setItem(STORAGE_HARVESTS_KEY, JSON.stringify(updated));
    }
  };

  // Financial Computations
  const totalWeightKg = harvests.reduce((acc, h) => acc + h.weightKg, 0);
  const totalRevenueGhc = harvests.reduce((acc, h) => acc + h.weightKg * h.pricePerKgGhc, 0);
  const totalExpenseGhc = harvests.reduce((acc, h) => acc + h.feedExpenseGhc, 0);
  const netProfitGhc = totalRevenueGhc - totalExpenseGhc;
  const roiPct = totalExpenseGhc > 0 ? ((netProfitGhc / totalExpenseGhc) * 100).toFixed(1) : "0";

  return (
    <PhoneFrame>
      {/* Header */}
      <header className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-gray-200 bg-white sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <Link to="/home" className="p-1 hover:bg-gray-100 rounded-full cursor-pointer">
            <ArrowLeft className="w-5.5 h-5.5 text-gray-900" />
          </Link>
          <div>
            <h1 className="text-[19px] font-extrabold text-gray-900 leading-tight">Pond Harvest Ledger</h1>
            <p className="text-[11.5px] text-gray-500 font-medium">Track sales revenue & net profits</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-2 rounded-2xl bg-[#0F6236] text-white text-xs font-extrabold shadow-md hover:bg-[#0B4D29] transition-all cursor-pointer flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Record Harvest
        </button>
      </header>

      <section className="p-5 space-y-4">
        {/* Net Profit Summary Card */}
        <div className="bg-gradient-to-br from-[#08301B] via-[#0F6236] to-[#0A4827] text-white p-5 rounded-3xl shadow-xl shadow-[#0F6236]/30 border border-emerald-400/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-300">
              Total Farm Net Profit
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-[10.5px] font-extrabold">
              {roiPct}% ROI
            </span>
          </div>

          <div className="text-3xl font-black text-white">
            GH₵ {netProfitGhc.toLocaleString()}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center text-xs">
            <div>
              <span className="text-[10px] text-emerald-200 font-bold block">Total Harvested</span>
              <span className="font-extrabold text-white">{totalWeightKg.toLocaleString()} kg</span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-200 font-bold block">Gross Revenue</span>
              <span className="font-extrabold text-emerald-300">GH₵ {totalRevenueGhc.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-200 font-bold block">Feed Expenses</span>
              <span className="font-extrabold text-amber-200">GH₵ {totalExpenseGhc.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Harvest Records List */}
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold text-gray-900">Recorded Harvest Batches ({harvests.length})</h2>

          {harvests.map((batch) => {
            const batchRevenue = batch.weightKg * batch.pricePerKgGhc;
            const batchNet = batchRevenue - batch.feedExpenseGhc;
            return (
              <div key={batch.id} className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm space-y-2.5 relative">
                <div className="flex items-start justify-between border-b border-gray-100 pb-2">
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900">{batch.pondName}</h3>
                    <div className="text-[11px] text-gray-500 font-semibold">{batch.species} • {batch.harvestDate}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black px-2.5 py-1 rounded-full ${batchNet >= 0 ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                      +GH₵ {batchNet.toLocaleString()} Net
                    </span>
                    <button onClick={() => handleDeleteHarvest(batch.id)} className="p-1 text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-[10px] text-gray-500 font-bold block">Harvest Weight</span>
                    <span className="font-extrabold text-gray-900">{batch.weightKg.toLocaleString()} kg</span>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-[10px] text-gray-500 font-bold block">Selling Price</span>
                    <span className="font-extrabold text-gray-900">GH₵ {batch.pricePerKgGhc} / kg</span>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-[10px] text-gray-500 font-bold block">Feed Expense</span>
                    <span className="font-extrabold text-amber-700">GH₵ {batch.feedExpenseGhc.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Record Harvest Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-1.5">
                <TrendingUp className="w-4.5 h-4.5 text-[#0F6236]" /> Record Harvest Batch
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAddHarvest} className="space-y-3 text-xs">
              <div>
                <label className="block font-extrabold text-gray-800 mb-1">Pond Name</label>
                <input
                  type="text"
                  required
                  value={pondName}
                  onChange={(e) => setPondName(e.target.value)}
                  className="w-full h-11 px-3 border border-gray-300 rounded-xl bg-gray-50 outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-extrabold text-gray-800 mb-1">Total Weight (kg)</label>
                  <input
                    type="number"
                    required
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value) || 0)}
                    className="w-full h-11 px-3 border border-gray-300 rounded-xl bg-gray-50 outline-none font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block font-extrabold text-gray-800 mb-1">Price (GH₵ / kg)</label>
                  <input
                    type="number"
                    required
                    value={pricePerKgGhc}
                    onChange={(e) => setPricePerKgGhc(Number(e.target.value) || 0)}
                    className="w-full h-11 px-3 border border-gray-300 rounded-xl bg-gray-50 outline-none font-bold text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-extrabold text-gray-800 mb-1">Total Feed Expense (GH₵)</label>
                  <input
                    type="number"
                    required
                    value={feedExpenseGhc}
                    onChange={(e) => setFeedExpenseGhc(Number(e.target.value) || 0)}
                    className="w-full h-11 px-3 border border-gray-300 rounded-xl bg-gray-50 outline-none font-bold text-sm text-amber-700"
                  />
                </div>
                <div>
                  <label className="block font-extrabold text-gray-800 mb-1">Harvest Date</label>
                  <input
                    type="date"
                    required
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    className="w-full h-11 px-3 border border-gray-300 rounded-xl bg-gray-50 outline-none font-bold text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-[#0F6236] hover:bg-[#0B4D29] text-white font-extrabold text-xs rounded-2xl shadow-md cursor-pointer mt-2"
              >
                Save Harvest Entry
              </button>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </PhoneFrame>
  );
}
