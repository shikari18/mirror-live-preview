import { X, Check, Globe } from "lucide-react";
import { useLanguage, SupportedLanguage } from "@/lib/languageContext";

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const languages: { id: SupportedLanguage; label: string; native: string; flag: string }[] = [
  { id: "English", label: "English", native: "English", flag: "🇬🇧" },
  { id: "Twi", label: "Twi", native: "Akan (Twi)", flag: "🇬🇭" },
  { id: "Ga", label: "Ga", native: "Ga-Adangme", flag: "🇬🇭" },
  { id: "Ewe", label: "Ewe", native: "Eʋegbe", flag: "🇬🇭" },
  { id: "Hausa", label: "Hausa", native: "Harshen Hausa", flag: "🇳🇬" },
];

export function LanguageModal({ isOpen, onClose }: LanguageModalProps) {
  const { language, setLanguage, t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#0F6236]/10 flex items-center justify-center text-[#0F6236]">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{t("chooseLanguage")}</h3>
            <p className="text-xs text-gray-500">Select your preferred local language</p>
          </div>
        </div>

        <div className="space-y-2 mt-4">
          {languages.map((lang) => {
            const isSelected = language === lang.id;
            return (
              <button
                key={lang.id}
                onClick={() => {
                  setLanguage(lang.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? "border-[#0F6236] bg-[#0F6236]/5 text-[#0F6236] font-bold"
                    : "border-gray-200 hover:bg-gray-50 text-gray-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{lang.flag}</span>
                  <div>
                    <div className="text-sm font-semibold">{lang.label}</div>
                    <div className="text-xs text-gray-400 font-normal">{lang.native}</div>
                  </div>
                </div>
                {isSelected && <Check className="w-5 h-5 text-[#0F6236]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
