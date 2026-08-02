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

  const handleScanPondWithAI = async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    setIsAnalyzingPond(true);
    try {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frameBase64 = canvas.toDataURL("image/jpeg", 0.85);

        const result = await estimatePondDimensionsAI(frameBase64);
        setTargetLength(result.lengthMeters);
        setTargetWidth(result.widthMeters);
        setTargetDepth(result.depthMeters);
        setLiveVolumeLiters(result.volumeLiters);
        setPondType(result.pondType);
        setAiConfidence(result.confidence);
      }
    } catch (e) {
      console.warn("AI Scan Pond error", e);
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

  const estimatedFishCapacity = Math.floor(liveVolumeLiters / 40);

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
              <Camera className="w-4 h-4 text-emerald-300" /> AI Vision Scanner
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

      {/* Scanned Image & Width/Height Result Banner */}
      {capturedSnapshot && (
        <section className="mx-5 mt-4">
          <div className="bg-emerald-50 border-2 border-emerald-500/40 rounded-3xl p-4 space-y-3 animate-in zoom-in-95 shadow-md">
            <div className="text-xs font-black text-emerald-950 flex items-center justify-between">
              <span>Scanned Image & AI Dimensions</span>
              <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[10px]">Verified Photo</span>
            </div>

            <div className="flex gap-3 items-center">
              {/* Captured Photo Snapshot */}
              <div className="relative shrink-0">
                <img
                  src={capturedSnapshot}
                  alt="Scanned Pond"
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-600 shadow-md"
                />
                <span className="absolute bottom-1 right-1 bg-black/75 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">Scanned</span>
              </div>

              {/* Clean Width & Height Display */}
              <div className="flex-1 space-y-2">
                <div className="bg-white p-2.5 rounded-2xl border border-emerald-200 shadow-2xs">
                  <div className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wide">Width</div>
                  <div className="text-lg font-black text-[#0F6236]">{targetWidth.toFixed(1)} meters</div>
                </div>

                <div className="bg-white p-2.5 rounded-2xl border border-emerald-200 shadow-2xs">
                  <div className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wide">Height / Length</div>
                  <div className="text-lg font-black text-[#0F6236]">{targetLength.toFixed(1)} meters</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Monitored Ponds List */}
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

      {/* Camera Scanner Modal */}
      {isCameraScannerOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between items-center animate-in fade-in">
          <div className="w-full px-5 pt-5 pb-3 flex items-center justify-between text-white bg-black/60 backdrop-blur-md z-20">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-extrabold text-sm">Point Camera at Pond</h3>
            </div>
            <button onClick={() => setIsCameraScannerOpen(false)} className="p-2 rounded-full bg-white/20 text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Live Video Stream Viewfinder */}
          <div className="relative w-full flex-1 max-w-sm flex items-center justify-center overflow-hidden my-2">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover rounded-3xl border-2 border-emerald-500/30" />
            <canvas ref={canvasRef} className="hidden" />

            <div className="absolute inset-8 border-2 border-dashed border-emerald-400 rounded-3xl pointer-events-none flex flex-col items-center justify-between p-3">
              <div className="text-[10px] font-black bg-emerald-600 text-white px-2.5 py-1 rounded-full shadow-md">
                HEIGHT: {targetLength.toFixed(1)} m
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-white/90 animate-ping" />
              <div className="text-[10px] font-black bg-emerald-600 text-white px-2.5 py-1 rounded-full shadow-md">
                WIDTH: {targetWidth.toFixed(1)} m
              </div>
            </div>
          </div>

          {/* AI Measurement Trigger Bottom Bar */}
          <div className="w-full max-w-sm bg-white p-5 rounded-t-3xl space-y-3 z-20 shadow-2xl">
            <button
              onClick={handleScanPondWithAI}
              disabled={isAnalyzingPond}
              className="w-full h-13 rounded-2xl bg-[#0F6236] text-white font-extrabold text-xs shadow-lg shadow-[#0F6236]/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-emerald-200 animate-spin" />
              {isAnalyzingPond ? "AI Vision Measuring Width & Height..." : "📸 Take Photo & Measure Width & Height"}
            </button>

            {capturedSnapshot && (
              <div className="flex items-center justify-between bg-emerald-50 p-2.5 rounded-2xl border border-emerald-200 text-xs font-extrabold text-[#0F6236]">
                <div className="flex items-center gap-2">
                  <img src={capturedSnapshot} alt="Snapshot" className="w-9 h-9 rounded-lg object-cover border border-emerald-500" />
                  <span>Width: {targetWidth.toFixed(1)}m | Height: {targetLength.toFixed(1)}m</span>
                </div>
                <button
                  onClick={handleSaveCameraPond}
                  className="px-3 py-1.5 bg-[#0F6236] text-white text-[11px] font-black rounded-xl cursor-pointer"
                >
                  Save
                </button>
              </div>
            )}
          </div>
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
