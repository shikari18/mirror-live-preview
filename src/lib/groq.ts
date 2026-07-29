// groq.ts — thin wrapper, actual logic is in gemini.ts (unified AI engine)
import { callGemini, setGroqKey, MediaAttachment } from "./gemini";

// Load Groq key from env if available
const envGroqKey = import.meta.env.VITE_GROQ_API_KEY || "";
if (envGroqKey) setGroqKey(envGroqKey);

export async function callGroqAI(
  prompt: string,
  systemInstruction?: string,
  mediaAttachments?: MediaAttachment[],
  _farmContext?: string
): Promise<string> {
  return callGemini(prompt, systemInstruction, mediaAttachments);
}
