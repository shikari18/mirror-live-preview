import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, MapPin, RefreshCw, BookOpen, ClipboardCheck, ShoppingCart, Lightbulb } from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import offlineImg from "@/assets/offline.png";
import farmerImg from "@/assets/farmer.jpg";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import { LanguageProvider } from "../lib/languageContext";
import { SplashScreen } from "@/components/SplashScreen";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";

function NotFoundComponent() {
  const items = [
    { Icon: BookOpen, title: "View My Data", sub: "Access your saved ponds, records and notes." },
    { Icon: ClipboardCheck, title: "View Offline Tasks", sub: "See and update your pending tasks." },
    { Icon: ShoppingCart, title: "Browse Saved Products", sub: "View products you've saved offline." },
    { Icon: Lightbulb, title: "Read Saved Tips", sub: "Access tips you've saved for offline reading." },
  ];
  return (
    <PhoneFrame>
      <header className="px-5 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/home" className="p-1"><ArrowLeft className="w-6 h-6 text-foreground" /></Link>
          <div>
            <div className="text-[20px] font-extrabold text-foreground leading-tight">Page Not Found / Offline</div>
            <div className="flex items-center gap-1 text-[#0F6236] text-[13px] font-medium">
              <MapPin className="w-4 h-4" /> Ghana
            </div>
          </div>
        </div>
        <img src={farmerImg} alt="Kofi" className="w-10 h-10 rounded-full object-cover border-2 border-[#0F6236]" />
      </header>

      <div className="px-6 mt-4 flex justify-center">
        <img src={offlineImg} alt="Offline illustration" className="w-64 h-44 object-contain" />
      </div>

      <div className="px-6 text-center">
        <h1 className="text-[24px] font-extrabold text-foreground">You're Offline or Page Moved</h1>
        <p className="mt-2 text-[13px] text-muted-foreground">It looks like you're not connected to the internet or the page doesn't exist. Local features remain available.</p>
      </div>

      <div className="px-6 mt-5 flex flex-col gap-3">
        <Link to="/home" className="w-full h-12 rounded-full bg-[#0F6236] text-white font-bold text-[15px] inline-flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4" /> Return to Dashboard
        </Link>
      </div>

      <section className="mx-5 mt-5 rounded-2xl bg-[#0F6236]/10 p-4 border border-[#0F6236]/20">
        <div className="text-[13px] font-extrabold text-[#0F6236]">You can still use:</div>
        <div className="mt-2 divide-y divide-gray-200/60">
          {items.map(({ Icon, title, sub }) => (
            <div key={title} className="w-full flex items-center gap-3 py-3 text-left">
              <div className="w-9 h-9 rounded-full bg-[#0F6236] text-white flex items-center justify-center shrink-0">
                <Icon className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-bold text-foreground">{title}</div>
                <div className="text-[11px] text-muted-foreground">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <BottomNav />
    </PhoneFrame>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error("Root Error Boundary caught error:", error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  const handleGoHome = () => {
    window.location.href = "/home";
  };

  return (
    <PhoneFrame>
      <div className="min-h-[75vh] flex flex-col justify-center items-center px-5 text-center my-auto">
        <div className="w-16 h-16 rounded-3xl bg-[#0F6236]/10 text-[#0F6236] flex items-center justify-center mb-3">
          <RefreshCw className="w-8 h-8 text-[#0F6236]" />
        </div>
        
        <h1 className="text-xl font-extrabold text-gray-900 leading-tight">
          System Notice
        </h1>
        
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-2xl text-left w-full max-w-[340px] space-y-1">
          <div className="text-[11px] font-extrabold text-red-700 uppercase tracking-wider">Diagnostic Details</div>
          <div className="text-xs font-mono font-bold text-red-900 break-words max-h-32 overflow-y-auto">
            {error?.message || String(error)}
          </div>
        </div>

        <div className="mt-5 flex flex-col w-full max-w-[280px] gap-2.5">
          <button
            onClick={handleGoHome}
            className="w-full h-12 rounded-2xl bg-[#0F6236] hover:bg-[#0B4D29] text-white font-extrabold text-xs shadow-lg shadow-[#0F6236]/25 cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            Go to Farm Dashboard
          </button>
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="w-full h-11 rounded-2xl border border-gray-300 bg-white text-gray-800 font-extrabold text-xs hover:bg-gray-50 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "FishFarm OS Ghana — Smart Tools for Fish Farmers" },
      { name: "description", content: "The operating system for fish farming in Ghana. Voice-first, offline-friendly tools helping farmers grow more and earn more." },
      { property: "og:title", content: "FishFarm OS Ghana" },
      { property: "og:description", content: "Smart. Simple. Local. Profitable. The OS for fish farming in Ghana." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#0F6236" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "apple-touch-icon", href: "/pwa-192.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("Service Worker registered successfully:", reg);
        })
        .catch((err) => {
          console.warn("Service Worker registration failed:", err);
        });

      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
        <Outlet />
        <PWAInstallBanner />
      </LanguageProvider>
    </QueryClientProvider>
  );
}
