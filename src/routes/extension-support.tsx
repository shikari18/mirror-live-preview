import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Phone, MessageSquare, UserCheck, ShieldCheck, MapPin, CheckCircle } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import { useLanguage } from "@/lib/languageContext";

export const Route = createFileRoute("/extension-support")({
  component: ExtensionSupportPage,
  head: () => ({
    meta: [
      { title: "Real-Life Extension Support — Fish Doctor" },
      { name: "description", content: "Call or request a certified field extension agent to visit your farm." },
    ],
  }),
});

export function ExtensionSupportPage() {
  const { t } = useLanguage();
  const [farmerName, setFarmerName] = useState("");
  const [farmerPhone, setFarmerPhone] = useState("+233 248785807");
  const [farmLocation, setFarmLocation] = useState("Accra & Ashanti Region");
  const [issueSummary, setIssueSummary] = useState("");
  const [requestSent, setRequestSent] = useState(false);

  const handleWhatsappClick = () => {
    const text = encodeURIComponent("hello, im messaging from the fish doctor app");
    window.open(`https://wa.me/233248785807?text=${text}`, "_blank");
  };

  const handleCallClick = () => {
    window.location.href = "tel:+233248785807";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRequestSent(true);
  };

  return (
    <PhoneFrame>
      {/* Header */}
      <header className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-gray-100 bg-white shadow-xs">
        <div className="flex items-center gap-3">
          <Link to="/home" className="p-1 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5.5 h-5.5 text-gray-800" />
          </Link>
          <div>
            <h1 className="text-[19px] font-extrabold text-gray-900 leading-tight">Extension Assistant Support</h1>
            <p className="text-xs text-[#0F6236] font-semibold">Real-Life On-Site Farm Visits</p>
          </div>
        </div>
        <img src={farmerImg} alt="Kofi" className="w-9 h-9 rounded-full object-cover border-2 border-[#0F6236]" />
      </header>

      {/* Hero Banner */}
      <section className="mx-5 mt-4 rounded-2xl bg-[#0F6236] text-white p-4 shadow-lg shadow-[#0F6236]/20 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-white shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold leading-tight">Call Real-Life Assistant</h2>
            <p className="text-xs text-emerald-100">If the app is not giving you what you need, get a certified assistant to visit your farm in person.</p>
          </div>
        </div>

        {/* Direct Contact Phone Number Card */}
        <div className="mt-3 p-3 bg-white/10 rounded-xl border border-white/20 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10.5px] text-emerald-200 uppercase font-extrabold tracking-wide block">Official Hotline</span>
            <span className="text-base font-extrabold text-white tracking-wide">+233 248785807</span>
          </div>
          <span className="text-[10px] font-extrabold bg-white text-[#0F6236] px-2.5 py-1 rounded-full shadow-xs">
            Live 24/7
          </span>
        </div>
      </section>

      {/* Direct Contact Buttons */}
      <section className="px-5 mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={handleWhatsappClick}
          className="h-13 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
        >
          <MessageSquare className="w-5 h-5" /> Chat on WhatsApp
        </button>
        <button
          onClick={handleCallClick}
          className="h-13 rounded-2xl bg-[#0F6236] hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
        >
          <Phone className="w-5 h-5" /> Direct Call
        </button>
      </section>

      {/* On-Site Farm Visit Request Form */}
      <section className="mx-5 mt-4 mb-6 rounded-2xl bg-white p-4 border border-gray-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
          <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
            📋 Request On-Site Farm Inspection
          </h3>
          <span className="text-[10px] font-extrabold text-[#0F6236] bg-[#0F6236]/10 px-2 py-0.5 rounded-full">
            Free Assistant Dispatch
          </span>
        </div>

        {requestSent ? (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2 animate-in fade-in">
            <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-extrabold text-base text-emerald-900">Request Sent Successfully!</h4>
            <p className="text-xs text-emerald-800 leading-relaxed font-medium">
              An aquaculture extension assistant will call you back at <strong>{farmerPhone}</strong> within 30 minutes to confirm your farm inspection.
            </p>
            <button
              onClick={() => setRequestSent(false)}
              className="mt-2 text-xs font-bold text-[#0F6236] underline cursor-pointer"
            >
              Submit another request
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Your Full Name</label>
              <input
                type="text"
                required
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                placeholder="e.g. Kwame Mensah"
                className="w-full h-11 px-3 font-semibold rounded-xl border border-gray-200 outline-none bg-gray-50 focus:ring-2 focus:ring-[#0F6236]/20"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Phone / WhatsApp Number</label>
              <input
                type="tel"
                required
                value={farmerPhone}
                onChange={(e) => setFarmerPhone(e.target.value)}
                className="w-full h-11 px-3 font-semibold rounded-xl border border-gray-200 outline-none bg-gray-50 focus:ring-2 focus:ring-[#0F6236]/20"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Farm Location / Region</label>
              <input
                type="text"
                required
                value={farmLocation}
                onChange={(e) => setFarmLocation(e.target.value)}
                placeholder="e.g. Dawhenya, Greater Accra / Kumasi"
                className="w-full h-11 px-3 font-semibold rounded-xl border border-gray-200 outline-none bg-gray-50 focus:ring-2 focus:ring-[#0F6236]/20"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Describe Issue Needed on Site</label>
              <textarea
                rows={3}
                required
                value={issueSummary}
                onChange={(e) => setIssueSummary(e.target.value)}
                placeholder="e.g. Need help testing water parameters, checking sick fish in pond 2, or designing new tarpaulin tanks."
                className="w-full p-3 font-medium rounded-xl border border-gray-200 outline-none bg-gray-50 focus:ring-2 focus:ring-[#0F6236]/20"
              />
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-[#0F6236] hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md shadow-[#0F6236]/25 cursor-pointer transition-all active:scale-95"
            >
              Dispatch Real-Life Assistant (+233 248785807)
            </button>
          </form>
        )}
      </section>

      <BottomNav />
    </PhoneFrame>
  );
}
