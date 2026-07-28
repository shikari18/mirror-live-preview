import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, User, Phone, MapPin, Award, Save, Camera, Building2, Target } from "lucide-react";
import farmerImg from "@/assets/farmer.jpg";
import { getFarmProfile, saveFarmProfile } from "@/lib/farmMemory";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({
    meta: [
      { title: "My Farm Profile — Fish Doctor" },
      { name: "description", content: "View and edit your farm profile and contact details." },
    ],
  }),
});

export function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfileState] = useState(getFarmProfile());
  const [farmerName, setFarmerName] = useState(profile.name || "Farmer Kofi");
  const [farmName, setFarmName] = useState(profile.farmName || "Green Aqua Farm");
  const [farmerPhone, setFarmerPhone] = useState(profile.phone || "+233 248785807");
  const [location, setLocation] = useState(profile.location || "Accra, Ghana");
  const [primaryGoal, setPrimaryGoal] = useState(profile.primaryGoal || "Increase Yield & Growth Rate");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedName = localStorage.getItem("user_name");
    if (savedName) setFarmerName(savedName);

    const savedFarmName = localStorage.getItem("user_farm_name");
    if (savedFarmName) setFarmName(savedFarmName);

    const savedGoal = localStorage.getItem("user_primary_goal");
    if (savedGoal) setPrimaryGoal(savedGoal);

    const savedPic = localStorage.getItem("user_profile_image");
    if (savedPic) setProfilePic(savedPic);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setProfilePic(base64);
        localStorage.setItem("user_profile_image", base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...profile,
      name: farmerName,
      farmName,
      phone: farmerPhone,
      location,
      primaryGoal,
    };
    saveFarmProfile(updated);
    setProfileState(updated);

    localStorage.setItem("user_name", farmerName);
    localStorage.setItem("user_farm_name", farmName);
    localStorage.setItem("user_phone", farmerPhone);
    localStorage.setItem("user_primary_goal", primaryGoal);

    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#EAEFEA] flex justify-center items-center font-sans antialiased sm:py-4">
      <main className="w-full max-w-[430px] min-h-screen sm:min-h-[820px] bg-[#FAFCFA] relative flex flex-col justify-between overflow-hidden shadow-2xl sm:rounded-[36px] sm:border sm:border-gray-200 pb-10">
        
        {/* Header */}
        <header className="px-5 pt-6 pb-4 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Link to="/home" className="p-1 text-gray-700 hover:text-gray-900 rounded-full hover:bg-gray-100">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-xl font-extrabold text-gray-900">Farmer Profile & Settings</h1>
          </div>
        </header>

        {/* Profile Details Form */}
        <div className="p-5 space-y-5 flex-1 overflow-y-auto">
          {/* Avatar Section */}
          <div className="flex flex-col items-center justify-center pt-2">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <img
                src={profilePic || farmerImg}
                alt="Farmer"
                className="w-24 h-24 rounded-full object-cover border-4 border-[#0F6236] shadow-lg"
              />
              <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#0F6236] text-white flex items-center justify-center border-2 border-white shadow-md">
                <Camera className="w-4 h-4" />
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <span className="text-[11px] font-bold text-[#0F6236] mt-1.5 cursor-pointer hover:underline" onClick={() => fileInputRef.current?.click()}>
              Tap to Change Profile Picture
            </span>

            <h2 className="mt-2 font-extrabold text-gray-900 text-lg">{farmerName}</h2>
            <div className="flex items-center gap-1 text-xs text-[#0F6236] font-semibold">
              <Award className="w-4 h-4" /> Certified Commercial Aquaculture Farmer
            </div>
          </div>

          {savedMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-[#0F6236] text-xs font-bold rounded-xl text-center animate-in fade-in">
              Profile Updated & Synced with Fish Doctor AI Memory!
            </div>
          )}

          <form onSubmit={handleSave} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[#0F6236]" /> Full Name
              </label>
              <input
                type="text"
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                className="w-full h-11 px-3 text-xs font-bold border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-[#0F6236]/20"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#0F6236]" /> Farm Name
              </label>
              <input
                type="text"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                className="w-full h-11 px-3 text-xs font-bold border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-[#0F6236]/20"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#0F6236]" /> Phone Number
              </label>
              <input
                type="tel"
                value={farmerPhone}
                onChange={(e) => setFarmerPhone(e.target.value)}
                className="w-full h-11 px-3 text-xs font-bold border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-[#0F6236]/20"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#0F6236]" /> Farm Location / Region
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Accra & Ashanti Region, Ghana"
                className="w-full h-11 px-3 text-xs font-bold border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-[#0F6236]/20"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-[#0F6236]" /> Primary Farm Goal (AI Mandate)
              </label>
              <select
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value)}
                className="w-full h-11 px-3 text-xs font-bold border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-[#0F6236]/20"
              >
                <option value="Increase Yield & Growth Rate">Increase Yield & Growth Rate</option>
                <option value="Prevent Disease & Mortality">Prevent Disease & Mortality</option>
                <option value="Reduce Feed Costs & Waste">Reduce Feed Costs & Waste</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full h-12 bg-[#0F6236] hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Profile Details
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
