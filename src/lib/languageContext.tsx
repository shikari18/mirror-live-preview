import React, { createContext, useContext, useState, useEffect } from "react";

export type SupportedLanguage = "English" | "Twi" | "Ga" | "Ewe" | "Hausa";

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
}

const translations: Record<SupportedLanguage, Record<string, string>> = {
  English: {
    welcome: "Welcome to FishFarm OS",
    welcomeBack: "Welcome Back!",
    loginSubtitle: "Log in to continue your fish farming journey.",
    createAccount: "Create Account",
    signupSubtitle: "Join FishFarm OS to start your fish farming journey.",
    phoneNumber: "Phone Number",
    password: "Password",
    forgotPassword: "Forgot Password?",
    login: "Log In",
    signup: "Sign Up",
    continueGoogle: "Continue with Google",
    noAccount: "Don't have an account?",
    alreadyAccount: "Already have an account?",
    chooseLanguage: "Choose Language",
    settings: "Settings",
    aiAssistant: "AI Assistant",
    aiDoctor: "AI Fish Doctor",
    feedCalc: "Feed Calculator",
    waterQuality: "Water Quality",
    market: "Market Place",
    myFarm: "My Farm",
    profile: "Profile",
    skip: "Skip",
    continue: "Continue",
  },
  Twi: {
    welcome: "Akwaaba wo FishFarm OS",
    welcomeBack: "Akwaaba bio!",
    loginSubtitle: "Kɔ so wo nsuom nam yɛnsɛm mu.",
    createAccount: "Bɔ Akawnt Foforo",
    signupSubtitle: "Kɔm FishFarm OS na hyɛ aseɛ nsuom nam adwuma.",
    phoneNumber: "Ahomatrofi Nɔma",
    password: "Password / W'asumsem",
    forgotPassword: "Werɛ afi w'asumsem?",
    login: "Kɔ Mu",
    signup: "Bɔ Akawnt",
    continueGoogle: "Toa so ne Google",
    noAccount: "Wonie akawnt?",
    alreadyAccount: "Wɔn akawnt dada?",
    chooseLanguage: "Paw Kasa",
    settings: "Nsesae (Settings)",
    aiAssistant: "AI Mmoafoma Kofi",
    aiDoctor: "AI Nam Yarba Oduruyɛfo",
    feedCalc: "Aduane Buo",
    waterQuality: "Nsuo Papa Sɛnea",
    market: "Gua Mu",
    myFarm: "Me Nam Afuo",
    profile: "Me Ho Sɛm",
    skip: "Twa Mu (Skip)",
    continue: "Toa So",
  },
  Ga: {
    welcome: "Atuu kɛba FishFarm OS",
    welcomeBack: "Kɛba bio!",
    loginSubtitle: "Ya no kɛ o-loongɔɔ nitsumɔ lɛ.",
    createAccount: "Feemɔ Akawnt He",
    signupSubtitle: "Fata FishFarm OS he kɛ je shishi.",
    phoneNumber: "Fon Nɔmba",
    password: "Laamɔ wiemɔ",
    forgotPassword: "O-hiɛ kpa laamɔ wiemɔ lɛ nɔ?",
    login: "Bote Mli",
    signup: "Bɔ Akawnt",
    continueGoogle: "Kɛ Google ya no",
    noAccount: "Bɛ akawnt?",
    alreadyAccount: "Yɛ akawnt momo?",
    chooseLanguage: "Hala Wiemɔ",
    settings: "Settings",
    aiAssistant: "AI Yejelɔ Kofi",
    aiDoctor: "AI Loongɔɔ Tsofafeemɔ",
    feedCalc: "Niyenii Buu",
    waterQuality: "Nu Kpakpa",
    market: "Jra Mli",
    myFarm: "Mi Loongɔɔ Shie",
    profile: "Mi Sane",
    skip: "Gbee nɔ (Skip)",
    continue: "Ya No",
  },
  Ewe: {
    welcome: "Woezor de FishFarm OS",
    welcomeBack: "Woezor vava!",
    loginSubtitle: "Yi dzi le wo tomenya wo me.",
    createAccount: "Wɔ Akawnt Yeye",
    signupSubtitle: "Wɔ ɖeka kple FishFarm OS.",
    phoneNumber: "Ka Xɔme Nɔmba",
    password: "Gbeɖiɖi",
    forgotPassword: "Ŋku dzɔ le gbeɖiɖi zi?",
    login: "Ge Ɖe Eme",
    signup: "Wɔ Akawnt",
    continueGoogle: "Yi dzi kple Google",
    noAccount: "Mete ŋu wɔ akawnt o?",
    alreadyAccount: "Le akawnt xoxo?",
    chooseLanguage: "Tia Gbe",
    settings: "Settings",
    aiAssistant: "AI Kpekpeɖeŋutɔ Kofi",
    aiDoctor: "AI Akpa Dɔwɔla",
    feedCalc: "Nuɖuɖu Bubu",
    waterQuality: "Tsi Nyui",
    market: "Asi Me",
    myFarm: "Nye Akpa Agble",
    profile: "Nye Nya",
    skip: "Tso Eji (Skip)",
    continue: "Yi Dzi",
  },
  Hausa: {
    welcome: "Barka da zuwa FishFarm OS",
    welcomeBack: "Barka da sake zuwa!",
    loginSubtitle: "Shiga domin ci gaba da noman kifi.",
    createAccount: "Ƙirƙiri Asusu",
    signupSubtitle: "Kasance tare da FishFarm OS don farawa.",
    phoneNumber: "Lambar Waya",
    password: "Kalmar Sirri",
    forgotPassword: "Ka manta kalmar sirri?",
    login: "Shiga",
    signup: "Yi Rajista",
    continueGoogle: "Ci gaba da Google",
    noAccount: "Ba ka da asusu?",
    alreadyAccount: "Kana da asusu a baya?",
    chooseLanguage: "Zabi Harshe",
    settings: "Saituna",
    aiAssistant: "AI Mai Taimako Kofi",
    aiDoctor: "AI Likitan Kifi",
    feedCalc: "Lissafin Abincin Kifi",
    waterQuality: "Ingancin Ruwa",
    market: "Kasuwa",
    myFarm: "Gona Ta",
    profile: "Bayanai Na",
    skip: "Tsallake (Skip)",
    continue: "Ci Gaba",
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: "English",
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>("English");

  useEffect(() => {
    const savedLang = localStorage.getItem("app_language") as SupportedLanguage;
    if (savedLang && translations[savedLang]) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem("app_language", lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.English[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
