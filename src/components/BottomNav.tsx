import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ClipboardList, Mic, ShoppingCart, User } from "lucide-react";

type NavItem = { to: string; label: string; Icon: typeof Home; center?: boolean };
const items: NavItem[] = [
  { to: "/home", label: "Home", Icon: Home },
  { to: "/my-farm", label: "My Farm", Icon: ClipboardList },
  { to: "/assistant", label: "Fish Doctor", Icon: Mic, center: true },
  { to: "/market", label: "Market", Icon: ShoppingCart },
  { to: "/profile", label: "Profile", Icon: User },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-white border-t border-blue-100 px-2 pt-2 pb-3.5 flex items-end justify-around z-40 shadow-2xl">
      {items.map(({ to, label, Icon, center }) => {
        const active = pathname === to;
        if (center) {
          return (
            <Link key={to} to={to as any} className="flex flex-col items-center -mt-6 cursor-pointer">
              <div className="w-14 h-14 rounded-full bg-[#0284C7] flex items-center justify-center shadow-lg shadow-[#0284C7]/30 border-4 border-white transition-transform active:scale-95">
                <Icon className="w-7 h-7 text-white" />
              </div>
              <span className="text-[11px] mt-0.5 text-sky-900 font-bold">{label}</span>
            </Link>
          );
        }
        return (
          <Link
            key={to}
            to={to as any}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all cursor-pointer ${active ? "bg-[#0284C7]/10 text-[#0284C7]" : "text-slate-500"}`}
          >
            <Icon className={`w-5 h-5 ${active ? "text-[#0284C7]" : "text-slate-500"}`} />
            <span className={`text-[11px] ${active ? "text-[#0284C7] font-bold" : "text-slate-500 font-medium"}`}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#E0F2FE] flex justify-center items-start sm:py-4">
      <div className="w-full max-w-[430px] flex flex-col bg-[#F0F9FF] min-h-screen sm:min-h-[820px] sm:rounded-[36px] sm:border sm:border-blue-200 overflow-hidden shadow-2xl relative pt-2 sm:pt-4 pb-24">
        {children}
      </div>
    </main>
  );
}
