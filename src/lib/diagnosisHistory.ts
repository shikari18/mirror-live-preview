import { DiagnosisResult } from "./gemini";

export interface SavedDiagnosis {
  id: string;
  timestamp: string;
  imageUrl?: string;
  pond?: string;
  result: DiagnosisResult;
}

const STORAGE_KEY = "fish_doctor_diagnosis_history";

export function getDiagnosisHistory(): SavedDiagnosis[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedDiagnosis[];
  } catch {
    return [];
  }
}

export function saveDiagnosis(diagnosis: Omit<SavedDiagnosis, "id" | "timestamp">): SavedDiagnosis {
  const history = getDiagnosisHistory();
  const record: SavedDiagnosis = {
    id: `dx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    ...diagnosis,
  };
  // Keep latest 50 results, newest first
  const updated = [record, ...history].slice(0, 50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return record;
}

export function deleteDiagnosis(id: string): void {
  const history = getDiagnosisHistory();
  const updated = history.filter((d) => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function clearAllDiagnoses(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function formatDiagnosisDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString("en-GH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
