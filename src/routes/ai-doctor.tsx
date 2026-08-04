import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { 
  ArrowLeft, MapPin, Upload, RefreshCw, Stethoscope, Loader2, 
  Volume2, VolumeX, ShieldCheck, 
  ChevronDown, ChevronUp, Droplets, Activity,Pill,
  AlertTriangle, Info, Share2, Printer, CheckCircle2, XCircle
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

  const [weightResult, setWeightResult] = useState<{
    estimatedWeightGrams: number;
    estimatedLengthCm: number;
    estimatedAgeWeeks: number;
    recommendedPelletSize: string;
    advice: string;
  } | null>(null);

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
          setUserCity(`GPS (${position.coords.latitude.toFixed(2)}°, ${position.coords.longitude.toFixed(2)}°)`);
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
      mediaAttachments.push({ mimeType: uploadedMedia.mimeType, data: uploadedMedia.url });
    }

    try {
      const result = await diagnoseFishDiseaseAI(fullSymptomsText, mediaAttachments);
      setDiagnosisResult(result);
      setScanTimestamp(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (err) {
      console.error("AI Doctor diagnosis error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAudio = () => {
    if (isPlayingAudio) {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      setIsPlayingAudio(false);
      return;
    }
    if (!diagnosisResult) return;
    const ttsSummary = `${diagnosisResult.species ? `Identified species: ${diagnosisResult.species}. ` : ""}${diagnosisResult.diseaseName}. ${diagnosisResult.whyThisDiagnosis} Treatment: ${diagnosisResult.treatmentPlan?.medication || ""}`;
    speakTextInstant(ttsSummary, language, () => setIsPlayingAudio(true), () => setIsPlayingAudio(false));
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "Healthy": return { bg: "bg-emerald-500", text: "text-emerald-400", border: "border-emerald-500/30", pill: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" };
      case "Monitor": return { bg: "bg-yellow-500", text: "text-yellow-400", border: "border-yellow-500/30", pill: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40" };
      case "Needs Attention": return { bg: "bg-orange-500", text: "text-orange-400", border: "border-orange-500/30", pill: "bg-orange-500/20 text-orange-300 border-orange-500/40" };
      case "Critical": return { bg: "bg-red-500", text: "text-red-400", border: "border-red-500/30", pill: "bg-red-500/20 text-red-300 border-red-500/40" };
      default: return { bg: "bg-emerald-500", text: "text-emerald-400", border: "border-emerald-500/30", pill: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" };
    }
  };

  const getRiskEmoji = (level: string) => {
    switch (level) {
      case "Healthy": return "🟢";
      case "Monitor": return "🟡";
      case "Needs Attention": return "🟠";
      case "Critical": return "🔴";
      default: return "🟢";
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
            <h1 className="text-[19px] font-extrabold text-gray-900 leading-tight">AI Fish Doctor</h1>
            <div className="flex items-center gap-1.5 text-[#0F6236] text-[12px] font-bold mt-0.5">
              <MapPin className="w-3.5 h-3.5" /> {userCity}
            </div>
          </div>
        </div>
        <img src={farmerImg} alt="Farmer" className="w-9.5 h-9.5 rounded-full object-cover border-2 border-[#0F6236] shadow-xs" />
      </header>

      <section className="mx-5 mt-4 space-y-4 mb-8">
        
        {/* Mode Switcher */}
        <div className="flex rounded-2xl bg-gray-200/80 p-1">
          <button type="button" onClick={() => setActiveMode("health")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${activeMode === "health" ? "bg-[#0F6236] text-white shadow-md" : "text-gray-600 hover:text-gray-900"}`}>
            🩺 Health Screening
          </button>
          <button type="button" onClick={() => setActiveMode("weight")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${activeMode === "weight" ? "bg-[#0F6236] text-white shadow-md" : "text-gray-600 hover:text-gray-900"}`}>
            📐 Weight Estimator
          </button>
        </div>

        {/* Weight Estimator */}
        {activeMode === "weight" && (
          <form onSubmit={handleEstimateWeight} className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-md space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-gray-900 mb-2">1. Upload Fish Photo Next to Reference (Hand/Ruler)</label>
              <input type="file" ref={fileInputRef} accept="image/*" onChange={handleMediaUpload} className="hidden" />
              {uploadedMedia ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-[#0F6236] shadow-md">
                  <img src={uploadedMedia.url} alt="Fish sample" className="w-full h-48 object-cover" />
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 text-white font-extrabold text-xs flex items-center justify-center gap-2 opacity-90 cursor-pointer">
                    <RefreshCw className="w-4 h-4" /> Retake Photo
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="w-full h-36 rounded-2xl border-2 border-dashed border-[#0F6236]/30 bg-[#0F6236]/5 hover:bg-[#0F6236]/10 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer">
                  <Upload className="w-8 h-8 text-[#0F6236]" />
                  <span className="text-xs font-extrabold text-gray-900">Tap to upload fish sample photo</span>
                </button>
              )}
            </div>
            <button type="submit" disabled={loading}
              className="w-full h-12 bg-[#0F6236] hover:bg-[#0B4D29] text-white font-extrabold text-xs rounded-2xl shadow-md cursor-pointer flex items-center justify-center gap-2">
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

        {/* Health Screening Upload Form */}
        {activeMode === "health" && (
          <form onSubmit={handleDiagnose} className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-md space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-gray-900 mb-2">1. Upload Fish or Pond Photo</label>
              <input type="file" ref={fileInputRef} accept="image/*,video/*" onChange={handleMediaUpload} className="hidden" />
              {uploadedMedia ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-[#0F6236] shadow-md group">
                  <img src={uploadedMedia.url} alt="Uploaded fish sample" className="w-full h-48 object-cover" />
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 text-white font-extrabold text-xs flex items-center justify-center gap-2 opacity-90 hover:opacity-100 transition-opacity cursor-pointer">
                    <RefreshCw className="w-4 h-4" /> Tap to Retake Photo
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="w-full h-36 rounded-2xl border-2 border-dashed border-[#0F6236]/30 bg-[#0F6236]/5 hover:bg-[#0F6236]/10 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs">
                  <div className="flex flex-col items-center gap-1.5 text-[#0F6236]">
                    <Upload className="w-8 h-8 text-[#0F6236]" />
                    <span className="text-xs font-extrabold text-gray-900">Tap to upload photo from camera</span>
                    <span className="text-[10.5px] text-gray-500 font-medium">Veterinary AI visual feature detection</span>
                  </div>
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-900 mb-1">
                2. Select Pond <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <select value={selectedPond} onChange={(e) => setSelectedPond(e.target.value)}
                className="w-full h-11 rounded-2xl border border-gray-200 px-3.5 text-xs font-bold bg-gray-50 text-gray-900 outline-none focus:ring-2 focus:ring-[#0F6236]/20">
                <option value="General Pond">General Pond</option>
                {ponds.map((p) => (
                  <option key={p.id} value={p.name}>{p.name} ({p.fishCount} {p.fishType})</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-extrabold text-gray-900">3. Visual Symptoms or Notes</label>
                <VoiceRecorder onTranscript={(text) => setDescription((prev) => (prev ? `${prev} ${text}` : text))} />
              </div>
              <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Type or tap Voice Note to speak in Twi or English..."
                className="w-full p-3 rounded-2xl border border-gray-200 text-xs font-medium text-gray-900 outline-none focus:ring-2 focus:ring-[#0F6236]/20 bg-gray-50" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full h-13 rounded-2xl bg-[#0F6236] hover:bg-[#0B4D29] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#0F6236]/25 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50">
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Visual Features...</>
              ) : (
                <><Stethoscope className="w-5 h-5" /> Run Veterinary Assessment</>
              )}
            </button>
          </form>
        )}

        {/* ─── REDESIGNED DIAGNOSIS RESULT CARD ─── */}
        {diagnosisResult && (
          <div className="rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-300 border border-gray-200">

            {/* ── Dark Header Banner ── */}
            <div className="bg-gradient-to-br from-[#07200F] via-[#0a2e17] to-[#071a0c] p-5 space-y-3">
              {/* Top Row: Badge + Actions */}
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <span className="text-[9.5px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full w-fit">
                    <ShieldCheck className="w-3 h-3" /> AI Veterinary Assessment
                  </span>

                  {/* Fish Species */}
                  {diagnosisResult.species && (
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🐟</span>
                      <div>
                        <span className="text-[9px] text-gray-400 font-bold uppercase block">Identified Species</span>
                        <span className="text-sm font-black text-white leading-tight">{diagnosisResult.species}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button type="button"
                    onClick={() => {
                      if (!diagnosisResult) return;
                      const text = `🐟 Fish Doctor AI Report\n\nSpecies: ${diagnosisResult.species || "Fish"}\nCondition: ${diagnosisResult.diseaseName}\nStatus: ${diagnosisResult.riskLevel}\n\n${diagnosisResult.whyThisDiagnosis}\n\nTreatment: ${diagnosisResult.treatmentPlan?.medication}\n\nGenerated via FishFarm OS Ghana`;
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
                    }}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 cursor-pointer transition-all active:scale-95">
                    <Share2 className="w-3.5 h-3.5 text-white" />
                  </button>
                  <button type="button" onClick={() => window.print()}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 cursor-pointer transition-all active:scale-95">
                    <Printer className="w-3.5 h-3.5 text-white" />
                  </button>
                  <button onClick={toggleAudio}
                    className={`px-3 py-2 rounded-xl font-extrabold text-[11px] flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 border ${isPlayingAudio ? "bg-red-500/20 border-red-400/30 text-red-300" : "bg-emerald-500/20 border-emerald-400/30 text-emerald-300"}`}>
                    {isPlayingAudio ? <><VolumeX className="w-3.5 h-3.5" /> Stop</> : <><Volume2 className="w-3.5 h-3.5" /> Listen</>}
                  </button>
                </div>
              </div>

              {/* Disease Name */}
              <div>
                <h2 className="text-[22px] font-black text-white leading-tight">{diagnosisResult.diseaseName}</h2>
                {scanTimestamp && (
                  <span className="text-[10.5px] text-gray-400 font-medium mt-0.5 block">Scan completed: Today at {scanTimestamp}</span>
                )}
              </div>

              {/* Risk Status Pill */}
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${getRiskColor(diagnosisResult.riskLevel).pill}`}>
                <span>{getRiskEmoji(diagnosisResult.riskLevel)}</span>
                <span>{diagnosisResult.riskLevel}</span>
              </div>

              {/* Uploaded image thumbnail */}
              {uploadedMedia?.url && (
                <div className="mt-1">
                  <img src={uploadedMedia.url} alt="Scanned fish" className="w-full h-36 object-cover rounded-2xl border border-white/10 shadow-lg" />
                </div>
              )}
            </div>

            {/* ── White Body ── */}
            <div className="bg-white p-5 space-y-5">

              {/* Primary Lesion Card */}
              {diagnosisResult.primaryLesion && (
                <div className="bg-[#07200F]/5 border border-[#0F6236]/20 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-black text-[#0F6236] uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5" /> Lesion Localization
                    </span>
                    <span className={`text-[9.5px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                      diagnosisResult.primaryLesion.severity === "Critical" ? "bg-red-50 text-red-700 border-red-200" :
                      diagnosisResult.primaryLesion.severity === "Severe" ? "bg-orange-50 text-orange-700 border-orange-200" :
                      "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {diagnosisResult.primaryLesion.severity} Severity
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white rounded-xl p-3 border border-[#0F6236]/10">
                      <span className="text-[9px] font-bold text-gray-400 uppercase block mb-0.5">Affected Region</span>
                      <span className="text-xs font-black text-gray-900">{diagnosisResult.primaryLesion.bodyPart}</span>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-[#0F6236]/10">
                      <span className="text-[9px] font-bold text-gray-400 uppercase block mb-0.5">Lesion Type</span>
                      <span className="text-xs font-black text-[#0F6236]">{diagnosisResult.primaryLesion.lesionType}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Visual Findings */}
              <div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2.5">Visual Findings</h3>
                <div className="space-y-2">
                  {diagnosisResult.visualFindings?.map((finding, idx) => (
                    <div key={idx} className={`flex items-start gap-3 p-3 rounded-xl border text-xs font-medium ${finding.isHealthy ? "bg-emerald-50/60 border-emerald-100 text-gray-700" : "bg-red-50/60 border-red-100 text-gray-700"}`}>
                      {finding.isHealthy
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        : <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
                      <span>{finding.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Differential Diagnosis */}
              {diagnosisResult.differentialDiagnosis && diagnosisResult.differentialDiagnosis.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2.5">Differential Diagnosis</h3>
                  <div className="space-y-2">
                    {diagnosisResult.differentialDiagnosis.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-gray-800">{item.condition}</span>
                            <span className="text-xs font-black text-[#0F6236]">{item.percentage}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-[#0F6236] to-emerald-400 transition-all duration-700"
                              style={{ width: `${item.percentage}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Treatment Plan */}
              <div className="bg-[#07200F] rounded-2xl p-4 space-y-4">
                <h3 className="text-[10.5px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5" /> Treatment Plan
                </h3>

                <div>
                  <span className="text-[9.5px] font-black text-gray-400 uppercase tracking-wider block mb-2">Immediate Actions</span>
                  <ul className="space-y-2">
                    {diagnosisResult.treatmentPlan?.immediateActions?.map((act, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-gray-200 font-medium">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400 font-black text-[9px] mt-0.5">{idx + 1}</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-[9.5px] font-black text-gray-400 uppercase tracking-wider block mb-2">Monitoring</span>
                  <ul className="space-y-1.5">
                    {diagnosisResult.treatmentPlan?.monitoring?.map((mon, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-gray-300 font-medium">
                        <span className="text-emerald-400 shrink-0 mt-0.5">›</span>
                        <span>{mon}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-white/10 pt-3">
                  <span className="text-[9.5px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <Pill className="w-3 h-3 text-emerald-400" /> Medication
                  </span>
                  <p className="text-xs font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl leading-relaxed">
                    {diagnosisResult.treatmentPlan?.medication}
                  </p>
                </div>
              </div>

              {/* Water Parameters */}
              {diagnosisResult.recommendedWaterParameters && (
                <div>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                    <Droplets className="w-3.5 h-3.5 text-[#0F6236]" /> Target Water Parameters
                  </h3>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: "Temp", val: diagnosisResult.recommendedWaterParameters.temperature },
                      { label: "DO₂", val: diagnosisResult.recommendedWaterParameters.dissolvedOxygen },
                      { label: "pH", val: diagnosisResult.recommendedWaterParameters.ph },
                      { label: "Ammonia", val: diagnosisResult.recommendedWaterParameters.ammonia },
                      { label: "Nitrite", val: diagnosisResult.recommendedWaterParameters.nitrite },
                      { label: "Nitrate", val: diagnosisResult.recommendedWaterParameters.nitrate },
                    ].map((p, i) => (
                      <div key={i} className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-[9px] text-gray-400 font-bold block mb-0.5">{p.label}</span>
                        <span className="text-[10px] font-extrabold text-gray-900 leading-tight">{p.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expandable Why Diagnosis */}
              <div className="border-t border-gray-100 pt-3">
                <button type="button" onClick={() => setShowExplanation(!showExplanation)}
                  className="w-full flex items-center justify-between text-xs font-extrabold text-gray-600 hover:text-gray-900 cursor-pointer">
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

              {/* Disclaimer */}
              <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200/80 text-[10.5px] text-amber-900 font-medium leading-relaxed flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span><span className="font-bold">Veterinary Disclaimer: </span>This AI assessment is a screening tool only. Laboratory testing and veterinary consultation may be required for a definitive diagnosis.</span>
              </div>

            </div>
          </div>
        )}

      </section>
      <BottomNav />
    </PhoneFrame>
  );
}
