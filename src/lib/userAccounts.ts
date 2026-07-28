export interface UserAccount {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  farmName?: string;
  isGoogleSignedIn: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
  lastLoginAt: string;
}

const STORAGE_KEY = "registered_user_accounts_v1";

export function getRegisteredAccounts(): UserAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading registered accounts:", err);
    return [];
  }
}

export function saveRegisteredAccounts(accounts: UserAccount[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error("Error saving registered accounts:", err);
  }
}

export function findAccountByIdentifier(identifier: string): UserAccount | undefined {
  if (!identifier) return undefined;
  const accounts = getRegisteredAccounts();
  const cleanId = identifier.trim().toLowerCase();
  return accounts.find(
    (acc) =>
      (acc.email && acc.email.toLowerCase() === cleanId) ||
      (acc.phone && acc.phone.replaceAll(" ", "").toLowerCase().includes(cleanId.replaceAll(" ", "")))
  );
}

export function registerOrLoginAccount(details: {
  name: string;
  phone?: string;
  email?: string;
  isGoogle?: boolean;
  farmName?: string;
}): { account: UserAccount; isExisting: boolean } {
  const accounts = getRegisteredAccounts();
  const identifier = details.email || details.phone || details.name;

  let existing = accounts.find((acc) => {
    if (details.email && acc.email && acc.email.toLowerCase() === details.email.toLowerCase()) return true;
    if (details.phone && acc.phone && acc.phone.replaceAll(" ", "") === details.phone.replaceAll(" ", "")) return true;
    return false;
  });

  const now = new Date().toISOString();

  if (existing) {
    existing.lastLoginAt = now;
    if (details.name && details.name !== "Google User") existing.name = details.name;
    if (details.farmName) existing.farmName = details.farmName;
    saveRegisteredAccounts(accounts);

    // Save Active Session
    localStorage.setItem("user_name", existing.name);
    if (existing.phone) localStorage.setItem("user_phone", existing.phone);
    if (existing.email) localStorage.setItem("user_email", existing.email);
    if (existing.farmName) localStorage.setItem("user_farm_name", existing.farmName);
    if (existing.isGoogleSignedIn) localStorage.setItem("user_google_signed_in", "true");
    localStorage.setItem("user_logged_in", "true");

    if (existing.onboardingCompleted) {
      localStorage.setItem("user_onboarding_completed", "true");
    }

    return { account: existing, isExisting: true };
  } else {
    const newAccount: UserAccount = {
      id: "usr_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      name: details.name || "Farmer",
      phone: details.phone,
      email: details.email,
      farmName: details.farmName || "Green Aqua Farm",
      isGoogleSignedIn: !!details.isGoogle,
      onboardingCompleted: false,
      createdAt: now,
      lastLoginAt: now,
    };

    accounts.push(newAccount);
    saveRegisteredAccounts(accounts);

    // Save Active Session
    localStorage.setItem("user_name", newAccount.name);
    if (newAccount.phone) localStorage.setItem("user_phone", newAccount.phone);
    if (newAccount.email) localStorage.setItem("user_email", newAccount.email);
    if (newAccount.farmName) localStorage.setItem("user_farm_name", newAccount.farmName);
    if (newAccount.isGoogleSignedIn) localStorage.setItem("user_google_signed_in", "true");
    localStorage.setItem("user_logged_in", "true");

    return { account: newAccount, isExisting: false };
  }
}

export function markCurrentAccountOnboardingComplete(farmName?: string): void {
  const currentEmail = localStorage.getItem("user_email");
  const currentPhone = localStorage.getItem("user_phone");
  const currentName = localStorage.getItem("user_name");

  const accounts = getRegisteredAccounts();
  const acc = accounts.find(
    (a) =>
      (currentEmail && a.email && a.email.toLowerCase() === currentEmail.toLowerCase()) ||
      (currentPhone && a.phone && a.phone.replaceAll(" ", "") === currentPhone.replaceAll(" ", "")) ||
      (currentName && a.name === currentName)
  );

  if (acc) {
    acc.onboardingCompleted = true;
    if (farmName) acc.farmName = farmName;
    saveRegisteredAccounts(accounts);
  }
  localStorage.setItem("user_onboarding_completed", "true");
}

export function deleteAccountById(id: string): void {
  const accounts = getRegisteredAccounts().filter((a) => a.id !== id);
  saveRegisteredAccounts(accounts);
}
