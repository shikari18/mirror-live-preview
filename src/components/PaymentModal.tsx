import { useState, useEffect } from "react";
import { X, Check, ShieldCheck, Zap, PhoneCall, CreditCard, Sparkles, AlertCircle, Clock } from "lucide-react";
import { PRO_MONTHLY_PRICE_GHC, getSubscriptionStatus, activateProSubscription, SubscriptionStatus } from "@/lib/subscription";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PaymentModal({ isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [status, setStatus] = useState<SubscriptionStatus>(getSubscriptionStatus());
  const [selectedMethod, setSelectedMethod] = useState<"momo_mtn" | "momo_telecel" | "momo_at" | "card">("momo_mtn");
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
      setPaymentSuccess(false);
      setErrorMsg("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (selectedMethod.startsWith("momo")) {
      if (!phoneNumber || phoneNumber.trim().length < 9) {
        setErrorMsg("Please enter a valid Ghana Mobile Money phone number.");
        return;
      }
    } else {
      if (!cardDetails.number || cardDetails.number.replace(/\s/g, "").length < 16) {
        setErrorMsg("Please enter a valid 16-digit bank card number.");
        return;
      }
    }

    setIsProcessing(true);

    // Simulate instant payment gateway authorization prompt (1.5s)
    setTimeout(() => {
      const res = activateProSubscription(selectedMethod, phoneNumber || cardDetails.number);
      setIsProcessing(false);

      if (res.success) {
        setPaymentSuccess(true);
        setStatus(getSubscriptionStatus());
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(res.message);
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-[420px] bg-white rounded-3xl overflow-hidden shadow-2xl border border-emerald-900/10 animate-in zoom-in-95 duration-200">
        
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

          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-black text-white">GH₵ {PRO_MONTHLY_PRICE_GHC.toFixed(2)}</span>
            <span className="text-xs text-emerald-200 font-medium">/ month</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">

          {paymentSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#0F6236] flex items-center justify-center mx-auto shadow-inner">
                <Check className="w-9 h-9 stroke-[3]" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-gray-900">Subscription Active!</h3>
                <p className="text-xs text-gray-600 mt-1">
                  You now have full Pro Access to AI Fish Doctor, Multi-Pond Analytics, and Market Tools.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full h-12 rounded-2xl bg-[#0F6236] hover:bg-[#0B4D29] text-white font-extrabold text-xs shadow-lg shadow-[#0F6236]/30 cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          ) : (
            <>
              {/* Status Banner */}
              {status.isPro ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Your Pro Subscription is active.</span>
                </div>
              ) : status.isTrialActive ? (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs font-bold text-amber-900">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-amber-700 font-extrabold">23-Hour Free Trial</div>
                      <div>{status.formattedTimeLeft}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-[10px] text-amber-900 font-extrabold">Active</span>
                </div>
              ) : (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-red-800">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>23-Hour Free Trial Expired. Subscribe to continue using Pro features.</span>
                </div>
              )}

              {/* Pro Benefits */}
              <div className="space-y-2">
                <div className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">What's included in Pro:</div>
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-gray-700">
                  <div className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-xl border border-gray-100">
                    <Check className="w-3.5 h-3.5 text-[#0F6236]" /> AI Doctor Diagnosis
                  </div>
                  <div className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-xl border border-gray-100">
                    <Check className="w-3.5 h-3.5 text-[#0F6236]" /> Voice Twi Assistance
                  </div>
                  <div className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-xl border border-gray-100">
                    <Check className="w-3.5 h-3.5 text-[#0F6236]" /> Unlimited Ponds
                  </div>
                  <div className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-xl border border-gray-100">
                    <Check className="w-3.5 h-3.5 text-[#0F6236]" /> Daily Feed Calculator
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <form onSubmit={handlePayment} className="space-y-3 pt-2">
                <div className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">Select Payment Method:</div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod("momo_mtn")}
                    className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      selectedMethod === "momo_mtn"
                        ? "border-[#0F6236] bg-emerald-50/80 ring-2 ring-[#0F6236]/20"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-amber-900">MTN MoMo</span>
                      <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium">Mobile Money</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod("momo_telecel")}
                    className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      selectedMethod === "momo_telecel"
                        ? "border-[#0F6236] bg-emerald-50/80 ring-2 ring-[#0F6236]/20"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-red-900">Telecel Cash</span>
                      <PhoneCall className="w-3.5 h-3.5 text-red-600" />
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium">Vodafone Cash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod("momo_at")}
                    className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      selectedMethod === "momo_at"
                        ? "border-[#0F6236] bg-emerald-50/80 ring-2 ring-[#0F6236]/20"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-blue-900">AT Money</span>
                      <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium">AirtelTigo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod("card")}
                    className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      selectedMethod === "card"
                        ? "border-[#0F6236] bg-emerald-50/80 ring-2 ring-[#0F6236]/20"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-gray-900">Bank Card</span>
                      <CreditCard className="w-3.5 h-3.5 text-gray-700" />
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium">Visa / Mastercard</span>
                  </button>
                </div>

                {/* Account Details Input */}
                {selectedMethod.startsWith("momo") ? (
                  <div>
                    <label className="block text-[11px] font-extrabold text-gray-700 mb-1">
                      Mobile Money Number
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="e.g. 0244123456"
                      className="w-full h-11 px-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#0F6236]/20"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] font-extrabold text-gray-700 mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                        placeholder="1234 5678 9012 3456"
                        className="w-full h-11 px-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#0F6236]/20"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                        className="h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold outline-none"
                      />
                      <input
                        type="text"
                        placeholder="CVC"
                        value={cardDetails.cvc}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                        className="h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold outline-none"
                      />
                    </div>
                  </div>
                )}

                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700">
                    {errorMsg}
                  </div>
                )}

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full h-12 rounded-2xl bg-[#0F6236] hover:bg-[#0B4D29] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#0F6236]/30 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Authorizing MoMo Payment...
                    </span>
                  ) : (
                    <span>Pay GH₵ {PRO_MONTHLY_PRICE_GHC.toFixed(2)} / Month</span>
                  )}
                </button>

                {/* Continue Free Trial Button if Active */}
                {status.isTrialActive && !status.isPro && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2.5 rounded-2xl text-xs font-extrabold text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-50 cursor-pointer transition-all text-center"
                  >
                    Continue Free ({status.formattedTimeLeft})
                  </button>
                )}
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
