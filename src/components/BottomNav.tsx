import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ClipboardList, Stethoscope, ShoppingCart, UserCheck } from "lucide-react";

type NavItem = { to: string; label: string; Icon: typeof Home; center?: boolean };
const items: NavItem[] = [
  { to: "/home", label: "Dashboard", Icon: Home },
  { to: "/my-farm", label: "My Farm", Icon: ClipboardList },
  { to: "/assistant", label: "Fish Doctor", Icon: Stethoscope, center: true },
  { to: "/extension-support", label: "Support", Icon: UserCheck },
  { to: "/market", label: "Store", Icon: ShoppingCart },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed bottom-3 left-0 right-0 max-w-[410px] mx-auto bg-white/90 backdrop-blur-xl border border-[#0F6236]/15 px-3 py-2 rounded-3xl flex items-center justify-around z-40 shadow-2xl shadow-[#0F6236]/15">
      {items.map(({ to, label, Icon, center }) => {
        const active = pathname === to;
        if (center) {
          return (
            <Link key={to} to={to as any} className="flex flex-col items-center -mt-7 cursor-pointer group">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#08301B] via-[#0F6236] to-[#14874B] flex items-center justify-center shadow-xl shadow-[#0F6236]/40 border-4 border-white group-hover:scale-105 transition-all duration-300">
                <Icon className="w-7 h-7 text-white" />
              </div>
              <span className="text-[10.5px] mt-0.5 text-[#0F6236] font-extrabold tracking-tight">{label}</span>
            </Link>
          );
        }
        return (
          <Link
            key={to}
            to={to as any}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all cursor-pointer ${
              active
                ? "bg-[#0F6236] text-white font-extrabold shadow-md shadow-[#0F6236]/25"
                : "text-gray-600 hover:text-[#0F6236] font-semibold hover:bg-emerald-50/60"
            }`}
          >
            <Icon className={`w-5 h-5 ${active ? "text-white" : "text-gray-500"}`} />
            <span className={`text-[10px] ${active ? "text-white font-extrabold" : "text-gray-500 font-semibold"}`}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#E3EAE4] flex justify-center items-start sm:py-4 font-sans">
      <div className="w-full max-w-[430px] flex flex-col bg-[#F4FAF5] min-h-screen sm:min-h-[840px] sm:rounded-[38px] sm:border sm:border-[#0F6236]/15 overflow-hidden shadow-2xl relative pt-1 sm:pt-3 pb-24 text-gray-900">
        {children}
      </div>
    </main>
  );
}
