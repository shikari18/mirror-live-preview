import { useState, useEffect } from "react";
import { X, Check, ShieldCheck, Zap, Phone, CreditCard, Sparkles, AlertCircle, Clock, Globe, ArrowRight, CheckCircle2 } from "lucide-react";
import { PRO_MONTHLY_PRICE_GHC, getSubscriptionStatus, activateProSubscription, SubscriptionStatus } from "@/lib/subscription";
import { WORLD_COUNTRIES, getCountryPaymentInfo, detectUserCountry, CountryPaymentInfo } from "@/lib/countryPayment";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PaymentModal({ isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [status, setStatus] = useState<SubscriptionStatus>(getSubscriptionStatus());
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("GH");
  const [countryInfo, setCountryInfo] = useState<CountryPaymentInfo>(getCountryPaymentInfo("GH"));
  const [selectedMethodId, setSelectedMethodId] = useState<string>("momo_mtn");
  
  // Payment Form States
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvc: "" });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      const sub = getSubscriptionStatus();
      setStatus(sub);
      const userPhone = localStorage.getItem("user_phone") || "";
      if (userPhone) setPhoneNumber(userPhone);

      const detected = detectUserCountry();
      setSelectedCountryCode(detected);
      const info = getCountryPaymentInfo(detected);
      setCountryInfo(info);
      if (info.paymentMethods.length > 0) {
        setSelectedMethodId(info.paymentMethods[0].id);
      }

      setPaymentSuccess(false);
      setErrorMsg("");
    }
  }, [isOpen]);

  const handleCountryChange = (code: string) => {
    setSelectedCountryCode(code);
    localStorage.setItem("user_selected_country_code", code);
    const info = getCountryPaymentInfo(code);
    setCountryInfo(info);
    if (info.paymentMethods.length > 0) {
      setSelectedMethodId(info.paymentMethods[0].id);
    }
  };

  if (!isOpen) return null;

  const currentMethod = countryInfo.paymentMethods.find((m) => m.id === selectedMethodId) || countryInfo.paymentMethods[0];

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (currentMethod.inputType === "phone") {
      if (!phoneNumber || phoneNumber.trim().length < 8) {
        setErrorMsg(`Please enter a valid phone number for ${currentMethod.name}.`);
        return;
      }
    } else if (currentMethod.inputType === "card") {
      if (!cardDetails.number || cardDetails.number.replace(/\s/g, "").length < 15) {
        setErrorMsg("Please enter a valid card number.");
        return;
      }
    }

    setIsProcessing(true);

    // Simulate instant multi-gateway authorization (1.2s)
    setTimeout(() => {
      const res = activateProSubscription(currentMethod.name, phoneNumber || cardDetails.number || "ONLINE_GATEWAY");
      setIsProcessing(false);

      if (res.success) {
        setPaymentSuccess(true);
        setStatus(getSubscriptionStatus());
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(res.message);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-[430px] bg-white rounded-3xl overflow-hidden shadow-2xl border border-emerald-900/10 animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#08301B] via-[#0F6236] to-[#08301B] p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Zap className="w-3.5 h-3.5 fill-emerald-300" /> FishFarm OS Pro Access
          </div>

          <h2 className="text-xl font-extrabold leading-tight">
            Unlimited AI & Farm Analytics
          </h2>

          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-black text-white">
                {countryInfo.currencySymbol} {countryInfo.monthlyPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-emerald-200 font-medium ml-1">/ month</span>
            </div>

            {/* Country Selector Switcher */}
            <div className="relative">
              <select
                value={selectedCountryCode}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="appearance-none bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs px-3 py-1.5 rounded-full pr-7 outline-none border border-white/20 cursor-pointer"
              >
                {WORLD_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code} className="text-gray-900 font-bold">
                    {c.flag} {c.name} ({c.currencyCode})
                  </option>
                ))}
              </select>
              <Globe className="w-3.5 h-3.5 text-emerald-200 absolute right-2 top-2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">

          {paymentSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#0F6236] flex items-center justify-center mx-auto shadow-inner">
                <Check className="w-9 h-9 stroke-[3]" />
              </div>
              <h3 className="text-xl font-black text-gray-900">Pro Membership Activated!</h3>
              <p className="text-xs text-gray-600 font-medium max-w-[260px] mx-auto">
                Thank you! You now have unlimited access to AI Doctor, AR Camera Pond Measurement, and live weather alerts.
              </p>
              <button
                onClick={onClose}
                className="w-full h-12 rounded-2xl bg-[#0F6236] text-white font-extrabold text-xs shadow-lg cursor-pointer"
              >
                Start Using Pro Access
              </button>
            </div>
          ) : (
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              
              {/* Payment Methods Selection for Selected Country */}
              <div>
                <label className="block text-xs font-extrabold text-gray-800 mb-2">
                  Select Payment Method for {countryInfo.flag} {countryInfo.name}:
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {countryInfo.paymentMethods.map((method) => (
                    <button
                      type="button"
                      key={method.id}
                      onClick={() => {
                        setSelectedMethodId(method.id);
                        setErrorMsg("");
                      }}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        selectedMethodId === method.id
                          ? "border-2 border-[#0F6236] bg-emerald-50/80 shadow-xs"
                          : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg">{method.icon}</span>
                        {selectedMethodId === method.id && (
                          <CheckCircle2 className="w-4 h-4 text-[#0F6236]" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-gray-900 mt-1 leading-tight">{method.name}</div>
                        <div className="text-[10px] text-gray-500 font-medium leading-tight mt-0.5 line-clamp-1">
                          {method.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Fields according to Payment Method */}
              {currentMethod.inputType === "phone" && (
                <div className="space-y-1">
                  <label className="block text-xs font-extrabold text-gray-800">
                    {currentMethod.name} Mobile Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0244123456"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full h-11 px-3.5 text-xs font-extrabold border border-gray-300 rounded-2xl bg-gray-50 outline-none focus:ring-2 focus:ring-[#0F6236]/20"
                    />
                    <Phone className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
                  </div>
                  <span className="text-[10.5px] text-gray-500 font-medium block pt-0.5">
                    An approval prompt will be sent directly to your mobile wallet.
                  </span>
                </div>
              )}

              {currentMethod.inputType === "card" && (
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-xs font-extrabold text-gray-800 mb-1">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="4532 •••• •••• 8912"
                        maxLength={19}
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                        className="w-full h-11 px-3.5 text-xs font-extrabold border border-gray-300 rounded-2xl bg-gray-50 outline-none focus:ring-2 focus:ring-[#0F6236]/20"
                      />
                      <CreditCard className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-extrabold text-gray-800 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM / YY"
                        maxLength={5}
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                        className="w-full h-11 px-3.5 text-xs font-extrabold border border-gray-300 rounded-2xl bg-gray-50 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-gray-800 mb-1">CVC / CVV</label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={4}
                        value={cardDetails.cvc}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                        className="w-full h-11 px-3.5 text-xs font-extrabold border border-gray-300 rounded-2xl bg-gray-50 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {(currentMethod.inputType === "qr" || currentMethod.inputType === "bank_transfer" || currentMethod.inputType === "ussd") && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-center space-y-1.5">
                  <div className="text-2xl">{currentMethod.icon}</div>
                  <div className="text-xs font-extrabold text-gray-900">{currentMethod.name} Instant Checkout</div>
                  <p className="text-[11px] text-gray-600 font-medium">
                    {currentMethod.description}. Authorize payment to complete Pro activation.
                  </p>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-extrabold text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full h-13 rounded-2xl bg-[#0F6236] hover:bg-[#0B4D29] text-white font-extrabold text-sm shadow-xl shadow-[#0F6236]/25 cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-white" /> Authorizing Payment...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 text-emerald-300" /> Pay {countryInfo.currencySymbol} {countryInfo.monthlyPrice.toLocaleString()} Now
                  </>
                )}
              </button>

            </form>
          )}

        </div>
      </div>
    </div>
  );
}
