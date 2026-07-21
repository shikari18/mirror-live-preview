import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ClipboardList, Mic, ShoppingCart, User } from "lucide-react";

type NavItem = { to: string; label: string; Icon: typeof Home; center?: boolean };
const items: NavItem[] = [
  { to: "/home", label: "Home", Icon: Home },
  { to: "/my-farm", label: "My Farm", Icon: ClipboardList },
  { to: "/assistant", label: "Assistant", Icon: Mic, center: true },
  { to: "/market", label: "Market", Icon: ShoppingCart },
  { to: "/profile", label: "Profile", Icon: User },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="sticky bottom-0 left-0 right-0 bg-card border-t border-border px-2 pt-2 pb-3 flex items-end justify-around">
      {items.map(({ to, label, Icon, center }) => {
        const active = pathname === to;
        if (center) {
          return (
            <Link key={to} to={to as any} className="flex flex-col items-center -mt-6">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <Icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <span className="text-[11px] mt-1 text-foreground">{label}</span>
            </Link>
          );
        }
        return (
          <Link
            key={to}
            to={to as any}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg ${active ? "bg-secondary" : ""}`}
          >
            <Icon className={`w-5 h-5 ${active ? "text-primary" : "text-foreground/70"}`} />
            <span className={`text-[11px] ${active ? "text-primary font-semibold" : "text-foreground/70"}`}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[430px] flex flex-col bg-background min-h-screen">
        {children}
      </div>
    </main>
  );
}
