import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Waves, MapPin, ArrowLeft, Trash2, Plus, RotateCcw, Undo2, Ruler, SlidersHorizontal, Check, X, Loader2, Camera } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import { useLanguage } from "@/lib/languageContext";
import { getFarmProfile, addPondToMemory, deletePondFromMemory, clearAllPondsFromMemory, PondRecord } from "@/lib/farmMemory";
import { estimatePondSpecsFromPhoto } from "@/lib/gemini";

export const Route = createFileRoute("/my-farm")({
  component: MyFarmPage,
  head: () => ({
    meta: [
      { title: "My Farm & Pond AR Measure — Fish Doctor" },
      { name: "description", content: "Measure pond dimensions with Apple Measure AR style." },
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

interface LockedPoint {
  x: number;
  y: number;
  lat: number;
  lon: number;
}

interface CompletedSegment {
  id: string;
  p1: LockedPoint;
  p2: LockedPoint;
  meters: number;
  label: string;
}

type Mode = "measure" | "level";

export function MyFarmPage() {
  const { t } = useLanguage();
  const [ponds, setPonds] = useState<PondRecord[]>(getFarmProfile().ponds || []);
  const [userLocation, setUserLocation] = useState<string>("Accra & Ashanti Region, Ghana");

  // AR Scanner UI state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("measure");
  const [currentGps, setCurrentGps] = useState<GpsFix | null>(null);
  
  // Measurement tracking
  const [startPoint, setStartPoint] = useState<LockedPoint | null>(null);
  const [segments, setSegments] = useState<CompletedSegment[]>([]);
  const [liveDist, setLiveDist] = useState<number>(0);

  // Save Modal
  const [showSavePanel, setShowSavePanel] = useState<boolean>(false);
  const [depthM, setDepthM] = useState<number>(1.2);
  const [pondType, setPondType] = useState<string>("Earthen");
  const [pondName, setPondName] = useState<string>("");
  const [isScanningPhoto, setIsScanningPhoto] = useState<boolean>(false);

  const handleSnapPhotoMeasurement = async () => {
    try {
      setIsScanningPhoto(true);
      let dataUrl = "";
      if (videoRef.current) {
        const c = document.createElement("canvas");
        c.width = videoRef.current.videoWidth || 640;
        c.height = videoRef.current.videoHeight || 480;
        const ctx = c.getContext("2d");
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, c.width, c.height);
          dataUrl = c.toDataURL("image/jpeg", 0.85);
        }
      }

      if (dataUrl) {
        const specs = await estimatePondSpecsFromPhoto(dataUrl);
        setDepthM(specs.depthM);
        setPondType(specs.pondType);
        const lat = currentGps ? currentGps.lat : 5.6037;
        const lon = currentGps ? currentGps.lon : -0.1870;
        const p1: LockedPoint = { x: 50, y: 50, lat, lon };
        const p2: LockedPoint = { x: 250, y: 50, lat, lon };
        const p3: LockedPoint = { x: 250, y: 250, lat, lon };

        setSegments([
          { id: `seg_l_${Date.now()}`, p1, p2, meters: specs.lengthM, label: "Length" },
          { id: `seg_w_${Date.now()}`, p1: p2, p2: p3, meters: specs.widthM, label: "Width" }
        ]);
        setShowSavePanel(true);
      } else {
        if (segments.length >= 2) setShowSavePanel(true);
        else handlePlusClick();
      }
    } catch (e) {
      console.error("Snapshot error:", e);
    } finally {
      setIsScanningPhoto(false);
    }
  };

  // Refs for HTML5 Canvas & Camera
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const watchRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const startPointRef = useRef<LockedPoint | null>(null);
  const segmentsRef = useRef<CompletedSegment[]>([]);

  useEffect(() => {
    startPointRef.current = startPoint;
  }, [startPoint]);

  useEffect(() => {
    segmentsRef.current = segments;
  }, [segments]);

  useEffect(() => {
    const f = getFarmProfile();
    setPonds(f.ponds || []);
    navigator.geolocation?.getCurrentPosition(
      (p) => setUserLocation(`GPS ${p.coords.latitude.toFixed(3)}°, ${p.coords.longitude.toFixed(3)}°`),
      () => {}
    );
  }, []);

  const refreshPonds = () => setPonds(getFarmProfile().ponds || []);

  // ── Render Apple Measure Canvas ──────────────────────────────────────────
  const drawMeasureCanvas = (canvas: HTMLCanvasElement, currentDist: number) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const cx = W / 2;
    const cy = H / 2;

    // 1. Draw Apple-style Circle Reticle in center
    const reticleRadius = Math.min(W, H) * 0.22;
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
    ctx.lineWidth = 2.5;

    // Draw 4 curved arcs for the ring
    const gap = Math.PI / 16;
    for (let i = 0; i < 4; i++) {
      const startAngle = i * (Math.PI / 2) + gap;
      const endAngle = (i + 1) * (Math.PI / 2) - gap;
      ctx.beginPath();
      ctx.arc(cx, cy, reticleRadius, startAngle, endAngle);
      ctx.stroke();
    }

    // Center white dot
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(cx, cy, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Draw Locked Segments
    segmentsRef.current.forEach((seg) => {
      ctx.save();
      // Draw solid white line
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(seg.p1.x, seg.p1.y);
      ctx.lineTo(seg.p2.x, seg.p2.y);
      ctx.stroke();

      // Start dot & end dot
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath(); ctx.arc(seg.p1.x, seg.p1.y, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(seg.p2.x, seg.p2.y, 6, 0, Math.PI * 2); ctx.fill();

      // Label Pill
      const mx = (seg.p1.x + seg.p2.x) / 2;
      const my = (seg.p1.y + seg.p2.y) / 2;
      drawCapsulePill(ctx, mx, my, `${seg.meters.toFixed(1)} m`);
      ctx.restore();
    });

    // 3. Draw Active Dotted Line (from startPoint to center reticle)
    const sp = startPointRef.current;
    if (sp) {
      ctx.save();

      // Calculate distance between sp and (cx, cy)
      const dx = cx - sp.x;
      const dy = cy - sp.y;
      const lengthPx = Math.sqrt(dx * dx + dy * dy);

      // Draw spaced dots • • • • • •
      const dotSpacing = 14;
      const numDots = Math.floor(lengthPx / dotSpacing);

      ctx.fillStyle = "#FFFFFF";
      for (let i = 0; i <= numDots; i++) {
        const t = numDots === 0 ? 0 : i / numDots;
        const px = sp.x + dx * t;
        const py = sp.y + dy * t;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Start point dot
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 7, 0, Math.PI * 2);
      ctx.fill();

      // Capsule Pill positioned near the start of the line (Apple Measure style)
      const pillT = lengthPx > 100 ? 0.3 : 0.5;
      const pillX = sp.x + dx * pillT;
      const pillY = sp.y + dy * pillT;

      const labelText = currentDist >= 1 ? `${currentDist.toFixed(1)} m` : `${Math.round(currentDist * 100)} cm`;
      drawCapsulePill(ctx, pillX, pillY, labelText);

      ctx.restore();
    }
  };

  const drawCapsulePill = (ctx: CanvasRenderingContext2D, x: number, y: number, text: string) => {
    ctx.save();
    ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    const textWidth = ctx.measureText(text).width;
    const paddingX = 14;
    const paddingY = 8;
    const width = textWidth + paddingX * 2;
    const height = 30;
    const radius = 15;

    const rectX = x - width / 2;
    const rectY = y - height / 2;

    // Draw white capsule background with shadow
    ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.roundRect(rectX, rectY, width, height, radius);
    ctx.fill();

    // Draw black text inside pill
    ctx.shadowColor = "transparent";
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y + 1);
    ctx.restore();
  };

  // Loop requestAnimationFrame for smooth canvas updates
  useEffect(() => {
    const loop = () => {
      if (canvasRef.current) {
        drawMeasureCanvas(canvasRef.current, liveDist);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [liveDist]);

  // ── Open Scanner ──────────────────────────────────────────────────────────
  const openScanner = async () => {
    setSegments([]);
    setStartPoint(null);
    setLiveDist(0);
    setShowSavePanel(false);
    setIsScannerOpen(true);

    // Open Camera
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      mediaRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch { /* Camera optional fallback */ }

    // Start watching GPS
    if ("geolocation" in navigator) {
      watchRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const fix: GpsFix = { lat: pos.coords.latitude, lon: pos.coords.longitude, acc: Math.round(pos.coords.accuracy) };
          setCurrentGps(fix);
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 0 }
      );
    }
  };

  const closeScanner = () => {
    if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
    mediaRef.current?.getTracks().forEach((t) => t.stop());
    mediaRef.current = null;
    setIsScannerOpen(false);
    setStartPoint(null);
    setSegments([]);
    setLiveDist(0);
  };

  // Update live distance when moving camera while measuring
  useEffect(() => {
    if (startPoint && currentGps) {
      const dist = haversine(startPoint.lat, startPoint.lon, currentGps.lat, currentGps.lon);
      setLiveDist(Math.round(dist * 10) / 10);
    }
  }, [currentGps, startPoint]);

  // ── Handle Big '+' Button Click ───────────────────────────────────────────
  const handlePlusClick = () => {
    const canvas = canvasRef.current;
    const cx = canvas ? canvas.width / 2 : window.innerWidth / 2;
    const cy = canvas ? canvas.height / 2 : window.innerHeight / 2;

    const lat = currentGps ? currentGps.lat : 5.6037;
    const lon = currentGps ? currentGps.lon : -0.1870;

    const newPt: LockedPoint = { x: cx, y: cy, lat, lon };

    if (!startPoint) {
      // First click: anchor start point at current reticle location
      setStartPoint(newPt);
      setLiveDist(0.1);
    } else {
      // Second click: lock segment from startPoint to current reticle location
      const calculatedDist = haversine(startPoint.lat, startPoint.lon, lat, lon);
      const finalMeters = Math.max(0.5, Math.round(calculatedDist * 10) / 10);
      const label = segments.length === 0 ? "Length" : segments.length === 1 ? "Width" : `Side ${segments.length + 1}`;

      const newSeg: CompletedSegment = {
        id: `seg_${Date.now()}`,
        p1: startPoint,
        p2: newPt,
        meters: finalMeters,
        label,
      };

      setSegments((prev) => [...prev, newSeg]);
      setStartPoint(null);
      setLiveDist(0);
    }
  };

  // Undo last action
  const handleUndo = () => {
    if (startPoint) {
      setStartPoint(null);
      setLiveDist(0);
    } else if (segments.length > 0) {
      setSegments((prev) => prev.slice(0, -1));
    }
  };

  // Clear all
  const handleClearAll = () => {
    setStartPoint(null);
    setSegments([]);
    setLiveDist(0);
  };

  // Calculated specs
  const lengthM = segments.find((s) => s.label === "Length")?.meters || (segments[0]?.meters ?? 0);
  const widthM = segments.find((s) => s.label === "Width")?.meters || (segments[1]?.meters ?? 0);
  const volL = Math.round(lengthM * widthM * depthM * 1000);
  const density = pondType.includes("Concrete") ? 80 : 50;
  const stockCap = Math.round(lengthM * widthM * depthM * density);
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
      fishType: "Catfish (Clarias)",
      measuredViaCamera: true,
    });
    refreshPonds();
    closeScanner();
  };

  return (
    <PhoneFrame>
      {/* Page Header */}
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

      {/* Launch Card */}
      <section className="mx-5 mt-4">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#09341D] via-[#0F6236] to-[#082917] text-white shadow-xl shadow-[#0F6236]/30 space-y-3">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">Apple Measure AR Style</div>
          <h2 className="text-lg font-black">Measure Pond Like iPhone</h2>
          <p className="text-xs text-emerald-100 leading-relaxed font-medium">
            Tap + to place start point → walk to end while dotted line follows live → tap + to complete measurement.
          </p>
          <button onClick={openScanner} className="w-full h-12 rounded-2xl bg-white text-[#0F6236] font-black text-xs cursor-pointer active:scale-95 shadow-md flex items-center justify-center gap-2">
            <Ruler className="w-4 h-4" /> Open AR Measure
          </button>
        </div>
      </section>

      {/* Saved Ponds List */}
      <section className="mx-5 mt-5 space-y-3 mb-24">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-gray-900">Saved Ponds ({ponds.length})</h2>
          {ponds.length > 0 && (
            <button onClick={() => { if (confirm("Clear all?")) { clearAllPondsFromMemory(); refreshPonds(); } }} className="text-xs font-bold text-red-500">
              Clear All
            </button>
          )}
        </div>
        {ponds.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 p-6 rounded-3xl text-center">
            <Waves className="w-8 h-8 text-[#0F6236]/30 mx-auto mb-2" />
            <p className="text-xs font-extrabold text-gray-400">No ponds saved yet — tap Open AR Measure</p>
          </div>
        ) : (
          ponds.map((pond) => (
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
          ))
        )}
      </section>

      {/* ════════════════════ APPLE MEASURE AR MODAL ════════════════════ */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden select-none">
          
          {/* Camera View */}
          <video
            ref={(el) => {
              videoRef.current = el;
              if (el && mediaRef.current && !el.srcObject) {
                el.srcObject = mediaRef.current;
                el.play().catch(() => {});
              }
            }}
            autoPlay playsInline muted
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* AR Overlay Canvas */}
          <canvas
            ref={(el) => {
              canvasRef.current = el;
              if (el) {
                el.width = window.innerWidth;
                el.height = window.innerHeight;
              }
            }}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 10 }}
          />

          {/* Top Control Bar (Undo & Trash Buttons - Exact Apple Layout) */}
          <div className="relative flex items-center justify-between px-6 pt-12 z-20 pointer-events-auto">
            <button
              onClick={handleUndo}
              disabled={!startPoint && segments.length === 0}
              className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white cursor-pointer active:scale-90 disabled:opacity-30">
              <Undo2 className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              {segments.length >= 2 && !showSavePanel && (
                <button
                  onClick={() => setShowSavePanel(true)}
                  className="bg-emerald-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-full shadow-lg cursor-pointer active:scale-95">
                  Done & Save
                </button>
              )}
              <button
                onClick={closeScanner}
                className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white cursor-pointer active:scale-90">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Bottom Control Bar (Big Plus, Shutter, Segmented Mode Bar - Exact Apple Layout) */}
          <div className="absolute bottom-0 left-0 right-0 z-20 pb-8 pt-4 flex flex-col items-center gap-5 pointer-events-auto bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            
            {/* Center '+' Button & Shutter Button */}
            <div className="flex items-center justify-center gap-8 w-full px-8">
              <button
                onClick={handlePlusClick}
                className="w-20 h-20 rounded-full bg-[#1C1C1E]/80 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white shadow-2xl cursor-pointer active:scale-90 transition-transform">
                <Plus className="w-10 h-10 text-white stroke-[2.5]" />
              </button>

              <button
                onClick={handleSnapPhotoMeasurement}
                disabled={isScanningPhoto}
                className="w-14 h-14 rounded-full bg-white border-4 border-black/40 shadow-xl cursor-pointer active:scale-90 flex items-center justify-center text-gray-900 disabled:opacity-50">
                {isScanningPhoto ? <Loader2 className="w-6 h-6 animate-spin text-[#0F6236]" /> : <Camera className="w-5 h-5 text-gray-800" />}
              </button>
            </div>

            {/* Apple Measure Segmented Mode Switcher */}
            <div className="flex items-center bg-[#1C1C1E]/80 backdrop-blur-xl rounded-full p-1 border border-white/15 w-64 shadow-xl">
              <button
                onClick={() => setMode("measure")}
                className={`flex-1 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  mode === "measure" ? "bg-white/25 text-white shadow-sm" : "text-white/60"
                }`}>
                <Ruler className="w-4 h-4" /> Measure
              </button>
              <button
                onClick={() => setMode("level")}
                className={`flex-1 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  mode === "level" ? "bg-white/25 text-white shadow-sm" : "text-white/60"
                }`}>
                <SlidersHorizontal className="w-4 h-4" /> Level
              </button>
            </div>
          </div>

          {/* Save Bottom Sheet Modal */}
          {showSavePanel && (
            <div className="absolute inset-x-0 bottom-0 z-30 bg-[#07200F] rounded-t-3xl p-5 space-y-4 border-t border-white/10 pointer-events-auto">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-emerald-400 font-extrabold text-sm">Pond Measurement Specs</span>
                <button onClick={() => setShowSavePanel(false)} className="text-white/50 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { l: "Length", v: `${lengthM.toFixed(1)} m` },
                  { l: "Width", v: `${widthM.toFixed(1)} m` },
                  { l: "Depth", v: `${depthM.toFixed(1)} m` },
                  { l: "Volume", v: `${(volL / 1000).toFixed(1)} kL` },
                  { l: "Max Stock", v: stockCap.toLocaleString() },
                  { l: "Daily Feed", v: `${dailyFeed} kg` },
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
                <button onClick={() => setShowSavePanel(false)} className="px-5 h-12 bg-white/12 text-white font-extrabold text-xs rounded-2xl cursor-pointer">Back</button>
              </div>
            </div>
          )}

        </div>
      )}

      <BottomNav />
    </PhoneFrame>
  );
}
