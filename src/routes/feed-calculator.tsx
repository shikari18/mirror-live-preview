import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Calculator, ArrowLeft, Sparkles, Check, Info, Loader2, TrendingUp, DollarSign, Scale, Percent } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import { useLanguage } from "@/lib/languageContext";
import { callGroqAI } from "@/lib/groq";
import { getUnifiedMemoryPrompt, getFarmProfile } from "@/lib/farmMemory";

export const Route = createFileRoute("/feed-calculator")({
  component: FeedCalculatorPage,
  head: () => ({
    meta: [
      { title: "Feed & FCR Profitability Calculator — Fish Doctor" },
      { name: "description", content: "Calculate daily feed rations, FCR (Feed Conversion Ratio), and net profit margins." },
    ],
  }),
});

export function FeedCalculatorPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"daily" | "fcr">("daily");

  // Daily Feed State
  const [fishType, setFishType] = useState("African Catfish");
  const [fishCount, setFishCount] = useState<number | "">(1000);
  const [avgWeightGrams, setAvgWeightGrams] = useState<number | "">(250);
  const [feedingRatePct, setFeedingRatePct] = useState<number | "">(3);
  const [result, setResult] = useState<{ dailyFeedKg: number; bagCount15kg: number; recommendedPelletSize: string; aiAdvice: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // FCR & Profitability State
  const [totalFeedConsumedKg, setTotalFeedConsumedKg] = useState<number | "">(1200);
  const [harvestWeightKg, setHarvestWeightKg] = useState<number | "">(1000);
  const [feedCostPerKgGhc, setFeedCostPerKgGhc] = useState<number | "">(18);
  const [fishPricePerKgGhc, setFishPricePerKgGhc] = useState<number | "">(38);
  const [fcrResult, setFcrResult] = useState<{
    fcr: number;
    fcrRating: string;
    totalFeedCost: number;
    totalRevenue: number;
    netProfit: number;
    profitMarginPct: number;
  } | null>(null);

  useEffect(() => {
    const profile = getFarmProfile();
    if (profile.primaryGoal) {
      if (profile.primaryGoal.toLowerCase().includes("tilapia")) {
        setFishType("Nile Tilapia");
      }
    }
    if (profile.ponds && profile.ponds.length > 0) {
      const firstPond = profile.ponds[0];
      if (firstPond.fishCount) setFishCount(firstPond.fishCount);
      if (firstPond.fishType) setFishType(firstPond.fishType);
    }
  }, []);

  const handleCalculateDaily = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const count = Number(fishCount) || 0;
    const weight = Number(avgWeightGrams) || 0;
    const rate = Number(feedingRatePct) || 0;

    const totalBiomassKg = (count * weight) / 1000;
    const dailyFeedKg = Number(((totalBiomassKg * rate) / 100).toFixed(2));
    const bagCount15kg = Math.ceil((dailyFeedKg * 30) / 15);

    let recommendedPelletSize = "3mm - 4mm Floating Pellets";
    if (weight <= 10) recommendedPelletSize = "1.5mm - 2mm Starter Crumble";
    else if (weight <= 50) recommendedPelletSize = "2mm Floating Pellets";
    else if (weight <= 150) recommendedPelletSize = "3mm Floating Pellets";
    else if (weight <= 400) recommendedPelletSize = "4.5mm - 6mm Pellets";
    else recommendedPelletSize = "6mm - 9mm Finisher Pellets";

    const farmMemory = getUnifiedMemoryPrompt();
    const prompt = `Fish species: ${fishType}, Total count: ${count}, Average weight: ${weight}g, Feeding rate: ${rate}%.
Calculate feeding advice and feed pellet size recommendations (e.g. 2mm, 3mm, or 4mm). Keep advice concise under 3 sentences.`;

    let aiAdvice = `Feed 2 times daily (morning 8:30am, evening 5:00pm). Recommended pellet size: ${recommendedPelletSize}. Ensure dissolved oxygen remains above 5.0 mg/L.`;
    try {
      const groqRes = await callGroqAI(prompt, "You are a Senior Feed & Nutrition Specialist for aquaculture.", [], farmMemory);
      if (groqRes && groqRes.trim()) {
        aiAdvice = groqRes.trim();
      }
    } catch (e) {
      console.warn("AI feed calculator fallback", e);
    }

    setResult({
      dailyFeedKg,
      bagCount15kg,
      recommendedPelletSize,
      aiAdvice
    });
    setLoading(false);
  };

  const handleCalculateFcr = (e: React.FormEvent) => {
    e.preventDefault();
    const feedKg = Number(totalFeedConsumedKg) || 0;
    const harvestKg = Number(harvestWeightKg) || 0;
    const costGhc = Number(feedCostPerKgGhc) || 0;
    const priceGhc = Number(fishPricePerKgGhc) || 0;

    if (!harvestKg || harvestKg <= 0) return;

    const fcr = Number((feedKg / harvestKg).toFixed(2));
    const totalFeedCost = feedKg * costGhc;
    const totalRevenue = harvestKg * priceGhc;
    const netProfit = totalRevenue - totalFeedCost;
    const profitMarginPct = Number(((netProfit / totalRevenue) * 100).toFixed(1));

    let fcrRating = "Excellent FCR (High Efficiency)";
    if (fcr > 1.8) fcrRating = "High FCR (Check Overfeeding or Water Quality)";
    else if (fcr > 1.4) fcrRating = "Standard Commercial FCR";
    else if (fcr < 1.0) fcrRating = "Exceptional FCR (Very Profitable)";

    setFcrResult({
      fcr,
      fcrRating,
      totalFeedCost,
      totalRevenue,
      netProfit,
      profitMarginPct
    });
  };

  return (
    <PhoneFrame>
      <header className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-gray-200 bg-white shadow-xs">
        <div className="flex items-center gap-3">
          <Link to="/home" className="p-1 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5.5 h-5.5 text-gray-900" />
          </Link>
          <h1 className="text-[19px] font-extrabold text-gray-900 leading-tight">AI Feed Calculator</h1>
        </div>
      </header>      <section className="p-5 space-y-4">
        {/* Tab Switcher */}
        <div className="flex rounded-2xl bg-gray-200/80 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("daily")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === "daily"
                ? "bg-[#0F6236] text-white shadow-md"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Daily Feed Ration
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("fcr")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === "fcr"
                ? "bg-[#0F6236] text-white shadow-md"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            FCR & Net Profit
          </button>
        </div>

        {activeTab === "daily" ? (
          <>
            <form onSubmit={handleCalculateDaily} className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">Fish Species</label>
                <select
                  value={fishType}
                  onChange={(e) => setFishType(e.target.value)}
                  className="w-full h-11 px-3 text-xs font-bold border border-gray-300 rounded-xl bg-gray-50 outline-none text-gray-900"
                >
                  <option>African Catfish</option>
                  <option>Nile Tilapia</option>
                  <option>Heterotis</option>
                  <option>Pangasius</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">Number of Fish Stocked</label>
                <input
                  type="number"
                  required
                  value={fishCount}
                  onChange={(e) => setFishCount(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full h-11 px-3 text-xs font-bold border border-gray-300 rounded-xl bg-gray-50 outline-none text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">Avg Weight (g)</label>
                  <input
                    type="number"
                    required
                    value={avgWeightGrams}
                    onChange={(e) => setAvgWeightGrams(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full h-11 px-3 text-xs font-bold border border-gray-300 rounded-xl bg-gray-50 outline-none text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">Feeding Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={feedingRatePct}
                    onChange={(e) => setFeedingRatePct(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full h-11 px-3 text-xs font-bold border border-gray-300 rounded-xl bg-gray-50 outline-none text-gray-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#0F6236] text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer hover:bg-[#0B4D29] flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Calculate Daily Ration</span>
              </button>
            </form>

            {result && (
              <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-md space-y-3 animate-in fade-in">
                <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">Calculated Daily Ration</h3>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <span className="text-[10px] text-gray-500 font-bold block">Daily Feed Weight</span>
                    <span className="text-xl font-black text-[#0F6236]">{result.dailyFeedKg} kg</span>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <span className="text-[10px] text-gray-500 font-bold block">Monthly 15kg Bags</span>
                    <span className="text-xl font-black text-[#0F6236]">{result.bagCount15kg} Bags</span>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs font-semibold text-gray-800">
                  <span className="font-extrabold text-[#0F6236] block mb-0.5">Recommended Size:</span>
                  {result.recommendedPelletSize}
                </div>

                <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-xs text-gray-700 leading-relaxed">
                  <span className="font-extrabold text-[#0F6236] block mb-0.5">AI Nutritionist Note:</span>
                  {result.aiAdvice}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* FCR & Net Profit Form */}
            <form onSubmit={handleCalculateFcr} className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">Total Feed Used (kg)</label>
                  <input
                    type="number"
                    required
                    value={totalFeedConsumedKg}
                    onChange={(e) => setTotalFeedConsumedKg(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full h-11 px-3 text-xs font-bold border border-gray-300 rounded-xl bg-gray-50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">Harvest Weight (kg)</label>
                  <input
                    type="number"
                    required
                    value={harvestWeightKg}
                    onChange={(e) => setHarvestWeightKg(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full h-11 px-3 text-xs font-bold border border-gray-300 rounded-xl bg-gray-50 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">Feed Cost (GH₵ / kg)</label>
                  <input
                    type="number"
                    required
                    value={feedCostPerKgGhc}
                    onChange={(e) => setFeedCostPerKgGhc(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full h-11 px-3 text-xs font-bold border border-gray-300 rounded-xl bg-gray-50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">Fish Price (GH₵ / kg)</label>
                  <input
                    type="number"
                    required
                    value={fishPricePerKgGhc}
                    onChange={(e) => setFishPricePerKgGhc(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full h-11 px-3 text-xs font-bold border border-gray-300 rounded-xl bg-gray-50 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-[#0F6236] text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer hover:bg-[#0B4D29] flex items-center justify-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Calculate FCR & Net Profit</span>
              </button>
            </form>

            {fcrResult && (
              <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-md space-y-3 animate-in fade-in">
                <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">FCR & Financial Performance</h3>

                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                  <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wider">Feed Conversion Ratio (FCR)</span>
                  <span className="text-3xl font-black text-[#0F6236]">{fcrResult.fcr}</span>
                  <span className="text-xs font-extrabold text-emerald-800 block mt-1">{fcrResult.fcrRating}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-[10px] text-gray-500 font-bold block">Total Feed Cost</span>
                    <span className="font-black text-gray-900">GH₵ {fcrResult.totalFeedCost.toLocaleString()}</span>
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-[10px] text-gray-500 font-bold block">Harvest Revenue</span>
                    <span className="font-black text-emerald-700">GH₵ {fcrResult.totalRevenue.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-gradient-to-r from-[#08301B] to-[#0F6236] rounded-2xl text-white flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider">Estimated Net Profit</span>
                    <div className="text-xl font-black">GH₵ {fcrResult.netProfit.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider">Margin</span>
                    <div className="text-lg font-black text-emerald-300">{fcrResult.profitMarginPct}%</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <BottomNav />
    </PhoneFrame>
  );
}
