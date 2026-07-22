import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Calculator, Info, Sparkles, Loader2, TrendingUp, CheckCircle2 } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import feedBag from "@/assets/feed-bag-illus.png";
import { callGemini } from "@/lib/gemini";
import { useLanguage } from "@/lib/languageContext";

export const Route = createFileRoute("/feed-calculator")({
  component: FeedCalcPage,
  head: () => ({
    meta: [
      { title: "Feed Calculator — FishFarm OS Ghana" },
      { name: "description", content: "Calculate the right amount of feed for healthy growth and less waste." },
    ],
  }),
});

export function FeedCalcPage() {
  const { t } = useLanguage();
  const [fishCount, setFishCount] = useState<number>(1000);
  const [avgWeight, setAvgWeight] = useState<number>(250); // in grams
  const [feedingRate, setFeedingRate] = useState<number>(2.5); // % of biomass
  const [timesPerDay, setTimesPerDay] = useState<number>(2);
  const [loadingAI, setLoadingAI] = useState<boolean>(false);
  const [aiAdvice, setAiAdvice] = useState<string>("");

  // Biomass calculation (kg) = (fishCount * avgWeight) / 1000
  const totalBiomassKg = (fishCount * avgWeight) / 1000;
  // Daily Feed (kg) = totalBiomassKg * (feedingRate / 100)
  const dailyFeedKg = totalBiomassKg * (feedingRate / 100);
  const feedPerMeal = dailyFeedKg / timesPerDay;
  const weeklyFeedKg = dailyFeedKg * 7;
  const monthlyFeedKg = dailyFeedKg * 30;

  const handleGetAITips = async () => {
    setLoadingAI(true);
    try {
      const prompt = `Give concise (2-3 sentences) expert advice for feeding ${fishCount} fish weighing an average of ${avgWeight}g with ${dailyFeedKg.toFixed(2)}kg of feed daily in Ghana ponds. Mention ideal pellet size (mm) and feeding times (e.g. 8am and 4pm).`;
      const res = await callGemini(prompt, "You are a professional aquaculture feeding specialist in Ghana.");
      setAiAdvice(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <PhoneFrame>
      {/* Header */}
      <header className="px-5 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/home" className="p-1">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </Link>
          <div>
            <h1 className="text-[20px] font-extrabold text-foreground leading-tight">{t("feedCalc")}</h1>
            <p className="text-xs text-muted-foreground">Calculate daily feed & optimize costs</p>
          </div>
        </div>
        <img src={farmerImg} alt="Kofi" className="w-10 h-10 rounded-full object-cover border-2 border-[#0F6236]" />
      </header>

      {/* Input Form */}
      <section className="mx-5 mt-4 rounded-2xl border border-border p-4 bg-white shadow-xs space-y-3">
        <div className="text-[14px] font-extrabold text-foreground">1. Enter Pond Parameters</div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Fish Count</label>
            <input
              type="number"
              value={fishCount}
              onChange={(e) => setFishCount(Number(e.target.value) || 0)}
              className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#0F6236]/20 bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Avg Weight (g)</label>
            <input
              type="number"
              value={avgWeight}
              onChange={(e) => setAvgWeight(Number(e.target.value) || 0)}
              className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#0F6236]/20 bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Feeding Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={feedingRate}
              onChange={(e) => setFeedingRate(Number(e.target.value) || 0)}
              className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#0F6236]/20 bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Meals / Day</label>
            <select
              value={timesPerDay}
              onChange={(e) => setTimesPerDay(Number(e.target.value))}
              className="w-full h-11 rounded-xl border border-gray-200 px-3 text-xs font-bold text-gray-900 outline-none bg-gray-50"
            >
              <option value={1}>1 Meal / Day</option>
              <option value={2}>2 Meals / Day</option>
              <option value={3}>3 Meals / Day</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGetAITips}
          disabled={loadingAI}
          className="w-full h-11 rounded-xl bg-[#0F6236] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#0F6236]/20 active:scale-[0.98] transition-all cursor-pointer mt-2"
        >
          {loadingAI ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Optimizing with Gemini...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Optimize Feed Plan with Gemini AI
            </>
          )}
        </button>
      </section>

      {/* Results Section */}
      <section className="mx-5 mt-4 rounded-2xl bg-[#0F6236]/10 p-4 border border-[#0F6236]/20">
        <div className="text-[13px] font-extrabold text-[#0F6236] uppercase tracking-wider">Calculated Results</div>
        <div className="mt-2 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white p-2 flex items-center justify-center shrink-0 shadow-xs">
            <img src={feedBag} alt="Feed Bag" className="w-full h-full object-contain" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-gray-600">Daily Feed Needed</div>
            <div className="text-[26px] font-extrabold text-[#0F6236] leading-tight">
              {dailyFeedKg.toFixed(2)} <span className="text-xs font-bold text-gray-700">kg/day</span>
            </div>
            <div className="text-[11px] font-semibold text-gray-600 mt-0.5">
              ({feedPerMeal.toFixed(2)} kg per meal × {timesPerDay} meals)
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#0F6236]/20 text-xs">
          <div className="bg-white p-2.5 rounded-xl border border-gray-200">
            <div className="text-gray-500 font-medium">Weekly Total</div>
            <div className="font-extrabold text-gray-900 text-sm">{weeklyFeedKg.toFixed(1)} kg</div>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-gray-200">
            <div className="text-gray-500 font-medium">Monthly Total</div>
            <div className="font-extrabold text-gray-900 text-sm">{monthlyFeedKg.toFixed(1)} kg</div>
          </div>
        </div>

        {/* AI Custom Advice */}
        {aiAdvice && (
          <div className="mt-3 p-3 rounded-xl bg-white border border-[#0F6236]/30 text-xs text-gray-800 animate-in fade-in">
            <div className="flex items-center gap-1.5 font-bold text-[#0F6236] mb-1">
              <Sparkles className="w-4 h-4" /> Gemini AI Feeding Advice:
            </div>
            <p className="leading-relaxed">{aiAdvice}</p>
          </div>
        )}
      </section>

      {/* Recommended Pellet Size Guide */}
      <section className="mx-5 mt-4 mb-6 rounded-2xl border border-border p-4 bg-white">
        <div className="text-[14px] font-extrabold text-foreground mb-3">Pellet Size Guide (Ghana)</div>
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="bg-blue-50 p-2 rounded-xl">
            <div className="font-bold text-blue-900">Fingerling</div>
            <div className="text-[10px] text-gray-500">5g – 20g</div>
            <div className="font-extrabold text-blue-700 mt-1">1.5 - 2mm</div>
          </div>
          <div className="bg-emerald-50 p-2 rounded-xl">
            <div className="font-bold text-emerald-900">Juvenile</div>
            <div className="text-[10px] text-gray-500">20g – 100g</div>
            <div className="font-extrabold text-emerald-700 mt-1">3mm</div>
          </div>
          <div className="bg-amber-50 p-2 rounded-xl">
            <div className="font-bold text-amber-900">Grower</div>
            <div className="text-[10px] text-gray-500">100g – 400g</div>
            <div className="font-extrabold text-amber-700 mt-1">4mm - 6mm</div>
          </div>
          <div className="bg-purple-50 p-2 rounded-xl">
            <div className="font-bold text-purple-900">Finisher</div>
            <div className="text-[10px] text-gray-500">400g+</div>
            <div className="font-extrabold text-purple-700 mt-1">9mm</div>
          </div>
        </div>
      </section>

      <BottomNav />
    </PhoneFrame>
  );
}
