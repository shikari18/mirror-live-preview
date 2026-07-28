import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import feedBag from "@/assets/feed-bag-illus.png";
import { callGroqAI } from "@/lib/groq";
import { useLanguage } from "@/lib/languageContext";

export const Route = createFileRoute("/feed-calculator")({
  component: FeedCalcPage,
  head: () => ({
    meta: [
      { title: "Feed Calculator — Fish Doctor" },
      { name: "description", content: "Calculate daily feed requirements and pellet sizing using Groq AI." },
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

  const totalBiomassKg = (fishCount * avgWeight) / 1000;
  const dailyFeedKg = totalBiomassKg * (feedingRate / 100);
  const feedPerMeal = dailyFeedKg / timesPerDay;
  const weeklyFeedKg = dailyFeedKg * 7;
  const monthlyFeedKg = dailyFeedKg * 30;

  const handleGetAITips = async () => {
    setLoadingAI(true);
    try {
      const prompt = `Give concise (2-3 sentences) expert advice for feeding ${fishCount} fish weighing an average of ${avgWeight}g with ${dailyFeedKg.toFixed(2)}kg of feed daily. Mention ideal pellet size (mm), protein percentage, and feeding times.`;
      const res = await callGroqAI(prompt, "You are a professional aquatic nutritionist and fish doctor.");
      setAiAdvice(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <PhoneFrame>
      <header className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-sky-100 bg-white shadow-xs">
        <div className="flex items-center gap-3">
          <Link to="/home" className="p-1 cursor-pointer hover:bg-sky-50 rounded-full">
            <ArrowLeft className="w-5 h-5 text-slate-800" />
          </Link>
          <div>
            <h1 className="text-[19px] font-extrabold text-slate-900 leading-tight">{t("feedCalc")}</h1>
            <p className="text-xs text-slate-500 font-medium">Calculate daily feed & optimize costs</p>
          </div>
        </div>
        <img src={farmerImg} alt="Kofi" className="w-9 h-9 rounded-full object-cover border-2 border-[#0284C7]" />
      </header>

      <section className="mx-5 mt-4 rounded-2xl border border-sky-100 p-4 bg-white shadow-xs space-y-3">
        <div className="text-[14px] font-extrabold text-slate-900">1. Enter Pond Parameters</div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Fish Count</label>
            <input
              type="number"
              value={fishCount}
              onChange={(e) => setFishCount(Number(e.target.value) || 0)}
              className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#0284C7]/20 bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Avg Weight (g)</label>
            <input
              type="number"
              value={avgWeight}
              onChange={(e) => setAvgWeight(Number(e.target.value) || 0)}
              className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#0284C7]/20 bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Feeding Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={feedingRate}
              onChange={(e) => setFeedingRate(Number(e.target.value) || 0)}
              className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#0284C7]/20 bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Meals / Day</label>
            <select
              value={timesPerDay}
              onChange={(e) => setTimesPerDay(Number(e.target.value))}
              className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-900 outline-none bg-slate-50"
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
          className="w-full h-11 rounded-xl bg-[#0284C7] hover:bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#0284C7]/20 active:scale-[0.98] transition-all cursor-pointer mt-2"
        >
          {loadingAI ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Groq AI Optimizing Feed Plan...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Optimize Feed Plan with Groq AI
            </>
          )}
        </button>
      </section>

      <section className="mx-5 mt-4 rounded-2xl bg-sky-50/80 p-4 border border-sky-200 shadow-xs">
        <div className="text-[13px] font-extrabold text-[#0284C7] uppercase tracking-wider">Calculated Biomass & Feed</div>
        <div className="mt-2 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white p-2 flex items-center justify-center shrink-0 shadow-xs border border-sky-100">
            <img src={feedBag} alt="Feed Bag" className="w-full h-full object-contain" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-slate-600">Daily Feed Needed</div>
            <div className="text-[26px] font-extrabold text-[#0284C7] leading-tight">
              {dailyFeedKg.toFixed(2)} <span className="text-xs font-bold text-slate-700">kg/day</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-600 mt-0.5">
              ({feedPerMeal.toFixed(2)} kg per meal × {timesPerDay} meals)
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-sky-200 text-xs">
          <div className="bg-white p-2.5 rounded-xl border border-sky-100">
            <div className="text-slate-500 font-medium">Weekly Total</div>
            <div className="font-extrabold text-slate-900 text-sm">{weeklyFeedKg.toFixed(1)} kg</div>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-sky-100">
            <div className="text-slate-500 font-medium">Monthly Total</div>
            <div className="font-extrabold text-slate-900 text-sm">{monthlyFeedKg.toFixed(1)} kg</div>
          </div>
        </div>

        {aiAdvice && (
          <div className="mt-3 p-3 rounded-xl bg-white border border-sky-200 text-xs text-slate-800 animate-in fade-in">
            <div className="flex items-center gap-1.5 font-bold text-[#0284C7] mb-1">
              <Sparkles className="w-4 h-4" /> Groq AI Advice:
            </div>
            <p className="leading-relaxed font-medium">{aiAdvice}</p>
          </div>
        )}
      </section>

      <BottomNav />
    </PhoneFrame>
  );
}
