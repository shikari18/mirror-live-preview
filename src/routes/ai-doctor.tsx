import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, MapPin, Camera, Sparkles, Loader2, Stethoscope, Pill, Volume2, VolumeX, CheckCircle2, ChevronRight } from "lucide-react";
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
      <header className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-black/5 bg-white/70 backdrop-blur-2xl sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link to="/home" className="p-2 text-black hover:bg-black/5 rounded-full transition-all cursor-pointer">
            <ArrowLeft className="w-5.5 h-5.5 text-black" />
          </Link>
          <div>
            <h1 className="text-[20px] font-extrabold text-black leading-tight tracking-tight">
              {t("aiDoctor")}
            </h1>
            <div className="flex items-center gap-1 text-gray-500 text-[12px] font-semibold mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-black" /> {userCity}
            </div>
          </div>
        </div>
        <img src={farmerImg} alt="Farmer" className="w-10 h-10 rounded-full object-cover border-2 border-black/10 shadow-md" />
      </header>

      {/* Hero Banner */}
      <section className="mx-5 mt-4 rounded-[32px] bg-black text-white p-5 flex items-start gap-3.5 shadow-2xl shadow-black/20 border border-white/10">
        <div className="w-11 h-11 rounded-full bg-white/15 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-md backdrop-blur-xl border border-white/20">
          <Stethoscope className="w-5.5 h-5.5 text-emerald-400" />
        </div>
        <div className="flex-1 text-[12.5px]">
          <div className="font-extrabold text-white text-sm tracking-tight">Apple Vision Fish Doctor</div>
          <div className="text-gray-300 font-medium leading-relaxed mt-0.5">Upload a photo of your fish or pond. AI Vision analyzes scale lesions, fin rot, water clarity & prescribes treatments.</div>
        </div>
      </section>

      {/* Diagnostic Form */}
      <section className="mx-5 mt-4 apple-card p-5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3.5">
          <span className="text-sm font-extrabold text-black tracking-tight">Fish Health Assessment</span>
          <span className="text-[10px] font-extrabold text-white bg-black px-3 py-1 rounded-full shadow-xs">
            Vision Model
          </span>
        </div>

        <form onSubmit={handleDiagnose} className="space-y-3.5">
          {/* Select Common Symptom */}
          <div>
            <label className="block text-xs font-bold text-black mb-1.5">Select Primary Symptom</label>
            <div className="grid grid-cols-2 gap-2">
              {commonSymptomsList.map((sym) => (
                <button
                  type="button"
                  key={sym}
                  onClick={() => setSelectedSymptom(sym)}
                  className={`p-3 rounded-[20px] border text-left text-xs font-extrabold transition-all cursor-pointer ${
                    selectedSymptom === sym
                      ? "border-black bg-black text-white shadow-md"
                      : "border-gray-200 text-black hover:bg-gray-100/60"
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>

          {/* Target Pond */}
          <div>
            <label className="block text-xs font-bold text-black mb-1">Affected Pond</label>
            <select
              value={selectedPond}
              onChange={(e) => setSelectedPond(e.target.value)}
              className="w-full h-11 rounded-[20px] border border-gray-200 px-3.5 text-xs font-bold bg-gray-50 text-black outline-none focus:ring-2 focus:ring-black"
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
            <label className="block text-xs font-bold text-black mb-1">Upload Fish Photo for Vision</label>
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
              className="w-full h-16 rounded-[22px] border-2 border-dashed border-black/30 bg-gray-50 hover:bg-gray-100 flex items-center justify-center gap-2 text-xs font-extrabold text-black transition-all cursor-pointer shadow-xs"
            >
              {uploadedMedia ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-black" /> Image Attached: {uploadedMedia.name}
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5 text-black" /> Tap to Upload Fish or Pond Image
                </>
              )}
            </button>

            {uploadedMedia && uploadedMedia.type === "image" && (
              <img src={uploadedMedia.url} alt="Uploaded fish" className="mt-2.5 w-full h-40 object-cover rounded-[22px] border border-black/10 shadow-lg" />
            )}
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-xs font-bold text-black mb-1">Additional Observations / Notes</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Fish floating near water surface, sluggish feeding, white spots..."
              className="w-full p-3.5 rounded-[20px] border border-gray-200 text-xs font-semibold text-black outline-none focus:ring-2 focus:ring-black bg-gray-50"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-13 rounded-full bg-black hover:bg-gray-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl cursor-pointer transition-all active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> AI Analyzing Vision & Symptoms...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-emerald-400" /> Run AI Vision Diagnosis
              </>
            )}
          </button>
        </form>

        {/* Dynamic AI Diagnosis Results Card */}
        {diagnosisResult && (
          <div className="mt-5 p-5 apple-card animate-in fade-in space-y-3.5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">AI Diagnosis Result</span>
                <h3 className="text-base font-extrabold text-black tracking-tight">{diagnosisResult.diseaseName}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleAudio}
                  className="p-2 rounded-full bg-black text-white cursor-pointer shadow-md hover:bg-gray-800"
                >
                  {isPlayingAudio ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <span className="text-xs font-extrabold px-3.5 py-1 rounded-full bg-black text-white shadow-xs">
                  {diagnosisResult.severity} Risk
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs text-black">
              <div>
                <span className="font-extrabold text-black block mb-0.5">Cause & Visual Analysis:</span>
                <p className="text-gray-700 leading-relaxed font-medium bg-gray-50 p-3 rounded-[20px] border border-black/5">{diagnosisResult.cause}</p>
              </div>

              <div>
                <span className="font-extrabold text-black block mb-1">Recommended Treatment Steps:</span>
                <ul className="space-y-2 bg-gray-50 p-3.5 rounded-[20px] border border-black/5">
                  {diagnosisResult.treatment?.map((t: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-black font-semibold">
                      <span className="text-black font-extrabold">•</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-black text-[11px] block flex items-center gap-1">
                    <Pill className="w-3.5 h-3.5" /> Recommended Medicine / Action:
                  </span>
                  <span className="font-extrabold text-black text-xs">{diagnosisResult.recommendedMedicine}</span>
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
