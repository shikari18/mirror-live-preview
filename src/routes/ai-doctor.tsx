import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, MapPin, Camera, Sparkles, Loader2, Stethoscope, Pill, Volume2, VolumeX, CheckCircle2 } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import { diagnoseFishDiseaseAI, MediaAttachment, getGeminiLiveVoiceAudio } from "@/lib/gemini";
import { useLanguage } from "@/lib/languageContext";
import { getFarmProfile, PondRecord } from "@/lib/farmMemory";

export const Route = createFileRoute("/ai-doctor")({
  component: DiseasePage,
  head: () => ({
    meta: [
      { title: "AI Fish Doctor — Aquatic Health & Vision Diagnosis" },
      { name: "description", content: "Upload photos or video of fish or ponds for instant AI diagnosis." },
    ],
  }),
});

const commonSymptomsList = [
  "Red Spots & Skin Ulcers",
  "Gasping at Water Surface",
  "White Spots / Fungal Growth",
  "Frayed & Rotting Fins",
  "Swollen Abdomen & Swimming Spiral",
  "Loss of Appetite & Lethargy"
];

export function DiseasePage() {
  const { t, language } = useLanguage();
  const [selectedSymptom, setSelectedSymptom] = useState<string>("Red Spots & Skin Ulcers");
  const [description, setDescription] = useState<string>("");
  const [ponds, setPonds] = useState<PondRecord[]>([]);
  const [selectedPond, setSelectedPond] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [diagnosisResult, setDiagnosisResult] = useState<any | null>(null);
  const [userCity, setUserCity] = useState<string>("Accra & Ashanti Region, Ghana");
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // File Upload State
  const [uploadedMedia, setUploadedMedia] = useState<{ name: string; type: string; mimeType: string; url: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const profile = getFarmProfile();
    setPonds(profile.ponds);
    if (profile.ponds.length > 0) {
      setSelectedPond(profile.ponds[0].name);
    }
    if (profile.location) {
      setUserCity(profile.location);
    }

    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setUserCity(`GPS Location (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`);
        },
        () => {}
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

    let fullSymptomsText = `Symptom Category: ${selectedSymptom}. Target Pond: ${selectedPond || "Main Pond"}. Additional Details: ${description || "Observed health signs in fish pond."}`;

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

      const ttsSummary = `${result.diseaseName}. ${result.cause}. Recommended medicine: ${result.recommendedMedicine}.`;
      const audioUrl = await getGeminiLiveVoiceAudio(ttsSummary, language);
      if (audioUrl) {
        if (audioRef.current) audioRef.current.pause();
        audioRef.current = new Audio(audioUrl);
        audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(() => {});
        audioRef.current.onended = () => setIsPlayingAudio(false);
      }
    } catch (err) {
      console.error("AI Doctor diagnosis error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlayingAudio) {
        audioRef.current.pause();
        setIsPlayingAudio(false);
      } else {
        audioRef.current.play();
        setIsPlayingAudio(true);
      }
    }
  };

  return (
    <PhoneFrame>
      {/* Header */}
      <header className="px-5 pt-4 flex items-start justify-between border-b border-gray-100 bg-white pb-3 shadow-xs">
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
        <div className="w-8 h-8 rounded-full bg-[#0F6236] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-md">
          <Stethoscope className="w-4.5 h-4.5" />
        </div>
        <div className="flex-1 text-[12.5px]">
          <div className="font-extrabold text-[#0F6236]">Fish Doctor AI Vision</div>
          <div className="text-gray-600">Upload a photo of your fish or pond. AI Vision analyzes lesions, fins, water clarity & prescribes treatments.</div>
        </div>
      </section>

      {/* Diagnostic Form */}
      <section className="mx-5 mt-4 rounded-2xl border border-gray-200 p-4 bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
          <span className="text-sm font-extrabold text-gray-900">Fish Health & Vision Assessment</span>
          <span className="text-[10px] font-bold text-[#0F6236] bg-[#0F6236]/10 px-2 py-0.5 rounded-full">
            AI Vision Engine
          </span>
        </div>

        <form onSubmit={handleDiagnose} className="space-y-3">
          {/* Select Common Symptom */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Select Primary Symptom</label>
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
              className="w-full h-11 rounded-xl border border-gray-200 px-3 text-xs font-semibold bg-gray-50 text-gray-800 outline-none focus:ring-2 focus:ring-[#0F6236]/30"
            >
              {ponds.length > 0 ? (
                ponds.map((p) => <option key={p.id} value={p.name}>{p.name} ({p.fishCount} {p.fishType})</option>)
              ) : (
                <option value="Main Pond">Main Pond 1</option>
              )}
            </select>
          </div>

          {/* Photo Upload Field */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Upload Fish Photo for AI Vision</label>
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
              className="w-full h-14 rounded-xl border-2 border-dashed border-[#0F6236]/40 bg-[#0F6236]/5 hover:bg-[#0F6236]/10 flex items-center justify-center gap-2 text-xs font-bold text-[#0F6236] transition-all cursor-pointer"
            >
              {uploadedMedia ? (
                <>
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" /> Image Attached: {uploadedMedia.name}
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 text-[#0F6236]" /> Tap to Upload Fish or Pond Image
                </>
              )}
            </button>

            {uploadedMedia && uploadedMedia.type === "image" && (
              <img src={uploadedMedia.url} alt="Uploaded fish" className="mt-2 w-full h-36 object-cover rounded-xl border border-gray-200 shadow-xs" />
            )}
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Additional Observations / Notes</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Fish floating near water surface, sluggish feeding, white spots..."
              className="w-full p-3 rounded-xl border border-gray-200 text-xs text-gray-800 outline-none focus:ring-2 focus:ring-[#0F6236]/20 bg-gray-50"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-[#0F6236] hover:bg-emerald-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#0F6236]/25 cursor-pointer transition-all active:scale-[0.99]"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> AI Analyzing Vision & Symptoms...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" /> Run AI Vision Diagnosis
              </>
            )}
          </button>
        </form>

        {/* Dynamic AI Diagnosis Results Card */}
        {diagnosisResult && (
          <div className="mt-5 p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 animate-in fade-in space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-2.5">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wide text-[#0F6236]">AI Diagnosis Result</span>
                <h3 className="text-base font-extrabold text-gray-900">{diagnosisResult.diseaseName}</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={toggleAudio}
                  className="p-1.5 rounded-full bg-white text-[#0F6236] border border-emerald-200 cursor-pointer shadow-xs"
                >
                  {isPlayingAudio ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                  diagnosisResult.severity === "High" || diagnosisResult.severity === "Critical"
                    ? "bg-red-100 text-red-700 border border-red-200"
                    : diagnosisResult.severity === "Medium"
                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                }`}>
                  {diagnosisResult.severity} Risk
                </span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-gray-800">
              <div>
                <span className="font-bold text-gray-900 block mb-0.5">Cause & Visual Analysis:</span>
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
                    <Pill className="w-3.5 h-3.5" /> Recommended Medicine / Action:
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
