import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { ArrowLeft, Bell, MapPin, RefreshCw, Download, BookOpen, ClipboardCheck, ShoppingCart, Lightbulb, ChevronRight, CloudUpload } from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import offlineImg from "@/assets/offline.png";
import farmerImg from "@/assets/farmer.jpg";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";

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
            <div className="text-[20px] font-extrabold text-foreground leading-tight">No Internet Connection</div>
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

      <div className="px-6 mt-4 flex justify-center">
        <img src={offlineImg} alt="Offline illustration" className="w-64 h-48 object-contain" />
      </div>

      <div className="px-6 text-center">
        <h1 className="text-[26px] font-extrabold text-foreground">You're Offline</h1>
        <p className="mt-2 text-[13px] text-muted-foreground">It looks like you're not connected to the internet. Some features are unavailable right now.</p>
      </div>

      <div className="px-6 mt-5 flex flex-col gap-3">
        <button onClick={() => location.reload()} className="w-full h-12 rounded-full bg-primary text-primary-foreground font-bold text-[15px] inline-flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
        <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
          <span className="flex-1 h-px bg-border" /> OR <span className="flex-1 h-px bg-border" />
        </div>
        <button className="w-full h-12 rounded-full border border-primary text-primary font-bold text-[15px] inline-flex items-center justify-center gap-2">
          <Download className="w-4 h-4" /> Download Data for Offline Use
        </button>
      </div>

      <section className="mx-5 mt-5 rounded-2xl bg-secondary/40 p-4">
        <div className="text-[13px] font-extrabold text-primary">You can still use:</div>
        <div className="mt-2 divide-y divide-border">
          {items.map(({ Icon, title, sub }) => (
            <button key={title} className="w-full flex items-center gap-3 py-3 text-left">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-bold text-foreground">{title}</div>
                <div className="text-[11px] text-muted-foreground">{sub}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </section>

      <section className="mx-5 mt-4 mb-6 rounded-2xl bg-yellow-50 p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
          <CloudUpload className="w-5 h-5 text-yellow-700" />
        </div>
        <div className="flex-1">
          <div className="text-[13px] font-extrabold text-foreground">We'll sync your data when you're back online.</div>
          <div className="text-[11px] text-muted-foreground">Any changes you make offline will be updated automatically.</div>
        </div>
      </section>

      <BottomNav />
    </PhoneFrame>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
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
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
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

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
