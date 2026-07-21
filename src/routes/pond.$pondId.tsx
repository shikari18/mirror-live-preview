import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Bell, MapPin, Fish, Calendar, Droplet, Clock, MoreVertical, TrendingUp, Package, Thermometer, Waves, FlaskConical, StickyNote, ChevronRight, BarChart3, FileEdit } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import pondImg from "@/assets/pond.jpg";

export const Route = createFileRoute("/pond/$pondId")({
  component: PondDetails,
  head: ({ params }) => ({
    meta: [
      { title: `Pond ${params.pondId} — FishFarm OS Ghana` },
      { name: "description", content: "Pond overview, water quality, growth and tasks." },
      { property: "og:title", content: `Pond ${params.pondId} — FishFarm OS Ghana` },
      { property: "og:description", content: "Pond overview and status." },
    ],
  }),
});

const tabs = ["Overview", "Water Quality", "Fish Growth", "History", "Settings"];

const overview = [
  { Icon: Waves, label: "Water Quality", value: "Good", sub: "Score: 85%", tint: "bg-blue-50 text-blue-700" },
  { Icon: Fish, label: "Fish Growth", value: "15%", sub: "This Week", tint: "bg-secondary/60 text-primary" },
  { Icon: Package, label: "Feed Used", value: "12 kg", sub: "This Week", tint: "bg-purple-50 text-purple-700" },
  { Icon: Thermometer, label: "Water Temp.", value: "28°C", sub: "Optimal", tint: "bg-yellow-50 text-yellow-700" },
];

const activity = [
  { Icon: Droplet, title: "Water quality checked", sub: "pH: 7.2, DO: 5.8 mg/L", when: "Today, 8:30 AM", tint: "bg-blue-50 text-blue-600" },
  { Icon: Package, title: "Fish fed", sub: "5 kg of Premium Tilapia Feed", when: "Today, 7:00 AM", tint: "bg-secondary/60 text-primary" },
  { Icon: FlaskConical, title: "pH test", sub: "pH level: 7.2", when: "Yesterday, 6:00 PM", tint: "bg-purple-50 text-purple-700" },
  { Icon: StickyNote, title: "Note added", sub: "Added a note about water clarity", when: "Yesterday, 4:30 PM", tint: "bg-yellow-50 text-yellow-700" },
];

function PondDetails() {
  const { pondId } = Route.useParams();
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

      <BottomNav />
    </PhoneFrame>
  );
}
