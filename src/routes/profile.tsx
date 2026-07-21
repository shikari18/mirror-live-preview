import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Settings, Camera, Award, Waves, Fish, TrendingUp, Calendar, User, Tractor, ShieldCheck, HelpCircle, Info, LogOut, ChevronRight, MapPin } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import fishDecor from "@/assets/fish-decor.jpg";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({
    meta: [
      { title: "Profile — FishFarm OS Ghana" },
      { name: "description", content: "Manage your account, farm settings and preferences." },
      { property: "og:title", content: "Profile — FishFarm OS Ghana" },
      { property: "og:description", content: "Your FishFarm OS profile." },
    ],
  }),
});

const menu = [
  { Icon: User, title: "Personal Information", sub: "Manage your personal details" },
  { Icon: Tractor, title: "Farm Settings", sub: "Manage your farm and pond settings" },
  { Icon: ShieldCheck, title: "Account & Security", sub: "Password, 2FA and security settings" },
  { Icon: Bell, title: "Notifications", sub: "Manage your notification preferences" },
  { Icon: HelpCircle, title: "Help & Support", sub: "Get help and contact support" },
  { Icon: Info, title: "About FishFarm OS", sub: "Learn more about the app" },
];

function ProfilePage() {
  return (
    <PhoneFrame>
      <header className="px-5 pt-6 flex items-center justify-between">
        <h1 className="text-[26px] font-extrabold text-foreground">Profile</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-6 h-6 text-foreground" />
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">3</span>
          </div>
          <Settings className="w-6 h-6 text-foreground" />
        </div>
      </header>

      <section className="mx-5 mt-5 rounded-2xl bg-primary text-primary-foreground p-5 relative overflow-hidden">
        <img src={fishDecor} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover opacity-25" />
        <div className="relative flex items-start gap-4">
          <div className="relative">
            <img src={farmerImg} alt="Kofi" className="w-24 h-24 rounded-full object-cover border-4 border-white/40" />
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white flex items-center justify-center">
              <Camera className="w-4 h-4 text-primary" />
            </button>
          </div>
          <div className="flex-1">
            <div className="text-[20px] font-extrabold">Kofi Akwaba</div>
            <div className="text-[13px] opacity-90 mt-1">+233 24 123 4567</div>
            <div className="text-[13px] opacity-90">kofiakwaba@gmail.com</div>
            <div className="flex items-center gap-1 text-[13px] opacity-90 mt-1"><MapPin className="w-3.5 h-3.5" /> Ashanti Region, Ghana</div>
            <div className="mt-2 inline-flex items-center gap-1 bg-white text-primary font-bold text-[12px] rounded-full px-2.5 py-1">
              <Award className="w-3.5 h-3.5" /> Premium Member
            </div>
          </div>
          <ChevronRight className="w-5 h-5" />
        </div>
      </section>

      <section className="mx-5 mt-4 rounded-2xl border border-border bg-card p-4">
        <div className="text-[15px] font-extrabold text-foreground">My Overview</div>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center">
          {[
            { Icon: Waves, value: "4", label: "Ponds" },
            { Icon: Fish, value: "3,250", label: "Total Fish" },
            { Icon: TrendingUp, value: "12%", label: "Avg. Growth" },
            { Icon: Calendar, value: "21 Days", label: "To Harvest" },
          ].map(({ Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-secondary/60 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-[16px] font-extrabold text-foreground mt-1">{value}</div>
              <div className="text-[11px] text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-5 mt-4 rounded-2xl border border-border bg-card divide-y divide-border">
        {menu.map(({ Icon, title, sub }) => (
          <button key={title} className="w-full flex items-center gap-3 p-4 text-left">
            <div className="w-10 h-10 rounded-full bg-secondary/60 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="text-[14px] font-bold text-foreground">{title}</div>
              <div className="text-[12px] text-muted-foreground">{sub}</div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        ))}
        <Link to="/" className="w-full flex items-center gap-3 p-4 text-left">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <LogOut className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <div className="text-[14px] font-bold text-red-600">Log Out</div>
            <div className="text-[12px] text-muted-foreground">Sign out from your account</div>
          </div>
        </Link>
      </section>

      <div className="h-6" />
      <BottomNav />
    </PhoneFrame>
  );
}
