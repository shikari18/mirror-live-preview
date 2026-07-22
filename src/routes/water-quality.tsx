import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, MapPin, Sparkles, Loader2, FlaskConical } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import { evaluateWaterQualityAI } from "@/lib/gemini";
import { useLanguage } from "@/lib/languageContext";

export const Route = createFileRoute("/water-quality")({
  component: WaterQualityPage,
  head: () => ({
    meta: [
      { title: "Water Quality — FishFarm OS Ghana" },
      { name: "description", content: "Monitor pond water quality: temperature, pH, oxygen and more." },
    ],
  }),
});

export function WaterQualityPage() {
  const { t } = useLanguage();
  const [temp, setTemp] = useState<number>(28);
  const [ph, setPh] = useState<number>(7.2);
  const [dissolvedOxygen, setDissolvedOxygen] = useState<number>(5.8);
  const [ammonia, setAmmonia] = useState<number>(0.02);

  const [loading, setLoading] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<any | null>(null);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await evaluateWaterQualityAI({
        temp,
        ph,
        do: dissolvedOxygen,
        ammonia,
      });
      setEvaluation(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PhoneFrame>
      {/* Header */}
      <header className="px-5 pt-6 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Link to="/home" className="pt-1">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </Link>
          <div>
            <h1 className="text-[22px] font-extrabold text-foreground leading-tight">{t("waterQuality")}</h1>
            <div className="flex items-center gap-1 text-[#0F6236] text-[13px] font-medium mt-0.5">
              <MapPin className="w-4 h-4" /> Ashanti Region, Ghana
            </div>
          </div>
        </div>
        <img src={farmerImg} alt="Kofi" className="w-10 h-10 rounded-full object-cover border-2 border-[#0F6236]" />
      </header>

      {/* Input Parameters Form */}
      <section className="mx-5 mt-4 rounded-2xl border border-border p-4 bg-white shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[14px] font-extrabold text-gray-900">Enter Live Measurements</span>
          <span className="text-[10px] font-bold text-[#0F6236] bg-[#0F6236]/10 px-2 py-0.5 rounded-full">
            AI Evaluator
          </span>
        </div>

        <form onSubmit={handleEvaluate} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Temperature (°C)</label>
              <input
                type="number"
                step="0.1"
                value={temp}
                onChange={(e) => setTemp(Number(e.target.value))}
                className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#0F6236]/20 bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">pH Level (6.0 - 9.0)</label>
              <input
                type="number"
                step="0.1"
                value={ph}
                onChange={(e) => setPh(Number(e.target.value))}
                className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#0F6236]/20 bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Dissolved Oxygen (mg/L)</label>
              <input
                type="number"
                step="0.1"
                value={dissolvedOxygen}
                onChange={(e) => setDissolvedOxygen(Number(e.target.value))}
                className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#0F6236]/20 bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Ammonia NH₃ (mg/L)</label>
              <input
                type="number"
                step="0.01"
                value={ammonia}
                onChange={(e) => setAmmonia(Number(e.target.value))}
                className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#0F6236]/20 bg-gray-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-[#0F6236] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#0F6236]/20 active:scale-[0.98] transition-all cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Evaluating Water Quality...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Evaluate Water Health with AI
              </>
            )}
          </button>
        </form>

        {evaluation && (
          <div className="mt-4 p-4 rounded-2xl bg-[#0F6236]/5 border border-[#0F6236]/30 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-[#0F6236] uppercase">AI Health Score</span>
                <div className="text-2xl font-extrabold text-gray-900">{evaluation.score} <span className="text-xs text-gray-500 font-normal">/ 100</span></div>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                evaluation.status === "Optimal"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}>
                {evaluation.status}
              </span>
            </div>

            <p className="text-xs text-gray-700 font-medium mt-2 leading-relaxed">{evaluation.summary}</p>

            <div className="mt-3 pt-2 border-t border-[#0F6236]/20">
              <span className="text-xs font-bold text-[#0F6236] block mb-1">Action Items:</span>
              <ul className="space-y-1 pl-4 list-disc text-xs text-gray-800">
                {evaluation.recommendations?.map((rec: string, idx: number) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>

      {/* Parameter Cards Overview */}
      <section className="mx-5 mt-4 mb-6 grid grid-cols-2 gap-2.5">
        {[
          { label: "Temperature", val: `${temp}°C`, range: "26 – 30°C", ok: temp >= 26 && temp <= 30 },
          { label: "pH Level", val: `${ph}`, range: "6.5 – 8.5", ok: ph >= 6.5 && ph <= 8.5 },
          { label: "Oxygen (DO)", val: `${dissolvedOxygen} mg/L`, range: "> 5.0 mg/L", ok: dissolvedOxygen >= 5.0 },
          { label: "Ammonia", val: `${ammonia} mg/L`, range: "< 0.05 mg/L", ok: ammonia <= 0.05 },
        ].map((item) => (
          <div key={item.label} className="p-3 bg-white rounded-2xl border border-gray-200/80 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
              <FlaskConical className="w-3.5 h-3.5 text-[#0F6236]" /> {item.label}
            </div>
            <div className="text-lg font-extrabold text-gray-900 mt-1">{item.val}</div>
            <div className="flex items-center justify-between mt-1 text-[10px]">
              <span className="text-gray-400">{item.range}</span>
              <span className={`font-bold ${item.ok ? "text-emerald-600" : "text-amber-600"}`}>
                {item.ok ? "Optimal" : "Check"}
              </span>
            </div>
          </div>
        ))}
      </section>

      <BottomNav />
    </PhoneFrame>
  );
}
