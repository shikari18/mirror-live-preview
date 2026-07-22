import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Waves, MapPin, ArrowLeft } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import { useLanguage } from "@/lib/languageContext";

export const Route = createFileRoute("/my-farm")({
  component: MyFarmPage,
  head: () => ({
    meta: [
      { title: "My Farm — FishFarm OS Ghana" },
      { name: "description", content: "Manage your ponds, stock, and growth in one place." },
    ],
  }),
});

export interface UserPond {
  id: string;
  name: string;
  species: string;
  count: number;
  stockDate: string;
  status: "Optimal" | "Healthy" | "Monitor";
}

export function MyFarmPage() {
  const { t } = useLanguage();
  const [ponds, setPonds] = useState<UserPond[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [pondName, setPondName] = useState("");
  const [species, setSpecies] = useState("Catfish (Clarias)");
  const [count, setCount] = useState<number>(1000);

  useEffect(() => {
    loadPonds();
  }, []);

  const loadPonds = () => {
    const saved = localStorage.getItem("user_ponds");
    if (saved) {
      setPonds(JSON.parse(saved));
    }
  };

  const handleAddPond = (e: React.FormEvent) => {
    e.preventDefault();
    const newPond: UserPond = {
      id: Date.now().toString(),
      name: pondName || `Pond ${ponds.length + 1}`,
      species,
      count,
      stockDate: new Date().toLocaleDateString(),
      status: "Healthy",
    };

    const updated = [...ponds, newPond];
    localStorage.setItem("user_ponds", JSON.stringify(updated));
    setPonds(updated);
    setIsModalOpen(false);
    setPondName("");
  };

  const totalFish = ponds.reduce((acc, p) => acc + p.count, 0);

  return (
    <PhoneFrame>
      {/* Header - Aligned & Compact */}
      <header className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3">
          <Link to="/home" className="p-1">
            <ArrowLeft className="w-5 h-5 text-gray-800" />
          </Link>
          <div>
            <h1 className="text-[19px] font-extrabold text-gray-900 leading-tight">{t("myFarm")}</h1>
            <div className="flex items-center gap-1 text-[#0F6236] text-[12px] font-medium mt-0.5">
              <MapPin className="w-3.5 h-3.5" /> Ashanti Region, Ghana
            </div>
          </div>
        </div>
        <img src={farmerImg} alt="Kofi" className="w-9 h-9 rounded-full object-cover border-2 border-[#0F6236]" />
      </header>

      {/* Farm Overview Banner */}
      <section className="mx-5 mt-4 rounded-2xl bg-[#0F6236] text-white p-4 shadow-lg shadow-[#0F6236]/20">
        <div className="flex items-center justify-between border-b border-white/20 pb-2 mb-3">
          <span className="text-xs font-bold uppercase text-emerald-200">Live Farm Summary</span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1 rounded-xl bg-white text-[#0F6236] font-bold text-xs shadow-xs hover:bg-gray-100 transition-all cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Pond
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-[10px] text-emerald-100">Total Ponds</div>
            <div className="text-xl font-extrabold">{ponds.length}</div>
          </div>
          <div>
            <div className="text-[10px] text-emerald-100">Total Stocked</div>
            <div className="text-xl font-extrabold">{totalFish.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[10px] text-emerald-100">Farm Status</div>
            <div className="text-xs font-bold text-emerald-300 mt-1">{ponds.length > 0 ? "Active" : "Pending Setup"}</div>
          </div>
        </div>
      </section>

      {/* Ponds List */}
      <section className="px-5 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-extrabold text-gray-900">Your Active Ponds</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs font-bold text-[#0F6236] hover:underline cursor-pointer"
          >
            + Add New Pond
          </button>
        </div>

        {ponds.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 shadow-xs">
            <Waves className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h3 className="font-bold text-gray-800 text-sm">No ponds added yet</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
              Add your first earthen pond, concrete tank, or tarpaulin high-density tank to start tracking stock.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-[#0F6236] text-white text-xs font-bold shadow-md cursor-pointer inline-flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Your First Pond
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {ponds.map((p) => (
              <div key={p.id} className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#0F6236]/10 text-[#0F6236] flex items-center justify-center font-bold text-lg">
                    🌊
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900">{p.name}</h3>
                    <p className="text-xs font-bold text-[#0F6236]">{p.species}</p>
                    <p className="text-[11px] text-gray-500">Stocked: {p.count.toLocaleString()} fish • {p.stockDate}</p>
                  </div>
                </div>

                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add Pond Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
              <h3 className="font-extrabold text-base text-gray-900">Add New Pond</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 font-bold hover:text-gray-600 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleAddPond} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Pond Name / Number</label>
                <input
                  type="text"
                  required
                  value={pondName}
                  onChange={(e) => setPondName(e.target.value)}
                  placeholder="e.g. Pond 1, Nursery Tank 2"
                  className="w-full h-11 rounded-xl border border-gray-200 px-3 text-xs font-semibold bg-gray-50 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Fish Species</label>
                <select
                  value={species}
                  onChange={(e) => setSpecies(e.target.value)}
                  className="w-full h-11 rounded-xl border border-gray-200 px-3 text-xs font-semibold bg-gray-50 outline-none"
                >
                  <option>Catfish (Clarias gariepinus)</option>
                  <option>Tilapia (Nile Tilapia)</option>
                  <option>Mixed Species</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Stock Count (Number of Fish)</label>
                <input
                  type="number"
                  required
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value) || 0)}
                  placeholder="e.g. 1000"
                  className="w-full h-11 rounded-xl border border-gray-200 px-3 text-xs font-semibold bg-gray-50 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-[#0F6236] text-white font-bold rounded-xl text-sm shadow-md shadow-[#0F6236]/20 cursor-pointer mt-2"
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
