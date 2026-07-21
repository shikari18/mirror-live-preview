import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Lock, Eye, EyeOff, ChevronDown } from "lucide-react";
import { useState } from "react";
import logoImg from "@/assets/logo.png";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Log In — FishFarm OS Ghana" },
      { name: "description", content: "Log in to continue your fish farming journey." },
      { property: "og:title", content: "Log In — FishFarm OS Ghana" },
      { property: "og:description", content: "Log in to continue your fish farming journey." },
    ],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  return (
    <main className="min-h-screen bg-secondary/40 flex justify-center relative overflow-hidden">
      <div className="w-full max-w-[430px] flex flex-col px-6 pt-12 pb-40">
        <div className="flex flex-col items-center">
          <img src={logoImg} alt="FishFarm OS logo" className="w-24 h-24 object-contain" />
          <div className="mt-2 text-center leading-none">
            <div className="text-[28px] font-extrabold text-primary">FishFarm OS</div>
            <div className="text-[12px] tracking-[0.4em] text-primary/80 mt-1">GHANA</div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <h1 className="text-[26px] font-extrabold text-foreground">Welcome Back!</h1>
          <p className="mt-2 text-[15px] text-muted-foreground">Log in to continue your<br />fish farming journey.</p>
        </div>

        <form
          className="mt-8 flex flex-col gap-5"
          onSubmit={(e) => { e.preventDefault(); navigate({ to: "/home" }); }}
        >
          <div>
            <label className="text-[14px] font-bold text-foreground">Phone Number</label>
            <div className="mt-2 flex gap-2">
              <button type="button" className="flex items-center gap-1 px-3 h-14 rounded-2xl bg-secondary/60 border border-border">
                <span className="text-lg">🇬🇭</span>
                <span className="font-semibold text-foreground">+233</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
              <input
                type="tel"
                placeholder="Enter your phone number"
                className="flex-1 h-14 rounded-2xl bg-card border border-border px-4 outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div>
            <label className="text-[14px] font-bold text-foreground">Password</label>
            <div className="mt-2 relative">
              <Lock className="w-5 h-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type={show ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full h-14 rounded-2xl bg-card border border-border pl-12 pr-12 outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                {show ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
            <div className="text-right mt-2">
              <a href="#" className="text-primary font-bold text-[14px]">Forgot Password?</a>
            </div>
          </div>

          <button type="submit" className="w-full h-14 rounded-2xl bg-primary text-primary-foreground text-[17px] font-bold shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform">
            Log In
          </button>

          <div className="relative flex items-center justify-center py-1">
            <div className="absolute inset-x-0 h-px bg-border" />
            <span className="relative bg-secondary/40 px-3 text-muted-foreground text-sm">or</span>
          </div>

          <button
            type="button"
            onClick={() => navigate({ to: "/home" })}
            className="w-full h-14 rounded-2xl bg-card border border-border font-semibold text-foreground flex items-center justify-center gap-3"
          >
            <span className="text-xl font-bold">G</span>
            Continue with Google
          </button>

          <p className="text-center text-[14px] text-muted-foreground">
            Don't have an account? <a href="#" className="text-primary font-bold">Sign Up</a>
          </p>
        </form>
        <Link to="/" className="text-center mt-4 text-xs text-muted-foreground">Back</Link>
      </div>

      <svg className="absolute bottom-0 left-0 w-full pointer-events-none" viewBox="0 0 430 120" preserveAspectRatio="none" aria-hidden>
        <path d="M0,60 C120,20 260,90 430,40 L430,120 L0,120 Z" fill="oklch(0.85 0.05 145)" opacity="0.6" />
        <path d="M0,80 C140,50 280,100 430,70 L430,120 L0,120 Z" fill="oklch(0.9 0.04 145)" opacity="0.8" />
      </svg>
    </main>
  );
}
