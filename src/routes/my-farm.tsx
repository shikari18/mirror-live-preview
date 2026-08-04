import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Waves, MapPin, ArrowLeft, Camera, Check, X, Trash2, AlertTriangle, Navigation, Ruler, RefreshCw } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import { useLanguage } from "@/lib/languageContext";
import { getFarmProfile, addPondToMemory, deletePondFromMemory, clearAllPondsFromMemory, PondRecord } from "@/lib/farmMemory";

export const Route = createFileRoute("/my-farm")({
  component: MyFarmPage,
  head: () => ({
    meta: [
      { title: "My Farm & Pond Measurement — Fish Doctor" },
      { name: "description", content: "Measure pond dimensions accurately using GPS walk-and-mark or manual entry." },
    ],
  }),
});

// ── Haversine GPS distance (metres between two lat/lon points) ───────────────
function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface GpsPoint { lat: number; lon: number; acc: number }

type ScanStep = "idle" | "mark_A" | "walk_length" | "mark_B" | "walk_width" | "mark_C" | "depth" | "photo" | "done";

export function MyFarmPage() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState(getFarmProfile());
  const [ponds, setPonds] = useState<PondRecord[]>(profile.ponds || []);
  const [userLocation, setUserLocation] = useState<string>(profile.location || "Accra & Ashanti Region, Ghana");

  // ── GPS Measurement State ──────────────────────────────────────────────────
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [step, setStep]     = useState<ScanStep>("idle");
  const [ptA, setPtA]       = useState<GpsPoint | null>(null);
  const [ptB, setPtB]       = useState<GpsPoint | null>(null);
  const [ptC, setPtC]       = useState<GpsPoint | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError]     = useState<string>("");
  const [currentGps, setCurrentGps] = useState<GpsPoint | null>(null);

  const [lengthM, setLengthM]   = useState<number | null>(null);
  const [widthM, setWidthM]     = useState<number | null>(null);
  const [depthM, setDepthM]     = useState<number>(1.2);
  const [pondType, setPondType] = useState<string>("Earthen");
  const [pondName, setPondName] = useState<string>("");
  const [fishType, setFishType] = useState<string>("Catfish (Clarias)");
  const [fishCount, setFishCount] = useState<number>(1000);

  // Camera for photo
  const [isCameraOpen, setIsCameraOpen]       = useState(false);
  const [capturedPhoto, setCapturedPhoto]     = useState<string | null>(null);
  const videoRef        = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef  = useRef<MediaStream | null>(null);

  useEffect(() => {
    refreshMemory();
    // Start watching GPS position continuously
    let watchId: number | null = null;
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (p) => setUserLocation(`GPS ${p.coords.latitude.toFixed(3)}°, ${p.coords.longitude.toFixed(3)}°`),
        () => {}
      );
      watchId = navigator.geolocation.watchPosition(
        (p) => setCurrentGps({ lat: p.coords.latitude, lon: p.coords.longitude, acc: Math.round(p.coords.accuracy) }),
        () => {},
        { enableHighAccuracy: true, maximumAge: 0 }
      );
    }
    return () => { if (watchId !== null) navigator.geolocation.clearWatch(watchId); };
  }, []);

  const refreshMemory = () => {
    const fresh = getFarmProfile();
    setProfile(fresh);
    setPonds(fresh.ponds || []);
  };

  // ── Get single high-accuracy GPS fix ──────────────────────────────────────
  const getHighAccuracyFix = (): Promise<GpsPoint> =>
    new Promise((resolve, reject) => {
      if (!("geolocation" in navigator)) { reject(new Error("GPS not available on this device.")); return; }
      // Take 3 readings and average them for better accuracy
      const readings: GpsPoint[] = [];
      let count = 0;
      const id = navigator.geolocation.watchPosition(
        (p) => {
          readings.push({ lat: p.coords.latitude, lon: p.coords.longitude, acc: p.coords.accuracy });
          count++;
          if (count >= 3 || (count >= 1 && p.coords.accuracy < 3)) {
            navigator.geolocation.clearWatch(id);
            const avgLat = readings.reduce((s, r) => s + r.lat, 0) / readings.length;
            const avgLon = readings.reduce((s, r) => s + r.lon, 0) / readings.length;
            const bestAcc = Math.min(...readings.map((r) => r.acc));
            resolve({ lat: avgLat, lon: avgLon, acc: Math.round(bestAcc) });
          }
        },
        (err) => { navigator.geolocation.clearWatch(id); reject(err); },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 12000 }
      );
    });

  const markPoint = async (which: "A" | "B" | "C") => {
    setGpsLoading(true);
    setGpsError("");
    try {
      const pt = await getHighAccuracyFix();
      if (which === "A") {
        setPtA(pt);
        setStep("walk_length");
      } else if (which === "B") {
        setPtB(pt);
        if (ptA) {
          const dist = haversineMeters(ptA.lat, ptA.lon, pt.lat, pt.lon);
          setLengthM(Math.round(dist * 10) / 10);
        }
        setStep("walk_width");
      } else if (which === "C") {
        setPtC(pt);
        if (ptA) {
          const dist = haversineMeters(ptA.lat, ptA.lon, pt.lat, pt.lon);
          setWidthM(Math.round(dist * 10) / 10);
        }
        setStep("depth");
      }
    } catch (err: any) {
      setGpsError(err?.message ?? "GPS error — make sure location is enabled.");
    } finally {
      setGpsLoading(false);
    }
  };

  const resetScan = () => {
    setStep("idle");
    setPtA(null); setPtB(null); setPtC(null);
    setLengthM(null); setWidthM(null);
    setDepthM(1.2);
    setCapturedPhoto(null);
    setPondName("");
    setGpsError("");
  };

  const openScanner = () => { resetScan(); setIsScannerOpen(true); setStep("mark_A"); };
  const closeScanner = () => { setIsScannerOpen(false); resetScan(); };

  // ── Camera for photo capture ───────────────────────────────────────────────
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch { /* camera optional */ }
  };

  const stopCamera = () => {
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const c = document.createElement("canvas");
    c.width = video.videoWidth || 1280;
    c.height = video.videoHeight || 720;
    c.getContext("2d")!.drawImage(video, 0, 0, c.width, c.height);
    setCapturedPhoto(c.toDataURL("image/jpeg", 0.85));
    stopCamera();
    setIsCameraOpen(false);
    setStep("done");
  };

  const skipPhoto = () => { stopCamera(); setIsCameraOpen(false); setStep("done"); };

  useEffect(() => {
    if (isCameraOpen) startCamera();
    else stopCamera();
    return () => stopCamera();
  }, [isCameraOpen]);

  // ── Calculations ──────────────────────────────────────────────────────────
  const volCubicM   = (lengthM ?? 0) * (widthM ?? 0) * depthM;
  const volLiters   = Math.round(volCubicM * 1000);
  const density     = pondType.toLowerCase().includes("concrete") ? 80 : 50;
  const stockCap    = Math.round(volCubicM * density);
  const dailyFeedKg = Number((stockCap * 0.4 * 0.03).toFixed(1));

  const handleSavePond = () => {
    if (!lengthM || !widthM) return;
    addPondToMemory({
      name: pondName || `Pond ${ponds.length + 1}`,
      type: pondType,
      widthMeters: widthM,
      lengthMeters: lengthM,
      depthMeters: depthM,
      volumeLiters: volLiters,
      fishCount: stockCap,
      fishType: fishType,
      measuredViaCamera: true,
    });
    refreshMemory();
    closeScanner();
  };

  // ── Step UI data ──────────────────────────────────────────────────────────
  const steps: { key: ScanStep; num: number; icon: string; title: string; desc: string }[] = [
    { key: "mark_A",       num: 1, icon: "📍", title: "Stand at Corner A",        desc: "Walk to any corner of your pond. Stand as close to the edge as possible, then tap Mark Point A." },
    { key: "walk_length",  num: 2, icon: "🚶", title: "Walk the LENGTH",          desc: "Walk along the longest side of your pond to the opposite corner." },
    { key: "mark_B",       num: 3, icon: "📍", title: "Mark Corner B (Length end)", desc: "You are now at the opposite end. Tap to record this GPS point — the app will calculate the length." },
    { key: "walk_width",   num: 4, icon: "🚶", title: "Walk the WIDTH",           desc: "Now walk 90° sideways across the width of your pond to the third corner." },
    { key: "mark_C",       num: 5, icon: "📍", title: "Mark Corner C (Width end)", desc: "Tap to record this GPS point — the app will calculate the width." },
    { key: "depth",        num: 6, icon: "📏", title: "Enter Pond Depth",         desc: "Enter the water depth of your pond (in metres). You can use a marked stick or rope to measure it." },
    { key: "photo",        num: 7, icon: "📸", title: "Take Pond Photo",          desc: "Take an optional photo of your pond for your record." },
    { key: "done",         num: 8, icon: "✅", title: "Review & Save",            desc: "Review your measurements and save the pond." },
  ];

  const currentStepData = steps.find((s) => s.key === step);

  // ── GPS accuracy signal ───────────────────────────────────────────────────
  const gpsSignal = currentGps
    ? currentGps.acc <= 5 ? { label: "Excellent", color: "text-green-400" }
    : currentGps.acc <= 10 ? { label: "Good", color: "text-emerald-400" }
    : currentGps.acc <= 20 ? { label: "Fair", color: "text-yellow-400" }
    : { label: "Weak", color: "text-red-400" }
    : { label: "No GPS", color: "text-gray-400" };

  // ── Pond type option (manual delete) ──────────────────────────────────────
  const handleDeletePond = (id: string) => { deletePondFromMemory(id); refreshMemory(); };
  const handleClearAllPonds = () => {
    if (confirm("Clear all saved ponds?")) { clearAllPondsFromMemory(); refreshMemory(); }
  };

  return (
    <PhoneFrame>
      {/* Header */}
      <header className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-[#0F6236]/10 bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <Link to="/home" className="p-1 hover:bg-emerald-50 rounded-full">
            <ArrowLeft className="w-5.5 h-5.5 text-gray-900" />
          </Link>
          <div>
            <h1 className="text-[19px] font-extrabold text-gray-900 leading-tight">Pond Measurement</h1>
            <div className="flex items-center gap-1 text-[#0F6236] text-[12px] font-bold mt-0.5">
              <MapPin className="w-3.5 h-3.5" /> {userLocation}
            </div>
          </div>
        </div>
        <img src={farmerImg} alt="Kofi" className="w-9.5 h-9.5 rounded-full object-cover border-2 border-[#0F6236]" />
      </header>

      {/* Launcher Card */}
      <section className="mx-5 mt-4">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#09341D] via-[#0F6236] to-[#082917] text-white shadow-xl shadow-[#0F6236]/30 space-y-3">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-emerald-200">
            <Navigation className="w-4 h-4 text-emerald-300" /> GPS Walk Measurement
          </div>
          <div>
            <h2 className="text-lg font-black leading-tight">Measure Your Pond Accurately</h2>
            <p className="text-xs text-emerald-100 mt-1 font-medium leading-relaxed">
              Walk around your pond with your phone. GPS records exact Width, Length & calculates Volume, Max Stock, and Daily Feed — no guessing.
            </p>
          </div>

          {/* GPS quality indicator */}
          <div className="flex items-center gap-2 text-[10.5px]">
            <span className="text-emerald-200 font-bold">GPS Signal:</span>
            <span className={`font-black ${gpsSignal.color}`}>{gpsSignal.label}</span>
            {currentGps && <span className="text-emerald-200/60 font-medium">±{currentGps.acc}m</span>}
          </div>

          <button onClick={openScanner}
            className="w-full h-12 rounded-2xl bg-white text-[#0F6236] font-black text-xs shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2">
            <Ruler className="w-4 h-4" /> Start GPS Pond Measurement
          </button>
        </div>
      </section>

      {/* Saved Ponds */}
      <section className="mx-5 mt-5 space-y-3 mb-24">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-gray-900">Saved Ponds ({ponds.length})</h2>
          {ponds.length > 0 && (
            <button onClick={handleClearAllPonds} className="text-xs font-bold text-red-600 hover:underline">Clear All</button>
          )}
        </div>
        {ponds.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 p-6 rounded-3xl text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#0F6236]/10 flex items-center justify-center mx-auto">
              <Waves className="w-6 h-6 text-[#0F6236]" />
            </div>
            <h3 className="font-extrabold text-sm text-gray-900">No Saved Ponds</h3>
            <p className="text-xs text-gray-500 font-medium">Use GPS Walk Measurement to measure and save your pond accurately.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ponds.map((pond) => (
              <div key={pond.id} className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-sm text-gray-900">{pond.name}</h3>
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                      {[
                        { l: "Width", v: `${pond.widthMeters}m` },
                        { l: "Length", v: `${pond.lengthMeters}m` },
                        { l: "Depth", v: `${pond.depthMeters}m` },
                      ].map(({ l, v }) => (
                        <div key={l} className="bg-emerald-50 rounded-xl p-1.5 border border-emerald-100">
                          <div className="text-gray-400 font-bold">{l}</div>
                          <div className="font-black text-[#0F6236]">{v}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-gray-500 font-medium pt-0.5">
                      <span>Vol: {(pond.volumeLiters / 1000).toFixed(1)}kL</span>
                      <span>•</span>
                      <span>Max: {pond.fishCount.toLocaleString()} fish</span>
                      <span>•</span>
                      <span>{pond.type}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDeletePond(pond.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl cursor-pointer shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─────────────────────────── GPS SCANNER MODAL ─────────────────────────── */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 bg-[#07200F] flex flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/10">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
                GPS Pond Measurement
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[10.5px] font-bold ${gpsSignal.color}`}>
                  📡 GPS {gpsSignal.label}
                </span>
                {currentGps && (
                  <span className="text-[10px] text-white/40 font-medium">±{currentGps.acc}m accuracy</span>
                )}
              </div>
            </div>
            <button onClick={closeScanner}
              className="p-2 rounded-full bg-white/10 border border-white/15 text-white cursor-pointer hover:bg-white/20">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step progress bar */}
          <div className="px-5 pt-3 pb-1">
            <div className="flex gap-1">
              {steps.map((s, i) => (
                <div key={s.key} className={`flex-1 h-1 rounded-full transition-all ${
                  steps.findIndex((ss) => ss.key === step) >= i ? "bg-emerald-400" : "bg-white/15"
                }`} />
              ))}
            </div>
            <div className="text-[10px] text-white/40 font-bold mt-1">
              Step {currentStepData?.num ?? 0} of {steps.length}
            </div>
          </div>

          {/* ── Step Content ── */}
          <div className="flex-1 px-5 py-4 overflow-y-auto space-y-5">

            {/* Current step card */}
            {currentStepData && (
              <div className="bg-white/8 border border-white/12 rounded-3xl p-5 space-y-2">
                <div className="text-3xl">{currentStepData.icon}</div>
                <h3 className="text-lg font-black text-white">{currentStepData.title}</h3>
                <p className="text-sm text-white/60 font-medium leading-relaxed">{currentStepData.desc}</p>
              </div>
            )}

            {/* GPS error */}
            {gpsError && (
              <div className="bg-red-500/15 border border-red-400/30 rounded-2xl p-3.5 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-300 font-medium">{gpsError}</p>
              </div>
            )}

            {/* Accuracy warning */}
            {currentGps && currentGps.acc > 15 && (step === "mark_A" || step === "mark_B" || step === "mark_C") && (
              <div className="bg-yellow-500/15 border border-yellow-400/30 rounded-2xl p-3.5 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-yellow-300">GPS accuracy is {currentGps.acc}m</p>
                  <p className="text-[10.5px] text-yellow-200/70 font-medium mt-0.5">Move to an open area away from trees and buildings for better accuracy. Wait for signal to improve before marking.</p>
                </div>
              </div>
            )}

            {/* Measurements so far */}
            {(lengthM !== null || widthM !== null) && (
              <div className="bg-emerald-500/10 border border-emerald-400/20 rounded-2xl p-4 space-y-2">
                <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">Measurements So Far</span>
                <div className="grid grid-cols-2 gap-2">
                  {lengthM !== null && (
                    <div className="bg-white/8 rounded-xl p-3 text-center">
                      <div className="text-[9px] text-white/40 font-bold uppercase">Length</div>
                      <div className="text-xl font-black text-white">{lengthM.toFixed(1)}<span className="text-sm text-white/50 ml-0.5">m</span></div>
                      {ptA && ptB && <div className="text-[9px] text-emerald-400 font-bold mt-0.5">GPS measured ✓</div>}
                    </div>
                  )}
                  {widthM !== null && (
                    <div className="bg-white/8 rounded-xl p-3 text-center">
                      <div className="text-[9px] text-white/40 font-bold uppercase">Width</div>
                      <div className="text-xl font-black text-white">{widthM.toFixed(1)}<span className="text-sm text-white/50 ml-0.5">m</span></div>
                      {ptA && ptC && <div className="text-[9px] text-emerald-400 font-bold mt-0.5">GPS measured ✓</div>}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Depth input step */}
            {step === "depth" && (
              <div className="space-y-4">
                <div className="bg-white/8 border border-white/12 rounded-2xl p-4 space-y-3">
                  <label className="text-xs font-extrabold text-white block">Pond Depth (metres)</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setDepthM(Math.max(0.3, +(depthM - 0.1).toFixed(1)))}
                      className="w-12 h-12 rounded-2xl bg-white/15 text-white font-black text-xl cursor-pointer active:scale-90 flex items-center justify-center">−</button>
                    <div className="flex-1 text-center">
                      <span className="text-4xl font-black text-white">{depthM.toFixed(1)}</span>
                      <span className="text-lg text-white/50 ml-1">m</span>
                    </div>
                    <button onClick={() => setDepthM(+(depthM + 0.1).toFixed(1))}
                      className="w-12 h-12 rounded-2xl bg-white/15 text-white font-black text-xl cursor-pointer active:scale-90 flex items-center justify-center">+</button>
                  </div>
                  <p className="text-[10.5px] text-white/40 font-medium text-center">Use a marked stick or rope to measure water depth</p>
                </div>

                <div className="bg-white/8 border border-white/12 rounded-2xl p-4 space-y-2">
                  <label className="text-xs font-extrabold text-white block">Pond Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Earthen", "Concrete", "Tarpaulin"].map((t) => (
                      <button key={t} onClick={() => setPondType(t)}
                        className={`py-2.5 rounded-xl text-[10.5px] font-extrabold cursor-pointer transition-all border ${
                          pondType === t ? "bg-emerald-500 border-emerald-400 text-white" : "bg-white/8 border-white/15 text-white/60"
                        }`}>{t}</button>
                    ))}
                  </div>
                </div>

                <button onClick={() => setStep("photo")}
                  className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-sm rounded-2xl cursor-pointer active:scale-95 flex items-center justify-center gap-2">
                  <Check className="w-4.5 h-4.5" /> Confirm Depth & Continue
                </button>
              </div>
            )}

            {/* Photo step */}
            {step === "photo" && (
              <div className="space-y-3">
                {capturedPhoto ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-400/50">
                    <img src={capturedPhoto} alt="Pond" className="w-full h-48 object-cover" />
                    <button onClick={() => { setCapturedPhoto(null); setIsCameraOpen(true); }}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-xs gap-2 cursor-pointer">
                      <RefreshCw className="w-4 h-4" /> Retake Photo
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setIsCameraOpen(true)}
                    className="w-full h-44 rounded-2xl border-2 border-dashed border-emerald-400/30 bg-white/5 flex flex-col items-center justify-center gap-2 cursor-pointer active:scale-95">
                    <Camera className="w-8 h-8 text-emerald-400" />
                    <span className="text-xs font-extrabold text-white">Take Pond Photo</span>
                    <span className="text-[10px] text-white/40 font-medium">Optional but recommended</span>
                  </button>
                )}
                <div className="flex gap-2">
                  <button onClick={() => setStep("done")}
                    className="flex-1 h-11 bg-emerald-500 text-white font-extrabold text-xs rounded-2xl cursor-pointer active:scale-95">
                    {capturedPhoto ? "Continue →" : "Skip Photo →"}
                  </button>
                </div>
              </div>
            )}

            {/* Done / Review step */}
            {step === "done" && lengthM !== null && widthM !== null && (
              <div className="space-y-4">
                {capturedPhoto && (
                  <img src={capturedPhoto} alt="Pond" className="w-full h-36 object-cover rounded-2xl border border-emerald-400/30" />
                )}

                {/* Full results grid */}
                <div className="bg-white/8 border border-white/12 rounded-2xl p-4 space-y-3">
                  <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">GPS Measurement Results</span>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { l: "Length",    v: `${lengthM.toFixed(1)} m`,          sub: "GPS measured" },
                      { l: "Width",     v: `${widthM.toFixed(1)} m`,           sub: "GPS measured" },
                      { l: "Depth",     v: `${depthM.toFixed(1)} m`,           sub: "Manual entry" },
                      { l: "Volume",    v: `${(volLiters / 1000).toFixed(1)} kL`, sub: "L×W×D×1000" },
                      { l: "Max Stock", v: stockCap.toLocaleString(),          sub: `${density} fish/m³` },
                      { l: "Daily Feed",v: `${dailyFeedKg} kg`,               sub: "3% body weight" },
                    ].map(({ l, v, sub }) => (
                      <div key={l} className="bg-white/8 rounded-xl p-2.5 border border-white/8">
                        <div className="text-[8.5px] text-white/35 font-bold uppercase">{l}</div>
                        <div className="text-sm font-black text-white mt-0.5">{v}</div>
                        <div className="text-[8px] text-emerald-400/70 font-medium mt-0.5">{sub}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pond name input */}
                <input type="text" value={pondName} onChange={(e) => setPondName(e.target.value)}
                  placeholder="Give this pond a name (optional)"
                  className="w-full h-11 bg-white/10 border border-white/20 rounded-xl px-3.5 text-white text-xs font-bold placeholder-white/30 outline-none" />

                <div className="flex gap-2.5">
                  <button onClick={handleSavePond}
                    className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95">
                    <Check className="w-4.5 h-4.5" /> Save Pond Record
                  </button>
                  <button onClick={resetScan}
                    className="px-4 h-12 bg-white/12 hover:bg-white/20 text-white font-extrabold text-xs rounded-2xl cursor-pointer">
                    Redo
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Bottom Action Button ── */}
          {(step === "mark_A" || step === "mark_B" || step === "mark_C" || step === "walk_length" || step === "walk_width") && (
            <div className="px-5 pb-8 pt-3 border-t border-white/8 space-y-2.5">
              {step === "mark_A" && (
                <button onClick={() => markPoint("A")} disabled={gpsLoading}
                  className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-extrabold text-base rounded-2xl shadow-lg cursor-pointer active:scale-95 flex items-center justify-center gap-2.5 transition-all">
                  {gpsLoading ? <><RefreshCw className="w-5 h-5 animate-spin" /> Getting GPS fix...</>
                    : <><MapPin className="w-5 h-5" /> Mark Corner A (Start)</>}
                </button>
              )}
              {step === "walk_length" && (
                <div className="space-y-2">
                  <p className="text-xs text-emerald-300 font-bold text-center">Walk to the opposite end of the pond →</p>
                  <button onClick={() => setStep("mark_B")}
                    className="w-full h-14 bg-white/15 hover:bg-white/20 text-white font-extrabold text-sm rounded-2xl cursor-pointer active:scale-95 flex items-center justify-center gap-2.5 border border-white/20">
                    ✅ I'm at the other end — Mark Point B
                  </button>
                </div>
              )}
              {step === "mark_B" && (
                <button onClick={() => markPoint("B")} disabled={gpsLoading}
                  className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-extrabold text-base rounded-2xl shadow-lg cursor-pointer active:scale-95 flex items-center justify-center gap-2.5">
                  {gpsLoading ? <><RefreshCw className="w-5 h-5 animate-spin" /> Getting GPS fix...</>
                    : <><MapPin className="w-5 h-5" /> Mark Corner B (Length end)</>}
                </button>
              )}
              {step === "walk_width" && (
                <div className="space-y-2">
                  <p className="text-xs text-emerald-300 font-bold text-center">Walk 90° sideways across the width →</p>
                  <button onClick={() => setStep("mark_C")}
                    className="w-full h-14 bg-white/15 hover:bg-white/20 text-white font-extrabold text-sm rounded-2xl cursor-pointer active:scale-95 flex items-center justify-center gap-2.5 border border-white/20">
                    ✅ I'm at the side — Mark Point C
                  </button>
                </div>
              )}
              {step === "mark_C" && (
                <button onClick={() => markPoint("C")} disabled={gpsLoading}
                  className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-extrabold text-base rounded-2xl shadow-lg cursor-pointer active:scale-95 flex items-center justify-center gap-2.5">
                  {gpsLoading ? <><RefreshCw className="w-5 h-5 animate-spin" /> Getting GPS fix...</>
                    : <><MapPin className="w-5 h-5" /> Mark Corner C (Width end)</>}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Full-screen camera for photo ── */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-60 bg-black flex flex-col">
          <video ref={(el) => { videoRef.current = el; if (el && mediaStreamRef.current) { el.srcObject = mediaStreamRef.current; el.play(); } }}
            autoPlay playsInline muted className="flex-1 w-full object-cover" />
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10">
            <button onClick={capturePhoto}
              className="w-20 h-20 rounded-full bg-white border-4 border-[#0F6236] shadow-2xl flex items-center justify-center cursor-pointer active:scale-90">
              <div className="w-14 h-14 rounded-full bg-[#0F6236] flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </button>
            <button onClick={skipPhoto}
              className="text-white text-xs font-bold bg-black/50 px-4 py-1.5 rounded-full cursor-pointer">
              Skip Photo
            </button>
          </div>
          <button onClick={() => { stopCamera(); setIsCameraOpen(false); }}
            className="absolute top-5 right-5 p-3 rounded-full bg-black/60 text-white border border-white/20 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <BottomNav />
    </PhoneFrame>
  );
}
