import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { Waves, MapPin, ArrowLeft, Camera, Check, X, Trash2, Plus, RotateCcw } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import { useLanguage } from "@/lib/languageContext";
import { getFarmProfile, addPondToMemory, deletePondFromMemory, clearAllPondsFromMemory, PondRecord } from "@/lib/farmMemory";

export const Route = createFileRoute("/my-farm")({
  component: MyFarmPage,
  head: () => ({
    meta: [
      { title: "My Farm & Pond Measurement — Fish Doctor" },
      { name: "description", content: "Measure pond dimensions with AR camera like iPhone Measure app." },
    ],
  }),
});

// Haversine distance in metres
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface GpsFix { lat: number; lon: number; acc: number }

interface Measurement {
  id: string;
  label: string;        // "Length" | "Width"
  meters: number;
  fromFix: GpsFix;
  toFix: GpsFix;
}

type Phase = "calibrating" | "ready" | "measuring" | "done";

export function MyFarmPage() {
  const { t } = useLanguage();
  const [profile] = useState(getFarmProfile());
  const [ponds, setPonds] = useState<PondRecord[]>(profile.ponds || []);
  const [userLocation, setUserLocation] = useState<string>(profile.location || "Accra & Ashanti Region, Ghana");

  // AR Scanner state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("calibrating");
  const [currentGps, setCurrentGps] = useState<GpsFix | null>(null);
  const [startFix, setStartFix] = useState<GpsFix | null>(null);
  const [liveDist, setLiveDist] = useState<number>(0);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [calDots, setCalDots] = useState(0); // calibration animation counter

  // Camera refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRef = useRef<MediaStream | null>(null);
  const watchRef = useRef<number | null>(null);
  const calTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pond save state
  const [depthM, setDepthM] = useState(1.2);
  const [pondType, setPondType] = useState("Earthen");
  const [pondName, setPondName] = useState("");
  const [fishType] = useState("Catfish (Clarias)");
  const [showSavePanel, setShowSavePanel] = useState(false);

  useEffect(() => {
    refreshPonds();
    navigator.geolocation?.getCurrentPosition(
      (p) => setUserLocation(`GPS ${p.coords.latitude.toFixed(3)}°, ${p.coords.longitude.toFixed(3)}°`),
      () => {}
    );
  }, []);

  const refreshPonds = () => {
    const fresh = getFarmProfile();
    setPonds(fresh.ponds || []);
  };

  // ── Open / Close scanner ───────────────────────────────────────────────────
  const openScanner = async () => {
    setMeasurements([]);
    setStartFix(null);
    setLiveDist(0);
    setPhase("calibrating");
    setCalDots(0);
    setShowSavePanel(false);
    setIsScannerOpen(true);

    // Start camera
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      mediaRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch { /* camera optional */ }

    // Calibration animation — dots count 0→25
    calTimerRef.current = setInterval(() => {
      setCalDots((d) => {
        if (d >= 25) return d;
        return d + 1;
      });
    }, 80);

    // Watch GPS continuously
    if ("geolocation" in navigator) {
      watchRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const fix: GpsFix = { lat: pos.coords.latitude, lon: pos.coords.longitude, acc: Math.round(pos.coords.accuracy) };
          setCurrentGps(fix);
          // Transition calibrating → ready when we have a decent GPS fix
          setPhase((prev) => {
            if (prev === "calibrating" && pos.coords.accuracy < 25) return "ready";
            return prev;
          });
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 0 }
      );
    }
  };

  const closeScanner = () => {
    if (calTimerRef.current) clearInterval(calTimerRef.current);
    if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
    mediaRef.current?.getTracks().forEach((t) => t.stop());
    mediaRef.current = null;
    setIsScannerOpen(false);
    setPhase("calibrating");
    setStartFix(null);
    setMeasurements([]);
    setShowSavePanel(false);
  };

  // ── Update live distance while measuring ─────────────────────────────────
  useEffect(() => {
    if (phase === "measuring" && startFix && currentGps) {
      setLiveDist(haversine(startFix.lat, startFix.lon, currentGps.lat, currentGps.lon));
    }
  }, [currentGps, phase, startFix]);

  // ── Calibration dot animation completes → force ready if GPS available ───
  useEffect(() => {
    if (calDots >= 25 && phase === "calibrating") {
      if (currentGps && currentGps.acc < 50) setPhase("ready");
    }
  }, [calDots, phase, currentGps]);

  // ── Mark start point ─────────────────────────────────────────────────────
  const handleMarkStart = () => {
    if (!currentGps) return;
    setStartFix(currentGps);
    setLiveDist(0);
    setPhase("measuring");
  };

  // ── Lock end point → save measurement ────────────────────────────────────
  const handleLockEnd = () => {
    if (!startFix || !currentGps) return;
    const dist = haversine(startFix.lat, startFix.lon, currentGps.lat, currentGps.lon);
    const label = measurements.length === 0 ? "Length" : measurements.length === 1 ? "Width" : `Measure ${measurements.length + 1}`;
    const m: Measurement = {
      id: `m_${Date.now()}`,
      label,
      meters: Math.max(0.5, Math.round(dist * 10) / 10),
      fromFix: startFix,
      toFix: currentGps,
    };
    setMeasurements((prev) => [...prev, m]);
    setStartFix(null);
    setLiveDist(0);
    setPhase("ready");
  };

  const deleteMeasurement = (id: string) => {
    setMeasurements((prev) => prev.filter((m) => m.id !== id));
  };

  const resetAll = () => {
    setMeasurements([]);
    setStartFix(null);
    setLiveDist(0);
    setPhase("ready");
    setShowSavePanel(false);
  };

  // ── Calculations ─────────────────────────────────────────────────────────
  const lengthM  = measurements.find((m) => m.label === "Length")?.meters ?? 0;
  const widthM   = measurements.find((m) => m.label === "Width")?.meters ?? 0;
  const volCubic = lengthM * widthM * depthM;
  const volL     = Math.round(volCubic * 1000);
  const density  = pondType.includes("Concrete") ? 80 : 50;
  const stockCap = Math.round(volCubic * density);
  const dailyFeed = Number((stockCap * 0.4 * 0.03).toFixed(1));

  const handleSavePond = () => {
    if (!lengthM || !widthM) return;
    addPondToMemory({
      name: pondName || `Pond ${ponds.length + 1}`,
      type: pondType,
      widthMeters: widthM,
      lengthMeters: lengthM,
      depthMeters: depthM,
      volumeLiters: volL,
      fishCount: stockCap,
      fishType,
      measuredViaCamera: true,
    });
    refreshPonds();
    closeScanner();
  };

  // ── Instruction text per phase ────────────────────────────────────────────
  const phaseInstruction =
    phase === "calibrating" ? "Move phone slowly to calibrate…" :
    phase === "ready"       ? "Point reticle at start edge. Tap +" :
    phase === "measuring"   ? "Walk to the other end, then tap +" :
    "";

  const gpsOk = currentGps && currentGps.acc <= 20;

  // Format distance nicely
  const fmtDist = (m: number) => m >= 1 ? `${m.toFixed(1)} m` : `${Math.round(m * 100)} cm`;

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

      {/* Launch card */}
      <section className="mx-5 mt-4">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#09341D] via-[#0F6236] to-[#082917] text-white shadow-xl shadow-[#0F6236]/30 space-y-3">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-emerald-200">
            <Camera className="w-4 h-4 text-emerald-300" /> AR Measure — GPS
          </div>
          <div>
            <h2 className="text-lg font-black leading-tight">Measure Pond Like iPhone</h2>
            <p className="text-xs text-emerald-100 mt-1 leading-relaxed font-medium">
              Mark start → walk to end → tap again. GPS gives you the real distance shown live on screen. Works for any size pond.
            </p>
          </div>
          <button onClick={openScanner}
            className="w-full h-12 rounded-2xl bg-white text-[#0F6236] font-black text-xs shadow-md cursor-pointer active:scale-95 flex items-center justify-center gap-2">
            <Camera className="w-4 h-4" /> Open AR Measure
          </button>
        </div>
      </section>

      {/* Saved Ponds */}
      <section className="mx-5 mt-5 space-y-3 mb-24">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-gray-900">Saved Ponds ({ponds.length})</h2>
          {ponds.length > 0 && (
            <button onClick={() => { if (confirm("Clear all?")) { clearAllPondsFromMemory(); refreshPonds(); } }}
              className="text-xs font-bold text-red-500 hover:underline">Clear All</button>
          )}
        </div>
        {ponds.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 p-6 rounded-3xl text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#0F6236]/10 flex items-center justify-center mx-auto">
              <Waves className="w-6 h-6 text-[#0F6236]" />
            </div>
            <h3 className="font-extrabold text-sm text-gray-900">No Saved Ponds</h3>
            <p className="text-xs text-gray-500 font-medium">Tap Open AR Measure to measure your pond accurately.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ponds.map((pond) => (
              <div key={pond.id} className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <h3 className="font-extrabold text-sm text-gray-900">{pond.name}</h3>
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                      {[{ l: "Length", v: `${pond.lengthMeters}m` }, { l: "Width", v: `${pond.widthMeters}m` }, { l: "Depth", v: `${pond.depthMeters}m` }].map(({ l, v }) => (
                        <div key={l} className="bg-emerald-50 rounded-xl p-1.5 border border-emerald-100">
                          <div className="text-gray-400 font-bold">{l}</div>
                          <div className="font-black text-[#0F6236]">{v}</div>
                        </div>
                      ))}
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium">
                      {(pond.volumeLiters / 1000).toFixed(1)}kL • Max {pond.fishCount.toLocaleString()} fish • {pond.type}
                    </div>
                  </div>
                  <button onClick={() => { deletePondFromMemory(pond.id); refreshPonds(); }}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-xl cursor-pointer shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════ AR MEASURE SCANNER MODAL ═══════════════ */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden">

          {/* Full-screen camera */}
          <video
            ref={(el) => {
              videoRef.current = el;
              if (el && mediaRef.current && el.srcObject !== mediaRef.current) {
                el.srcObject = mediaRef.current;
                el.play().catch(() => {});
              }
            }}
            autoPlay playsInline muted
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Dark vignette overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/70 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black/80 to-transparent" />
          </div>

          {/* Top bar */}
          <div className="relative z-20 flex items-center justify-between px-5 pt-12 pb-3">
            <button onClick={() => { resetAll(); }}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white cursor-pointer active:scale-90">
              <RotateCcw className="w-4.5 h-4.5" />
            </button>
            <span className="text-white text-xs font-extrabold bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/15">
              AR Pond Measure
            </span>
            <button onClick={closeScanner}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white cursor-pointer active:scale-90">
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* ── CALIBRATING PHASE ── */}
          {phase === "calibrating" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
              {/* Animated dot grid — like iPhone calibration */}
              <div className="relative w-64 h-48 border-2 border-white/70 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 grid grid-cols-7 gap-0 content-center p-4">
                  {Array.from({ length: 35 }).map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full mx-auto my-1 transition-all duration-200 ${
                      i < calDots ? "bg-white" : "bg-white/15"
                    }`} />
                  ))}
                </div>
                {/* Corner brackets */}
                {["top-0 left-0 border-t-2 border-l-2 rounded-tl-xl", "top-0 right-0 border-t-2 border-r-2 rounded-tr-xl",
                  "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-xl", "bottom-0 right-0 border-b-2 border-r-2 rounded-br-xl"].map((cls, i) => (
                  <div key={i} className={`absolute w-6 h-6 border-white ${cls}`} />
                ))}
              </div>
              <p className="text-white font-extrabold text-sm mt-5 tracking-wide">
                {currentGps ? `Getting precise GPS… ±${currentGps.acc}m` : "Move phone to calibrate"}
              </p>
              <p className="text-white/50 text-xs font-medium mt-1">Walk slowly in any direction</p>
            </div>
          )}

          {/* ── MEASUREMENT LINE CANVAS (always shown when not calibrating) ── */}
          {(phase === "ready" || phase === "measuring") && (
            <div className="absolute inset-0 z-10 pointer-events-none">

              {/* Saved measurement lines */}
              {measurements.map((m, idx) => {
                // Show each locked measurement as a horizontal bar across the screen
                const yFraction = 0.25 + idx * 0.18; // stack them vertically
                const y = `${Math.round(yFraction * 100)}%`;
                return (
                  <div key={m.id} className="absolute left-0 right-0" style={{ top: y }}>
                    {/* Line */}
                    <div className="absolute inset-x-8 top-0 h-0.5 bg-white shadow-[0_0_6px_2px_rgba(255,255,255,0.6)]" />
                    {/* Start dot */}
                    <div className="absolute left-8 top-0 w-3 h-3 -mt-1.5 -ml-1.5 rounded-full bg-white shadow-lg border-2 border-white" />
                    {/* End dot */}
                    <div className="absolute right-8 top-0 w-3 h-3 -mt-1.5 -mr-1.5 rounded-full bg-white shadow-lg border-2 border-white" />
                    {/* Distance pill — centred on line */}
                    <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                      <div className="bg-white rounded-full px-3 py-1 flex items-center gap-1.5 shadow-lg">
                        <span className="text-xs font-black text-gray-900">{fmtDist(m.meters)}</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase">{m.label}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Live line (while measuring) */}
              {phase === "measuring" && liveDist > 0 && (
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
                  {/* Dashed live line */}
                  <div className="absolute inset-x-10 top-0 border-t-2 border-dashed border-white/60" />
                  {/* Start dot */}
                  <div className="absolute left-10 top-0 w-3 h-3 -mt-1.5 -ml-1.5 rounded-full bg-white shadow-lg" />
                  {/* Reticle end */}
                  <div className="absolute right-10 top-0 w-3 h-3 -mt-1.5 -mr-1.5 rounded-full bg-emerald-400 border-2 border-white shadow-lg animate-pulse" />
                  {/* Live distance pill */}
                  <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-emerald-500 rounded-full px-3.5 py-1.5 shadow-xl">
                      <span className="text-sm font-black text-white">{fmtDist(liveDist)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Centre Reticle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Outer ring */}
                  <div className={`w-16 h-16 rounded-full border-2 transition-colors duration-300 ${
                    phase === "measuring" ? "border-emerald-400" : "border-white"
                  }`} />
                  {/* Inner dot */}
                  <div className={`absolute inset-0 flex items-center justify-center`}>
                    <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                      phase === "measuring" ? "bg-emerald-400" : "bg-white"
                    }`} />
                  </div>
                  {/* Cross hairs */}
                  <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/40 -translate-x-0.5" />
                  <div className="absolute left-0 right-0 top-1/2 h-px bg-white/40 -translate-y-0.5" />
                </div>
              </div>
            </div>
          )}

          {/* ── BOTTOM PANEL ── */}
          <div className="absolute bottom-0 left-0 right-0 z-20 px-5 pb-10 space-y-4">

            {/* GPS accuracy bar */}
            {currentGps && phase !== "calibrating" && (
              <div className="flex items-center justify-center gap-2">
                <div className="flex gap-1">
                  {[5, 10, 20, 35].map((threshold, i) => (
                    <div key={i} className={`w-1.5 h-4 rounded-full ${
                      currentGps.acc <= threshold ? "bg-emerald-400" : "bg-white/20"
                    }`} />
                  ))}
                </div>
                <span className={`text-[10px] font-bold ${
                  currentGps.acc <= 10 ? "text-emerald-400" : currentGps.acc <= 20 ? "text-yellow-400" : "text-red-400"
                }`}>
                  GPS ±{currentGps.acc}m
                </span>
              </div>
            )}

            {/* Instruction text */}
            {phaseInstruction && phase !== "calibrating" && (
              <p className="text-white text-center text-xs font-extrabold tracking-wide">
                {phaseInstruction}
              </p>
            )}

            {/* Measurement list (compact chips) */}
            {measurements.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {measurements.map((m) => (
                  <div key={m.id} className="bg-white/15 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 flex items-center gap-2">
                    <span className="text-xs font-extrabold text-white">{m.label}: {fmtDist(m.meters)}</span>
                    <button onClick={() => deleteMeasurement(m.id)}
                      className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center cursor-pointer pointer-events-auto">
                      <X className="w-2.5 h-2.5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Main action buttons */}
            <div className="flex items-center justify-center gap-6 pointer-events-auto">
              {/* + button to mark / lock points */}
              {(phase === "ready" || phase === "measuring") && (
                <button
                  onClick={phase === "ready" ? handleMarkStart : handleLockEnd}
                  disabled={phase === "ready" && !gpsOk}
                  className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl cursor-pointer active:scale-90 transition-all border-4 ${
                    phase === "measuring"
                      ? "bg-emerald-500 border-emerald-300 shadow-emerald-500/50"
                      : gpsOk
                      ? "bg-white/20 backdrop-blur-md border-white/60"
                      : "bg-white/10 border-white/20 opacity-50"
                  }`}
                >
                  {phase === "measuring"
                    ? <Check className="w-8 h-8 text-white" />
                    : <Plus className="w-8 h-8 text-white" />
                  }
                </button>
              )}
            </div>

            {/* Show Save button when we have length + width */}
            {measurements.length >= 2 && !showSavePanel && (
              <button
                onClick={() => setShowSavePanel(true)}
                className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-sm rounded-2xl cursor-pointer active:scale-95 flex items-center justify-center gap-2 pointer-events-auto">
                <Check className="w-4.5 h-4.5" /> Done — Save Pond
              </button>
            )}
          </div>

          {/* ── SAVE PANEL SHEET ── */}
          {showSavePanel && (
            <div className="absolute inset-x-0 bottom-0 z-30 bg-[#07200F] rounded-t-3xl p-5 space-y-4 border-t border-white/10">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-emerald-400 font-extrabold text-sm">Pond Measurement Results</span>
                <button onClick={() => setShowSavePanel(false)} className="text-white/50 cursor-pointer">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Results grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { l: "Length",   v: `${lengthM.toFixed(1)} m` },
                  { l: "Width",    v: `${widthM.toFixed(1)} m` },
                  { l: "Depth",    v: `${depthM.toFixed(1)} m` },
                  { l: "Volume",   v: `${(volL / 1000).toFixed(1)} kL` },
                  { l: "Max Stock",v: stockCap.toLocaleString() },
                  { l: "Daily Feed",v: `${dailyFeed} kg` },
                ].map(({ l, v }) => (
                  <div key={l} className="bg-white/8 rounded-xl p-2.5 border border-white/10">
                    <div className="text-[8.5px] text-white/40 font-bold uppercase">{l}</div>
                    <div className="text-sm font-black text-white mt-0.5">{v}</div>
                  </div>
                ))}
              </div>

              {/* Depth slider */}
              <div className="flex items-center gap-3 bg-white/8 border border-white/12 rounded-2xl px-4 py-3">
                <span className="text-xs font-bold text-white/60 w-12 shrink-0">Depth</span>
                <button onClick={() => setDepthM((d) => Math.max(0.3, +(d - 0.1).toFixed(1)))}
                  className="w-8 h-8 rounded-xl bg-white/15 text-white font-black text-lg cursor-pointer active:scale-90 flex items-center justify-center">−</button>
                <div className="flex-1 text-center">
                  <span className="text-xl font-black text-white">{depthM.toFixed(1)}</span>
                  <span className="text-xs text-white/40 ml-1">m</span>
                </div>
                <button onClick={() => setDepthM((d) => +(d + 0.1).toFixed(1))}
                  className="w-8 h-8 rounded-xl bg-white/15 text-white font-black text-lg cursor-pointer active:scale-90 flex items-center justify-center">+</button>
              </div>

              {/* Pond type */}
              <div className="flex gap-2">
                {["Earthen", "Concrete", "Tarpaulin"].map((t) => (
                  <button key={t} onClick={() => setPondType(t)}
                    className={`flex-1 py-2.5 rounded-xl text-[10.5px] font-extrabold cursor-pointer border transition-all ${
                      pondType === t ? "bg-emerald-500 border-emerald-400 text-white" : "bg-white/8 border-white/15 text-white/60"
                    }`}>{t}</button>
                ))}
              </div>

              {/* Name input */}
              <input type="text" value={pondName} onChange={(e) => setPondName(e.target.value)}
                placeholder="Pond name (optional)"
                className="w-full h-10 bg-white/10 border border-white/20 rounded-xl px-3.5 text-white text-xs font-bold placeholder-white/30 outline-none" />

              <div className="flex gap-2.5">
                <button onClick={handleSavePond}
                  className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95">
                  <Check className="w-4.5 h-4.5" /> Save Pond Record
                </button>
                <button onClick={() => setShowSavePanel(false)}
                  className="px-5 h-12 bg-white/12 text-white font-extrabold text-xs rounded-2xl cursor-pointer">
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <BottomNav />
    </PhoneFrame>
  );
}
