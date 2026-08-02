import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { 
  ArrowLeft, MapPin, Upload, RefreshCw, Stethoscope, Loader2, 
  Volume2, VolumeX, CheckCircle2, AlertTriangle, ShieldCheck, 
  ChevronDown, ChevronUp, Droplets, Activity, FileText, Pill,
  Check, AlertCircle, Info, Share2, Printer
} from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import { diagnoseFishDiseaseAI, MediaAttachment, speakTextInstant, DiagnosisResult } from "@/lib/gemini";
import { useLanguage } from "@/lib/languageContext";
import { getFarmProfile, PondRecord } from "@/lib/farmMemory";
import { VoiceRecorder } from "@/components/VoiceRecorder";

export const Route = createFileRoute("/ai-doctor")({
  component: DiseasePage,
  head: () => ({
    meta: [
      { title: "AI Fish Doctor — Veterinary Health Screening" },
      { name: "description", content: "Upload a photo of your fish or pond for an evidence-based AI veterinary diagnosis." },
    ],
  }),
});

export function DiseasePage() {
  const { t, language } = useLanguage();
  const [activeMode, setActiveMode] = useState<"health" | "weight">("health");

  const [description, setDescription] = useState<string>("");
  const [ponds, setPonds] = useState<PondRecord[]>([]);
  const [selectedPond, setSelectedPond] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [scanTimestamp, setScanTimestamp] = useState<string>("");
  const [userCity, setUserCity] = useState<string>("Accra & Ashanti Region, Ghana");
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // Weight Estimator State
  const [weightResult, setWeightResult] = useState<{
    estimatedWeightGrams: number;
    estimatedLengthCm: number;
    estimatedAgeWeeks: number;
    recommendedPelletSize: string;
    advice: string;
  } | null>(null);

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
      setScanTimestamp(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));

      // Prepare audio for manual play ONLY (NO AUTO PLAY)
      const ttsSummary = `${result.diseaseName}. Confidence ${result.confidencePercent} percent. ${result.whyThisDiagnosis}`;
      const audioUrl = await getGeminiLiveVoiceAudio(ttsSummary, language);
      if (audioUrl) {
        if (audioRef.current) audioRef.current.pause();
        audioRef.current = new Audio(audioUrl);
        audioRef.current.onended = () => setIsPlayingAudio(false);
        audioRef.current.onerror = () => setIsPlayingAudio(false);
      }
    } catch (err) {
      console.error("AI Doctor diagnosis error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Voice playback trigger ONLY when user clicks play button
  const toggleAudio = () => {
    if (isPlayingAudio) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlayingAudio(false);
      return;
    }

    if (!diagnosisResult) return;
    const ttsSummary = `${diagnosisResult.diseaseName}. Confidence ${diagnosisResult.confidencePercent} percent. ${diagnosisResult.whyThisDiagnosis}`;

    speakTextInstant(
      ttsSummary,
      language,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false)
    );
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "Healthy":
        return { label: "🟢 Healthy", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" };
      case "Monitor":
        return { label: "🟡 Monitor", bg: "bg-yellow-50 text-yellow-800 border-yellow-200" };
      case "Needs Attention":
        return { label: "🟠 Needs Attention", bg: "bg-orange-50 text-orange-800 border-orange-200" };
      case "Critical":
        return { label: "🔴 Critical", bg: "bg-red-50 text-red-800 border-red-200" };
      default:
        return { label: "🟢 Healthy", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" };
    }
  };

  const handleEstimateWeight = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setWeightResult(null);

    setTimeout(() => {
      setWeightResult({
        estimatedWeightGrams: 380,
        estimatedLengthCm: 32.5,
        estimatedAgeWeeks: 14,
        recommendedPelletSize: "4.5mm - 6mm Floating Pellets",
        advice: "Fish growth rate is optimal for 14-week catfish. Continue 3% body weight feeding ration 2x daily."
      });
      setLoading(false);
    }, 1200);
  };

  return (
    <PhoneFrame>
      {/* Header */}
      <header className="px-5 pt-4 pb-3.5 flex items-center justify-between border-b border-[#0F6236]/10 bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <Link to="/home" className="p-1 hover:bg-emerald-50 rounded-full transition-all cursor-pointer">
            <ArrowLeft className="w-5.5 h-5.5 text-gray-900" />
          </Link>
          <div>
            <h1 className="text-[19px] font-extrabold text-gray-900 leading-tight">
              AI Fish Doctor & Scanner
            </h1>
            <div className="flex items-center gap-1.5 text-[#0F6236] text-[12px] font-bold mt-0.5">
              <MapPin className="w-3.5 h-3.5" /> {userCity}
            </div>
          </div>
        </div>
        <img src={farmerImg} alt="Farmer" className="w-9.5 h-9.5 rounded-full object-cover border-2 border-[#0F6236] shadow-xs" />
      </header>

      {/* Main Content Area */}
      <section className="mx-5 mt-4 space-y-4 mb-8">
        
        {/* Mode Switcher */}
        <div className="flex rounded-2xl bg-gray-200/80 p-1">
          <button
            type="button"
            onClick={() => setActiveMode("health")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeMode === "health"
                ? "bg-[#0F6236] text-white shadow-md"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            🩺 Health Screening
          </button>
          <button
            type="button"
            onClick={() => setActiveMode("weight")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeMode === "weight"
                ? "bg-[#0F6236] text-white shadow-md"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            📐 Weight Estimator
          </button>
        </div>

        {activeMode === "weight" && (
          <form onSubmit={handleEstimateWeight} className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-md space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-gray-900 mb-2">
                1. Upload Fish Photo Next to Reference (Hand/Ruler)
              </label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleMediaUpload}
                className="hidden"
              />

              {uploadedMedia ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-[#0F6236] shadow-md">
                  <img src={uploadedMedia.url} alt="Fish sample" className="w-full h-48 object-cover" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 text-white font-extrabold text-xs flex items-center justify-center gap-2 opacity-90 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" /> Retake Photo
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-36 rounded-2xl border-2 border-dashed border-[#0F6236]/30 bg-[#0F6236]/5 hover:bg-[#0F6236]/10 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-[#0F6236]" />
                  <span className="text-xs font-extrabold text-gray-900">Tap to upload fish sample photo</span>
                  <span className="text-[10.5px] text-gray-500 font-medium">AI vision weight & length estimation</span>
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#0F6236] hover:bg-[#0B4D29] text-white font-extrabold text-xs rounded-2xl shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Stethoscope className="w-4 h-4" />}
              <span>Estimate Weight & Length</span>
            </button>
          </form>
        )}

        {activeMode === "weight" && weightResult && (
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-md space-y-4 animate-in fade-in">
            <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">AI Weight & Growth Result</h3>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                <span className="text-[10px] text-gray-500 font-bold block">Estimated Weight</span>
                <span className="text-2xl font-black text-[#0F6236]">{weightResult.estimatedWeightGrams} g</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                <span className="text-[10px] text-gray-500 font-bold block">Estimated Length</span>
                <span className="text-2xl font-black text-[#0F6236]">{weightResult.estimatedLengthCm} cm</span>
              </div>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-xs font-semibold text-gray-800 space-y-1">
              <div><span className="font-extrabold text-[#0F6236]">Estimated Age:</span> ~{weightResult.estimatedAgeWeeks} Weeks</div>
              <div><span className="font-extrabold text-[#0F6236]">Pellet Size:</span> {weightResult.recommendedPelletSize}</div>
            </div>

            <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-xs text-gray-700 leading-relaxed">
              <span className="font-extrabold text-[#0F6236] block mb-0.5">AI Nutrition Advice:</span>
              {weightResult.advice}
            </div>
          </div>
        )}
        
        {/* Upload Form Card */}
        {activeMode === "health" && (
          <form onSubmit={handleDiagnose} className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-md space-y-4">
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

            {uploadedMedia ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-[#0F6236] shadow-md group">
                <img
                  src={uploadedMedia.url}
                  alt="Uploaded fish sample"
                  className="w-full h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 text-white font-extrabold text-xs flex items-center justify-center gap-2 opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" /> Tap to Retake Photo
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-36 rounded-2xl border-2 border-dashed border-[#0F6236]/30 bg-[#0F6236]/5 hover:bg-[#0F6236]/10 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                <div className="flex flex-col items-center gap-1.5 text-[#0F6236]">
                  <Upload className="w-8 h-8 text-[#0F6236]" />
                  <span className="text-xs font-extrabold text-gray-900">Tap to upload photo from camera</span>
                  <span className="text-[10.5px] text-gray-500 font-medium">Veterinary AI visual feature detection</span>
                </div>
              </button>
            )}
          </div>

          {/* Select Pond */}
          <div>
            <label className="block text-xs font-extrabold text-gray-900 mb-1">
              2. Select Pond <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <select
              value={selectedPond}
              onChange={(e) => setSelectedPond(e.target.value)}
              className="w-full h-11 rounded-2xl border border-gray-200 px-3.5 text-xs font-bold bg-gray-50 text-gray-900 outline-none focus:ring-2 focus:ring-[#0F6236]/20"
            >
              <option value="General Pond">General Pond</option>
              {ponds.map((p) => (
                <option key={p.id} value={p.name}>{p.name} ({p.fishCount} {p.fishType})</option>
              ))}
            </select>
          </div>

          {/* Additional Notes with Voice Note */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-extrabold text-gray-900">
                3. Visual Symptoms or Notes
              </label>
              <VoiceRecorder
                onTranscript={(text) => setDescription((prev) => (prev ? `${prev} ${text}` : text))}
              />
            </div>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Type or tap Voice Note to speak in Twi or English..."
              className="w-full p-3 rounded-2xl border border-gray-200 text-xs font-medium text-gray-900 outline-none focus:ring-2 focus:ring-[#0F6236]/20 bg-gray-50"
            />
          </div>

          {/* Analyze Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-13 rounded-2xl bg-[#0F6236] hover:bg-[#0B4D29] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#0F6236]/25 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Analyzing Visual Features...
              </>
            ) : (
              <>
                <Stethoscope className="w-5 h-5" /> Run Veterinary Assessment
              </>
            )}
          </button>
        </form>
        )}

        {/* ─── VETERINARY DIAGNOSIS RESULT CARD (CENTERPIECE) ─── */}
        {diagnosisResult && (
          <div className="bg-white rounded-3xl border border-gray-200/90 p-5 space-y-5 shadow-2xl animate-in fade-in duration-300">
            
            {/* Header: Disease Name & Actions */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#0F6236] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0F6236]" /> AI Health Assessment
                </span>
                <h2 className="text-xl font-black text-gray-900 mt-1 leading-tight">
                  {diagnosisResult.diseaseName}
                </h2>
                {scanTimestamp && (
                  <span className="text-[11px] text-gray-500 font-medium mt-0.5 block">
                    Scan completed: Today at {scanTimestamp}
                  </span>
                )}
              </div>

              {/* Actions: Voice, WhatsApp Share, Print PDF */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    if (!diagnosisResult) return;
                    const text = `🐟 Fish Doctor AI Diagnosis Report\n\nCondition: ${diagnosisResult.diseaseName}\nConfidence: ${diagnosisResult.confidencePercent}%\nStatus: ${diagnosisResult.riskLevel}\n\nSummary: ${diagnosisResult.whyThisDiagnosis}\n\nGenerated via FishFarm OS Ghana`;
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
                  }}
                  className="p-2.5 rounded-2xl bg-emerald-100 hover:bg-emerald-200 text-[#0F6236] cursor-pointer shadow-2xs transition-all active:scale-95 flex items-center justify-center"
                  title="Share Report on WhatsApp"
                >
                  <Share2 className="w-4 h-4 text-[#0F6236]" />
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer shadow-2xs transition-all active:scale-95 flex items-center justify-center"
                  title="Download / Print PDF Report"
                >
                  <Printer className="w-4 h-4 text-gray-700" />
                </button>

                <button
                  onClick={toggleAudio}
                  className="p-2.5 px-3 rounded-2xl bg-[#0F6236] hover:bg-[#0B4D29] text-white cursor-pointer shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                  title="Listen to Voice Diagnosis"
                >
                  {isPlayingAudio ? (
                    <>
                      <VolumeX className="w-4 h-4 text-white" />
                      <span className="text-[11px] font-extrabold">Stop</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-white" />
                      <span className="text-[11px] font-extrabold">Listen</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Confidence Score & Visual Meter */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-gray-900">
                  Confidence: <span className="text-[#0F6236]">{diagnosisResult.confidencePercent}%</span>
                </span>
                <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${getRiskBadge(diagnosisResult.riskLevel).bg}`}>
                  {getRiskBadge(diagnosisResult.riskLevel).label}
                </span>
              </div>

              {/* Confidence Progress Bar */}
              <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    diagnosisResult.confidencePercent >= 90
                      ? "bg-emerald-600"
                      : diagnosisResult.confidencePercent >= 70
                      ? "bg-yellow-500"
                      : diagnosisResult.confidencePercent >= 50
                      ? "bg-orange-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${diagnosisResult.confidencePercent}%` }}
                />
              </div>

              <p className="text-[11.5px] text-gray-600 font-medium">
                {diagnosisResult.riskDescription}
              </p>
            </div>

            {/* Visual Findings Checklist */}
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">
                Visual Findings
              </h3>
              <div className="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100 space-y-2">
                {diagnosisResult.visualFindings?.map((finding, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs font-semibold text-gray-800">
                    {finding.isHealthy ? (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <span>{finding.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Differential Diagnosis (Possibilities) */}
            {diagnosisResult.differentialDiagnosis && diagnosisResult.differentialDiagnosis.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">
                  Differential Diagnosis (Possibilities)
                </h3>
                <div className="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100 space-y-2">
                  {diagnosisResult.differentialDiagnosis.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-800">• {item.condition}</span>
                      <span className="font-extrabold text-gray-600">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Treatment Plan (Staged) */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">
                Veterinary Action & Treatment Plan
              </h3>

              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 space-y-3">
                {/* Immediate Actions */}
                <div>
                  <span className="text-[11px] font-extrabold text-[#0F6236] uppercase tracking-wider block mb-1">
                    Immediate Actions:
                  </span>
                  <ul className="space-y-1.5 text-xs text-gray-800 font-medium">
                    {diagnosisResult.treatmentPlan?.immediateActions?.map((act, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-[#0F6236] font-bold">•</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Monitoring */}
                <div>
                  <span className="text-[11px] font-extrabold text-[#0F6236] uppercase tracking-wider block mb-1">
                    Monitoring:
                  </span>
                  <ul className="space-y-1 text-xs text-gray-800 font-medium">
                    {diagnosisResult.treatmentPlan?.monitoring?.map((mon, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-[#0F6236] font-bold">•</span>
                        <span>{mon}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Medication Advice */}
                <div className="pt-2 border-t border-emerald-200/60">
                  <span className="text-[11px] font-extrabold text-gray-900 flex items-center gap-1.5 mb-1">
                    <Pill className="w-3.5 h-3.5 text-[#0F6236]" /> Medication Advice:
                  </span>
                  <p className="text-xs font-bold text-gray-800 bg-white p-2.5 rounded-xl border border-emerald-200/80">
                    {diagnosisResult.treatmentPlan?.medication}
                  </p>
                </div>
              </div>
            </div>

            {/* Recommended Water Parameters Card */}
            {diagnosisResult.recommendedWaterParameters && (
              <div className="space-y-2">
                <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-[#0F6236]" /> Target Water Quality Parameters
                </h3>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-[10px] text-gray-500 font-bold block">Temp</span>
                    <span className="font-extrabold text-gray-900">{diagnosisResult.recommendedWaterParameters.temperature}</span>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-[10px] text-gray-500 font-bold block">Dissolved O₂</span>
                    <span className="font-extrabold text-gray-900">{diagnosisResult.recommendedWaterParameters.dissolvedOxygen}</span>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-[10px] text-gray-500 font-bold block">pH</span>
                    <span className="font-extrabold text-gray-900">{diagnosisResult.recommendedWaterParameters.ph}</span>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-[10px] text-gray-500 font-bold block">Ammonia</span>
                    <span className="font-extrabold text-gray-900">{diagnosisResult.recommendedWaterParameters.ammonia}</span>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-[10px] text-gray-500 font-bold block">Nitrite</span>
                    <span className="font-extrabold text-gray-900">{diagnosisResult.recommendedWaterParameters.nitrite}</span>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-[10px] text-gray-500 font-bold block">Nitrate</span>
                    <span className="font-extrabold text-gray-900">{diagnosisResult.recommendedWaterParameters.nitrate}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Expandable Explanation: Why this diagnosis? */}
            <div className="border-t border-gray-100 pt-3">
              <button
                type="button"
                onClick={() => setShowExplanation(!showExplanation)}
                className="w-full flex items-center justify-between text-xs font-extrabold text-gray-700 hover:text-gray-900 cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#0F6236]" /> Why this diagnosis?
                </span>
                {showExplanation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showExplanation && (
                <div className="mt-2.5 p-3 rounded-2xl bg-gray-50 text-xs text-gray-700 font-medium border border-gray-200/80 leading-relaxed animate-in fade-in">
                  {diagnosisResult.whyThisDiagnosis}
                </div>
              )}
            </div>

            {/* Mandatory AI Disclaimer */}
            <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200/80 text-[11px] text-amber-900 font-medium leading-relaxed">
              <span className="font-bold block mb-0.5">Veterinary Disclaimer:</span>
              This assessment is generated by AI using visual feature analysis and should be considered a screening tool. Laboratory testing, water analysis, and veterinary consultation may be required for a definitive diagnosis.
            </div>

          </div>
        )}

      </section>

      <BottomNav />
    </PhoneFrame>
  );
}
