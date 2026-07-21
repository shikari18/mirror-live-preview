import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { User, Lock, Eye, EyeOff, ChevronDown } from "lucide-react";
import { useState } from "react";
import { GhanaFlag } from "@/components/ui/GhanaFlag";
import { GoogleLogo } from "@/components/ui/GoogleLogo";
import { FishFarmLogo } from "@/components/ui/FishFarmLogo";
import { WavyFishBackground } from "@/components/ui/WavyFishBackground";
import { MobileStatusBar } from "@/components/ui/MobileStatusBar";

export const Route = createFileRoute("/signup")({
  component: SignUpPage,
  head: () => ({
    meta: [
      { title: "Sign Up — FishFarm OS Ghana" },
      { name: "description", content: "Create an account to start your fish farming journey." },
    ],
  }),
});

function SignUpPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/home" });
  };

  return (
    <div className="min-h-screen bg-[#EAEFEA] flex justify-center items-center font-sans antialiased sm:py-6">
      <main className="w-full max-w-[430px] min-h-[960px] sm:min-h-[920px] bg-[#FAFCFA] relative flex flex-col justify-between overflow-hidden shadow-2xl sm:rounded-[40px] sm:border sm:border-gray-200">
        
        {/* Mobile Status Bar */}
        <MobileStatusBar />

        {/* Content Container */}
        <div className="px-6 pt-3 pb-36 z-10 flex flex-col flex-1 justify-center">
          
          {/* Logo Section */}
          <div className="flex justify-center mb-4">
            <FishFarmLogo className="w-18 h-18" />
          </div>

          {/* Heading */}
          <div className="text-center mb-5">
            <h1 className="text-[26px] font-bold text-gray-900 tracking-tight">
              Create Account
            </h1>
            <p className="mt-1 text-[14px] text-gray-500 leading-snug font-normal">
              Join FishFarm OS to start your<br />fish farming journey.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            
            {/* Full Name Field */}
            <div>
              <label className="block text-[13.5px] font-bold text-gray-900 mb-1">
                Full Name
              </label>
              <div className="relative flex items-center h-13 bg-white border border-gray-200 rounded-[18px] px-3.5 shadow-xs focus-within:border-[#0F6236] focus-within:ring-2 focus-within:ring-[#0F6236]/20 transition-all">
                <User className="w-4.5 h-4.5 text-gray-400 shrink-0" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="flex-1 bg-transparent pl-3 text-[14.5px] text-gray-900 placeholder:text-gray-400 outline-none font-medium"
                />
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-[13.5px] font-bold text-gray-900 mb-1">
                Phone Number
              </label>
              <div className="flex items-center h-13 bg-white border border-gray-200 rounded-[18px] px-3.5 shadow-xs focus-within:border-[#0F6236] focus-within:ring-2 focus-within:ring-[#0F6236]/20 transition-all">
                <div className="flex items-center gap-1.5 pr-2.5 border-r border-gray-200 cursor-pointer select-none">
                  <GhanaFlag className="w-5.5 h-3.5" />
                  <span className="font-bold text-gray-900 text-[14.5px]">+233</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="flex-1 bg-transparent pl-3 text-[14.5px] text-gray-900 placeholder:text-gray-400 outline-none font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[13.5px] font-bold text-gray-900 mb-1">
                Password
              </label>
              <div className="relative flex items-center h-13 bg-white border border-gray-200 rounded-[18px] px-3.5 shadow-xs focus-within:border-[#0F6236] focus-within:ring-2 focus-within:ring-[#0F6236]/20 transition-all">
                <Lock className="w-4.5 h-4.5 text-gray-400 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="flex-1 bg-transparent pl-3 pr-2 text-[14.5px] text-gray-900 placeholder:text-gray-400 outline-none font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-[13.5px] font-bold text-gray-900 mb-1">
                Confirm Password
              </label>
              <div className="relative flex items-center h-13 bg-white border border-gray-200 rounded-[18px] px-3.5 shadow-xs focus-within:border-[#0F6236] focus-within:ring-2 focus-within:ring-[#0F6236]/20 transition-all">
                <Lock className="w-4.5 h-4.5 text-gray-400 shrink-0" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="flex-1 bg-transparent pl-3 pr-2 text-[14.5px] text-gray-900 placeholder:text-gray-400 outline-none font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full h-13 bg-[#0F6236] hover:bg-[#0B502B] active:scale-[0.98] transition-all text-white text-[16px] font-bold rounded-[18px] shadow-lg shadow-[#0F6236]/20 flex items-center justify-center mt-2 cursor-pointer"
            >
              Sign Up
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-1.5">
              <div className="absolute inset-x-0 h-[1px] bg-gray-200" />
              <span className="relative bg-[#FAFCFA] px-4 text-[12.5px] font-semibold text-gray-400">
                or
              </span>
            </div>

            {/* Google Sign Up Button */}
            <button
              type="button"
              onClick={() => navigate({ to: "/home" })}
              className="w-full h-13 bg-white border border-gray-200 hover:bg-gray-50 active:scale-[0.98] transition-all text-gray-900 text-[15.5px] font-bold rounded-[18px] shadow-xs flex items-center justify-center gap-3 cursor-pointer"
            >
              <GoogleLogo className="w-4.5 h-4.5" />
              Sign up with Google
            </button>

            {/* Footer Log In Link */}
            <p className="text-center text-[13.5px] text-gray-500 font-medium mt-2">
              Already have an account?{" "}
              <Link to="/login" className="text-[#0F6236] font-bold hover:underline">
                Log In
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
