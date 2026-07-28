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
    <nav className="fixed bottom-4 left-0 right-0 max-w-[400px] mx-auto bg-white/80 backdrop-blur-2xl border border-white/60 px-3 py-2 rounded-[32px] flex items-center justify-around z-40 shadow-2xl shadow-black/10">
      {items.map(({ to, label, Icon, center }) => {
        const active = pathname === to;
        if (center) {
          return (
            <Link key={to} to={to as any} className="flex flex-col items-center -mt-7 cursor-pointer group">
              <div className="w-14 h-14 rounded-[26px] bg-black text-white flex items-center justify-center shadow-xl shadow-black/25 border-4 border-white group-hover:scale-105 transition-all duration-300">
                <Icon className="w-7 h-7 text-white" />
              </div>
              <span className="text-[10px] mt-1 text-black font-extrabold tracking-tight">{label}</span>
            </Link>
          );
        }
        return (
          <Link
            key={to}
            to={to as any}
            className={`flex flex-col items-center gap-0.5 px-3.5 py-1.5 rounded-[20px] transition-all cursor-pointer ${
              active
                ? "bg-black text-white font-extrabold shadow-md"
                : "text-gray-500 hover:text-black font-semibold hover:bg-gray-100/60"
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
    <main className="min-h-screen bg-[#E5E5EA] flex justify-center items-start sm:py-4 font-sans">
      <div className="w-full max-w-[430px] flex flex-col bg-[#F2F2F7] min-h-screen sm:min-h-[850px] sm:rounded-[44px] sm:border sm:border-black/10 overflow-hidden shadow-2xl relative pt-1 sm:pt-3 pb-24 text-[#1C1C1E]">
        {children}
      </div>
    </main>
  );
}
