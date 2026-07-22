import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Bell, MapPin, Camera, Send, ShieldCheck, X, Headphones, MessageSquare, ChevronRight, Sparkles, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import ulcers from "@/assets/disease-ulcers.jpg";
import gasping from "@/assets/disease-gasping.jpg";
import whitespots from "@/assets/disease-whitespots.jpg";
import { diagnoseFishDiseaseAI } from "@/lib/gemini";
import { useLanguage } from "@/lib/languageContext";

export const Route = createFileRoute("/ai-doctor")({
  component: DiseasePage,
  head: () => ({
    meta: [
      { title: "AI Fish Doctor — FishFarm OS Ghana" },
      { name: "description", content: "Report signs of disease and get instant AI diagnosis powered by Gemini 2.5." },
    ],
  }),
});

const commonSymptomsList = [
  "Red Spots & Body Ulcers",
  "Gasping at Water Surface",
  "White Spots on Skin / Scales",
  "Frayed & Rotting Fins",
  "Erratic Swimming & Swelling",
  "Loss of Appetite & Lethargy"
];

export function DiseasePage() {
  const { t } = useLanguage();
  const [selectedSymptom, setSelectedSymptom] = useState<string>("Red Spots & Body Ulcers");
  const [description, setDescription] = useState<string>("");
  const [pond, setPond] = useState<string>("Pond 1 (Catfish)");
  const [loading, setLoading] = useState<boolean>(false);
  const [diagnosisResult, setDiagnosisResult] = useState<any | null>(null);

  const handleDiagnose = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setDiagnosisResult(null);

    const fullSymptomsText = `${selectedSymptom}. ${description}`;
    try {
      const result = await diagnoseFishDiseaseAI(fullSymptomsText);
      setDiagnosisResult(result);
    } catch (err) {
      console.error(err);
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
            <div className="text-[22px] font-extrabold text-foreground leading-tight">
              {t("aiDoctor")}
            </div>
            <div className="flex items-center gap-1 text-[#0F6236] text-[13px] font-medium mt-0.5">
              <MapPin className="w-4 h-4" /> Ashanti Region, Ghana
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#0F6236]/10 text-[#0F6236] flex items-center justify-center font-bold text-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <img src={farmerImg} alt="Farmer Kofi" className="w-10 h-10 rounded-full object-cover border-2 border-[#0F6236]" />
        </div>
      </header>

      {/* Warning Banner */}
      <section className="mx-5 mt-4 rounded-2xl bg-[#0F6236]/10 p-3.5 flex items-start gap-3 border border-[#0F6236]/20">
        <div className="w-8 h-8 rounded-full bg-[#0F6236] text-white flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="flex-1 text-[12.5px]">
          <div className="font-extrabold text-[#0F6236]">Early AI Detection Saves Your Stock</div>
          <div className="text-gray-600">Select symptoms or type observations for real-time Gemini diagnosis.</div>
        </div>
      </section>

      {/* Diagnostic Form */}
      <section className="mx-5 mt-4 rounded-2xl border border-border p-4 bg-white shadow-xs">
        <div className="flex items-center justify-between">
          <div className="text-[15px] font-extrabold text-foreground flex items-center gap-2">
            <span>1. Select Observed Symptoms</span>
          </div>
          <span className="text-[10px] font-bold text-[#0F6236] bg-[#0F6236]/10 px-2 py-0.5 rounded-full">
            Gemini 2.5 AI
          </span>
        </div>

        <form onSubmit={handleDiagnose} className="mt-3 space-y-3">
          {/* Select Common Symptom */}
          <div className="grid grid-cols-2 gap-2">
            {commonSymptomsList.map((sym) => (
              <button
                type="button"
                key={sym}
                onClick={() => setSelectedSymptom(sym)}
                className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                  selectedSymptom === sym
                    ? "border-[#0F6236] bg-[#0F6236]/10 text-[#0F6236]"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                🐟 {sym}
              </button>
            ))}
          </div>

          {/* Select Target Pond */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Target Pond</label>
            <select
              value={pond}
              onChange={(e) => setPond(e.target.value)}
              className="w-full h-11 rounded-xl border border-gray-200 px-3 text-xs font-semibold bg-gray-50 text-gray-800 outline-none"
            >
              <option>Pond 1 (Catfish - 1,200 fish)</option>
              <option>Pond 2 (Tilapia - 800 fish)</option>
              <option>Pond 3 (Catfish Nursery - 3,000 fingerlings)</option>
            </select>
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Additional Observations / Water Details</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Fish started swimming sluggishly this morning, water looks cloudy..."
              className="w-full p-3 rounded-xl border border-gray-200 text-xs text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#0F6236]/20"
            />
          </div>

          {/* Submit AI Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-[#0F6236] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#0F6236]/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Analyzing with Gemini AI...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" /> Run AI Disease Diagnosis
              </>
            )}
          </button>
        </form>

        {/* Diagnosis Results Card */}
        {diagnosisResult && (
          <div className="mt-5 p-4 rounded-2xl bg-[#0F6236]/5 border border-[#0F6236]/30 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#0F6236]/20 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-[#0F6236] tracking-wider">AI Diagnosis Result</span>
                <h3 className="text-base font-extrabold text-gray-900">{diagnosisResult.diseaseName}</h3>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                diagnosisResult.severity === "High" || diagnosisResult.severity === "Critical"
                  ? "bg-red-100 text-red-700"
                  : "bg-amber-100 text-amber-700"
              }`}>
                {diagnosisResult.severity} Risk
              </span>
            </div>

            <div className="mt-3 space-y-2.5 text-xs text-gray-800">
              <div>
                <span className="font-bold text-gray-900">Probable Cause: </span>
                <span>{diagnosisResult.cause}</span>
              </div>

              <div>
                <span className="font-bold text-gray-900 block mb-1">Recommended Action Plan:</span>
                <ul className="space-y-1 pl-4 list-disc text-gray-700 font-medium">
                  {diagnosisResult.treatment?.map((t: string, idx: number) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-[#0F6236]/10">
                <span className="font-bold text-[#0F6236] block">Local Remedy / Medicine (Ghana):</span>
                <span className="font-extrabold text-gray-900">{diagnosisResult.recommendedMedicine}</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Historical Cases */}
      <section className="mx-5 mt-4 mb-6 rounded-2xl border border-border p-4 bg-white">
        <div className="text-[15px] font-extrabold text-foreground mb-3">Previous AI Assessments</div>
        <div className="space-y-3 divide-y divide-gray-100">
          <div className="flex items-center gap-3 pt-2">
            <img src={ulcers} alt="Ulcers" className="w-12 h-12 rounded-xl object-cover" />
            <div className="flex-1">
              <div className="text-xs font-bold text-gray-900">Body Ulcers on Tilapia</div>
              <div className="text-[11px] text-gray-500">Pond 1 • Salt Treatment Applied</div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">Resolved</span>
          </div>

          <div className="flex items-center gap-3 pt-3">
            <img src={gasping} alt="Gasping" className="w-12 h-12 rounded-xl object-cover" />
            <div className="flex-1">
              <div className="text-xs font-bold text-gray-900">Gasping at Surface</div>
              <div className="text-[11px] text-gray-500">Pond 2 • Aeration Restored</div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">Resolved</span>
          </div>
        </div>
      </section>

      <BottomNav />
    </PhoneFrame>
  );
}
