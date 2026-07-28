import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, MapPin, Camera, Sparkles, Loader2, Stethoscope, Pill, Volume2, VolumeX, CheckCircle2, Upload } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import { diagnoseFishDiseaseAI, MediaAttachment, getGeminiLiveVoiceAudio } from "@/lib/gemini";
import { useLanguage } from "@/lib/languageContext";
import { getFarmProfile, PondRecord } from "@/lib/farmMemory";

export const Route = createFileRoute("/ai-doctor")({
  component: DiseasePage,
  head: () => ({
    meta: [
      { title: "AI Fish Doctor — Photo Health Diagnosis" },
      { name: "description", content: "Upload a photo of your fish or pond for instant AI diagnosis." },
    ],
  }),
});

export function DiseasePage() {
  const { t, language } = useLanguage();
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
    setPonds(profile.ponds || []);
    if (profile.ponds && profile.ponds.length > 0) {
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
          setUserCity(`GPS (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`);
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

    let fullSymptomsText = `Target Pond: ${selectedPond || "General Pond"}. Observations: ${description || "Attached fish photo for visual health diagnosis."}`;

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

      const ttsSummary = `${result.diseaseName}. ${result.cause}. Recommended treatment: ${result.recommendedMedicine}.`;
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
      <header className="px-5 pt-4 flex items-start justify-between border-b border-[#0F6236]/10 bg-white/80 backdrop-blur-md pb-3 shadow-xs">
        <div className="flex items-start gap-3">
          <Link to="/home" className="pt-1 cursor-pointer">
            <ArrowLeft className="w-5.5 h-5.5 text-gray-900" />
          </Link>
          <div>
            <h1 className="text-[20px] font-extrabold text-gray-900 leading-tight">
              {t("aiDoctor")}
            </h1>
            <div className="flex items-center gap-1 text-[#0F6236] text-[12px] font-bold mt-0.5">
              <MapPin className="w-3.5 h-3.5" /> {userCity}
            </div>
          </div>
        </div>
        <img src={farmerImg} alt="Farmer" className="w-9 h-9 rounded-full object-cover border-2 border-[#0F6236]" />
      </header>

      {/* Super Simple Photo Upload Form */}
      <section className="mx-5 mt-4 space-y-4">
        <form onSubmit={handleDiagnose} className="emerald-card p-5 rounded-3xl space-y-4">
          
          {/* Photo Dropzone */}
          <div>
            <label className="block text-xs font-extrabold text-gray-900 mb-2">
              1. Upload Fish or Pond Photo
            </label>
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
              className="w-full h-32 rounded-2xl border-2 border-dashed border-[#0F6236]/30 bg-[#0F6236]/5 hover:bg-[#0F6236]/10 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              {uploadedMedia ? (
                <div className="flex flex-col items-center gap-1">
                  <CheckCircle2 className="w-8 h-8 text-[#0F6236]" />
                  <span className="text-xs font-extrabold text-[#0F6236] px-2 truncate max-w-[200px]">
                    {uploadedMedia.name}
                  </span>
                  <span className="text-[10px] text-gray-500 font-bold">Tap to replace image</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-[#0F6236]">
                  <Upload className="w-7 h-7 text-[#0F6236]" />
                  <span className="text-xs font-extrabold text-gray-900">Tap to upload photo from camera</span>
                  <span className="text-[10.5px] text-gray-500 font-medium">AI automatically detects disease & health</span>
                </div>
              )}
            </button>

            {uploadedMedia && uploadedMedia.type === "image" && (
              <img src={uploadedMedia.url} alt="Uploaded fish" className="mt-3 w-full h-44 object-cover rounded-2xl border border-gray-200 shadow-md" />
            )}
          </div>

          {/* Optional Pond Select */}
          <div>
            <label className="block text-xs font-extrabold text-gray-900 mb-1">
              2. Select Pond <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <select
              value={selectedPond}
              onChange={(e) => setSelectedPond(e.target.value)}
              className="w-full h-11 rounded-2xl border border-gray-200 px-3.5 text-xs font-bold bg-gray-50 text-gray-900 outline-none focus:ring-2 focus:ring-[#0F6236]/30"
            >
              <option value="General Pond">General Pond</option>
              {ponds.map((p) => (
                <option key={p.id} value={p.name}>{p.name} ({p.fishCount} {p.fishType})</option>
              ))}
            </select>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-extrabold text-gray-900 mb-1">
              3. Any Notes? <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Fish floating, white spots or swimming slowly..."
              className="w-full p-3 rounded-2xl border border-gray-200 text-xs font-medium text-gray-900 outline-none focus:ring-2 focus:ring-[#0F6236]/20 bg-gray-50"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-13 rounded-2xl bg-[#0F6236] hover:bg-[#0B4D29] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#0F6236]/30 cursor-pointer transition-all active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> AI Analyzing Fish Photo...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" /> Diagnose Fish Health
              </>
            )}
          </button>
        </form>

        {/* Dynamic AI Diagnosis Results Card */}
        {diagnosisResult && (
          <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-300 animate-in fade-in space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wide text-[#0F6236]">AI Health Assessment</span>
                <h3 className="text-base font-extrabold text-gray-900">{diagnosisResult.diseaseName}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleAudio}
                  className="p-2 rounded-full bg-[#0F6236] text-white cursor-pointer shadow-md hover:bg-emerald-800"
                >
                  {isPlayingAudio ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <span className={`text-xs font-extrabold px-3 py-1 rounded-full shadow-xs ${
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

            <div className="space-y-3 text-xs text-gray-900">
              <div>
                <span className="font-extrabold text-gray-900 block mb-0.5">Cause & Visual Findings:</span>
                <p className="text-gray-700 leading-relaxed font-medium bg-white p-3 rounded-2xl border border-gray-200/80 shadow-2xs">{diagnosisResult.cause}</p>
              </div>

              <div>
                <span className="font-extrabold text-gray-900 block mb-1">Treatment & Solution:</span>
                <ul className="space-y-2 bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-2xs">
                  {diagnosisResult.treatment?.map((t: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-800 font-medium">
                      <span className="text-[#0F6236] font-bold">•</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-[#0F6236] text-[11px] block flex items-center gap-1">
                    <Pill className="w-3.5 h-3.5" /> Recommended Medicine:
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
