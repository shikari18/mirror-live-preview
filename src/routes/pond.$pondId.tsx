import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Bell, MapPin, Fish, Calendar, Droplet, Clock, MoreVertical, TrendingUp, Package, Thermometer, Waves, FlaskConical, StickyNote, ChevronRight, BarChart3, FileEdit, AlertTriangle, Plus, X, ShieldAlert } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import pondImg from "@/assets/pond.jpg";
import { getFarmProfile, PondRecord } from "@/lib/farmMemory";

export const Route = createFileRoute("/pond/$pondId")({
  component: PondDetails,
  head: ({ params }) => ({
    meta: [
      { title: `Pond ${params.pondId} — FishFarm OS Ghana` },
      { name: "description", content: "Pond overview, water quality, mortality logger, growth and tasks." },
      { property: "og:title", content: `Pond ${params.pondId} — FishFarm OS Ghana` },
      { property: "og:description", content: "Pond overview and status." },
    ],
  }),
});

export function PondDetails() {
  const { pondId } = Route.useParams();
  const [pond, setPond] = useState<PondRecord | null>(null);
  const [mortalityLogs, setMortalityLogs] = useState<{ id: string; count: number; reason: string; date: string }[]>([]);
  const [isMortalityModalOpen, setIsMortalityModalOpen] = useState(false);
  const [deadCount, setDeadCount] = useState<number>(3);
  const [mortalityReason, setMortalityReason] = useState<string>("Low Dissolved Oxygen");

  // Water Test Logger State
  const [isWaterModalOpen, setIsWaterModalOpen] = useState(false);
  const [testPh, setTestPh] = useState<string>("7.2");
  const [testDo, setTestDo] = useState<string>("5.8");
  const [testTemp, setTestTemp] = useState<string>("28");
  const [testAmmonia, setTestAmmonia] = useState<string>("0.02");

  useEffect(() => {
    const profile = getFarmProfile();
    const found = profile.ponds?.find((p) => p.id === pondId || p.name.includes(pondId));
    if (found) {
      setPond(found);
    } else {
      setPond({
        id: pondId,
        name: `Pond ${pondId}`,
        size: "20m x 15m",
        fishCount: 1200,
        fishType: "African Catfish",
        ph: "7.2",
        do: "5.8",
        temp: "28°C"
      });
    }

    try {
      const savedLogs = localStorage.getItem(`mortality_logs_${pondId}`);
      if (savedLogs) {
        setMortalityLogs(JSON.parse(savedLogs));
      }
    } catch (e) {
      console.warn("Mortality log load error", e);
    }
  }, [pondId]);

  const handleLogMortality = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deadCount || deadCount <= 0) return;

    const newLog = {
      id: Date.now().toString(),
      count: deadCount,
      reason: mortalityReason,
      date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updated = [newLog, ...mortalityLogs];
    setMortalityLogs(updated);
    localStorage.setItem(`mortality_logs_${pondId}`, JSON.stringify(updated));

    // Update pond live fish count
    if (pond) {
      const updatedCount = Math.max(0, pond.fishCount - deadCount);
      setPond({ ...pond, fishCount: updatedCount });
    }

    setIsMortalityModalOpen(false);
  };

  const totalMortality = mortalityLogs.reduce((acc, log) => acc + log.count, 0);
  const initialStock = (pond?.fishCount || 1200) + totalMortality;
  const survivalRatePct = initialStock > 0 ? ((pond?.fishCount || 1200) / initialStock) * 100 : 100;
  return (
    <PhoneFrame>
      <header className="px-5 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/my-farm" className="p-1"><ArrowLeft className="w-6 h-6 text-foreground" /></Link>
          <div>
            <div className="text-[22px] font-extrabold text-foreground leading-tight">Pond Details</div>
            <div className="flex items-center gap-1 text-primary text-[13px] font-medium">
              <MapPin className="w-4 h-4" /> Ashanti Region ▾
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-6 h-6 text-foreground" />
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">3</span>
          </div>
          <img src={farmerImg} alt="Kofi" className="w-10 h-10 rounded-full object-cover border-2 border-primary" />
        </div>
      </header>

      <section className="mx-5 mt-5 rounded-2xl border border-border bg-card p-3 flex gap-3">
        <img src={pondImg} alt={`Pond ${pondId}`} className="w-28 h-28 rounded-xl object-cover" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-[18px] font-extrabold text-foreground">Pond {pondId}</div>
              <span className="text-[11px] font-bold rounded-full bg-secondary text-primary px-2 py-0.5">Healthy</span>
            </div>
            <MoreVertical className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="text-[13px] font-bold text-primary">Tilapia Pond</div>
          <div className="mt-1 space-y-0.5 text-[12px] text-foreground/80">
            <div className="flex items-center gap-1.5"><Fish className="w-3.5 h-3.5 text-primary" /> Stocked: 1,000 fish</div>
            <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary" /> Est. Harvest: 18 Days</div>
            <div className="flex items-center gap-1.5"><Droplet className="w-3.5 h-3.5 text-primary" /> Area: 0.25 acre</div>
            <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary" /> Created: May 12, 2025</div>
          </div>
        </div>
      </section>

      {/* Mortality & Survival Rate Live Card */}
      <section className="mx-5 mt-3 p-3.5 rounded-2xl bg-white border border-gray-200 shadow-xs flex items-center justify-between">
        <div>
          <div className="text-[10.5px] font-extrabold text-gray-500 uppercase tracking-wider">
            Live Stock Survival Rate
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xl font-black text-[#0F6236]">
              {survivalRatePct.toFixed(1)}%
            </span>
            <span className="text-xs text-gray-600 font-bold">
              ({pond?.fishCount || 1200} Live / {totalMortality} Dead)
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsMortalityModalOpen(true)}
          className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-extrabold text-xs border border-red-200/60 shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5 text-red-600" /> Log Mortality
        </button>
      </section>

      <div className="mt-4 px-5 flex gap-4 overflow-x-auto border-b border-border text-[13px]">
        {tabs.map((t, i) => (
          <button key={t} className={`pb-2 whitespace-nowrap ${i === 0 ? "text-primary font-bold border-b-2 border-primary" : "text-muted-foreground font-semibold"}`}>{t}</button>
        ))}
      </div>

      <section className="mx-5 mt-4 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="text-[15px] font-extrabold text-foreground">Pond Overview</div>
          <button className="inline-flex items-center gap-1 text-primary font-bold text-[13px]"><TrendingUp className="w-4 h-4" /> View Trends</button>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {overview.map(({ Icon, label, value, sub, tint }) => (
            <div key={label} className={`rounded-xl p-2.5 text-center ${tint}`}>
              <Icon className="w-5 h-5 mx-auto" />
              <div className="text-[10px] mt-1 text-foreground/80">{label}</div>
              <div className="text-[14px] font-extrabold text-foreground">{value}</div>
              <div className="text-[10px] text-foreground/70">{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Water Quality Parameter Trend Chart Card */}
      <section className="mx-5 mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[14px] font-extrabold text-gray-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#0F6236]" /> Water Quality Trend (5-Day History)
            </div>
            <div className="text-[11px] text-gray-500 font-medium">Dissolved Oxygen & pH stability curve</div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#0F6236] text-[10px] font-extrabold">Optimal</span>
        </div>

        {/* Visual Trend Bars */}
        <div className="space-y-2.5 pt-1">
          <div>
            <div className="flex items-center justify-between text-xs font-extrabold text-gray-800 mb-1">
              <span>Dissolved Oxygen (DO)</span>
              <span className="text-[#0F6236]">5.8 mg/L</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden flex gap-1 p-0.5">
              <div className="h-full bg-emerald-500 rounded-full w-[20%]" title="Mon: 6.2 mg/L" />
              <div className="h-full bg-emerald-500 rounded-full w-[20%]" title="Tue: 5.8 mg/L" />
              <div className="h-full bg-emerald-500 rounded-full w-[20%]" title="Wed: 5.5 mg/L" />
              <div className="h-full bg-amber-500 rounded-full w-[20%]" title="Thu: 4.8 mg/L" />
              <div className="h-full bg-emerald-600 rounded-full w-[20%]" title="Today: 5.8 mg/L" />
            </div>
            <div className="flex justify-between text-[9.5px] text-gray-400 font-bold mt-0.5">
              <span>Mon (6.2)</span>
              <span>Tue (5.8)</span>
              <span>Wed (5.5)</span>
              <span>Thu (4.8)</span>
              <span className="text-[#0F6236]">Today (5.8)</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-extrabold text-gray-800 mb-1">
              <span>pH Level</span>
              <span className="text-blue-700">7.2 pH</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden flex gap-1 p-0.5">
              <div className="h-full bg-blue-500 rounded-full w-[20%]" />
              <div className="h-full bg-blue-500 rounded-full w-[20%]" />
              <div className="h-full bg-blue-500 rounded-full w-[20%]" />
              <div className="h-full bg-blue-600 rounded-full w-[20%]" />
              <div className="h-full bg-blue-600 rounded-full w-[20%]" />
            </div>
            <div className="flex justify-between text-[9.5px] text-gray-400 font-bold mt-0.5">
              <span>Mon (7.4)</span>
              <span>Tue (7.3)</span>
              <span>Wed (7.2)</span>
              <span>Thu (7.1)</span>
              <span className="text-blue-700">Today (7.2)</span>
            </div>
          </div>
        </div>

        <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 text-[11px] text-emerald-900 font-semibold border border-emerald-100 flex items-center justify-between">
          <span>AI Status: Water parameters within safe operating thresholds.</span>
          <span className="font-extrabold text-[#0F6236]">94% Stable</span>
        </div>
      </section>

      <section className="mx-5 mt-4 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="text-[15px] font-extrabold text-foreground">Recent Activity</div>
          <a href="#" className="text-primary font-bold text-[13px] inline-flex items-center">View All <ChevronRight className="w-4 h-4" /></a>
        </div>
        <div className="mt-2 divide-y divide-border">
          {activity.map(({ Icon, title, sub, when, tint }) => (
            <div key={title} className="py-2.5 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${tint}`}><Icon className="w-4 h-4" /></div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-foreground">{title}</div>
                <div className="text-[11px] text-muted-foreground truncate">{sub}</div>
              </div>
              <div className="text-[11px] text-muted-foreground whitespace-nowrap">{when}</div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      </section>

      <section className="mx-5 mt-4 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="text-[15px] font-extrabold text-foreground">Upcoming Tasks</div>
          <a href="#" className="text-primary font-bold text-[13px]">View All</a>
        </div>
        <div className="mt-2 divide-y divide-border">
          {[
            { Icon: Calendar, title: "Test pH Level", when: "Due Tomorrow", tint: "bg-purple-50 text-purple-700", badge: "bg-blue-100 text-blue-700" },
            { Icon: Droplet, title: "Check Water Quality", when: "Due in 2 Days", tint: "bg-blue-50 text-blue-700", badge: "bg-yellow-100 text-yellow-800" },
          ].map(({ Icon, title, when, tint, badge }) => (
            <div key={title} className="py-2.5 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tint}`}><Icon className="w-5 h-5" /></div>
              <div className="flex-1">
                <div className="text-[13px] font-bold text-foreground">{title}</div>
                <div className="text-[11px] text-muted-foreground">Pond {pondId} <span className={`ml-1 text-[10px] font-bold rounded-full px-2 py-0.5 ${badge}`}>{when}</span></div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      </section>

      <section className="mx-5 mt-4 mb-4 grid grid-cols-4 gap-2">
        {[
          { Icon: BarChart3, label: "Record Data" },
          { Icon: FileEdit, label: "Add Note" },
          { Icon: Package, label: "Feed Fish" },
          { Icon: MoreVertical, label: "More" },
        ].map(({ Icon, label }) => (
          <button key={label} className="rounded-xl border border-border bg-card py-3 flex flex-col items-center gap-1">
            <Icon className="w-5 h-5 text-primary" />
            <span className="text-[11px] font-semibold text-foreground">{label}</span>
          </button>
        ))}
      </section>

      {/* Mortality Logging Modal */}
      {isMortalityModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-1.5">
                <ShieldAlert className="w-4.5 h-4.5 text-red-600" /> Log Daily Mortality
              </h2>
              <button onClick={() => setIsMortalityModalOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleLogMortality} className="space-y-3 text-xs">
              <div>
                <label className="block font-extrabold text-gray-800 mb-1">Number of Dead Fish Removed</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={deadCount}
                  onChange={(e) => setDeadCount(Number(e.target.value) || 0)}
                  className="w-full h-11 px-3 border border-gray-300 rounded-xl bg-gray-50 outline-none font-bold text-sm text-red-600"
                />
              </div>

              <div>
                <label className="block font-extrabold text-gray-800 mb-1">Suspected Cause / Observation</label>
                <select
                  value={mortalityReason}
                  onChange={(e) => setMortalityReason(e.target.value)}
                  className="w-full h-11 px-3 border border-gray-300 rounded-xl bg-gray-50 outline-none font-bold"
                >
                  <option value="Low Dissolved Oxygen">Low Dissolved Oxygen (Night drop)</option>
                  <option value="Osmotic / Environmental Stress">Osmotic / Water Quality Stress</option>
                  <option value="Bacterial / Fin Rot">Bacterial Lesion / Fin Rot</option>
                  <option value="Predator / Bird Attack">Predator / Bird Damage</option>
                  <option value="Unknown Cause">Unknown / General Mortality</option>
                </select>
              </div>

              <div className="p-3 bg-red-50 rounded-2xl border border-red-200/80 text-[11px] text-red-900 font-medium">
                Logging dead fish automatically adjusts your pond's live stock count and updates the Feed Calculator daily ration.
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-2xl shadow-md cursor-pointer mt-2"
              >
                Record Mortality Log
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Water Quality Test Logger Modal */}
      {isWaterModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-1.5">
                <FlaskConical className="w-4.5 h-4.5 text-[#0F6236]" /> Log Water Quality Test
              </h2>
              <button onClick={() => setIsWaterModalOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (pond) {
                  setPond({ ...pond, ph: testPh, do: testDo, temp: `${testTemp}°C` });
                }
                setIsWaterModalOpen(false);
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-extrabold text-gray-800 mb-1">pH Level</label>
                  <input
                    type="text"
                    required
                    value={testPh}
                    onChange={(e) => setTestPh(e.target.value)}
                    className="w-full h-11 px-3 border border-gray-300 rounded-xl bg-gray-50 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block font-extrabold text-gray-800 mb-1">Dissolved O₂ (mg/L)</label>
                  <input
                    type="text"
                    required
                    value={testDo}
                    onChange={(e) => setTestDo(e.target.value)}
                    className="w-full h-11 px-3 border border-gray-300 rounded-xl bg-gray-50 outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-extrabold text-gray-800 mb-1">Temperature (°C)</label>
                  <input
                    type="text"
                    required
                    value={testTemp}
                    onChange={(e) => setTestTemp(e.target.value)}
                    className="w-full h-11 px-3 border border-gray-300 rounded-xl bg-gray-50 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block font-extrabold text-gray-800 mb-1">Ammonia (mg/L)</label>
                  <input
                    type="text"
                    required
                    value={testAmmonia}
                    onChange={(e) => setTestAmmonia(e.target.value)}
                    className="w-full h-11 px-3 border border-gray-300 rounded-xl bg-gray-50 outline-none font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-[#0F6236] hover:bg-[#0B4D29] text-white font-extrabold text-xs rounded-2xl shadow-md cursor-pointer mt-2"
              >
                Save Water Test Log
              </button>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </PhoneFrame>
  );
}
