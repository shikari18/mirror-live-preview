import { getUnifiedMemoryPrompt } from "./farmMemory";

export interface MediaAttachment {
  mimeType: string;
  data: string; // Base64 or URL
}

// ─── Key Management ────────────────────────────────────────────────────────────

const getGeminiKey = (): string => {
  if (import.meta.env.VITE_GEMINI_API_KEY) return import.meta.env.VITE_GEMINI_API_KEY;
  // Embedded key (base64 encoded)
  try { return atob("QVEuQWI4Uk42SWQ4aEhRRGVQSFFOT19xMzZyNVEtMnYzZmduaDZyQUtudG9HTExadEcxNFE="); } catch { return ""; }
};

const getGroqKey = (): string => {
  if (import.meta.env.VITE_GROQ_API_KEY) return import.meta.env.VITE_GROQ_API_KEY;
  // Embedded Groq key (updated by user)
  const enc = (window as any).__GROQ_KEY__ || "";
  return enc;
};

export function setGeminiKey(key: string) { (window as any).__GEMINI_KEY__ = key; }
export function setGroqKey(key: string) { (window as any).__GROQ_KEY__ = key; }

// ─── Groq Engine (text + vision via llama) ─────────────────────────────────────

async function callGroqEngine(
  prompt: string,
  systemInstruction?: string,
  mediaAttachments?: MediaAttachment[],
  farmContext?: string
): Promise<string> {
  const apiKey = getGroqKey();
  if (!apiKey) throw new Error("No Groq key");

  const system = [
    "You are the official FISH DOCTOR AI — an elite aquatic veterinarian for Ghana fish farmers.",
    systemInstruction,
    farmContext ? `[FARM MEMORY]:\n${farmContext}` : ""
  ].filter(Boolean).join("\n\n");

  const hasImages = mediaAttachments && mediaAttachments.length > 0;
  const MODELS = hasImages
    ? ["llama-3.2-11b-vision-preview", "llama-3.2-90b-vision-preview"]
    : ["llama-3.1-8b-instant", "llama-3.3-70b-versatile", "mixtral-8x7b-32768"];

  for (const model of MODELS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      let userContent: any;
      if (hasImages) {
        const parts: any[] = [{ type: "text", text: prompt }];
        for (const m of mediaAttachments!) {
          const dataUrl = m.data.startsWith("data:") ? m.data : `data:${m.mimeType};base64,${m.data}`;
          parts.push({ type: "image_url", image_url: { url: dataUrl } });
        }
        userContent = parts;
      } else {
        userContent = prompt;
      }

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: userContent }
          ],
          temperature: 0.4,
          max_tokens: 800,
        }),
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const e = await response.json().catch(() => ({}));
        console.warn(`Groq ${model} failed ${response.status}:`, e);
        continue;
      }
      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content;
      if (text?.trim()) return text.trim();
    } catch (err: any) {
      if (err?.name === "AbortError") { console.warn(`Groq ${model} timed out`); continue; }
      console.warn(`Groq ${model} error:`, err);
      continue;
    }
  }
  throw new Error("All Groq models failed");
}

// ─── Gemini Engine (text + vision) ─────────────────────────────────────────────

async function callGeminiEngine(
  prompt: string,
  systemInstruction?: string,
  mediaAttachments?: MediaAttachment[],
  farmContext?: string
): Promise<string> {
  const apiKey = getGeminiKey();
  if (!apiKey) throw new Error("No Gemini key");

  const system = [
    "You are the official FISH DOCTOR AI — an elite aquatic veterinarian for Ghana fish farmers.",
    systemInstruction,
    farmContext ? `[FARM MEMORY]:\n${farmContext}` : ""
  ].filter(Boolean).join("\n\n");

  const parts: any[] = [];
  if (mediaAttachments?.length) {
    for (const m of mediaAttachments) {
      let base64 = m.data;
      let mime = m.mimeType || "image/jpeg";
      if (base64.startsWith("data:")) {
        const match = base64.match(/^data:([^;]+);base64,(.+)$/);
        if (match) { mime = match[1]; base64 = match[2]; }
      }
      parts.push({ inline_data: { mime_type: mime, data: base64 } });
    }
  }
  parts.push({ text: prompt });

  const body = {
    system_instruction: { parts: [{ text: system }] },
    contents: [{ role: "user", parts }],
    generationConfig: { temperature: 0.4, maxOutputTokens: 800 }
  };

  const MODELS = ["gemini-2.0-flash", "gemini-2.0-flash-lite"];

  for (const model of MODELS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: controller.signal }
      );
      clearTimeout(timeoutId);
      if (response.status === 429 || response.status === 503 || response.status === 404) {
        console.warn(`Gemini ${model} unavailable (${response.status})`); continue;
      }
      if (!response.ok) throw new Error(`Gemini ${response.status}`);
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text?.trim()) return text.trim();
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err?.name === "AbortError") { continue; }
      throw err;
    }
  }
  throw new Error("All Gemini models exhausted");
}

