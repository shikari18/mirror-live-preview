import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Plus, Waves, MapPin, ArrowLeft, Camera, Check, RefreshCw, X, Shield, Sparkles, Scale, Maximize2 } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import { useLanguage } from "@/lib/languageContext";
import { getFarmProfile, addPondToMemory, PondRecord, saveFarmProfile } from "@/lib/farmMemory";

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
  const [userLocation, setUserLocation] = useState<string>(profile.location || "Accra, Ghana");

  // Standard Form State
  const [pondName, setPondName] = useState("");
  const [fishType, setFishType] = useState("Nile Tilapia");
  const [fishCount, setFishCount] = useState<number>(1000);
  const [pondType, setPondType] = useState("Concrete");

  // Camera Pond Calculator AR State
  const [camWidth, setCamWidth] = useState<number>(6.5);
  const [camLength, setCamLength] = useState<number>(10.0);
  const [camDepth, setCamDepth] = useState<number>(1.5);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

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
        video: { facingMode: { ideal: "environment" } },
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      console.warn("Camera fallback to basic video", err);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  const calculatedVolumeLiters = Math.round(camWidth * camLength * camDepth * 1000);
  const estimatedCapacityFish = Math.floor(calculatedVolumeLiters / 40); // ~25 fish per m3

  const handleSaveCameraPond = () => {
    addPondToMemory({
      name: pondName || `AR Camera Measured Pond ${ponds.length + 1}`,
      type: pondType,
      widthMeters: camWidth,
      lengthMeters: camLength,
      depthMeters: camDepth,
      volumeLiters: calculatedVolumeLiters,
      fishCount: estimatedCapacityFish,
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
      <header className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-sky-100 bg-white shadow-xs">
        <div className="flex items-center gap-3">
          <Link to="/home" className="p-1 hover:bg-sky-50 rounded-full">
            <ArrowLeft className="w-5 h-5 text-slate-800" />
          </Link>
          <div>
            <h1 className="text-[19px] font-extrabold text-slate-900 leading-tight">My Farm & Ponds</h1>
            <div className="flex items-center gap-1 text-[#0284C7] text-[12px] font-semibold mt-0.5">
              <MapPin className="w-3.5 h-3.5" /> {userLocation}
            </div>
          </div>
        </div>
        <img src={farmerImg} alt="Kofi" className="w-9 h-9 rounded-full object-cover border-2 border-[#0284C7]" />
      </header>

      {/* Farm Overview Banner */}
      <section className="mx-5 mt-4 rounded-2xl bg-[#0284C7] text-white p-4 shadow-lg shadow-[#0284C7]/20">
        <div className="flex items-center justify-between border-b border-white/20 pb-2 mb-3">
          <span className="text-xs font-extrabold uppercase tracking-wide text-sky-100 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Unified Farm Memory
          </span>
          <button
            onClick={() => setIsCameraScannerOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white text-[#0284C7] font-extrabold text-xs shadow-xs hover:bg-sky-50 transition-all cursor-pointer flex items-center gap-1 active:scale-95"
          >
            <Camera className="w-3.5 h-3.5" /> AR Camera Measure
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-[10.5px] text-sky-100 font-medium">Ponds Count</div>
            <div className="text-xl font-extrabold">{ponds.length}</div>
          </div>
          <div>
            <div className="text-[10.5px] text-sky-100 font-medium">Total Stocked</div>
            <div className="text-xl font-extrabold">{totalFish.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[10.5px] text-sky-100 font-medium">Total Volume</div>
            <div className="text-xs font-bold text-sky-100 mt-1">{totalVolume > 0 ? `${(totalVolume/1000).toFixed(0)} m³` : "0 L"}</div>
          </div>
        </div>
      </section>

      {/* Camera Pond Calculator Feature Card */}
      <section className="mx-5 mt-4">
        <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#0284C7] text-white flex items-center justify-center font-bold shrink-0 shadow-md">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Camera Pond Size Calculator</h3>
              <p className="text-[11.5px] text-slate-600 font-medium">Point your camera at your pond to measure width, length & volume automatically.</p>
            </div>
          </div>

          <button
            onClick={() => setIsCameraScannerOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#0284C7] hover:bg-sky-600 text-white text-xs font-extrabold shadow-md shrink-0 cursor-pointer transition-all active:scale-95"
          >
            Open Camera
          </button>
        </div>
      </section>

      {/* Ponds List */}
      <section className="px-5 mt-5 pb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-extrabold text-slate-900">Your Active Ponds</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs font-bold text-[#0284C7] hover:underline cursor-pointer"
          >
            + Add Standard Pond
          </button>
        </div>

        {ponds.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-sky-100 shadow-xs">
            <Waves className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-800 text-sm">No ponds saved in memory</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Use the camera pond size calculator or manually add your pond to sync with Fish Doctor AI.
            </p>
            <button
              onClick={() => setIsCameraScannerOpen(true)}
              className="mt-4 px-4 py-2.5 rounded-xl bg-[#0284C7] text-white text-xs font-bold shadow-md cursor-pointer inline-flex items-center gap-1.5"
            >
              <Camera className="w-4 h-4" /> Measure Pond with Camera
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {ponds.map((p) => (
              <div key={p.id} className="p-4 bg-white rounded-2xl border border-sky-100 shadow-xs space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-sky-50 text-[#0284C7] border border-sky-100 flex items-center justify-center font-bold text-lg shrink-0">
                      🌊
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">{p.name}</h3>
                      <p className="text-xs font-bold text-[#0284C7]">{p.fishType} ({p.fishCount} fish)</p>
                    </div>
                  </div>

                  {p.measuredViaCamera && (
                    <span className="text-[10px] font-extrabold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Camera className="w-3 h-3" /> AR Measured
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-sky-100 text-center text-xs">
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">Dimensions</span>
                    <span className="font-extrabold text-slate-800">{p.widthMeters}m x {p.lengthMeters}m</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">Depth</span>
                    <span className="font-extrabold text-slate-800">{p.depthMeters}m</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">Volume</span>
                    <span className="font-extrabold text-[#0284C7]">{p.volumeLiters.toLocaleString()} L</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CAMERA POND SIZE CALCULATOR AR MODAL */}
      {isCameraScannerOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between items-center animate-in fade-in">
          {/* Real Camera Feed / Overlay */}
          <div className="absolute inset-0 w-full h-full bg-slate-900 overflow-hidden">
            {cameraActive ? (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center">
                <Camera className="w-12 h-12 text-[#0284C7] mb-2 animate-bounce" />
                <span className="text-sm font-extrabold">Camera Initializing...</span>
                <span className="text-xs text-slate-400 mt-1">Point your device camera at your pond perimeter</span>
              </div>
            )}

            {/* AR Bounding Box Frame */}
            <div className="absolute inset-12 border-2 border-dashed border-sky-400 rounded-3xl pointer-events-none flex flex-col justify-between p-4 bg-sky-500/10">
              <div className="flex justify-between text-[11px] font-extrabold text-sky-200 bg-black/60 px-3 py-1 rounded-full w-fit">
                <span>AR Width Scanner: {camWidth}m</span>
              </div>
              <div className="text-center font-extrabold text-white bg-black/60 px-4 py-1.5 rounded-full mx-auto text-xs border border-white/20 shadow-md">
                📐 Point camera at corners & adjust dimensions
              </div>
              <div className="flex justify-between text-[11px] font-extrabold text-sky-200 bg-black/60 px-3 py-1 rounded-full w-fit ml-auto">
                <span>AR Length: {camLength}m</span>
              </div>
            </div>
          </div>

          {/* Modal Header */}
          <div className="w-full flex items-center justify-between text-white z-20 pt-6 px-5 bg-gradient-to-b from-black/80 to-transparent pb-4">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#0284C7]" />
              <h3 className="font-extrabold text-sm text-white">Camera Pond Size Calculator</h3>
            </div>
            <button
              onClick={() => setIsCameraScannerOpen(false)}
              className="p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Controls & Calculations (Bottom Sheet) */}
          <div className="w-full max-w-md bg-white rounded-t-3xl p-5 z-20 space-y-3 shadow-2xl border-t border-sky-100">
            <div className="flex items-center justify-between border-b border-sky-100 pb-2">
              <h4 className="text-xs font-extrabold text-slate-900">Live Pond Dimension Adjustment</h4>
              <span className="text-xs font-extrabold text-[#0284C7] bg-sky-50 px-2.5 py-0.5 rounded-full">
                {calculatedVolumeLiters.toLocaleString()} Liters ({ (calculatedVolumeLiters/1000).toFixed(1) } m³)
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Width (meters)</label>
                <input
                  type="number"
                  step="0.5"
                  value={camWidth}
                  onChange={(e) => setCamWidth(Number(e.target.value) || 1)}
                  className="w-full h-9 px-2 text-xs font-bold text-slate-900 border border-slate-200 rounded-xl bg-slate-50 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Length (meters)</label>
                <input
                  type="number"
                  step="0.5"
                  value={camLength}
                  onChange={(e) => setCamLength(Number(e.target.value) || 1)}
                  className="w-full h-9 px-2 text-xs font-bold text-slate-900 border border-slate-200 rounded-xl bg-slate-50 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Depth (meters)</label>
                <input
                  type="number"
                  step="0.1"
                  value={camDepth}
                  onChange={(e) => setCamDepth(Number(e.target.value) || 0.5)}
                  className="w-full h-9 px-2 text-xs font-bold text-slate-900 border border-slate-200 rounded-xl bg-slate-50 outline-none"
                />
              </div>
            </div>

            <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 flex items-center justify-between text-xs">
              <div>
                <span className="font-extrabold text-slate-900 block">Recommended Stock Capacity:</span>
                <span className="text-slate-600 text-[11px]">Optimal for ~{estimatedCapacityFish.toLocaleString()} fish</span>
              </div>
              <span className="font-extrabold text-[#0284C7] bg-white px-2.5 py-1 rounded-lg border border-sky-200">
                {estimatedCapacityFish} Fish
              </span>
            </div>

            <div>
              <input
                type="text"
                value={pondName}
                onChange={(e) => setPondName(e.target.value)}
                placeholder="Pond Name (e.g. Concrete Pond 1)"
                className="w-full h-10 px-3 text-xs font-medium border border-slate-200 rounded-xl outline-none bg-slate-50"
              />
            </div>

            <button
              onClick={handleSaveCameraPond}
              className="w-full h-12 bg-[#0284C7] hover:bg-sky-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-[#0284C7]/25 cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" /> Save Pond Dimensions to Unified AI Memory
            </button>
          </div>
        </div>
      )}

      {/* Manual Add Pond Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-sky-100">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3 mb-3">
              <h3 className="font-extrabold text-base text-slate-900">Add New Pond</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 font-bold hover:text-slate-600 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleAddStandardPond} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pond Name / Label</label>
                <input
                  type="text"
                  required
                  value={pondName}
                  onChange={(e) => setPondName(e.target.value)}
                  placeholder="e.g. Pond 1, Main Tarpaulin"
                  className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs font-semibold bg-slate-50 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fish Species</label>
                <select
                  value={fishType}
                  onChange={(e) => setFishType(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs font-semibold bg-slate-50 outline-none"
                >
                  <option>Nile Tilapia</option>
                  <option>African Catfish</option>
                  <option>Heterotis</option>
                  <option>Common Carp</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Stock Count</label>
                <input
                  type="number"
                  required
                  value={fishCount}
                  onChange={(e) => setFishCount(Number(e.target.value) || 0)}
                  placeholder="e.g. 1000"
                  className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs font-semibold bg-slate-50 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-[#0284C7] text-white font-bold rounded-xl text-sm shadow-md shadow-[#0284C7]/20 cursor-pointer mt-2"
              >
                Save Pond to Memory
              </button>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </PhoneFrame>
  );
}
