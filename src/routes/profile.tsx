import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, User, Phone, MapPin, Award, Save, LogOut } from "lucide-react";
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
  const [farmerName, setFarmerName] = useState(profile.farmerName || "Farmer Kofi");
  const [farmerPhone, setFarmerPhone] = useState(profile.farmerPhone || "+233 248785807");
  const [location, setLocation] = useState(profile.location || "Accra, Ghana");
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("user_name");
    if (saved) setFarmerName(saved);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...profile,
      farmerName,
      farmerPhone,
      location,
    };
    saveFarmProfile(updated);
    setProfileState(updated);
    localStorage.setItem("user_name", farmerName);
    localStorage.setItem("user_phone", farmerPhone);

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
            <h1 className="text-xl font-extrabold text-gray-900">Farmer Profile</h1>
          </div>
        </header>

        {/* Profile Details Form */}
        <div className="p-5 space-y-5 flex-1 overflow-y-auto">
          {/* Avatar Section */}
          <div className="flex flex-col items-center justify-center pt-2">
            <div className="relative">
              <img src={farmerImg} alt="Farmer" className="w-20 h-20 rounded-full object-cover border-4 border-[#0F6236] shadow-md" />
              <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#0F6236] text-white flex items-center justify-center text-xs font-bold border-2 border-white">
                ✓
              </div>
            </div>
            <h2 className="mt-3 font-extrabold text-gray-900 text-lg">{farmerName}</h2>
            <div className="flex items-center gap-1 text-xs text-[#0F6236] font-semibold">
              <Award className="w-4 h-4" /> Certified Commercial Aquaculture Farmer
            </div>
          </div>

          {savedMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-[#0F6236] text-xs font-bold rounded-xl text-center animate-in fade-in">
              Profile Updated & Synced with Unified AI Memory!
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
                className="w-full h-11 px-3 text-xs font-bold border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-[#0F6236]/20"
              />
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
