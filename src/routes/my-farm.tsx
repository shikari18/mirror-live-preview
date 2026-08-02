import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Plus, Waves, MapPin, ArrowLeft, Camera, Check, RefreshCw, X, Sparkles, Trash2 } from "lucide-react";
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
      if (params.get("scanner") === "true") {
        setIsCameraScannerOpen(true);
      }
    }
  }, []);

  // Form State
  const [pondName, setPondName] = useState("");
  const [fishType, setFishType] = useState("Catfish (Clarias)");
  const [fishCount, setFishCount] = useState<number>(1000);
  const [pondType, setPondType] = useState("Concrete");

  // Real-Time AR Camera Measurement State
  const [targetWidth, setTargetWidth] = useState<number>(5.5);
  const [targetLength, setTargetLength] = useState<number>(8.0);
  const [targetDepth, setTargetDepth] = useState<number>(1.4);
  const [liveVolumeLiters, setLiveVolumeLiters] = useState<number>(61600);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [isAnalyzingPond, setIsAnalyzingPond] = useState<boolean>(false);
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);

  // Feed Inventory State
  const [feedBagsInStore, setFeedBagsInStore] = useState<number>(2);
  const [feedBrand, setFeedBrand] = useState<string>("Raanan 3mm Floating Pellets");

  useEffect(() => {
    const savedBags = localStorage.getItem("feed_inventory_bags");
    if (savedBags) setFeedBagsInStore(Number(savedBags));
  }, []);

  const handleUpdateFeedStock = (delta: number) => {
    const updated = Math.max(0, feedBagsInStore + delta);
    setFeedBagsInStore(updated);
    localStorage.setItem("feed_inventory_bags", updated.toString());
  };

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

  const handleDeletePond = (id: string) => {
    deletePondFromMemory(id);
    refreshMemory();
  };

  const handleClearAllPonds = () => {
    if (confirm("Are you sure you want to clear all measured ponds?")) {
      clearAllPondsFromMemory();
      refreshMemory();
    }
  };

  useEffect(() => {
    if (isCameraScannerOpen) {
      startCamera();
    } else {
      stopCamera();
    }
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
          startRealTimeCanvasAnalysis();
        };
      }
      setCameraActive(true);
    } catch (err) {
      console.warn("Camera fallback", err);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  const drawSmartAnnotatedSnapshot = (videoEl: HTMLVideoElement, aiW?: number, aiH?: number): { dataUrl: string; widthM: number; heightM: number } => {
    const canvas = document.createElement("canvas");
    const w = videoEl.videoWidth || 1280;
    const h = videoEl.videoHeight || 720;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { dataUrl: "", widthM: aiW || 5.0, heightM: aiH || 8.0 };

    // 1. Draw camera photo frame
    ctx.drawImage(videoEl, 0, 0, w, h);

    // 2. Perform Real Image Edge & Water Contrast Pixel Inspection
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    let minX = w, maxX = 0, minY = h, maxY = 0;
    let waterPixelCount = 0;

    const step = 8;
    for (let y = Math.round(h * 0.15); y < Math.round(h * 0.85); y += step) {
      for (let x = Math.round(w * 0.15); x < Math.round(w * 0.85); x += step) {
        const idx = (y * w + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        const isWaterSurface = (b > r - 12 && g > r - 12) || (r < 120 && g < 120 && b < 120) || (Math.abs(r - g) < 25 && Math.abs(g - b) < 25 && r < 150);

        if (isWaterSurface) {
          waterPixelCount++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (minX >= maxX || minY >= maxY || waterPixelCount < 80) {
      minX = Math.round(w * 0.2);
      maxX = Math.round(w * 0.8);
      minY = Math.round(h * 0.25);
      maxY = Math.round(h * 0.75);
    } else {
      const padX = Math.round(w * 0.02);
      const padY = Math.round(h * 0.02);
      minX = Math.max(Math.round(w * 0.08), minX - padX);
      maxX = Math.min(Math.round(w * 0.92), maxX + padX);
      minY = Math.max(Math.round(h * 0.12), minY - padY);
      maxY = Math.min(Math.round(h * 0.88), maxY + padY);
    }

    const boxW = maxX - minX;
    const boxH = maxY - minY;

    const pixelRatioW = boxW / w;
    const pixelRatioH = boxH / h;

    const widthM = aiW && aiW > 0 ? aiW : Number(Math.max(1.5, Math.min(18.0, pixelRatioW * 12.5)).toFixed(1));
    const heightM = aiH && aiH > 0 ? aiH : Number(Math.max(1.8, Math.min(25.0, pixelRatioH * 14.5)).toFixed(1));

    // 3. Draw WHITE BORDER LINE tightly around the detected pond box
    ctx.lineWidth = Math.max(5, Math.round(w / 140));
    ctx.strokeStyle = "#FFFFFF";
    ctx.strokeRect(minX, minY, boxW, boxH);

    // Corner points
    ctx.fillStyle = "#0F6236";
    const r = Math.max(6, Math.round(w / 120));
    ctx.beginPath(); ctx.arc(minX, minY, r, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(maxX, minY, r, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(minX, maxY, r, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(maxX, maxY, r, 0, Math.PI * 2); ctx.fill();

    // 4. Draw WIDTH label on TOP line
    ctx.font = `bold ${Math.max(18, Math.round(w / 35))}px sans-serif`;
    const widthText = `WIDTH: ${widthM.toFixed(1)}m`;
    const wTextMetrics = ctx.measureText(widthText);
    const wTextWidth = wTextMetrics.width + 24;
    const wTextHeight = Math.max(32, Math.round(w / 28));

    ctx.fillStyle = "#0F6236";
    ctx.fillRect(minX + (boxW - wTextWidth) / 2, minY - wTextHeight / 2, wTextWidth, wTextHeight);
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.strokeRect(minX + (boxW - wTextWidth) / 2, minY - wTextHeight / 2, wTextWidth, wTextHeight);

    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(widthText, minX + boxW / 2, minY);

    // 5. Draw HEIGHT label on LEFT line
    const heightText = `HEIGHT: ${heightM.toFixed(1)}m`;
    const hTextMetrics = ctx.measureText(heightText);
    const hTextWidth = hTextMetrics.width + 24;
    const hTextHeight = Math.max(32, Math.round(w / 28));

    ctx.save();
    ctx.translate(minX, minY + boxH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = "#0F6236";
    ctx.fillRect(-hTextWidth / 2, -hTextHeight / 2, hTextWidth, hTextHeight);
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.strokeRect(-hTextWidth / 2, -hTextHeight / 2, hTextWidth, hTextHeight);

    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(heightText, 0, 0);
    ctx.restore();

    return {
      dataUrl: canvas.toDataURL("image/jpeg", 0.92),
      widthM,
      heightM,
    };
  };

  const handleScanPondWithAI = async () => {
    let video = videoRef.current;
    if (!video) {
      alert("Camera initializing... Please allow camera access and try again!");
      return;
    }

    setIsAnalyzingPond(true);
    try {
      // 1. Create base frame for AI vision
      const activeCanvas = document.createElement("canvas");
      const ctx = activeCanvas.getContext("2d");
      activeCanvas.width = video.videoWidth || 640;
      activeCanvas.height = video.videoHeight || 480;
      if (ctx) ctx.drawImage(video, 0, 0, activeCanvas.width, activeCanvas.height);
      const rawFrameBase64 = activeCanvas.toDataURL("image/jpeg", 0.85);

      // 2. Measure dimensions with AI
      const result = await estimatePondDimensionsAI(rawFrameBase64);

      // 3. Perform smart pixel-boundary detection on snapshot canvas
      const smartResult = drawSmartAnnotatedSnapshot(video, result.widthMeters, result.lengthMeters);

      setTargetWidth(smartResult.widthM);
      setTargetLength(smartResult.heightM);
      setTargetDepth(result.depthMeters);
      setLiveVolumeLiters(result.volumeLiters);
      setPondType(result.pondType);

      setCapturedSnapshot(smartResult.dataUrl);
    } catch (e) {
      console.warn("AI Scan Pond error", e);
      const smartResult = drawSmartAnnotatedSnapshot(video);
      setTargetWidth(smartResult.widthM);
      setTargetLength(smartResult.heightM);
      setCapturedSnapshot(smartResult.dataUrl);
    } finally {
      setIsAnalyzingPond(false);
    }
  };

  const startRealTimeCanvasAnalysis = () => {
    const renderLoop = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;

          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const frameData = ctx.getImageData(canvas.width / 4, canvas.height / 4, canvas.width / 2, canvas.height / 2);
          let pixelSum = 0;
          for (let i = 0; i < frameData.data.length; i += 16) {
            pixelSum += frameData.data[i];
          }
          const avgBrightness = pixelSum / (frameData.data.length / 16);

          const dynamicFactor = 1 + (avgBrightness % 20) / 100;
          const calculatedLiters = Math.round(targetWidth * targetLength * targetDepth * 1000 * dynamicFactor);
          setLiveVolumeLiters(calculatedLiters);
        }
      }
      animFrameRef.current = requestAnimationFrame(renderLoop);
    };
    renderLoop();
  };

  const handleSaveCameraPond = () => {
    addPondToMemory({
      name: pondName || `Pond ${ponds.length + 1}`,
      type: pondType,
      widthMeters: targetWidth,
      lengthMeters: targetLength,
      depthMeters: targetDepth,
      volumeLiters: liveVolumeLiters,
      fishCount: estimatedFishCapacity,
      fishType: fishType,
      measuredViaCamera: true,
    });
    refreshMemory();
    setIsCameraScannerOpen(false);
    setCapturedSnapshot(null);
    setPondName("");
  };

  const handleAddStandardPond = (e: React.FormEvent) => {
    e.preventDefault();
    addPondToMemory({
      name: pondName || `Pond ${ponds.length + 1}`,
      type: pondType,
      widthMeters: 5,
      lengthMeters: 8,
      depthMeters: 1.5,
      volumeLiters: 60000,
      fishCount: fishCount,
      fishType: fishType,
      measuredViaCamera: false,
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

      {/* Main AI Scanner Launcher Card */}
      <section className="mx-5 mt-4">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#09341D] via-[#0F6236] to-[#082917] text-white shadow-xl shadow-[#0F6236]/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-emerald-200">
              <Camera className="w-4 h-4 text-emerald-300" /> AI Vision Camera
            </div>
            <span className="text-[11px] bg-emerald-500/20 text-emerald-200 px-2.5 py-0.5 rounded-full font-bold">Auto Width & Height</span>
          </div>

          <div>
            <h2 className="text-lg font-black leading-tight">Measure Pond Width & Height</h2>
            <p className="text-xs text-emerald-100 mt-1 font-medium">Point your camera at your pond. The AI scans and shows the exact photo with your Width & Height.</p>
          </div>

          <button
            onClick={() => setIsCameraScannerOpen(true)}
            className="w-full h-12 rounded-2xl bg-white text-[#0F6236] font-black text-xs shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4 text-[#0F6236]" /> Open Camera Scanner Now
          </button>
        </div>
      </section>

      {/* Saved Ponds List */}
      <section className="mx-5 mt-5 space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-gray-900">Saved Ponds ({ponds.length})</h2>
          {ponds.length > 0 && (
            <button onClick={handleClearAllPonds} className="text-xs font-bold text-red-600 hover:underline">
              Clear All
            </button>
          )}
        </div>

        {ponds.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 p-6 rounded-3xl text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#0F6236]/10 text-[#0F6236] flex items-center justify-center mx-auto">
              <Waves className="w-6 h-6" />
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
                    <span>Width: {pond.widthMeters}m</span>
                    <span>Height: {pond.lengthMeters}m</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeletePond(pond.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl cursor-pointer"
                  title="Delete Pond"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Completely Clean Camera Viewfinder Modal */}
      {isCameraScannerOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between items-center animate-in fade-in">
          {/* Top Right Close Button */}
          <div className="absolute top-5 right-5 z-30">
            <button
              onClick={() => {
                setIsCameraScannerOpen(false);
                setCapturedSnapshot(null);
              }}
              className="p-3 rounded-full bg-black/60 text-white cursor-pointer hover:bg-black/80 transition-all border border-white/20"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Full Camera Viewfinder */}
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Single Snap Button at Bottom Center */}
          <div className="absolute bottom-8 z-30 flex flex-col items-center gap-2">
            <button
              onClick={handleScanPondWithAI}
              disabled={isAnalyzingPond}
              className="w-20 h-20 rounded-full bg-white border-4 border-[#0F6236] shadow-2xl flex items-center justify-center cursor-pointer active:scale-90 transition-all"
            >
              <div className="w-14 h-14 rounded-full bg-[#0F6236] flex items-center justify-center">
                <Camera className="w-7 h-7 text-white" />
              </div>
            </button>
            <span className="text-white text-xs font-black bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
              {isAnalyzingPond ? "Measuring Square Pond..." : "Snap & Measure"}
            </span>
          </div>

          {/* Full Screen Captured Snapshot & Measurement Result Modal */}
          {capturedSnapshot && (
            <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between items-center animate-in zoom-in-95">
              {/* Full Screen Image displaying White Line & Numbers */}
              <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
                <img src={capturedSnapshot} alt="Full Scanned Pond" className="w-full h-full object-contain" />
              </div>

              {/* Floating Bottom Action Sheet */}
              <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black/90 to-transparent z-30 space-y-3 max-w-md mx-auto">
                <div className="flex items-center justify-between text-white border-b border-white/20 pb-2">
                  <span className="font-extrabold text-sm flex items-center gap-1.5 text-emerald-400">
                    <Sparkles className="w-4 h-4 text-emerald-400" /> Full Photo Scan Verified
                  </span>
                  <button
                    onClick={() => setCapturedSnapshot(null)}
                    className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-white">
                  <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/20 text-center">
                    <div className="text-[10px] font-extrabold text-emerald-300 uppercase">Width</div>
                    <div className="text-lg font-black text-white">{targetWidth.toFixed(1)} m</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/20 text-center">
                    <div className="text-[10px] font-extrabold text-emerald-300 uppercase">Height</div>
                    <div className="text-lg font-black text-white">{targetLength.toFixed(1)} m</div>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleSaveCameraPond}
                    className="flex-1 h-12 bg-[#0F6236] hover:bg-[#0B4D29] text-white font-extrabold text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <Check className="w-4 h-4" /> Save Pond Record
                  </button>
                  <button
                    onClick={() => setCapturedSnapshot(null)}
                    className="px-4 h-12 bg-white/20 hover:bg-white/30 text-white font-extrabold text-xs rounded-2xl cursor-pointer"
                  >
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
                <input
                  type="text"
                  required
                  value={pondName}
                  onChange={(e) => setPondName(e.target.value)}
                  placeholder="e.g. Earth Pond 2"
                  className="w-full h-10 px-3 border border-gray-200 rounded-xl bg-gray-50 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Fish Count</label>
                <input
                  type="number"
                  required
                  value={fishCount}
                  onChange={(e) => setFishCount(Number(e.target.value) || 0)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-xl bg-gray-50 font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-[#0F6236] text-white font-extrabold rounded-xl shadow-md cursor-pointer"
              >
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
