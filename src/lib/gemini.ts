import { getUnifiedMemoryPrompt } from "./farmMemory";
import { callGroqAI } from "./groq";

export interface MediaAttachment {
  mimeType: string;
  data: string; // Base64 or URL
}

export async function callGemini(
  prompt: string,
  systemInstruction?: string,
  mediaAttachments?: MediaAttachment[]
): Promise<string> {
  const farmMemoryPrompt = getUnifiedMemoryPrompt();
  return await callGroqAI(prompt, systemInstruction, mediaAttachments, farmMemoryPrompt);
}

export async function getGeminiLiveVoiceAudio(text: string, targetLanguage: string = "English"): Promise<string | null> {
  let cleanText = text.replace(/[#*`_]/g, "").trim();
  if (!cleanText) return null;

  const isTwi = targetLanguage.toLowerCase().includes("twi") || targetLanguage.toLowerCase().includes("akan");

  // In-browser Web Speech Synthesis execution for zero latency
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

export async function getAIAssistantResponse(
  userMessage: string,
  language: string = "English",
  mediaAttachments?: MediaAttachment[],
  userLocationInfo?: { coords?: string; city?: string; weather?: string; time?: string }
): Promise<string> {
  const currentTime = userLocationInfo?.time || new Date().toLocaleString("en-US", { dateStyle: "full", timeStyle: "medium" });
  const locationText = userLocationInfo?.city || userLocationInfo?.coords || "Ghana Region";
  const weatherText = userLocationInfo?.weather || "29°C, Tropical Climate";
  const farmMemoryPrompt = getUnifiedMemoryPrompt();

  const isTwi = language.toLowerCase().includes("twi") || language.toLowerCase().includes("akan");

  const languagePrompt = isTwi
    ? `CRITICAL LANGUAGE DIRECTIVE: The user wants their response ENTIRELY in authentic AKAN TWI (Asante Twi). DO NOT include any English sentences! Write EVERYTHING in natural Akan Twi (e.g., "Akwaaba! Meyɛ wo Fish Doctor AI. Wo nsuo foforo a wode gu mu no bɛma wo nsuo no aye kuro na nsuo no ho afi...").`
    : language && language !== "English"
    ? `CRITICAL LANGUAGE DIRECTIVE: The user selected ${language}. Respond ENTIRELY in fluent ${language}!`
    : `Respond in clear, professional English.`;

  const systemPrompt = `You are the official FISH DOCTOR AI — an elite aquatic veterinarian, fish health specialist, and pond engineer.
You assist farmers with BOTH fish health/diseases AND pond management/water quality/feed calculations.

REAL-TIME SYSTEM CONTEXT:
- Current Time & Date: ${currentTime}
- User Live Location: ${locationText}
- Weather: ${weatherText}

${languagePrompt}

FORMATTING RULES:
- Use clean markdown formatting (### Heading, - Bullet points).
- Keep response concise, direct, and actionable.`;

  return await callGroqAI(userMessage, systemPrompt, mediaAttachments, farmMemoryPrompt);
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
  const farmMemoryPrompt = getUnifiedMemoryPrompt();
  const systemInstruction = `You are an expert Aquatic Veterinarian & Fish Doctor.
Analyze the provided symptoms, attached images/videos, and farm memory context.
If an image is attached, inspect the fish closely for skin lesions, scale damage, fin rot, swelling, parasites, or clear health indicators.
If the fish/pond image looks completely healthy and free of symptoms, return diseaseName "Healthy Fish / Optimal Condition" with Low severity and state "All Good! Fish appears healthy." in cause and treatment.

Respond STRICTLY with a valid JSON object formatted EXACTLY as:
{
  "diseaseName": "Specific name of disease OR 'Healthy Fish / Optimal Condition'",
  "severity": "High" | "Medium" | "Low" | "Critical",
  "cause": "Detailed analysis of symptoms or visual observation from photo",
  "treatment": ["Treatment step 1", "Treatment step 2", "Treatment step 3"],
  "prevention": ["Prevention tip 1", "Prevention tip 2"],
  "recommendedMedicine": "Specific medicine or remedy available in Ghana (e.g. Oxytetracycline, Salt Dip, Formalin Bath, Oxygenation, None needed)"
}`;

  try {
    const rawText = await callGroqAI(`Analyze sick fish symptoms or photo: "${symptoms}".`, systemInstruction, mediaAttachments, farmMemoryPrompt);
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.diseaseName && parsed.cause) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Groq AI Diagnosis JSON parse failed, retrying...", err);
  }

  return {
    diseaseName: "Aquatic Health & Water Quality Diagnostic Assessment",
    severity: "Medium",
    cause: `Based on your description ("${symptoms}"), there are potential environmental stress factors affecting fish respiration or skin barrier.`,
    treatment: [
      "Conduct a 30-40% fresh water exchange immediately.",
      "Check dissolved oxygen levels and ensure continuous surface aeration.",
      "Apply 2kg aquaculture salt per 1000L to reduce osmotic stress."
    ],
    prevention: [
      "Maintain strict feeding schedules and avoid excess feed decomposition.",
      "Test pH, ammonia, and water clarity regularly."
    ],
    recommendedMedicine: "Aquaculture Salt Dip & Oxytetracycline"
  };
}

export async function evaluateWaterQualityAI(params: {
  temp: number;
  ph: number;
  doMg: number;
  ammonia: number;
  clarityCm: number;
}): Promise<{
  overallStatus: "Optimal" | "Warning" | "Critical";
  score: number;
  issues: string[];
  recommendations: string[];
}> {
  const prompt = `Water Quality Data: Temperature: ${params.temp}°C, pH: ${params.ph}, Dissolved Oxygen: ${params.doMg} mg/L, Ammonia: ${params.ammonia} mg/L, Secchi Clarity: ${params.clarityCm} cm.
Evaluate water quality and provide score (0-100), overallStatus ("Optimal"|"Warning"|"Critical"), issues list, and recommendations list.
Respond STRICTLY in JSON format:
{
  "overallStatus": "Optimal" | "Warning" | "Critical",
  "score": 85,
  "issues": ["Issue 1"],
  "recommendations": ["Recommendation 1"]
}`;

  try {
    const rawText = await callGroqAI(prompt, "You are a Senior Water Quality & Limnology Specialist.");
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.warn("Water quality AI fallback", e);
  }

  let status: "Optimal" | "Warning" | "Critical" = "Optimal";
  let score = 90;
  const issues: string[] = [];
  const recommendations: string[] = [];

  if (params.doMg < 4.0) {
    status = "Critical";
    score -= 30;
    issues.push("Dissolved Oxygen is dangerously low (< 4.0 mg/L).");
    recommendations.push("Turn on aerators immediately and do a 25% water exchange.");
  }
  if (params.ammonia > 0.5) {
    status = "Warning";
    score -= 20;
    issues.push("Ammonia level is elevated (> 0.5 mg/L).");
    recommendations.push("Reduce feed ration by 50% for 24 hours.");
  }

  return {
    overallStatus: status,
    score: Math.max(score, 30),
    issues: issues.length ? issues : ["All water parameters within healthy aquaculture limits."],
    recommendations: recommendations.length ? recommendations : ["Maintain regular feeding and testing schedules."]
  };
}

export async function getAIVideoCallResponse(userTranscript: string): Promise<string> {
  if (!userTranscript || !userTranscript.trim()) {
    return "I am observing your fish pond via live camera. What issue or fish symptoms do you see?";
  }
  return await callGroqAI(userTranscript, "You are an expert Fish Doctor conducting a live video call consultation. Keep responses under 2 sentences.");
}
