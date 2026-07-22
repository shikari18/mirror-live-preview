import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Check, ChevronRight, ArrowLeft, Fish, Waves, Target, Globe, Video, UploadCloud, CheckCircle } from "lucide-react";
import { useLanguage, SupportedLanguage } from "@/lib/languageContext";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
  head: () => ({
    meta: [
      { title: "Onboarding — FishFarm OS Ghana" },
      { name: "description", content: "Customize your fish farm setup." },
    ],
  }),
});

export function OnboardingPage() {
  const navigate = useNavigate();
  const { setLanguage } = useLanguage();
  const [step, setStep] = useState(1);

  // Form selections
  const [fishType, setFishType] = useState<string>("Both Catfish & Tilapia");
  const [pondCount, setPondCount] = useState<string>("3-5 Ponds");
  const [primaryGoal, setPrimaryGoal] = useState<string>("Increase Yield & Growth");
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>("English");

  // Mandatory Pond Video State
  const [pondVideo, setPondVideo] = useState<{ name: string; url: string } | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const totalSteps = 4;

  const handlePondVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPondVideo({
          name: file.name,
          url: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinish = () => {
    localStorage.setItem(
      "user_farm_profile",
      JSON.stringify({
        fishType,
        pondCount,
        primaryGoal,
        language: selectedLang,
        pondVideoName: pondVideo?.name || null,
        videoAnalyzed: true,
      })
    );
    localStorage.setItem("user_onboarding_completed", "true");
    setLanguage(selectedLang);
    navigate({ to: "/home" });
  };

  const handleNext = () => {
    if (step === 2 && !pondVideo) {
      alert("Please upload or record a short video of your pond(s) so AI can inspect and analyze your water layout!");
      return;
    }

    if (step < totalSteps) {
      setStep((s) => s + 1);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    localStorage.setItem("user_onboarding_completed", "true");
    navigate({ to: "/home" });
  };

  return (
    <div className="min-h-screen bg-[#EAEFEA] flex justify-center items-center font-sans antialiased sm:py-4">
      <main className="w-full max-w-[430px] min-h-screen sm:min-h-[820px] bg-[#FAFCFA] relative flex flex-col justify-between overflow-hidden shadow-2xl sm:rounded-[36px] sm:border sm:border-gray-200">
        
        {/* Header with Progress & Skip */}
        <div className="px-6 pt-6 flex items-center justify-between z-10">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-8" />
          )}

          {/* Progress Dots */}
          <div className="flex gap-1.5 items-center">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  step === idx + 1
                    ? "w-7 bg-[#0F6236]"
                    : step > idx + 1
                    ? "w-2 bg-[#0F6236]/60"
                    : "w-2 bg-gray-200"
                }`}
              />
            ))}
          </div>

          {/* Skip Button */}
          <button
            onClick={handleSkip}
            className="text-sm font-bold text-gray-400 hover:text-gray-700 px-2 py-1 rounded-lg cursor-pointer"
          >
            Skip
          </button>
        </div>

        {/* Content Box */}
        <div className="px-6 py-6 flex-1 flex flex-col justify-between z-10">
          <div>
            {/* Step 1: Fish Type */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="w-12 h-12 rounded-2xl bg-[#0F6236]/10 flex items-center justify-center text-[#0F6236] mb-4">
                  <Fish className="w-6 h-6" />
                </div>
                <h1 className="text-[22px] font-extrabold text-gray-900 leading-tight">
                  What type of fish do you raise?
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  We'll customize your feeding schedules and water quality targets.
                </p>

                <div className="space-y-3 mt-6">
                  {[
                    { id: "Catfish (Clarias)", label: "Catfish (Clarias gariepinus)", icon: "🐟", desc: "Air-breathing, fast growing" },
                    { id: "Tilapia (Nile)", label: "Tilapia (Nile Tilapia)", icon: "🐠", desc: "Herbivorous, pond & cage farming" },
                    { id: "Both Catfish & Tilapia", label: "Both Catfish & Tilapia", icon: "🐟🐠", desc: "Polyculture or multi-pond farm" },
                    { id: "Just Starting / Planning", label: "Just Starting / Planning", icon: "🚀", desc: "Setting up a new fish farm in Ghana" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setFishType(item.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        fishType === item.id
                          ? "border-[#0F6236] bg-[#0F6236]/5 text-[#0F6236] font-bold shadow-xs"
                          : "border-gray-200 hover:bg-gray-50 text-gray-800"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <div className="text-[15px] font-bold">{item.label}</div>
                          <div className="text-xs text-gray-400 font-normal">{item.desc}</div>
                        </div>
                      </div>
                      {fishType === item.id && <Check className="w-5 h-5 text-[#0F6236]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Pond Count & Mandatory Pond Video Upload */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="w-12 h-12 rounded-2xl bg-[#0F6236]/10 flex items-center justify-center text-[#0F6236] mb-4">
                  <Waves className="w-6 h-6" />
                </div>
                <h1 className="text-[22px] font-extrabold text-gray-900 leading-tight">
                  Pond Count & Inspection Video
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Select your pond count and upload a short video of your pond for AI analysis.
                </p>

                <div className="space-y-3 mt-4">
                  {[
                    { id: "1-2 Ponds", label: "1 - 2 Ponds", desc: "Small scale or backyard farming" },
                    { id: "3-5 Ponds", label: "3 - 5 Ponds", desc: "Commercial growing farm" },
                    { id: "6+ Ponds", label: "6+ Ponds or Cages", desc: "Large commercial production" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setPondCount(item.id)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        pondCount === item.id
                          ? "border-[#0F6236] bg-[#0F6236]/5 text-[#0F6236] font-bold shadow-xs"
                          : "border-gray-200 hover:bg-gray-50 text-gray-800"
                      }`}
                    >
                      <div>
                        <div className="text-[14px] font-bold">{item.label}</div>
                        <div className="text-xs text-gray-400 font-normal">{item.desc}</div>
                      </div>
                      {pondCount === item.id && <Check className="w-5 h-5 text-[#0F6236]" />}
                    </button>
                  ))}

                  {/* Mandatory Pond Video Upload */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-gray-800 mb-1.5 flex items-center gap-1">
                      <Video className="w-4 h-4 text-[#0F6236]" /> Upload Pond Inspection Video <span className="text-red-500">*</span>
                    </label>
                    
                    <input
                      type="file"
                      ref={videoInputRef}
                      accept="video/*,image/*"
                      onChange={handlePondVideoUpload}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className={`w-full p-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                        pondVideo
                          ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                          : "border-[#0F6236]/30 bg-[#0F6236]/5 text-[#0F6236] hover:bg-[#0F6236]/10"
                      }`}
                    >
                      {pondVideo ? (
                        <>
                          <CheckCircle className="w-6 h-6 text-emerald-600" />
                          <span>Video Uploaded: {pondVideo.name}</span>
                          <span className="text-[10px] text-emerald-600 font-normal">AI will inspect your water layout & inform you on dashboard!</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-6 h-6 text-[#0F6236]" />
                          <span>Tap to Upload / Record Pond Video</span>
                          <span className="text-[10.5px] text-gray-500 font-normal">Show your water inlet, pond depth, or fish swimming</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Farming Goal */}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="w-12 h-12 rounded-2xl bg-[#0F6236]/10 flex items-center justify-center text-[#0F6236] mb-4">
                  <Target className="w-6 h-6" />
                </div>
                <h1 className="text-[22px] font-extrabold text-gray-900 leading-tight">
                  What is your primary goal?
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Our AI will prioritize your daily recommendations.
                </p>

                <div className="space-y-3 mt-6">
                  {[
                    { id: "Increase Yield & Growth", label: "Increase Growth & Yield 📈", desc: "Reach 1.5kg harvest weight faster" },
                    { id: "Prevent Disease & Mortality", label: "Prevent Disease & Mortality 🛡️", desc: "Keep water clean and fish healthy" },
                    { id: "Maximize Sales & Price", label: "Maximize Market Sales 💰", desc: "Connect directly with fish buyers in Ghana" },
                    { id: "Optimize Feed Costs", label: "Optimize Feed Costs 🌾", desc: "Calculate exact daily feed without waste" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setPrimaryGoal(item.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        primaryGoal === item.id
                          ? "border-[#0F6236] bg-[#0F6236]/5 text-[#0F6236] font-bold shadow-xs"
                          : "border-gray-200 hover:bg-gray-50 text-gray-800"
                      }`}
                    >
                      <div>
                        <div className="text-[15px] font-bold">{item.label}</div>
                        <div className="text-xs text-gray-400 font-normal">{item.desc}</div>
                      </div>
                      {primaryGoal === item.id && <Check className="w-5 h-5 text-[#0F6236]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Language Selection */}
            {step === 4 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="w-12 h-12 rounded-2xl bg-[#0F6236]/10 flex items-center justify-center text-[#0F6236] mb-4">
                  <Globe className="w-6 h-6" />
                </div>
                <h1 className="text-[22px] font-extrabold text-gray-900 leading-tight">
                  Choose your language
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  FishFarm OS supports local Ghanaian languages and voice assistance.
                </p>

                <div className="space-y-3 mt-6">
                  {[
                    { id: "English" as SupportedLanguage, label: "English", flag: "🇬🇧", desc: "Default language" },
                    { id: "Twi" as SupportedLanguage, label: "Akan (Twi)", flag: "🇬🇭", desc: "Kasa wo Twi mu" },
                    { id: "Ga" as SupportedLanguage, label: "Ga", flag: "🇬🇭", desc: "Wiemɔ kɛ Ga" },
                    { id: "Ewe" as SupportedLanguage, label: "Ewe", flag: "🇬🇭", desc: "Gblɔ nya le Eʋegbe me" },
                    { id: "Hausa" as SupportedLanguage, label: "Hausa", flag: "🇳🇬", desc: "Harshen Hausa" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedLang(item.id)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedLang === item.id
                          ? "border-[#0F6236] bg-[#0F6236]/5 text-[#0F6236] font-bold shadow-xs"
                          : "border-gray-200 hover:bg-gray-50 text-gray-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.flag}</span>
                        <div>
                          <div className="text-[15px] font-bold">{item.label}</div>
                          <div className="text-xs text-gray-400 font-normal">{item.desc}</div>
                        </div>
                      </div>
                      {selectedLang === item.id && <Check className="w-5 h-5 text-[#0F6236]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Button */}
          <div className="mt-8">
            <button
              onClick={handleNext}
              className="w-full h-14 bg-[#0F6236] hover:bg-[#0B502B] active:scale-[0.98] transition-all text-white font-bold text-base rounded-2xl shadow-lg shadow-[#0F6236]/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {step === totalSteps ? "Finish Setup & Start" : "Continue"}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
