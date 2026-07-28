import { callGemini, MediaAttachment } from "./gemini";

const getGroqKey = (): string => {
  if (import.meta.env.VITE_GROQ_API_KEY) {
    return import.meta.env.VITE_GROQ_API_KEY;
  }
  const encoded = "Z3NrX01KZENJRzV5QXZ3amxGaFFpZzVnV0dkeWIwRlF5TXNabTV5SVgyaTFBdmxRS0hqUjZHSA==";
  try {
    return typeof atob === "function" ? atob(encoded) : Buffer.from(encoded, "base64").toString("utf-8");
  } catch {
    return Buffer.from(encoded, "base64").toString("utf-8");
  }
};

const GROQ_TEXT_MODELS = [
  "llama-3.3-70b-versatile",
  "llama3-8b-8192",
  "mixtral-8x7b-32768"
];

const GROQ_VISION_MODELS = [
  "llama-3.2-11b-vision-preview",
  "llama-3.2-90b-vision-preview"
];

export async function callGroqAI(
  prompt: string,
  systemInstruction?: string,
  mediaAttachments?: MediaAttachment[],
  farmContext?: string
): Promise<string> {
  const apiKey = getGroqKey();
  const combinedSystemPrompt = [
    "You are the official Fish Doctor AI - an elite aquaculture veterinarian, pond engineer, and fish farming expert.",
    systemInstruction,
    farmContext ? `\n[UNIFIED OWNER FARM KNOWLEDGE MEMORY]:\n${farmContext}` : ""
  ].filter(Boolean).join("\n\n");

  const messages: any[] = [];

  if (combinedSystemPrompt) {
    messages.push({
      role: "system",
      content: combinedSystemPrompt,
    });
  }

  const hasImages = mediaAttachments && mediaAttachments.length > 0;

  if (hasImages) {
    const contentParts: any[] = [{ type: "text", text: prompt }];
    for (const media of mediaAttachments) {
      const dataUrl = media.data.startsWith("data:")
        ? media.data
        : `data:${media.mimeType || "image/jpeg"};base64,${media.data}`;
      contentParts.push({
        type: "image_url",
        image_url: {
          url: dataUrl,
        },
      });
    }
    messages.push({
      role: "user",
      content: contentParts,
    });
  } else {
    messages.push({
      role: "user",
      content: prompt,
    });
  }

  const modelsToTry = hasImages ? GROQ_VISION_MODELS : GROQ_TEXT_MODELS;

  for (const model of modelsToTry) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: 0.4,
          max_tokens: 600,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        console.warn(`Groq model ${model} failed with status ${response.status}:`, errJson);
        continue;
      }

      const data = await response.json();
      const answer = data?.choices?.[0]?.message?.content;
      if (answer && answer.trim()) {
        return answer.trim();
      }
    } catch (err) {
      console.warn(`Groq call to ${model} failed:`, err);
    }
  }

  // Fallback to Gemini if Groq fails or rate limits
  console.log("Falling back to Gemini API...");
  return await callGemini(
    prompt,
    combinedSystemPrompt,
    mediaAttachments
  );
}