// ─── Unified AI call — tries Groq first, falls back to Gemini ─────────────────

async function callAI(
  prompt: string,
  systemInstruction?: string,
  mediaAttachments?: MediaAttachment[],
  farmContext?: string
): Promise<string> {
  // Try Groq first (faster, free)
  const groqKey = getGroqKey();
  if (groqKey) {
    try {
      return await callGroqEngine(prompt, systemInstruction, mediaAttachments, farmContext);
    } catch (err) {
      console.warn("Groq failed, falling back to Gemini:", err);
    }
  }

  // Fall back to Gemini
  try {
    return await callGeminiEngine(prompt, systemInstruction, mediaAttachments, farmContext);
  } catch (err) {
    console.warn("Gemini also failed:", err);
  }

  // Ultimate hardcoded fallback
  return "Fish Doctor AI is temporarily unavailable. For urgent issues: perform a 25-30% water exchange, ensure aerators are running, and apply 2kg aquaculture salt per 1,000L. Check internet connection and try again.";
}

// ─── Public API ────────────────────────────────────────────────────────────────

export async function callGemini(
  prompt: string,
  systemInstruction?: string,
  mediaAttachments?: MediaAttachment[]
): Promise<string> {
  return callAI(prompt, systemInstruction, mediaAttachments, getUnifiedMemoryPrompt());
}

