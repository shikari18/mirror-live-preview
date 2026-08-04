import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Plus, Waves, MapPin, ArrowLeft, Camera, Check, RefreshCw, X, Sparkles, Trash2, AlertTriangle } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import { useLanguage } from "@/lib/languageContext";
import { getFarmProfile, addPondToMemory, deletePondFromMemory, clearAllPondsFromMemory, PondRecord } from "@/lib/farmMemory";
import { estimatePondDimensionsAI } from "@/lib/gemini";

export const Route = createFileRoute("/my-farm")({
  component: MyFarmPage,
  head: () => ({
    meta: [
      { title: "My Farm & Camera Pond Calculator — Fish Doctor" },
      { name: "description", content: "Manage ponds and calculate pond dimensions using live camera AR scanner." },
    ],
  }),
});

export function MyFarmPage() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState(getFarmProfile());
  const [ponds, setPonds] = useState<PondRecord[]>(profile.ponds || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<string>(profile.location || "Accra & Ashanti Region, Ghana");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("scanner") === "true") setIsCameraScannerOpen(true);
    }
  }, []);

  const [pondName, setPondName] = useState("");
  const [fishType, setFishType] = useState("Catfish (Clarias)");
  const [fishCount, setFishCount] = useState<number>(1000);
  const [pondType, setPondType] = useState("Concrete");

  const [targetWidth, setTargetWidth] = useState<number>(5.5);
  const [targetLength, setTargetLength] = useState<number>(8.0);
  const [targetDepth, setTargetDepth] = useState<number>(1.4);
  const [liveVolumeLiters, setLiveVolumeLiters] = useState<number>(61600);
  const [isAnalyzingPond, setIsAnalyzingPond] = useState<boolean>(false);
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<{
    widthM: number; heightM: number; depthM: number;
    volL: number; stockCap: number; dailyFeed: number; pondType: string;
  } | null>(null);

  // Live AR guide state
  const [pondFillPct, setPondFillPct] = useState<number>(0);
  const [guideStatus, setGuideStatus] = useState<"scanning" | "good" | "bad">("scanning");
  const [guideMessage, setGuideMessage] = useState<string>("Point camera at pond");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    refreshMemory();
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation(`GPS: ${pos.coords.latitude.toFixed(2)}°, ${pos.coords.longitude.toFixed(2)}°`),
        () => {}
      );
    }
  }, []);

  const refreshMemory = () => {
    const fresh = getFarmProfile();
    setProfile(fresh);
    setPonds(fresh.ponds || []);
  };

  const handleDeletePond = (id: string) => { deletePondFromMemory(id); refreshMemory(); };
  const handleClearAllPonds = () => {
    if (confirm("Are you sure you want to clear all measured ponds?")) {
      clearAllPondsFromMemory(); refreshMemory();
    }
  };

  useEffect(() => {
    if (isCameraScannerOpen) startCamera();
    else stopCamera();
    return () => stopCamera();
  }, [isCameraScannerOpen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          startLiveGuideLoop();
        };
      }
    } catch (err) { console.warn("Camera fallback", err); }
  };

  const stopCamera = () => {
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
    if (mediaStreamRef.current) { mediaStreamRef.current.getTracks().forEach((t) => t.stop()); mediaStreamRef.current = null; }
  };

  // ── Live AR guide loop: detects pond fill percentage in guide zone ──
  const startLiveGuideLoop = () => {
    const loop = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const vw = video.videoWidth || 640;
          const vh = video.videoHeight || 480;
          canvas.width = vw;
          canvas.height = vh;
          ctx.drawImage(video, 0, 0, vw, vh);

          // Sample the 84%×76% guide zone
          const sx = Math.round(vw * 0.08);
          const sy = Math.round(vh * 0.12);
          const sw = Math.round(vw * 0.84);
          const sh = Math.round(vh * 0.76);
          const fd = ctx.getImageData(sx, sy, sw, sh);
          const d = fd.data;
          const total = d.length / 4;

          let waterPx = 0;
          for (let i = 0; i < d.length; i += 4) {
            const r = d[i], g = d[i + 1], b = d[i + 2];
            const isWater =
              (b >= r - 15 && g >= r - 15) ||
              (r < 130 && g < 130 && b < 130) ||
              (Math.abs(r - g) < 30 && Math.abs(g - b) < 30 && r < 160);
            if (isWater) waterPx++;
          }

          const fillPct = Math.round((waterPx / total) * 100);
          setPondFillPct(fillPct);

          if (fillPct >= 50) {
            setGuideStatus("good");
            setGuideMessage("✅ Pond in frame — tap Scan!");
          } else if (fillPct >= 25) {
            setGuideStatus("scanning");
            setGuideMessage("Move closer or tilt down slightly");
          } else {
            setGuideStatus("bad");
            setGuideMessage("No pond detected — aim at pond surface");
          }
        }
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };
    loop();
  };

  // ── Annotate captured frame with guide box + labels ──
  const drawAnnotatedSnapshot = (videoEl: HTMLVideoElement, aiW: number, aiH: number): string => {
    const c = document.createElement("canvas");
    const vw = videoEl.videoWidth || 1280;
    const vh = videoEl.videoHeight || 720;
    c.width = vw;
    c.height = vh;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(videoEl, 0, 0, vw, vh);

    const bx = vw * 0.08, by = vh * 0.12;
    const bw = vw * 0.84, bh = vh * 0.76;
    const lw = Math.max(4, Math.round(vw / 160));
    const cl = Math.min(bw, bh) * 0.08;

    // Dark overlay everywhere except box
    ctx.fillStyle = "rgba(0,0,0,0.40)";
    ctx.fillRect(0, 0, vw, vh);
    ctx.clearRect(bx, by, bw, bh);
    ctx.drawImage(videoEl, bx, by, bw, bh, bx, by, bw, bh);

    // Green border
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = lw;
    ctx.strokeRect(bx, by, bw, bh);

    // Corner accents
    const drawCorner = (cx: number, cy: number, dx: number, dy: number) => {
      ctx.beginPath();
      ctx.moveTo(cx + dx * cl, cy);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy + dy * cl);
      ctx.strokeStyle = "#4ade80";
      ctx.lineWidth = lw * 2;
      ctx.stroke();
    };
    drawCorner(bx, by, 1, 1);
    drawCorner(bx + bw, by, -1, 1);
    drawCorner(bx, by + bh, 1, -1);
    drawCorner(bx + bw, by + bh, -1, -1);

    const fs = Math.max(20, Math.round(vw / 30));
    ctx.font = `bold ${fs}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Width pill top
    const wLabel = `WIDTH: ${aiW.toFixed(1)} m`;
    const wW = ctx.measureText(wLabel).width + 32;
    const pH = fs + 18;
    ctx.fillStyle = "rgba(15,98,54,0.93)";
    ctx.beginPath();
    (ctx as any).roundRect?.(bx + bw / 2 - wW / 2, by - pH / 2, wW, pH, 8);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillText(wLabel, bx + bw / 2, by);

    // Height pill left (rotated)
    const hLabel = `HEIGHT: ${aiH.toFixed(1)} m`;
    ctx.save();
    ctx.translate(bx, by + bh / 2);
    ctx.rotate(-Math.PI / 2);
    const hW = ctx.measureText(hLabel).width + 32;
    ctx.fillStyle = "rgba(15,98,54,0.93)";
    ctx.beginPath();
    (ctx as any).roundRect?.(-hW / 2, -pH / 2, hW, pH, 8);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillText(hLabel, 0, 0);
    ctx.restore();

    return c.toDataURL("image/jpeg", 0.92);
  };

  const handleScanPondWithAI = async () => {
    const video = videoRef.current;
    if (!video) { alert("Camera initializing... Please allow camera access and try again!"); return; }
    if (guideStatus === "bad") {
      alert("No pond detected in frame. Please point the camera directly at the pond surface and wait for the frame to turn green.");
      return;
    }

    setIsAnalyzingPond(true);
    try {
      const ac = document.createElement("canvas");
      const ctx = ac.getContext("2d")!;
      ac.width = video.videoWidth || 640;
      ac.height = video.videoHeight || 480;
      ctx.drawImage(video, 0, 0, ac.width, ac.height);
      const rawBase64 = ac.toDataURL("image/jpeg", 0.85);

      const result = await estimatePondDimensionsAI(rawBase64);
      const dataUrl = drawAnnotatedSnapshot(video, result.widthMeters, result.lengthMeters);

      setTargetWidth(result.widthMeters);
      setTargetLength(result.lengthMeters);
      setTargetDepth(result.depthMeters);
      setLiveVolumeLiters(result.volumeLiters);
      setPondType(result.pondType);
      setScanResult({
        widthM: result.widthMeters,
        heightM: result.lengthMeters,
        depthM: result.depthMeters,
        volL: result.volumeLiters,
        stockCap: result.stockingCapacity,
        dailyFeed: result.dailyFeedKg,
        pondType: result.pondType,
      });
      setCapturedSnapshot(dataUrl);
    } catch (e) {
      console.warn("AI Scan Pond error", e);
    } finally {
      setIsAnalyzingPond(false);
    }
  };

  const handleSaveCameraPond = () => {
    addPondToMemory({
      name: pondName || `Pond ${ponds.length + 1}`,
      type: pondType,
      widthMeters: targetWidth,
      lengthMeters: targetLength,
      depthMeters: targetDepth,
      volumeLiters: liveVolumeLiters,
      fishCount: scanResult?.stockCap ?? Math.floor(liveVolumeLiters / 40),
      fishType: fishType,
      measuredViaCamera: true,
    });
    refreshMemory();
    setIsCameraScannerOpen(false);
    setCapturedSnapshot(null);
    setScanResult(null);
    setPondName("");
  };

  const handleAddStandardPond = (e: React.FormEvent) => {
    e.preventDefault();
    addPondToMemory({
      name: pondName || `Pond ${ponds.length + 1}`,
      type: pondType, widthMeters: 5, lengthMeters: 8, depthMeters: 1.5,
      volumeLiters: 60000, fishCount: fishCount, fishType: fishType, measuredViaCamera: false,
    });
    refreshMemory();
    setIsModalOpen(false);
    setPondName("");
  };

  const estimatedFishCapacity = Math.floor(liveVolumeLiters / 40);

  return (
    <PhoneFrame>
      {/* Header */}
      <header className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-[#0F6236]/10 bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <Link to="/home" className="p-1 hover:bg-emerald-50 rounded-full">
            <ArrowLeft className="w-5.5 h-5.5 text-gray-900" />
          </Link>
          <div>
            <h1 className="text-[19px] font-extrabold text-gray-900 leading-tight">Pond Camera Scanner</h1>
            <div className="flex items-center gap-1 text-[#0F6236] text-[12px] font-bold mt-0.5">
              <MapPin className="w-3.5 h-3.5" /> {userLocation}
            </div>
          </div>
        </div>
        <img src={farmerImg} alt="Kofi" className="w-9.5 h-9.5 rounded-full object-cover border-2 border-[#0F6236]" />
      </header>

      {/* Launcher */}
      <section className="mx-5 mt-4">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#09341D] via-[#0F6236] to-[#082917] text-white shadow-xl shadow-[#0F6236]/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-emerald-200">
              <Camera className="w-4 h-4 text-emerald-300" /> AI Vision Camera
            </div>
            <span className="text-[11px] bg-emerald-500/20 text-emerald-200 px-2.5 py-0.5 rounded-full font-bold">Width & Height Auto</span>
          </div>
          <div>
            <h2 className="text-lg font-black leading-tight">Measure Pond With Camera</h2>
            <p className="text-xs text-emerald-100 mt-1 font-medium">
              Align your pond inside the green guide frame — the AI will scan Width, Height, Depth, Volume, and Max Stocking Capacity automatically.
            </p>
          </div>
          <button onClick={() => setIsCameraScannerOpen(true)}
            className="w-full h-12 rounded-2xl bg-white text-[#0F6236] font-black text-xs shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2">
            <Camera className="w-4 h-4" /> Open Camera Scanner
          </button>
        </div>
      </section>

      {/* Saved Ponds */}
      <section className="mx-5 mt-5 space-y-3 mb-6">
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
            <p className="text-xs text-gray-500 font-medium">Use the Camera Scanner to automatically measure and save your pond.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ponds.map((pond) => (
              <div key={pond.id} className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-sm text-gray-900">{pond.name}</h3>
                  <div className="flex items-center gap-3 text-xs font-bold text-[#0F6236]">
                    <span>W: {pond.widthMeters}m</span>
                    <span>H: {pond.lengthMeters}m</span>
                    <span>D: {pond.depthMeters}m</span>
                  </div>
                  <div className="text-[10px] text-gray-500 font-medium">{pond.fishCount.toLocaleString()} {pond.fishType} • {pond.type}</div>
                </div>
                <button onClick={() => handleDeletePond(pond.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl cursor-pointer">
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── LIVE AR CAMERA SCANNER MODAL ─── */}
      {isCameraScannerOpen && (
        <div className="fixed inset-0 z-50 bg-black">
          {/* Close */}
          <div className="absolute top-5 right-5 z-40">
            <button onClick={() => { setIsCameraScannerOpen(false); setCapturedSnapshot(null); setScanResult(null); }}
              className="p-3 rounded-full bg-black/60 text-white cursor-pointer hover:bg-black/80 border border-white/20">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Full-screen video */}
          <div className="relative w-full h-full">
            <video
              ref={(el) => {
                videoRef.current = el;
                if (el && mediaStreamRef.current && el.srcObject !== mediaStreamRef.current) {
                  el.srcObject = mediaStreamRef.current;
                  el.play().catch(() => {});
                }
              }}
              autoPlay playsInline muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* ── AR Overlay ── */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Top vignette */}
              <div className="absolute inset-x-0 top-0 h-[12%] bg-gradient-to-b from-black/70 to-transparent" />
              {/* Bottom vignette */}
              <div className="absolute inset-x-0 bottom-0 h-[32%] bg-gradient-to-t from-black/80 to-transparent" />
              {/* Left & Right vignette */}
              <div className="absolute inset-y-0 left-0 w-[8%] bg-gradient-to-r from-black/50 to-transparent" />
              <div className="absolute inset-y-0 right-0 w-[8%] bg-gradient-to-l from-black/50 to-transparent" />

              {/* Guide Rectangle */}
              <div className="absolute" style={{ left: "8%", top: "12%", width: "84%", height: "68%" }}>
                {/* Main border */}
                <div className={`absolute inset-0 rounded-2xl border-2 transition-colors duration-500 ${
                  guideStatus === "good" ? "border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.4)]"
                  : guideStatus === "bad" ? "border-red-400/70"
                  : "border-white/50"
                }`} />

                {/* Corner L-brackets */}
                {[
                  "top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-2xl",
                  "top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-2xl",
                  "bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-2xl",
                  "bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-2xl",
                ].map((cls, i) => (
                  <div key={i} className={`absolute w-10 h-10 transition-colors duration-500 ${cls} ${
                    guideStatus === "good" ? "border-green-400" : guideStatus === "bad" ? "border-red-400" : "border-white"
                  }`} />
                ))}

                {/* Label: WIDTH top center */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                    guideStatus === "good" ? "bg-green-500/90 text-white" : "bg-white/20 text-white/80"
                  }`}>WIDTH →</span>
                </div>
                {/* Label: HEIGHT left center */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-2">
                  <span className={`text-[10px] font-extrabold px-2 py-1 rounded-full writing-mode-vertical-lr rotate-180 ${
                    guideStatus === "good" ? "bg-green-500/90 text-white" : "bg-white/20 text-white/80"
                  }`} style={{ writingMode: "vertical-lr", transform: "rotate(180deg)" }}>HEIGHT ↕</span>
                </div>

                {/* Center reticle */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-8 h-8 border-2 rounded-full transition-all ${
                    guideStatus === "good" ? "border-green-400 bg-green-400/20" : "border-white/40 bg-white/10"
                  }`}>
                    <div className={`absolute inset-0 rounded-full m-1.5 ${guideStatus === "good" ? "bg-green-400" : "bg-white/30"}`} />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Status Bar top ── */}
            <div className="absolute top-5 left-4 right-16 z-20 flex flex-col gap-2">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold backdrop-blur-md border transition-all self-start ${
                guideStatus === "good" ? "bg-green-500/25 border-green-400/50 text-green-300"
                : guideStatus === "bad" ? "bg-red-500/25 border-red-400/40 text-red-300"
                : "bg-black/50 border-white/20 text-white"
              }`}>
                {guideStatus === "good" && <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />}
                {guideStatus === "bad" && <AlertTriangle className="w-3.5 h-3.5" />}
                {guideStatus === "scanning" && <span className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />}
                {guideMessage}
              </div>
              {/* Coverage bar */}
              <div className="flex items-center gap-2">
                <div className="w-32 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-200 ${
                    pondFillPct >= 50 ? "bg-green-400" : pondFillPct >= 25 ? "bg-yellow-400" : "bg-red-400"
                  }`} style={{ width: `${Math.min(pondFillPct * 2, 100)}%` }} />
                </div>
                <span className="text-[10px] text-white/60 font-bold">{pondFillPct}% coverage</span>
              </div>
            </div>

            {/* ── Snap Button bottom ── */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3">
              <button
                onClick={handleScanPondWithAI}
                disabled={isAnalyzingPond}
                className={`w-20 h-20 rounded-full border-[5px] shadow-2xl flex items-center justify-center cursor-pointer active:scale-90 transition-all ${
                  guideStatus === "good"
                    ? "border-green-400 bg-green-500 shadow-green-500/40"
                    : guideStatus === "bad"
                    ? "border-red-400/60 bg-red-500/50"
                    : "border-white bg-white/20"
                }`}
              >
                <div className="w-13 h-13 rounded-full bg-white/25 flex items-center justify-center">
                  {isAnalyzingPond
                    ? <RefreshCw className="w-7 h-7 text-white animate-spin" />
                    : <Camera className="w-7 h-7 text-white" />}
                </div>
              </button>
              <span className={`text-xs font-extrabold px-4 py-1.5 rounded-full border backdrop-blur-md ${
                guideStatus === "good" ? "bg-green-500/25 border-green-400/50 text-green-300"
                : "bg-black/60 border-white/20 text-white"
              }`}>
                {isAnalyzingPond ? "⏳ Measuring..." : guideStatus === "good" ? "✅ Tap to Scan!" : "Align pond in frame first"}
              </span>
            </div>
          </div>

          {/* ── Full-Screen Scan Result ── */}
          {capturedSnapshot && (
            <div className="absolute inset-0 z-50 bg-black flex flex-col">
              {/* Annotated image */}
              <div className="flex-1 flex items-center justify-center overflow-hidden">
                <img src={capturedSnapshot} alt="Scanned Pond" className="w-full h-full object-contain" />
              </div>

              {/* Results bottom sheet */}
              <div className="bg-gradient-to-t from-black via-black/98 to-transparent px-5 pb-8 pt-4 space-y-4">
                <div className="flex items-center justify-between border-b border-white/15 pb-3">
                  <span className="font-extrabold text-sm text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Scan Complete ✓
                  </span>
                  <button onClick={() => { setCapturedSnapshot(null); setScanResult(null); }}
                    className="p-1.5 bg-white/15 rounded-full text-white cursor-pointer hover:bg-white/25">
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* Measurement grid */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: "Width", val: `${(scanResult?.widthM ?? targetWidth).toFixed(1)} m` },
                    { label: "Height", val: `${(scanResult?.heightM ?? targetLength).toFixed(1)} m` },
                    { label: "Depth", val: `${(scanResult?.depthM ?? targetDepth).toFixed(1)} m` },
                    { label: "Volume", val: `${((scanResult?.volL ?? liveVolumeLiters) / 1000).toFixed(1)} kL` },
                    { label: "Max Stock", val: `${(scanResult?.stockCap ?? estimatedFishCapacity).toLocaleString()}` },
                    { label: "Daily Feed", val: `${scanResult?.dailyFeed?.toFixed(1) ?? "—"} kg` },
                  ].map(({ label, val }) => (
                    <div key={label} className="bg-white/10 rounded-2xl p-2.5 border border-white/15">
                      <div className="text-[9px] font-extrabold text-emerald-400 uppercase mb-0.5">{label}</div>
                      <div className="text-sm font-black text-white">{val}</div>
                    </div>
                  ))}
                </div>

                <div className="text-[10px] text-gray-400 font-medium text-center">
                  Pond Type: <span className="text-emerald-400 font-bold">{scanResult?.pondType ?? pondType}</span>
                </div>

                {/* Name input */}
                <input type="text" value={pondName} onChange={(e) => setPondName(e.target.value)}
                  placeholder="Give this pond a name (optional)"
                  className="w-full h-10 bg-white/15 border border-white/20 rounded-xl px-3.5 text-white text-xs font-bold placeholder-white/40 outline-none" />

                <div className="flex gap-2.5">
                  <button onClick={handleSaveCameraPond}
                    className="flex-1 h-12 bg-[#0F6236] hover:bg-[#0B4D29] text-white font-extrabold text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95">
                    <Check className="w-4 h-4" /> Save Pond Record
                  </button>
                  <button onClick={() => { setCapturedSnapshot(null); setScanResult(null); }}
                    className="px-5 h-12 bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs rounded-2xl cursor-pointer">
                    Retake
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-5 animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="font-extrabold text-sm text-gray-900">Add Pond Manually</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleAddStandardPond} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Pond Name</label>
                <input type="text" required value={pondName} onChange={(e) => setPondName(e.target.value)}
                  placeholder="e.g. Earth Pond 2"
                  className="w-full h-10 px-3 border border-gray-200 rounded-xl bg-gray-50 font-bold" />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">Fish Count</label>
                <input type="number" required value={fishCount} onChange={(e) => setFishCount(Number(e.target.value) || 0)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-xl bg-gray-50 font-bold" />
              </div>
              <button type="submit" className="w-full h-11 bg-[#0F6236] text-white font-extrabold rounded-xl shadow-md cursor-pointer">
                Save Pond
              </button>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </PhoneFrame>
  );
}
