import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Waves, MapPin, ArrowLeft, Trash2, Plus, RotateCcw, X, Check } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import { useLanguage } from "@/lib/languageContext";
import { getFarmProfile, addPondToMemory, deletePondFromMemory, clearAllPondsFromMemory, PondRecord } from "@/lib/farmMemory";

export const Route = createFileRoute("/my-farm")({
  component: MyFarmPage,
  head: () => ({
    meta: [
      { title: "My Farm & Pond Measurement — Fish Doctor" },
      { name: "description", content: "Measure pond with AR GPS line like iPhone Measure." },
    ],
  }),
});

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
interface Measurement { id: string; label: string; meters: number }
type Phase = "calibrating" | "ready" | "measuring";

export function MyFarmPage() {
  const { t } = useLanguage();
  const [ponds, setPonds] = useState<PondRecord[]>(getFarmProfile().ponds || []);
  const [userLocation, setUserLocation] = useState<string>("Accra & Ashanti Region, Ghana");

  // AR Scanner
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("calibrating");
  const [currentGps, setCurrentGps] = useState<GpsFix | null>(null);
  const [startFix, setStartFix] = useState<GpsFix | null>(null);
  const [liveDist, setLiveDist] = useState(0);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [calDots, setCalDots] = useState(0);

  // Save panel
  const [showSave, setShowSave] = useState(false);
  const [depthM, setDepthM] = useState(1.2);
  const [pondType, setPondType] = useState("Earthen");
  const [pondName, setPondName] = useState("");

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const watchRef = useRef<number | null>(null);
  const calTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef = useRef<number | null>(null);

  // Point A screen anchor (left-center of canvas)
  const ptARef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const f = getFarmProfile();
    setPonds(f.ponds || []);
    navigator.geolocation?.getCurrentPosition(
      (p) => setUserLocation(`GPS ${p.coords.latitude.toFixed(3)}°, ${p.coords.longitude.toFixed(3)}°`),
      () => {}
    );
  }, []);

  const refreshPonds = () => setPonds(getFarmProfile().ponds || []);

  // ── Draw live AR line on canvas ────────────────────────────────────────────
  const drawLine = (canvas: HTMLCanvasElement, dist: number) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Reticle center (always screen centre)
    const cx = W / 2;
    const cy = H / 2;

    if (phase === "calibrating") return;

    // Draw reticle circle
    const ringR = 36;
    ctx.save();
    ctx.strokeStyle = phase === "measuring" ? "rgba(52,211,153,1)" : "rgba(255,255,255,0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
    ctx.stroke();
    // Cross hairs
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx, cy - ringR - 8); ctx.lineTo(cx, cy + ringR + 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - ringR - 8, cy); ctx.lineTo(cx + ringR + 8, cy); ctx.stroke();
    // Inner dot
    ctx.fillStyle = phase === "measuring" ? "rgba(52,211,153,1)" : "rgba(255,255,255,0.9)";
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (phase !== "measuring" || !ptARef.current) return;

    const ax = ptARef.current.x;
    const ay = ptARef.current.y;

    // ── White line from Point A → reticle centre ─────────────────────────
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.95)";
    ctx.lineWidth = 2;
    ctx.shadowColor = "rgba(255,255,255,0.6)";
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(cx, cy);
    ctx.stroke();
    ctx.restore();

    // Point A dot
    ctx.save();
    ctx.fillStyle = "white";
    ctx.shadowColor = "rgba(255,255,255,0.8)";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(ax, ay, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Distance pill at midpoint
    const mx = (ax + cx) / 2;
    const my = (ay + cy) / 2;
    const label = dist >= 1 ? `${dist.toFixed(1)} m` : `${Math.round(dist * 100)} cm`;
    ctx.save();
    ctx.font = "bold 14px -apple-system, sans-serif";
    const tw = ctx.measureText(label).width;
    const pw = tw + 20;
    const ph = 28;
    const rx = mx - pw / 2;
    const ry = my - ph / 2;
    const r = 14;
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.roundRect(rx, ry, pw, ph, r);
    ctx.fill();
    ctx.fillStyle = "#111";
    ctx.shadowBlur = 0;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, mx, my);
    ctx.restore();
  };

  // Continuously redraw canvas
  useEffect(() => {
    const loop = () => {
      if (canvasRef.current) drawLine(canvasRef.current, liveDist);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [phase, liveDist]);

  // ── Open scanner ──────────────────────────────────────────────────────────
  const openScanner = async () => {
    setMeasurements([]);
    setStartFix(null);
    setLiveDist(0);
    setPhase("calibrating");
    setCalDots(0);
    setShowSave(false);
    ptARef.current = null;
    setIsScannerOpen(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      mediaRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
    } catch { /* camera optional */ }

    calTimerRef.current = setInterval(() => {
      setCalDots((d) => { if (d >= 30) { clearInterval(calTimerRef.current!); return d; } return d + 1; });
    }, 60);

    if ("geolocation" in navigator) {
      watchRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const fix: GpsFix = { lat: pos.coords.latitude, lon: pos.coords.longitude, acc: Math.round(pos.coords.accuracy) };
          setCurrentGps(fix);
          if (pos.coords.accuracy < 30) {
            setPhase((prev) => prev === "calibrating" ? "ready" : prev);
          }
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
    setLiveDist(0);
    setMeasurements([]);
    ptARef.current = null;
  };

  // Update live distance while measuring
  useEffect(() => {
    if (phase === "measuring" && startFix && currentGps) {
      const d = haversine(startFix.lat, startFix.lon, currentGps.lat, currentGps.lon);
      setLiveDist(Math.round(d * 10) / 10);
    }
  }, [currentGps, phase, startFix]);

  // Force ready after calibration dots fill
  useEffect(() => {
    if (calDots >= 30 && phase === "calibrating" && currentGps) {
      setPhase("ready");
    }
  }, [calDots, phase, currentGps]);

  // ── Mark start point (tap + on ready) ────────────────────────────────────
  const handleMarkStart = () => {
    if (!currentGps) return;
    setStartFix(currentGps);
    setLiveDist(0);
    // Place Point A at left-center of canvas
    const canvas = canvasRef.current;
    if (canvas) {
      ptARef.current = { x: canvas.width * 0.15, y: canvas.height * 0.5 };
    }
    setPhase("measuring");
  };

  // ── Lock end point (tap + on measuring) ──────────────────────────────────
  const handleLockEnd = () => {
    if (!startFix || !currentGps) return;
    const dist = Math.max(0.5, haversine(startFix.lat, startFix.lon, currentGps.lat, currentGps.lon));
    const label = measurements.length === 0 ? "Length" : measurements.length === 1 ? "Width" : `M${measurements.length + 1}`;
    setMeasurements((prev) => [...prev, { id: `m_${Date.now()}`, label, meters: Math.round(dist * 10) / 10 }]);
    setStartFix(null);
    setLiveDist(0);
    ptARef.current = null;
    setPhase("ready");
  };

  const deleteMeasurement = (id: string) => setMeasurements((prev) => prev.filter((m) => m.id !== id));

  // Calculated results
  const lengthM = measurements.find((m) => m.label === "Length")?.meters ?? 0;
  const widthM  = measurements.find((m) => m.label === "Width")?.meters ?? 0;
  const volL    = Math.round(lengthM * widthM * depthM * 1000);
  const density = pondType.includes("Concrete") ? 80 : 50;
  const stockCap  = Math.round(lengthM * widthM * depthM * density);
  const dailyFeed = Number((stockCap * 0.4 * 0.03).toFixed(1));

  const handleSavePond = () => {
    if (!lengthM || !widthM) return;
    addPondToMemory({ name: pondName || `Pond ${ponds.length + 1}`, type: pondType, widthMeters: widthM, lengthMeters: lengthM, depthMeters: depthM, volumeLiters: volL, fishCount: stockCap, fishType: "Catfish (Clarias)", measuredViaCamera: true });
    refreshPonds();
    closeScanner();
  };

  const gpsOk = currentGps && currentGps.acc <= 25;

  const phaseHint =
    phase === "calibrating" ? "Move phone slowly to calibrate…" :
    phase === "ready"       ? "Point at start edge — tap + to begin" :
    phase === "measuring"   ? "Walk to other end — line follows live" : "";

  const fmtDist = (m: number) => m >= 1 ? `${m.toFixed(1)} m` : `${Math.round(m * 100)} cm`;

  return (
    <PhoneFrame>
      <header className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-[#0F6236]/10 bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <Link to="/home" className="p-1 hover:bg-emerald-50 rounded-full">
            <ArrowLeft className="w-5.5 h-5.5 text-gray-900" />
          </Link>
          <div>
            <h1 className="text-[19px] font-extrabold text-gray-900">Pond Measurement</h1>
            <div className="flex items-center gap-1 text-[#0F6236] text-[11px] font-bold mt-0.5">
              <MapPin className="w-3 h-3" /> {userLocation}
            </div>
          </div>
        </div>
        <img src={farmerImg} alt="Kofi" className="w-9 h-9 rounded-full object-cover border-2 border-[#0F6236]" />
      </header>

      <section className="mx-5 mt-4">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#09341D] via-[#0F6236] to-[#082917] text-white shadow-xl shadow-[#0F6236]/30 space-y-3">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">AR GPS Measure</div>
          <h2 className="text-lg font-black">Measure Pond Like iPhone</h2>
          <p className="text-xs text-emerald-100 leading-relaxed">Tap + at start edge → a line follows your camera live → tap + at end → real GPS distance shown on screen.</p>
          <button onClick={openScanner} className="w-full h-12 rounded-2xl bg-white text-[#0F6236] font-black text-xs cursor-pointer active:scale-95">
            Open AR Measure
          </button>
        </div>
      </section>

      <section className="mx-5 mt-5 space-y-3 mb-24">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-gray-900">Saved Ponds ({ponds.length})</h2>
          {ponds.length > 0 && <button onClick={() => { if (confirm("Clear all?")) { clearAllPondsFromMemory(); refreshPonds(); } }} className="text-xs font-bold text-red-500">Clear All</button>}
        </div>
        {ponds.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 p-6 rounded-3xl text-center">
            <Waves className="w-8 h-8 text-[#0F6236]/30 mx-auto mb-2" />
            <p className="text-xs font-extrabold text-gray-400">No ponds yet — tap Open AR Measure</p>
          </div>
        ) : ponds.map((pond) => (
          <div key={pond.id} className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <h3 className="font-extrabold text-sm text-gray-900">{pond.name}</h3>
                <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                  {[{ l: "Length", v: `${pond.lengthMeters}m` }, { l: "Width", v: `${pond.widthMeters}m` }, { l: "Depth", v: `${pond.depthMeters}m` }].map(({ l, v }) => (
                    <div key={l} className="bg-emerald-50 rounded-xl p-1.5 border border-emerald-100">
                      <div className="text-gray-400 font-bold">{l}</div>
                      <div className="font-black text-[#0F6236]">{v}</div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400">{(pond.volumeLiters / 1000).toFixed(1)}kL · Max {pond.fishCount.toLocaleString()} fish · {pond.type}</p>
              </div>
              <button onClick={() => { deletePondFromMemory(pond.id); refreshPonds(); }} className="p-2 text-red-400 hover:bg-red-50 rounded-xl cursor-pointer">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* ═══════════════ AR MEASURE OVERLAY ═══════════════ */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">

          {/* Camera feed */}
          <video
            ref={(el) => {
              videoRef.current = el;
              if (el && mediaRef.current && !el.srcObject) { el.srcObject = mediaRef.current; el.play().catch(() => {}); }
            }}
            autoPlay playsInline muted
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* AR Canvas — draws line + reticle on top of camera */}
          <canvas
            ref={(el) => { canvasRef.current = el; if (el) { el.width = window.innerWidth; el.height = window.innerHeight; } }}
            className="absolute inset-0 w-full h-full"
            style={{ zIndex: 10 }}
          />

          {/* Dark gradient overlays */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/65 to-transparent pointer-events-none" style={{ zIndex: 11 }} />
          <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/75 to-transparent pointer-events-none" style={{ zIndex: 11 }} />

          {/* Top bar */}
          <div className="relative flex items-center justify-between px-5 pt-12 pb-3" style={{ zIndex: 20 }}>
            <button onClick={() => { setMeasurements([]); setStartFix(null); setLiveDist(0); ptARef.current = null; setPhase("ready"); setShowSave(false); }}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur border border-white/25 flex items-center justify-center text-white cursor-pointer active:scale-90">
              <RotateCcw className="w-4.5 h-4.5" />
            </button>
            <span className="text-white text-xs font-extrabold bg-black/40 backdrop-blur px-3 py-1.5 rounded-full border border-white/15">
              AR Pond Measure
            </span>
            <button onClick={closeScanner}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur border border-white/25 flex items-center justify-center text-white cursor-pointer active:scale-90">
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Calibration screen */}
          {phase === "calibrating" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ zIndex: 15 }}>
              <div className="relative w-60 h-44 border-2 border-white/80 rounded-2xl overflow-hidden bg-black/10">
                <div className="absolute inset-0 flex flex-wrap content-center justify-center gap-2 p-5">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i < calDots ? "bg-white scale-100" : "bg-white/15 scale-75"}`} />
                  ))}
                </div>
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-white rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-white rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-white rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-white rounded-br-xl" />
              </div>
              <p className="text-white font-extrabold text-sm mt-4">
                {currentGps ? `GPS locking… ±${currentGps.acc}m` : "Move phone slowly to calibrate"}
              </p>
            </div>
          )}

          {/* Bottom controls */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-10 space-y-4" style={{ zIndex: 20 }}>

            {/* GPS bar */}
            {currentGps && phase !== "calibrating" && (
              <div className="flex items-center justify-center gap-2">
                {[5, 10, 20, 30].map((threshold, i) => (
                  <div key={i} className={`w-1.5 rounded-full transition-all ${currentGps.acc <= threshold ? "bg-emerald-400 h-4" : "bg-white/20 h-3"}`} />
                ))}
                <span className={`text-[10px] font-bold ml-1 ${currentGps.acc <= 10 ? "text-emerald-400" : currentGps.acc <= 20 ? "text-yellow-400" : "text-orange-400"}`}>
                  ±{currentGps.acc}m
                </span>
              </div>
            )}

            {/* Instruction */}
            {phaseHint && phase !== "calibrating" && (
              <p className="text-white text-center text-xs font-extrabold">{phaseHint}</p>
            )}

            {/* Locked measurement chips */}
            {measurements.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {measurements.map((m) => (
                  <div key={m.id} className="bg-white/15 backdrop-blur border border-white/20 rounded-full px-3 py-1.5 flex items-center gap-2">
                    <span className="text-xs font-extrabold text-white">{m.label}: {fmtDist(m.meters)}</span>
                    <button onClick={() => deleteMeasurement(m.id)} className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center cursor-pointer">
                      <X className="w-2.5 h-2.5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Main + / ✓ button */}
            {(phase === "ready" || phase === "measuring") && (
              <div className="flex items-center justify-center">
                <button
                  onClick={phase === "ready" ? handleMarkStart : handleLockEnd}
                  disabled={phase === "ready" && !gpsOk}
                  className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl cursor-pointer active:scale-90 transition-all border-4 ${
                    phase === "measuring"
                      ? "bg-emerald-500 border-emerald-300 shadow-emerald-500/40"
                      : gpsOk
                        ? "bg-white/25 backdrop-blur border-white/60"
                        : "bg-white/10 border-white/20 opacity-50"
                  }`}
                >
                  {phase === "measuring"
                    ? <Check className="w-8 h-8 text-white" />
                    : <Plus className="w-8 h-8 text-white" />}
                </button>
              </div>
            )}

            {/* Save button after 2 measurements */}
            {measurements.length >= 2 && !showSave && (
              <button onClick={() => setShowSave(true)}
                className="w-full h-12 bg-emerald-500 text-white font-extrabold text-sm rounded-2xl cursor-pointer active:scale-95 flex items-center justify-center gap-2">
                <Check className="w-4.5 h-4.5" /> Done — Save Pond
              </button>
            )}
          </div>

          {/* Save bottom sheet */}
          {showSave && (
            <div className="absolute inset-x-0 bottom-0 bg-[#07200F] rounded-t-3xl p-5 space-y-4 border-t border-white/10" style={{ zIndex: 30 }}>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-emerald-400 font-extrabold text-sm">Measurement Results</span>
                <button onClick={() => setShowSave(false)} className="text-white/50 cursor-pointer"><X className="w-4.5 h-4.5" /></button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { l: "Length",    v: `${lengthM.toFixed(1)} m` },
                  { l: "Width",     v: `${widthM.toFixed(1)} m` },
                  { l: "Depth",     v: `${depthM.toFixed(1)} m` },
                  { l: "Volume",    v: `${(volL / 1000).toFixed(1)} kL` },
                  { l: "Max Stock", v: stockCap.toLocaleString() },
                  { l: "Daily Feed",v: `${dailyFeed} kg` },
                ].map(({ l, v }) => (
                  <div key={l} className="bg-white/8 rounded-xl p-2.5 border border-white/10">
                    <div className="text-[8.5px] text-white/40 font-bold uppercase">{l}</div>
                    <div className="text-sm font-black text-white mt-0.5">{v}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 bg-white/8 rounded-2xl px-4 py-3 border border-white/12">
                <span className="text-xs font-bold text-white/50 w-10">Depth</span>
                <button onClick={() => setDepthM((d) => Math.max(0.3, +(d - 0.1).toFixed(1)))} className="w-8 h-8 rounded-xl bg-white/15 text-white font-black text-lg cursor-pointer flex items-center justify-center active:scale-90">−</button>
                <div className="flex-1 text-center"><span className="text-xl font-black text-white">{depthM.toFixed(1)}</span><span className="text-xs text-white/40 ml-1">m</span></div>
                <button onClick={() => setDepthM((d) => +(d + 0.1).toFixed(1))} className="w-8 h-8 rounded-xl bg-white/15 text-white font-black text-lg cursor-pointer flex items-center justify-center active:scale-90">+</button>
              </div>

              <div className="flex gap-2">
                {["Earthen", "Concrete", "Tarpaulin"].map((t) => (
                  <button key={t} onClick={() => setPondType(t)}
                    className={`flex-1 py-2.5 rounded-xl text-[10.5px] font-extrabold cursor-pointer border transition-all ${pondType === t ? "bg-emerald-500 border-emerald-400 text-white" : "bg-white/8 border-white/15 text-white/60"}`}>{t}</button>
                ))}
              </div>

              <input type="text" value={pondName} onChange={(e) => setPondName(e.target.value)} placeholder="Pond name (optional)" className="w-full h-10 bg-white/10 border border-white/20 rounded-xl px-3.5 text-white text-xs font-bold placeholder-white/30 outline-none" />

              <div className="flex gap-2.5">
                <button onClick={handleSavePond} className="flex-1 h-12 bg-emerald-500 text-white font-extrabold text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95">
                  <Check className="w-4.5 h-4.5" /> Save Pond Record
                </button>
                <button onClick={() => setShowSave(false)} className="px-5 h-12 bg-white/12 text-white font-extrabold text-xs rounded-2xl cursor-pointer">Back</button>
              </div>
            </div>
          )}
        </div>
      )}

      <BottomNav />
    </PhoneFrame>
  );
}
