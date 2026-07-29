import { getUnifiedMemoryPrompt } from "./farmMemory";

export interface MediaAttachment {
  mimeType: string;
  data: string; // Base64 or URL
}

// ─── Gemini API Engine ─────────────────────────────────────────────────────────

const getGeminiKey = (): string => {
  // First check environment variable
  if (import.meta.env.VITE_GEMINI_API_KEY) {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }
  // Fallback embedded key (set via setGeminiKey at runtime)
  return (window as any).__GEMINI_KEY__ || "";
};

// Called from groq.ts after decoding key
export function setGeminiKey(key: string) {
  (window as any).__GEMINI_KEY__ = key;
}

async function callGeminiAPI(
  prompt: string,
  systemInstruction?: string,
  mediaAttachments?: MediaAttachment[],
  farmContext?: string
): Promise<string> {
  const apiKey = getGeminiKey();
  if (!apiKey) throw new Error("No Gemini API key configured");

  const combinedSystem = [
    "You are the official FISH DOCTOR AI — an elite aquatic veterinarian, fish health specialist, and pond engineer for Ghana and West Africa.",
    systemInstruction,
    farmContext ? `\n[FARM MEMORY]:\n${farmContext}` : ""
  ].filter(Boolean).join("\n\n");

  const parts: any[] = [];

  // Add images if present
  if (mediaAttachments && mediaAttachments.length > 0) {
    for (const media of mediaAttachments) {
      let base64Data = media.data;
      let mimeType = media.mimeType || "image/jpeg";

      // Strip data URL prefix if present
      if (base64Data.startsWith("data:")) {
        const match = base64Data.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          mimeType = match[1];
          base64Data = match[2];
        }
      }

      parts.push({
        inline_data: {
          mime_type: mimeType,
          data: base64Data,
        }
      });
    }
  }

  parts.push({ text: prompt });

  const body = {
    system_instruction: { parts: [{ text: combinedSystem }] },
    contents: [{ role: "user", parts }],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 800,
    }
  };

  // Use gemini-1.5-flash for text, gemini-1.5-flash for vision too (it supports both)
  const model = "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text().catch(() => "Unknown error");
      throw new Error(`Gemini API error ${response.status}: ${errText.slice(0, 200)}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text && text.trim()) return text.trim();
    throw new Error("Empty response from Gemini");
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─── Public callGemini wrapper ─────────────────────────────────────────────────

export async function callGemini(
  prompt: string,
  systemInstruction?: string,
  mediaAttachments?: MediaAttachment[]
): Promise<string> {
  const farmContext = getUnifiedMemoryPrompt();
  return callGeminiAPI(prompt, systemInstruction, mediaAttachments, farmContext);
}

// ─── TTS / Voice ───────────────────────────────────────────────────────────────

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
    } catch (e) {
      console.warn("Speech Synthesis warning:", e);
    }
  }
  return null;
}

// ─── AI Assistant (Chat) ───────────────────────────────────────────────────────

export async function getAIAssistantResponse(
  userMessage: string,
  language: string = "English",
  mediaAttachments?: MediaAttachment[],
  userLocationInfo?: { coords?: string; city?: string; weather?: string; time?: string }
): Promise<string> {
  const currentTime = userLocationInfo?.time || new Date().toLocaleString("en-US", { dateStyle: "full", timeStyle: "medium" });
  const locationText = userLocationInfo?.city || "Ghana Region";
  const weatherText = userLocationInfo?.weather || "29°C, Tropical Climate";
  const farmContext = getUnifiedMemoryPrompt();

  const isTwi = language.toLowerCase().includes("twi") || language.toLowerCase().includes("akan");
  const langDirective = isTwi
    ? "CRITICAL: Respond ENTIRELY in authentic Akan Twi. No English sentences at all."
    : language !== "English"
    ? `CRITICAL: Respond ENTIRELY in fluent ${language}.`
    : "Respond in clear professional English.";

  const systemPrompt = `You are the official FISH DOCTOR AI — an elite aquatic veterinarian and pond engineer serving Ghana fish farmers.

Context: Time=${currentTime}, Location=${locationText}, Weather=${weatherText}

${langDirective}

Format responses with markdown (### headers, - bullet points). Keep answers concise and actionable.`;

  try {
    return await callGeminiAPI(userMessage, systemPrompt, mediaAttachments, farmContext);
  } catch (err) {
    console.error("AI Assistant error:", err);
    if (isTwi) return "Meyɛ wo Fish Doctor AI. Hwɛ wo nsuo mu nhwehwɛmu na fa me nsɛm no bi. Me kwan no wɔ mu afei.";
    return "Fish Doctor AI is ready! Please check your internet connection and try again. I can help with fish diseases, feeding calculations, and water quality.";
  }
}

// ─── Fish Disease Diagnosis ────────────────────────────────────────────────────

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
  const farmContext = getUnifiedMemoryPrompt();
  const systemInstruction = `You are an expert Aquatic Veterinarian & Fish Doctor AI for Ghana.
Analyze symptoms and any attached images carefully.
If the image shows a healthy fish with no symptoms, return diseaseName "Healthy Fish / Optimal Condition" with severity "Low".

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "diseaseName": "Name of disease or condition",
  "severity": "Low",
  "cause": "Explanation of cause based on image or symptoms",
  "treatment": ["Step 1", "Step 2", "Step 3"],
  "prevention": ["Prevention tip 1", "Prevention tip 2"],
  "recommendedMedicine": "Medicine name available in Ghana"
}`;

  try {
    const rawText = await callGeminiAPI(
      `Diagnose this fish health issue: "${symptoms}". ${mediaAttachments?.length ? "An image has been attached - analyze it visually." : ""}`,
      systemInstruction,
      mediaAttachments,
      farmContext
    );

    // Extract JSON from response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.diseaseName && parsed.cause) {
        return {
          diseaseName: parsed.diseaseName,
          severity: parsed.severity || "Medium",
          cause: parsed.cause,
          treatment: Array.isArray(parsed.treatment) ? parsed.treatment : [parsed.treatment],
          prevention: Array.isArray(parsed.prevention) ? parsed.prevention : [parsed.prevention],
          recommendedMedicine: parsed.recommendedMedicine || "Consult local aquaculture supplier"
        };
      }
    }
    throw new Error("Could not parse diagnosis JSON");
  } catch (err) {
    console.error("Diagnosis error:", err);
    return {
      diseaseName: "Environmental Stress / Water Quality Issue",
      severity: "Medium",
      cause: `Based on your description: "${symptoms}" — fish are likely experiencing osmotic or oxygen stress. Please check water parameters immediately.`,
      treatment: [
        "Perform 25-30% fresh water exchange immediately.",
        "Run aerators continuously for 24 hours.",
        "Apply 2kg aquaculture salt per 1,000L of water."
      ],
      prevention: [
        "Test pH, dissolved oxygen and ammonia daily.",
        "Avoid overfeeding — remove uneaten feed after 30 minutes."
      ],
      recommendedMedicine: "Aquaculture Salt & Oxytetracycline (consult local supplier)"
    };
  }
}

