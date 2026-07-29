import { callGemini, setGeminiKey, MediaAttachment } from "./gemini";

// Decode and register the Gemini key at module load time
// Replace the value below with your new key from https://aistudio.google.com/apikey
const GEMINI_KEY_ENCODED = ""; // EMPTY - user must set VITE_GEMINI_API_KEY in environment

// Try to set from env var or encoded fallback
const envKey = import.meta.env.VITE_GEMINI_API_KEY || "";
if (envKey) {
  setGeminiKey(envKey);
}

export async function callGroqAI(
  prompt: string,
  systemInstruction?: string,
  mediaAttachments?: MediaAttachment[],
  farmContext?: string
): Promise<string> {
  // Delegate entirely to Gemini API
  try {
    const fullPrompt = farmContext
      ? `${prompt}\n\n[FARM CONTEXT]:\n${farmContext}`
      : prompt;
    return await callGemini(fullPrompt, systemInstruction, mediaAttachments);
  } catch (err) {
    console.error("callGroqAI -> Gemini failed:", err);

    // Ultimate fallback
    const isTwi = systemInstruction?.toLowerCase().includes("twi") || prompt.toLowerCase().includes("twi");
    if (isTwi) {
      return "Akwaaba! Meyɛ wo Fish Doctor AI. Fa w'asiansunam ho nsɛm kyerɛ me na mɛboa wo pɛ.";
    }
    return "Fish Doctor AI is ready to help. Please check your internet connection and try again. For urgent issues: perform a 25% water exchange, check dissolved oxygen levels, and ensure aerators are running.";
  }
}
