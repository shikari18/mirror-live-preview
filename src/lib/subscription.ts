// Subscription & 23-Hour Free Trial Management for FishFarm OS Ghana

export interface SubscriptionStatus {
  isPro: boolean;
  isTrialActive: boolean;
  isTrialExpired: boolean;
  hoursRemaining: number;
  minutesRemaining: number;
  secondsRemaining: number;
  totalSecondsRemaining: number;
  percentRemaining: number;
  formattedTimeLeft: string;
  paymentDate?: string;
  paymentMethod?: string;
}

const STORAGE_KEYS = {
  FIRST_USE_TIME: "fish_app_first_use_timestamp_v1",
  IS_PRO: "fish_app_is_pro_subscriber_v1",
  PAYMENT_METHOD: "fish_app_payment_method_v1",
  PAYMENT_DATE: "fish_app_payment_date_v1",
};

export const PRO_MONTHLY_PRICE_GHC = 100; // 100 GHS straight
export const FREE_TRIAL_HOURS = 23;
export const FREE_TRIAL_MS = FREE_TRIAL_HOURS * 60 * 60 * 1000; // 23 Hours in milliseconds

export function getTrialStartTime(): number {
  if (typeof window === "undefined") return Date.now();
  
  let stored = localStorage.getItem(STORAGE_KEYS.FIRST_USE_TIME);
  if (!stored) {
    const now = Date.now();
    localStorage.setItem(STORAGE_KEYS.FIRST_USE_TIME, now.toString());
    return now;
  }
  return parseInt(stored, 10);
}

export function getSubscriptionStatus(): SubscriptionStatus {
  if (typeof window === "undefined") {
    return {
      isPro: false,
      isTrialActive: true,
      isTrialExpired: false,
      hoursRemaining: 23,
      minutesRemaining: 0,
      secondsRemaining: 0,
      totalSecondsRemaining: 23 * 3600,
      percentRemaining: 100,
      formattedTimeLeft: "23h 0m",
    };
  }

  // Check if Pro subscription is active
  const isPro = localStorage.getItem(STORAGE_KEYS.IS_PRO) === "true";
  const paymentMethod = localStorage.getItem(STORAGE_KEYS.PAYMENT_METHOD) || undefined;
  const paymentDate = localStorage.getItem(STORAGE_KEYS.PAYMENT_DATE) || undefined;

  if (isPro) {
    return {
      isPro: true,
      isTrialActive: false,
      isTrialExpired: false,
      hoursRemaining: 999,
      minutesRemaining: 0,
      secondsRemaining: 0,
      totalSecondsRemaining: 999 * 3600,
      percentRemaining: 100,
      formattedTimeLeft: "Pro Plan (Unlimited)",
      paymentDate,
      paymentMethod,
    };
  }

  const startTime = getTrialStartTime();
  const now = Date.now();
  const elapsedMs = now - startTime;
  const remainingMs = Math.max(0, FREE_TRIAL_MS - elapsedMs);

  const totalSecondsRemaining = Math.floor(remainingMs / 1000);
  const hoursRemaining = Math.floor(totalSecondsRemaining / 3600);
  const minutesRemaining = Math.floor((totalSecondsRemaining % 3600) / 60);
  const secondsRemaining = totalSecondsRemaining % 60;

  const isTrialActive = remainingMs > 0;
  const isTrialExpired = remainingMs <= 0;
  const percentRemaining = Math.max(0, Math.min(100, (remainingMs / FREE_TRIAL_MS) * 100));

  let formattedTimeLeft = "";
  if (isTrialActive) {
    if (hoursRemaining > 0) {
      formattedTimeLeft = `${hoursRemaining}h ${minutesRemaining}m remaining`;
    } else if (minutesRemaining > 0) {
      formattedTimeLeft = `${minutesRemaining}m ${secondsRemaining}s remaining`;
    } else {
      formattedTimeLeft = `${secondsRemaining}s remaining`;
    }
  } else {
    formattedTimeLeft = "23-Hour Free Trial Expired";
  }

  return {
    isPro: false,
    isTrialActive,
    isTrialExpired,
    hoursRemaining,
    minutesRemaining,
    secondsRemaining,
    totalSecondsRemaining,
    percentRemaining,
    formattedTimeLeft,
  };
}

export function activateProSubscription(method: "momo_mtn" | "momo_telecel" | "momo_at" | "card", phoneOrCardNumber: string): { success: boolean; message: string } {
  if (typeof window === "undefined") return { success: false, message: "Window unavailable" };

  try {
    const now = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.IS_PRO, "true");
    localStorage.setItem(STORAGE_KEYS.PAYMENT_METHOD, method);
    localStorage.setItem(STORAGE_KEYS.PAYMENT_DATE, now);

    // Sync with active user account if registered
    const currentUserEmail = localStorage.getItem("user_email");
    const currentUserPhone = localStorage.getItem("user_phone");
    const accountsRaw = localStorage.getItem("registered_user_accounts_v1");
    if (accountsRaw) {
      const accounts = JSON.parse(accountsRaw);
      const acc = accounts.find((a: any) => 
        (currentUserEmail && a.email?.toLowerCase() === currentUserEmail.toLowerCase()) ||
        (currentUserPhone && a.phone?.replaceAll(" ", "") === currentUserPhone.replaceAll(" ", ""))
      );
      if (acc) {
        acc.isPro = true;
        acc.proActivatedAt = now;
        localStorage.setItem("registered_user_accounts_v1", JSON.stringify(accounts));
      }
    }

    return {
      success: true,
      message: `Pro Plan activated successfully! GH₵ ${PRO_MONTHLY_PRICE_GHC.toFixed(2)} charged via ${method.toUpperCase()}.`,
    };
  } catch (err) {
    console.error("Error activating subscription:", err);
    return { success: false, message: "Subscription activation failed. Please try again." };
  }
}

export function cancelProSubscription(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.IS_PRO);
  localStorage.removeItem(STORAGE_KEYS.PAYMENT_METHOD);
  localStorage.removeItem(STORAGE_KEYS.PAYMENT_DATE);
}