// ─── Water Quality AI ──────────────────────────────────────────────────────────

export async function evaluateWaterQualityAI(params: {
  temp: number; ph: number; doMg: number; ammonia: number; clarityCm: number;
}): Promise<{
  overallStatus: "Optimal" | "Warning" | "Critical";
  score: number;
  issues: string[];
  recommendations: string[];
}> {
  try {
    const prompt = `Evaluate pond water: Temp=${params.temp}°C, pH=${params.ph}, DO=${params.doMg}mg/L, Ammonia=${params.ammonia}mg/L, Clarity=${params.clarityCm}cm.
Return ONLY valid JSON: {"overallStatus":"Optimal","score":85,"issues":["issue1"],"recommendations":["rec1"]}`;
    const raw = await callGeminiAPI(prompt, "You are a Senior Water Quality Specialist.");
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
  } catch (e) {
    console.warn("Water quality AI fallback", e);
  }

  // Local fallback
  let status: "Optimal" | "Warning" | "Critical" = "Optimal";
  let score = 90;
  const issues: string[] = [];
  const recommendations: string[] = [];
  if (params.doMg < 4.0) { status = "Critical"; score -= 30; issues.push("Dissolved Oxygen dangerously low (<4 mg/L)"); recommendations.push("Activate aerators immediately"); }
  if (params.ammonia > 0.5) { status = status === "Critical" ? "Critical" : "Warning"; score -= 20; issues.push("Ammonia elevated (>0.5 mg/L)"); recommendations.push("Reduce feeding by 50% for 24hrs"); }
  if (params.ph < 6.5 || params.ph > 9.0) { status = status === "Critical" ? "Critical" : "Warning"; score -= 15; issues.push(`pH out of range (${params.ph})`); recommendations.push("Apply lime to adjust pH"); }
  return { overallStatus: status, score: Math.max(score, 20), issues: issues.length ? issues : ["All parameters within acceptable range"], recommendations: recommendations.length ? recommendations : ["Maintain current water management practices"] };
}

// ─── Video Call AI ─────────────────────────────────────────────────────────────

export async function getAIVideoCallResponse(userTranscript: string): Promise<string> {
  if (!userTranscript?.trim()) return "I'm watching your fish pond. What symptoms or issues do you see?";
  try {
    return await callGeminiAPI(userTranscript, "You are a Fish Doctor on a live video call. Give a concise 1-2 sentence response.");
  } catch {
    return "I can see your fish pond. Please describe the main symptom you are concerned about.";
  }
}
