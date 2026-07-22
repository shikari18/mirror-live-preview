import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, MapPin, Camera, ShieldCheck, Sparkles, Loader2, Paperclip, CheckCircle, AlertTriangle, Stethoscope, Pill } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import { diagnoseFishDiseaseAI, MediaAttachment } from "@/lib/gemini";
import { useLanguage } from "@/lib/languageContext";
import { UserPond } from "./my-farm";

export const Route = createFileRoute("/ai-doctor")({
  component: DiseasePage,
  head: () => ({
    meta: [
      { title: "AI Fish Doctor — FishFarm OS Ghana" },
      { name: "description", content: "Report signs of disease and get instant AI diagnosis & treatments." },
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
  const [ponds, setPonds] = useState<UserPond[]>([]);
  const [selectedPond, setSelectedPond] = useState<string>("Pond 1");
  const [loading, setLoading] = useState<boolean>(false);
  const [diagnosisResult, setDiagnosisResult] = useState<any | null>(null);
  const [userCity, setUserCity] = useState<string>("Accra / Kumasi, Ghana");

  // File Upload State
  const [uploadedMedia, setUploadedMedia] = useState<{ name: string; type: string; mimeType: string; url: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("user_ponds");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setPonds(parsed);
        setSelectedPond(parsed[0].name);
      }
    }

    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setUserCity(`GPS: ${lat.toFixed(2)}° N, ${lon.toFixed(2)}° W (Ghana)`);
        },
        () => setUserCity("Ghana Farm Region")
      );
    }
  }, []);

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedMedia({
          name: file.name,
          type: file.type.startsWith("video") ? "video" : "image",
          mimeType: file.type || "image/jpeg",
          url: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDiagnose = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setDiagnosisResult(null);

    let fullSymptomsText = `Symptom Category: ${selectedSymptom}. Target Pond: ${selectedPond}. Additional Details: ${description || "Observed signs of distress in fish pond."}`;

    let mediaAttachments: MediaAttachment[] = [];
    if (uploadedMedia) {
      mediaAttachments.push({
        mimeType: uploadedMedia.mimeType,
        data: uploadedMedia.url
      });
    }

    try {
      const result = await diagnoseFishDiseaseAI(fullSymptomsText, mediaAttachments);
      setDiagnosisResult(result);
    } catch (err) {
      console.error("AI Doctor diagnosis error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PhoneFrame>
      {/* Header */}
      <header className="px-5 pt-4 flex items-start justify-between border-b border-gray-100 bg-white pb-3">
        <div className="flex items-start gap-3">
          <Link to="/home" className="pt-1 cursor-pointer">
            <ArrowLeft className="w-5.5 h-5.5 text-gray-800" />
          </Link>
          <div>
            <h1 className="text-[20px] font-extrabold text-gray-900 leading-tight">
              {t("aiDoctor")}
            </h1>
            <div className="flex items-center gap-1 text-[#0F6236] text-[12px] font-semibold mt-0.5">
              <MapPin className="w-3.5 h-3.5" /> {userCity}
            </div>
          </div>
        </div>
        <img src={farmerImg} alt="Farmer" className="w-9 h-9 rounded-full object-cover border-2 border-[#0F6236]" />
      </header>

      {/* Warning Banner */}
      <section className="mx-5 mt-4 rounded-2xl bg-[#0F6236]/10 p-3.5 flex items-start gap-3 border border-[#0F6236]/20">
        <div className="w-8 h-8 rounded-full bg-[#0F6236] text-white flex items-center justify-center shrink-0 mt-0.5">
          <Stethoscope className="w-4.5 h-4.5" />
        </div>
        <div className="flex-1 text-[12.5px]">
          <div className="font-extrabold text-[#0F6236]">AI Aquatic Veterinary Doctor</div>
          <div className="text-gray-600">Select symptoms, upload fish photos or video to get instant diagnosis, causes & Ghana medicines.</div>
        </div>
      </section>

      {/* Diagnostic Form */}
      <section className="mx-5 mt-4 rounded-2xl border border-gray-200 p-4 bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
          <span className="text-sm font-extrabold text-gray-900">Fish Health Assessment</span>
          <span className="text-[10px] font-bold text-[#0F6236] bg-[#0F6236]/10 px-2 py-0.5 rounded-full">
            Real AI Diagnosis
          </span>
        </div>

        <form onSubmit={handleDiagnose} className="space-y-3">
          {/* Select Common Symptom */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Select Observed Symptoms</label>
            <div className="grid grid-cols-2 gap-2">
              {commonSymptomsList.map((sym) => (
                <button
                  type="button"
                  key={sym}
                  onClick={() => setSelectedSymptom(sym)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                    selectedSymptom === sym
                      ? "border-[#0F6236] bg-[#0F6236]/10 text-[#0F6236]"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  🐟 {sym}
                </button>
              ))}
            </div>
          </div>

          {/* Target Pond */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Affected Pond</label>
            <select
              value={selectedPond}
              onChange={(e) => setSelectedPond(e.target.value)}
              className="w-full h-11 rounded-xl border border-gray-200 px-3 text-xs font-semibold bg-gray-50 text-gray-800 outline-none"
            >
              {ponds.length > 0 ? (
                ponds.map((p) => <option key={p.id} value={p.name}>{p.name} ({p.species})</option>)
              ) : (
                <option value="Pond 1">Pond 1 (Catfish / Tilapia)</option>
              )}
            </select>
          </div>

          {/* Photo / Video Upload Field */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Upload Photo or Video of Sick Fish</label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,video/*"
              onChange={handleMediaUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-12 rounded-xl border-2 border-dashed border-[#0F6236]/30 bg-[#0F6236]/5 hover:bg-[#0F6236]/10 flex items-center justify-center gap-2 text-xs font-bold text-[#0F6236] transition-all cursor-pointer"
            >
              {uploadedMedia ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> Attached: {uploadedMedia.name}
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" /> Tap to Add Fish Photo or Video
                </>
              )}
            </button>

            {uploadedMedia && uploadedMedia.type === "image" && (
              <img src={uploadedMedia.url} alt="Uploaded sick fish" className="mt-2 w-full h-32 object-cover rounded-xl border" />
            )}
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Additional Observations / Notes</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Fish floating near water inlet, stopped feeding..."
              className="w-full p-3 rounded-xl border border-gray-200 text-xs text-gray-800 outline-none focus:ring-2 focus:ring-[#0F6236]/20 bg-gray-50"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-[#0F6236] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#0F6236]/20 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> AI Doctor Analyzing Symptoms & Media...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" /> Run AI Disease Diagnosis
              </>
            )}
          </button>
        </form>

        {/* Dynamic AI Diagnosis Results Card */}
        {diagnosisResult && (
          <div className="mt-5 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 animate-in fade-in space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-2.5">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wide text-[#0F6236]">AI Diagnostic Diagnosis</span>
                <h3 className="text-base font-extrabold text-gray-900">{diagnosisResult.diseaseName}</h3>
              </div>
              <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                diagnosisResult.severity === "High" || diagnosisResult.severity === "Critical"
                  ? "bg-red-100 text-red-700 border border-red-200"
                  : "bg-amber-100 text-amber-800 border border-amber-200"
              }`}>
                {diagnosisResult.severity} Risk
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-gray-800">
              <div>
                <span className="font-bold text-gray-900 block mb-0.5">Probable Cause:</span>
                <p className="text-gray-700 leading-relaxed font-medium bg-white p-2.5 rounded-xl border border-gray-100">{diagnosisResult.cause}</p>
              </div>

              <div>
                <span className="font-bold text-gray-900 block mb-1">Recommended Treatment Steps:</span>
                <ul className="space-y-1.5 bg-white p-3 rounded-xl border border-gray-100">
                  {diagnosisResult.treatment?.map((t: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1.5 text-gray-800 font-medium">
                      <span className="text-[#0F6236] font-bold">•</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#0F6236] text-[11px] block flex items-center gap-1">
                    <Pill className="w-3.5 h-3.5" /> Ghana Recommended Medicine:
                  </span>
                  <span className="font-extrabold text-gray-900 text-xs">{diagnosisResult.recommendedMedicine}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <BottomNav />
    </PhoneFrame>
  );
}
