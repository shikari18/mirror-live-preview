import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Calculator, ArrowLeft, Sparkles, Check, Info, Loader2 } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import { useLanguage } from "@/lib/languageContext";
import { callGroqAI } from "@/lib/groq";
import { getUnifiedMemoryPrompt, getFarmProfile } from "@/lib/farmMemory";

export const Route = createFileRoute("/feed-calculator")({
  component: FeedCalculatorPage,
  head: () => ({
    meta: [
      { title: "Feed Calculator — Fish Doctor" },
      { name: "description", content: "Calculate daily feed rations and growth targets using AI." },
    ],
  }),
});

export function FeedCalculatorPage() {
  const { t } = useLanguage();
  const [fishType, setFishType] = useState("African Catfish");
  const [fishCount, setFishCount] = useState<number>(1000);
  const [avgWeightGrams, setAvgWeightGrams] = useState<number>(250);
  const [feedingRatePct, setFeedingRatePct] = useState<number>(3);
  const [result, setResult] = useState<{ dailyFeedKg: number; bagCount15kg: number; recommendedPelletSize: string; aiAdvice: string } | null>(null);
  const [loading, setLoading] = useState(false);

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

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const totalBiomassKg = (fishCount * avgWeightGrams) / 1000;
    const dailyFeedKg = Number(((totalBiomassKg * feedingRatePct) / 100).toFixed(2));
    const bagCount15kg = Math.ceil((dailyFeedKg * 30) / 15);

    let recommendedPelletSize = "3mm - 4mm Floating Pellets";
    if (avgWeightGrams <= 10) recommendedPelletSize = "1.5mm - 2mm Starter Crumble";
    else if (avgWeightGrams <= 50) recommendedPelletSize = "2mm Floating Pellets";
    else if (avgWeightGrams <= 150) recommendedPelletSize = "3mm Floating Pellets";
    else if (avgWeightGrams <= 400) recommendedPelletSize = "4.5mm - 6mm Pellets";
    else recommendedPelletSize = "6mm - 9mm Finisher Pellets";

    const farmMemory = getUnifiedMemoryPrompt();
    const prompt = `Fish species: ${fishType}, Total count: ${fishCount}, Average weight: ${avgWeightGrams}g, Feeding rate: ${feedingRatePct}%.
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

  return (
    <PhoneFrame>
      <header className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-gray-200 bg-white shadow-xs">
        <div className="flex items-center gap-3">
          <Link to="/home" className="p-1 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5.5 h-5.5 text-gray-900" />
          </Link>
          <h1 className="text-[19px] font-extrabold text-gray-900 leading-tight">AI Feed Calculator</h1>
        </div>
      </header>

      <section className="p-5 space-y-4">
        <div className="bg-[#0F6236]/10 p-4 rounded-2xl border border-[#0F6236]/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F6236] text-white flex items-center justify-center font-bold">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#0F6236]">Feed Conversion Ratio (FCR)</div>
            <div className="text-xs text-gray-600 font-medium">Calculate exact daily feed weight & prevent overfeeding water pollution.</div>
          </div>
        </div>

        <form onSubmit={handleCalculate} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
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
              onChange={(e) => setFishCount(Number(e.target.value) || 0)}
              className="w-full h-11 px-3 text-xs font-bold border border-gray-300 rounded-xl bg-gray-50 outline-none text-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">Avg Weight (Grams)</label>
              <input
                type="number"
                required
                value={avgWeightGrams}
                onChange={(e) => setAvgWeightGrams(Number(e.target.value) || 0)}
                className="w-full h-11 px-3 text-xs font-bold border border-gray-300 rounded-xl bg-gray-50 outline-none text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">Feeding Rate (% Body Weight)</label>
              <input
                type="number"
                step="0.5"
                required
                value={feedingRatePct}
                onChange={(e) => setFeedingRatePct(Number(e.target.value) || 0)}
                className="w-full h-11 px-3 text-xs font-bold border border-gray-300 rounded-xl bg-gray-50 outline-none text-gray-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#0F6236] hover:bg-[#0B4D29] text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" /> Calculating Feed Ration...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Calculate Daily Ration
              </>
            )}
          </button>
        </form>

        {result && (
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-3 animate-in fade-in shadow-md">
            <h3 className="text-xs font-extrabold text-[#0F6236] uppercase tracking-wider">Calculated Feed Requirement</h3>
            
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-white p-3 rounded-xl border border-emerald-200">
                <span className="text-[10px] text-gray-500 font-bold block">Daily Feed Ration</span>
                <span className="text-lg font-extrabold text-gray-900">{result.dailyFeedKg} kg / day</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-200">
                <span className="text-[10px] text-gray-500 font-bold block">Monthly Bags (15kg)</span>
                <span className="text-lg font-extrabold text-[#0F6236]">~{result.bagCount15kg} Bags</span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-emerald-200 text-xs text-gray-800 font-medium">
              <span className="font-extrabold text-[#0F6236] block mb-0.5">Recommended Feed Size:</span>
              <span className="font-bold text-gray-900">{result.recommendedPelletSize}</span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-emerald-200 text-xs text-gray-800 font-medium">
              <span className="font-extrabold text-gray-900 block mb-0.5">AI Nutrition Guidance:</span>
              {result.aiAdvice}
            </div>
          </div>
        )}
      </section>

      <BottomNav />
    </PhoneFrame>
  );
}