export async function getGeminiLiveVoiceAudio(text: string, targetLanguage: string = "English"): Promise<string | null> {
  const cleanText = text.replace(/[#*`_]/g, "").trim();
  if (!cleanText) return null;
  const isTwi = targetLanguage.toLowerCase().includes("twi") || targetLanguage.toLowerCase().includes("akan");
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = isTwi ? "en-GH" : targetLanguage === "French" ? "fr-FR" : "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch (e) { console.warn("TTS error:", e); }
  }
  return null;
}

export async function getAIAssistantResponse(
  userMessage: string,
  language: string = "English",
  mediaAttachments?: MediaAttachment[],
  userLocationInfo?: { coords?: string; city?: string; weather?: string; time?: string }
): Promise<string> {
  const currentTime = userLocationInfo?.time || new Date().toLocaleString();
  const location = userLocationInfo?.city || "Ghana";
  const weather = userLocationInfo?.weather || "29°C Tropical";
  const isTwi = language.toLowerCase().includes("twi") || language.toLowerCase().includes("akan");

  const langDirective = isTwi
    ? "CRITICAL: Respond ENTIRELY in authentic Akan Twi (Asante Twi). No English at all."
    : language !== "English"
    ? `CRITICAL: Respond ENTIRELY in ${language}.`
    : "Respond in clear English.";

  const system = `You are the FISH DOCTOR AI — elite aquatic vet & pond engineer for Ghana.
Time: ${currentTime} | Location: ${location} | Weather: ${weather}
${langDirective}
Use markdown (### headers, - bullets). Be concise and actionable.`;

  try {
    return await callAI(userMessage, system, mediaAttachments, getUnifiedMemoryPrompt());
  } catch {
    if (isTwi) return "Meyɛ wo Fish Doctor AI. Fa me nsɛm kyerɛ me wɔ wo nsuo mu nam ho asiansunam.";
    return "Fish Doctor AI is ready! Please check your internet connection and try again.";
  }
}

export async function diagnoseFishDiseaseAI(
  symptoms: string,
  mediaAttachments?: MediaAttachment[]
): Promise<{
  diseaseName: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  cause: string;
  treatment: string[];
  prevention: string[];
  recommendedMedicine: string;
}> {
  const system = `You are an expert Fish Disease Diagnostician for Ghana aquaculture.
Analyze symptoms and attached images. Look for: white spots, fin rot, lesions, bloating, abnormal behavior.
If image shows healthy fish, return diseaseName "Healthy Fish" with severity "Low".
RESPOND ONLY with valid JSON — no extra text before or after:
{"diseaseName":"...","severity":"Low|Medium|High|Critical","cause":"...","treatment":["..."],"prevention":["..."],"recommendedMedicine":"..."}`;

  try {
    const raw = await callAI(
      `Diagnose fish health: "${symptoms}"${mediaAttachments?.length ? " (image attached)" : ""}`,
      system,
      mediaAttachments,
      getUnifiedMemoryPrompt()
    );
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      const p = JSON.parse(match[0]);
      if (p.diseaseName && p.cause) return {
        diseaseName: p.diseaseName,
        severity: p.severity || "Medium",
        cause: p.cause,
        treatment: Array.isArray(p.treatment) ? p.treatment : [p.treatment],
        prevention: Array.isArray(p.prevention) ? p.prevention : [p.prevention],
        recommendedMedicine: p.recommendedMedicine || "Consult local aquaculture supplier"
      };
    }
  } catch (err) {
    console.error("Diagnosis error:", err);
  }

  return {
    diseaseName: "Environmental Stress / Water Quality Issue",
    severity: "Medium",
    cause: `Based on: "${symptoms}" — fish show signs of environmental stress. Check water parameters immediately.`,
    treatment: [
      "Perform 25-30% fresh water exchange immediately.",
      "Run aerators continuously for 24 hours.",
      "Apply 2kg aquaculture salt per 1,000L of water."
    ],
    prevention: [
      "Test pH, dissolved oxygen and ammonia daily.",
      "Remove uneaten feed within 30 minutes."
    ],
    recommendedMedicine: "Aquaculture Salt & Oxytetracycline (consult local supplier)"
  };
}

export async function evaluateWaterQualityAI(params: {
  temp: number; ph: number; doMg: number; ammonia: number; clarityCm: number;
}): Promise<{ overallStatus: "Optimal" | "Warning" | "Critical"; score: number; issues: string[]; recommendations: string[] }> {
  try {
    const raw = await callAI(
      `Evaluate pond: Temp=${params.temp}°C, pH=${params.ph}, DO=${params.doMg}mg/L, Ammonia=${params.ammonia}mg/L, Clarity=${params.clarityCm}cm. Return JSON only: {"overallStatus":"Optimal","score":85,"issues":[],"recommendations":[]}`,
      "You are a Water Quality Specialist. Respond ONLY with valid JSON."
    );
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
  } catch (e) { console.warn("WQ AI fallback", e); }

  let status: "Optimal" | "Warning" | "Critical" = "Optimal";
  let score = 90;
  const issues: string[] = [];
  const recs: string[] = [];
  if (params.doMg < 4.0) { status = "Critical"; score -= 30; issues.push("Dissolved Oxygen critically low"); recs.push("Activate aerators immediately"); }
  if (params.ammonia > 0.5) { if (status !== "Critical") status = "Warning"; score -= 20; issues.push("Ammonia elevated"); recs.push("Reduce feeding by 50%"); }
  if (params.ph < 6.5 || params.ph > 9.0) { if (status !== "Critical") status = "Warning"; score -= 15; issues.push(`pH out of safe range (${params.ph})`); recs.push("Apply lime to adjust pH"); }
  return { overallStatus: status, score: Math.max(score, 20), issues: issues.length ? issues : ["All parameters within normal range"], recommendations: recs.length ? recs : ["Maintain current management practices"] };
}

export async function getAIVideoCallResponse(userTranscript: string): Promise<string> {
  if (!userTranscript?.trim()) return "I'm watching your pond. What symptoms do you see?";
  try { return await callAI(userTranscript, "You are a Fish Doctor on live video call. 1-2 sentences max."); } catch { return "Please describe the main symptom you are concerned about."; }
}
