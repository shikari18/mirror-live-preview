import { createFileRoute, Link } from "@tanstack/react-router";
import { Menu, Bell, MapPin, ChevronRight, Fish, Waves, Package, TrendingUp, Droplet, FlaskConical, Calendar, Lightbulb } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import pondImg from "@/assets/pond.jpg";

export const Route = createFileRoute("/my-farm")({
  component: MyFarmPage,
  head: () => ({
    meta: [
      { title: "My Farm — FishFarm OS Ghana" },
      { name: "description", content: "Manage your ponds, stock, tasks and growth in one place." },
      { property: "og:title", content: "My Farm — FishFarm OS Ghana" },
      { property: "og:description", content: "Manage your fish farm ponds and tasks." },
    ],
  }),
});

const ponds = [
  { id: "1", name: "Pond 1", species: "Tilapia", stocked: "1,000 fish", tag: "Healthy", tint: "bg-secondary text-primary", growth: "15%", harvest: "18 Days" },
  { id: "2", name: "Pond 2", species: "Catfish", stocked: "800 fish", tag: "Good", tint: "bg-secondary text-primary", growth: "10%", harvest: "25 Days" },
  { id: "3", name: "Pond 3", species: "Tilapia", stocked: "900 fish", tag: "Healthy", tint: "bg-secondary text-primary", growth: "12%", harvest: "20 Days" },
  { id: "4", name: "Pond 4", species: "Mixed Fish", stocked: "550 fish", tag: "Monitor", tint: "bg-yellow-100 text-yellow-800", growth: "8%", harvest: "30 Days" },
];

const tasks = [
  { title: "Check Water Quality", where: "Pond 2", when: "Due Today", tint: "bg-yellow-100 text-yellow-800", Icon: Droplet, iconColor: "text-blue-600 bg-blue-50" },
  { title: "Feed Fish", where: "All Ponds", when: "Due Today", tint: "bg-yellow-100 text-yellow-800", Icon: Package, iconColor: "text-primary bg-secondary" },
  { title: "Test pH Level", where: "Pond 1", when: "Due Tomorrow", tint: "bg-blue-100 text-blue-700", Icon: FlaskConical, iconColor: "text-purple-700 bg-purple-50" },
  { title: "Record Growth", where: "All Ponds", when: "Due in 2 Days", tint: "bg-secondary text-primary", Icon: Calendar, iconColor: "text-purple-700 bg-purple-50" },
];

function MyFarmPage() {
  return (
    <PhoneFrame>
      <header className="px-5 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Menu className="w-6 h-6 text-foreground" />
          <div>
            <div className="text-[20px] font-extrabold text-foreground">My Farm</div>
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

      <section className="mx-5 mt-5 rounded-2xl bg-primary text-primary-foreground p-4">
        <div className="flex items-center justify-between">
          <div className="text-[15px] font-extrabold">Farm Overview</div>
          <ChevronRight className="w-5 h-5" />
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center">
          {[
            { Icon: Fish, label: "Ponds", value: "4", sub: "Active" },
            { Icon: Waves, label: "Total Stock", value: "3,250", sub: "Fish" },
            { Icon: Package, label: "Next Harvest", value: "21 Days", sub: "Estimated" },
            { Icon: TrendingUp, label: "Avg. Growth", value: "12%", sub: "This Week" },
          ].map(({ Icon, label, value, sub }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-[10px] opacity-90">{label}</div>
              <div className="text-[14px] font-extrabold leading-tight">{value}</div>
              <div className="text-[10px] opacity-80">{sub}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-extrabold text-foreground">My Ponds</h2>
          <a href="#" className="text-primary font-semibold text-[14px] flex items-center gap-0.5">View All <ChevronRight className="w-4 h-4" /></a>
        </div>
        <div className="mt-3 flex flex-col gap-3">
          {ponds.map((p) => (
            <Link key={p.id} to="/pond/$pondId" params={{ pondId: p.id }} className="rounded-2xl border border-border bg-card p-3 flex items-center gap-3">
              <img src={pondImg} alt={p.name} loading="lazy" className="w-20 h-20 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-extrabold text-foreground">{p.name}</div>
                <div className="text-[13px] font-bold text-primary">{p.species}</div>
                <div className="text-[12px] text-muted-foreground">Stocked: {p.stocked}</div>
              </div>
              <div className="text-right">
                <span className={`inline-block text-[11px] font-bold rounded-full px-2 py-0.5 ${p.tint}`}>{p.tag}</span>
                <div className="text-[12px] text-foreground mt-1">Growth: <span className="font-bold">{p.growth}</span></div>
                <div className="text-[11px] text-muted-foreground">Est. Harvest: {p.harvest}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </section>

      <section className="px-5 mt-6">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-extrabold text-foreground">Farm Tasks</h2>
            <a href="#" className="text-primary font-semibold text-[13px]">View All</a>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {tasks.map(({ title, where, when, tint, Icon, iconColor }) => (
              <div key={title} className="flex flex-col items-center text-center">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-[11px] font-bold text-foreground mt-1.5 leading-tight">{title}</div>
                <div className="text-[10px] text-muted-foreground">{where}</div>
                <span className={`mt-1 text-[9px] font-bold rounded-full px-2 py-0.5 ${tint}`}>{when}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-5 mt-4 mb-6 rounded-2xl bg-secondary/40 p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="text-[14px] font-extrabold text-primary">Farm Tip of the Day</div>
          <div className="text-[12px] text-muted-foreground">Maintain good water quality and consistent feeding for healthy fish growth.</div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </section>

      <BottomNav />
    </PhoneFrame>
  );
}
