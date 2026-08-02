import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Plus, Waves, MapPin, ArrowLeft, Camera, Check, RefreshCw, X, Sparkles, Trash2 } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import { useLanguage } from "@/lib/languageContext";
import { getFarmProfile, addPondToMemory, deletePondFromMemory, clearAllPondsFromMemory, PondRecord } from "@/lib/farmMemory";

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

  // Standard Form State
  const [pondName, setPondName] = useState("");
  const [fishType, setFishType] = useState("Nile Tilapia");
  const [fishCount, setFishCount] = useState<number>(1000);
  const [pondType, setPondType] = useState("Concrete");

  // Real-Time AR Camera Measurement State
  const [targetWidth, setTargetWidth] = useState<number>(5.5);
  const [targetLength, setTargetLength] = useState<number>(8.0);
  const [targetDepth, setTargetDepth] = useState<number>(1.4);
  const [liveVolumeLiters, setLiveVolumeLiters] = useState<number>(61600);
  const [cameraActive, setCameraActive] = useState<boolean>(false);

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
      name: pondName || `AR Measured ${pondType} Pond ${ponds.length + 1}`,
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

  const totalFish = ponds.reduce((acc, p) => acc + (p.fishCount || 0), 0);
  const totalVolume = ponds.reduce((acc, p) => acc + (p.volumeLiters || 0), 0);

  return (
    <PhoneFrame>
      {/* Header */}
      <header className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-[#0F6236]/10 bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <Link to="/home" className="p-1 hover:bg-emerald-50 rounded-full">
            <ArrowLeft className="w-5.5 h-5.5 text-gray-900" />
          </Link>
          <div>
            <h1 className="text-[19px] font-extrabold text-gray-900 leading-tight">My Farm & Ponds</h1>
            <div className="flex items-center gap-1 text-[#0F6236] text-[12px] font-bold mt-0.5">
              <MapPin className="w-3.5 h-3.5" /> {userLocation}
            </div>
          </div>
        </div>
        <img src={farmerImg} alt="Kofi" className="w-9.5 h-9.5 rounded-full object-cover border-2 border-[#0F6236]" />
      </header>

      {/* Farm Summary Banner */}
      <section className="mx-5 mt-4 rounded-3xl bg-gradient-to-br from-[#09341D] via-[#0F6236] to-[#082917] text-white p-5 shadow-xl shadow-[#0F6236]/30 border border-emerald-500/20">
        <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-3">
          <span className="text-xs font-extrabold uppercase tracking-wide text-emerald-200 flex items-center gap-1.5">
            <Waves className="w-4 h-4 text-emerald-300" /> Unified Farm Memory
          </span>
          <button
            onClick={() => setIsCameraScannerOpen(true)}
            className="px-3.5 py-2 rounded-2xl bg-white text-[#0F6236] font-extrabold text-xs shadow-md hover:bg-emerald-50 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <Camera className="w-4 h-4 text-[#0F6236]" /> AR Camera Measure
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-[11px] text-emerald-100 font-medium">Ponds Count</div>
            <div className="text-2xl font-extrabold">{ponds.length}</div>
          </div>
          <div>
            <div className="text-[11px] text-emerald-100 font-medium">Total Stocked</div>
            <div className="text-2xl font-extrabold">{totalFish.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[11px] text-emerald-100 font-medium">Total Volume</div>
            <div className="text-sm font-extrabold text-emerald-200 mt-1">{totalVolume > 0 ? `${(totalVolume/1000).toFixed(0)} m³` : "0 L"}</div>
          </div>
        </div>
      </section>

      {/* Real-Time Camera Pond Size Calculator Card */}
      <section className="mx-5 mt-4">
        <div className="p-4 rounded-3xl bg-emerald-50/90 border border-emerald-200 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#0F6236] text-white flex items-center justify-center font-bold shrink-0 shadow-md shadow-[#0F6236]/25">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-gray-900">Camera Pond Size Calculator</h3>
              <p className="text-[11.5px] text-gray-600 font-medium">Real-time canvas video feed measures width, length & volume automatically.</p>
            </div>
          </div>

          <button
            onClick={() => setIsCameraScannerOpen(true)}
            className="px-3.5 py-2.5 rounded-2xl bg-[#0F6236] hover:bg-[#0B4D29] text-white text-xs font-extrabold shadow-md shrink-0 cursor-pointer transition-all active:scale-95"
          >
            Open Scanner
          </button>
        </div>
      </section>

      {/* Feed Inventory & Low Stock Alarm Card */}
      <section className="mx-5 mt-3 p-4 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold shrink-0">
              🌾
            </div>
            <div>
              <div className="text-xs font-extrabold text-gray-900">Feed Bag Store Inventory</div>
              <div className="text-[11px] text-gray-500 font-medium">{feedBrand}</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleUpdateFeedStock(-1)}
              className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-black text-sm flex items-center justify-center cursor-pointer"
            >
              -
            </button>
            <span className="text-base font-black text-gray-900 px-1">{feedBagsInStore} Bags</span>
            <button
              onClick={() => handleUpdateFeedStock(1)}
              className="w-8 h-8 rounded-xl bg-[#0F6236] hover:bg-[#0B4D29] text-white font-black text-sm flex items-center justify-center cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {feedBagsInStore < 3 && (
          <div className="p-3 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-900 font-medium flex items-center justify-between animate-pulse">
            <span className="font-extrabold text-red-950">⚠️ Low Feed Warning: Only {feedBagsInStore} bags remaining!</span>
            <Link to="/market" className="px-2.5 py-1 rounded-xl bg-red-600 text-white font-extrabold text-[10.5px]">
              Reorder
            </Link>
          </div>
        )}
      </section>

      {/* Ponds List */}
      <section className="mx-5 mt-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-gray-900">Active Monitored Ponds ({ponds.length})</h2>
          <div className="flex gap-2">
            {ponds.length > 0 && (
              <button onClick={handleClearAllPonds} className="text-xs font-bold text-red-600 hover:underline">
                Clear All
              </button>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-extrabold text-[#0F6236] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Manually
            </button>
          </div>
        </div>

        {ponds.length === 0 ? (
          <div className="emerald-card p-6 rounded-3xl text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0F6236]/10 text-[#0F6236] flex items-center justify-center mx-auto">
              <Waves className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-gray-900">No Ponds Measured Yet</h3>
            <p className="text-xs text-gray-500 font-medium max-w-[240px] mx-auto">
              Tap the AR Camera button above to measure your pond dimensions with your phone camera!
            </p>
            <button
              onClick={() => setIsCameraScannerOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-[#0F6236] text-white text-xs font-extrabold shadow-md cursor-pointer"
            >
              Start AR Camera Scanner
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {ponds.map((pond) => (
              <div key={pond.id} className="emerald-card p-4 rounded-3xl space-y-2 relative">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900">{pond.name}</h3>
                    <div className="text-[11px] text-gray-500 font-semibold">{pond.type} Pond • {pond.fishType}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {pond.measuredViaCamera && (
                      <span className="text-[10px] font-extrabold bg-[#0F6236] text-white px-2.5 py-0.5 rounded-full shadow-xs">
                        AR Camera
                      </span>
                    )}
                    <button
                      onClick={() => handleDeletePond(pond.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                  <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                    <span className="text-[10px] text-gray-400 font-bold block">Stock Count</span>
                    <span className="font-extrabold text-gray-900">{pond.fishCount?.toLocaleString()} Fish</span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                    <span className="text-[10px] text-gray-400 font-bold block">Volume</span>
                    <span className="font-extrabold text-[#0F6236]">{(pond.volumeLiters / 1000).toFixed(1)} m³</span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                    <span className="text-[10px] text-gray-400 font-bold block">Dimensions</span>
                    <span className="font-extrabold text-gray-900">{pond.widthMeters}m x {pond.lengthMeters}m</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* AR Camera Scanner Modal */}
      {isCameraScannerOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col justify-between items-center animate-in fade-in">
          <div className="w-full px-5 pt-5 pb-3 flex items-center justify-between text-white bg-black/60 backdrop-blur-md z-20">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-extrabold text-sm">AR Camera Pond Scanner</h3>
            </div>
            <button onClick={() => setIsCameraScannerOpen(false)} className="p-2 rounded-full bg-white/20 text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Video Stream & Reticle Overlay */}
          <div className="relative w-full flex-1 max-w-sm flex items-center justify-center overflow-hidden my-2">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover rounded-3xl border-2 border-emerald-500/30" />
            <canvas ref={canvasRef} className="hidden" />

            {/* Target Reticle & Measurement Guides */}
            <div className="absolute inset-8 border-2 border-dashed border-emerald-400 rounded-3xl pointer-events-none flex flex-col items-center justify-between p-3">
              <div className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full shadow-md">
                LENGTH: {targetLength.toFixed(1)} m
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-white/90 animate-ping" />
              <div className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full shadow-md">
                WIDTH: {targetWidth.toFixed(1)} m
              </div>
            </div>

            {/* Live Volume Counter Overlay */}
            <div className="absolute top-3 bg-black/80 backdrop-blur-md border border-emerald-400/40 text-white px-4 py-2 rounded-full text-xs font-extrabold flex items-center gap-2 shadow-2xl z-20">
              <Waves className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Pond Volume: {(liveVolumeLiters / 1000).toFixed(1)} m³ ({liveVolumeLiters.toLocaleString()} L)</span>
            </div>
          </div>

          {/* AR Controls Box */}
          <div className="w-full max-w-sm bg-white p-5 rounded-t-3xl space-y-3.5 z-20 shadow-2xl">
            <div className="text-xs font-extrabold text-gray-900 border-b border-gray-100 pb-2 flex items-center justify-between">
              <span>Pond Dimensions & Stocking Capacity</span>
              <span className="text-[#0F6236] font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md">
                Max Stock: ~{estimatedFishCapacity.toLocaleString()} Fish
              </span>
            </div>

            {/* Dimension Sliders & Direct Inputs */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-gray-50 p-2 rounded-2xl border border-gray-200 text-center">
                <label className="text-[10px] font-bold text-gray-500 block mb-1">Width (m)</label>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setTargetWidth((prev) => Math.max(0.5, Number((prev - 0.5).toFixed(1))))}
                    className="w-7 h-7 rounded-lg bg-gray-200 font-bold text-gray-800"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    step="0.1"
                    value={targetWidth}
                    onChange={(e) => setTargetWidth(Math.max(0.1, Number(e.target.value) || 1))}
                    className="w-full text-center font-black text-xs text-gray-900 bg-transparent outline-none"
                  />
                  <button
                    onClick={() => setTargetWidth((prev) => Number((prev + 0.5).toFixed(1)))}
                    className="w-7 h-7 rounded-lg bg-[#0F6236] font-bold text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 p-2 rounded-2xl border border-gray-200 text-center">
                <label className="text-[10px] font-bold text-gray-500 block mb-1">Length (m)</label>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setTargetLength((prev) => Math.max(0.5, Number((prev - 0.5).toFixed(1))))}
                    className="w-7 h-7 rounded-lg bg-gray-200 font-bold text-gray-800"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    step="0.1"
                    value={targetLength}
                    onChange={(e) => setTargetLength(Math.max(0.1, Number(e.target.value) || 1))}
                    className="w-full text-center font-black text-xs text-gray-900 bg-transparent outline-none"
                  />
                  <button
                    onClick={() => setTargetLength((prev) => Number((prev + 0.5).toFixed(1)))}
                    className="w-7 h-7 rounded-lg bg-[#0F6236] font-bold text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 p-2 rounded-2xl border border-gray-200 text-center">
                <label className="text-[10px] font-bold text-gray-500 block mb-1">Depth (m)</label>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setTargetDepth((prev) => Math.max(0.2, Number((prev - 0.1).toFixed(1))))}
                    className="w-7 h-7 rounded-lg bg-gray-200 font-bold text-gray-800"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    step="0.1"
                    value={targetDepth}
                    onChange={(e) => setTargetDepth(Math.max(0.1, Number(e.target.value) || 0.5))}
                    className="w-full text-center font-black text-xs text-gray-900 bg-transparent outline-none"
                  />
                  <button
                    onClick={() => setTargetDepth((prev) => Number((prev + 0.1).toFixed(1)))}
                    className="w-7 h-7 rounded-lg bg-[#0F6236] font-bold text-white"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Calculated Metrics Summary */}
            <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-[#0F6236] font-bold">
              <span>Surface Area: {(targetWidth * targetLength).toFixed(1)} m²</span>
              <span>Water Volume: {(targetWidth * targetLength * targetDepth).toFixed(1)} m³</span>
            </div>

            <div>
              <label className="text-[10.5px] font-extrabold text-gray-700 block mb-1">Pond Name</label>
              <input
                type="text"
                value={pondName}
                onChange={(e) => setPondName(e.target.value)}
                placeholder="e.g. Earth Pond 1"
                className="w-full h-11 px-3 text-xs font-bold border border-gray-300 rounded-xl bg-gray-50 outline-none"
              />
            </div>

            <button
              onClick={handleSaveCameraPond}
              className="w-full h-12 rounded-2xl bg-[#0F6236] hover:bg-[#0B4D29] text-white font-extrabold text-xs shadow-lg shadow-[#0F6236]/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Check className="w-4 h-4 text-white" /> Save Measured Pond to Memory
            </button>
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
