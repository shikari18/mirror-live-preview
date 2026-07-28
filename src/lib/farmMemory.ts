export interface PondRecord {
  id: string;
  name: string;
  type: string; // e.g. Earthen, Concrete, Tarpaulin, Cage
  widthMeters: number;
  lengthMeters: number;
  depthMeters: number;
  volumeLiters: number;
  fishCount: number;
  fishType: string;
  dateAdded: string;
  measuredViaCamera?: boolean;
}

export interface UserFarmProfile {
  name: string;
  phone: string;
  location: string;
  experienceLevel: string;
  targetWeightKg: number;
  ponds: PondRecord[];
  notes: string[];
}

const STORAGE_KEY = "fish_doctor_unified_farm_memory_v1";

const DEFAULT_PROFILE: UserFarmProfile = {
  name: "Aquaculture Farmer",
  phone: "+233 248785807",
  location: "Accra, Ghana",
  experienceLevel: "Intermediate",
  targetWeightKg: 1.2,
  ponds: [
    {
      id: "pond-1",
      name: "Main Concrete Pond 1",
      type: "Concrete",
      widthMeters: 5,
      lengthMeters: 8,
      depthMeters: 1.5,
      volumeLiters: 60000,
      fishCount: 1500,
      fishType: "Nile Tilapia",
      dateAdded: new Date().toISOString(),
      measuredViaCamera: false,
    },
    {
      id: "pond-2",
      name: "Tarpaulin Rearing Pond 2",
      type: "Tarpaulin",
      widthMeters: 4,
      lengthMeters: 4,
      depthMeters: 1.2,
      volumeLiters: 19200,
      fishCount: 800,
      fishType: "African Catfish",
      dateAdded: new Date().toISOString(),
      measuredViaCamera: false,
    }
  ],
  notes: [],
};

export function getFarmProfile(): UserFarmProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROFILE));
      return DEFAULT_PROFILE;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveFarmProfile(profile: UserFarmProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function addPondToMemory(pond: Omit<PondRecord, "id" | "dateAdded">): PondRecord {
  const profile = getFarmProfile();
  const newPond: PondRecord = {
    ...pond,
    id: `pond-${Date.now()}`,
    dateAdded: new Date().toISOString(),
  };
  profile.ponds.push(newPond);
  saveFarmProfile(profile);
  return newPond;
}

export function getUnifiedMemoryPrompt(): string {
  const profile = getFarmProfile();
  const totalFish = profile.ponds.reduce((acc, p) => acc + (p.fishCount || 0), 0);
  const totalVolume = profile.ponds.reduce((acc, p) => acc + (p.volumeLiters || 0), 0);

  let summary = `FARM OWNER: ${profile.name}\n`;
  summary += `LOCATION: ${profile.location}\n`;
  summary += `EXPERIENCE: ${profile.experienceLevel}\n`;
  summary += `TARGET HARVEST WEIGHT: ${profile.targetWeightKg} kg\n`;
  summary += `TOTAL PONDS: ${profile.ponds.length} ponds | TOTAL FISH STOCK: ${totalFish} fish | TOTAL WATER VOLUME: ${totalVolume.toLocaleString()} Liters\n\n`;

  summary += `DETAILED POND INVENTORY:\n`;
  profile.ponds.forEach((p, idx) => {
    summary += `${idx + 1}. [${p.name}] - Type: ${p.type} | Dimensions: ${p.widthMeters}m W x ${p.lengthMeters}m L x ${p.depthMeters}m D | Volume: ${p.volumeLiters.toLocaleString()} L | Stock: ${p.fishCount} ${p.fishType} ${p.measuredViaCamera ? "(Measured via AR Camera Scanner)" : ""}\n`;
  });

  return summary;
}
