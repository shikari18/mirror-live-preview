import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Lock, Eye, EyeOff, ChevronDown } from "lucide-react";
import { useState } from "react";
import { GhanaFlag } from "@/components/ui/GhanaFlag";
import { GoogleLogo } from "@/components/ui/GoogleLogo";
import { FishFarmLogo } from "@/components/ui/FishFarmLogo";
import { WavyFishBackground } from "@/components/ui/WavyFishBackground";
import { MobileStatusBar } from "@/components/ui/MobileStatusBar";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Log In — FishFarm OS Ghana" },
      { name: "description", content: "Log in to continue your fish farming journey." },
    ],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/home" });
  };

  return (
    <div className="min-h-screen bg-[#EAEFEA] flex justify-center items-center font-sans antialiased sm:py-6">
      <main className="w-full max-w-[430px] min-h-[915px] sm:min-h-[880px] bg-[#FAFCFA] relative flex flex-col justify-between overflow-hidden shadow-2xl sm:rounded-[40px] sm:border sm:border-gray-200">
        
        {/* Mobile Status Bar */}
        <MobileStatusBar />

        {/* Content Container */}
        <div className="px-6 pt-4 pb-36 z-10 flex flex-col flex-1 justify-center">
          
          {/* Logo Section */}
          <div className="flex justify-center mb-5">
            <FishFarmLogo className="w-20 h-20" />
          </div>

          {/* Heading */}
          <div className="text-center mb-7">
            <h1 className="text-[26px] font-bold text-gray-900 tracking-tight">
              Welcome Back!
            </h1>
            <p className="mt-1.5 text-[15px] text-gray-500 leading-snug font-normal">
              Log in to continue your<br />fish farming journey.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Phone Field */}
            <div>
              <label className="block text-[14px] font-bold text-gray-900 mb-1.5">
                Phone Number
              </label>
              <div className="flex items-center h-14 bg-white border border-gray-200 rounded-[18px] px-3.5 shadow-xs focus-within:border-[#0F6236] focus-within:ring-2 focus-within:ring-[#0F6236]/20 transition-all">
                <div className="flex items-center gap-2 pr-3 border-r border-gray-200 cursor-pointer select-none">
                  <GhanaFlag className="w-6 h-4" />
                  <span className="font-bold text-gray-900 text-[15px]">+233</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="flex-1 bg-transparent pl-3 text-[15px] text-gray-900 placeholder:text-gray-400 outline-none font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[14px] font-bold text-gray-900 mb-1.5">
                Password
              </label>
              <div className="relative flex items-center h-14 bg-white border border-gray-200 rounded-[18px] px-3.5 shadow-xs focus-within:border-[#0F6236] focus-within:ring-2 focus-within:ring-[#0F6236]/20 transition-all">
                <Lock className="w-5 h-5 text-gray-400 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="flex-1 bg-transparent pl-3 pr-2 text-[15px] text-gray-900 placeholder:text-gray-400 outline-none font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              <div className="text-right mt-2">
                <a href="#" className="text-[14px] font-bold text-[#0F6236] hover:underline">
                  Forgot Password?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full h-14 bg-[#0F6236] hover:bg-[#0B502B] active:scale-[0.98] transition-all text-white text-[17px] font-bold rounded-[18px] shadow-lg shadow-[#0F6236]/20 flex items-center justify-center mt-2 cursor-pointer"
            >
              Log In
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-2">
              <div className="absolute inset-x-0 h-[1px] bg-gray-200" />
              <span className="relative bg-[#FAFCFA] px-4 text-[13px] font-semibold text-gray-400">
                or
              </span>
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={() => navigate({ to: "/home" })}
              className="w-full h-14 bg-white border border-gray-200 hover:bg-gray-50 active:scale-[0.98] transition-all text-gray-900 text-[16px] font-bold rounded-[18px] shadow-xs flex items-center justify-center gap-3 cursor-pointer"
            >
              <GoogleLogo className="w-5 h-5" />
              Continue with Google
            </button>

            {/* Footer Sign Up Link */}
            <p className="text-center text-[14px] text-gray-500 font-medium mt-4">
              Don’t have an account?{" "}
              <Link to="/signup" className="text-[#0F6236] font-bold hover:underline">
                Sign Up
              </Link>
            </p>
          </form>
        </div>

        {/* Wavy Fish Background Decor */}
        <WavyFishBackground />
      </main>
    </div>
  );
}
