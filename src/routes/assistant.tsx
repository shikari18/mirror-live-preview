import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Mic, Send, Video, VideoOff, MicOff, PhoneOff, Sparkles, Loader2, MessageSquare, Globe, Headphones, Play } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import { getAIAssistantResponse, getAIVideoCallResponse } from "@/lib/gemini";
import { useLanguage } from "@/lib/languageContext";

export const Route = createFileRoute("/assistant")({
  component: AssistantPage,
  head: () => ({
    meta: [
      { title: "AI Assistant & Video Call — FishFarm OS Ghana" },
      { name: "description", content: "Voice & Video AI Fish Farming Consultant powered by Gemini 2.5." },
    ],
  }),
});

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  time: string;
}

export function AssistantPage() {
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "ai",
      text: `Akwaaba! I am Kofi, your Gemini AI Fish Farming Advisor. How can I help with your Catfish or Tilapia today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [videoCallText, setVideoCallText] = useState("");
  const [videoCallHistory, setVideoCallHistory] = useState<string[]>([
    "Dr. Kwame: 'Hello! I am Dr. Kwame, your virtual fish health consultant. How are your fish doing today?'"
  ]);
  const [isCallMuted, setIsCallMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const aiReply = await getAIAssistantResponse(query, language);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: aiReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoSpeak = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoCallText.trim() || videoLoading) return;

    const userSpeech = videoCallText;
    setVideoCallHistory((prev) => [...prev, `You: "${userSpeech}"`]);
    setVideoCallText("");
    setVideoLoading(true);

    try {
      const response = await getAIVideoCallResponse(userSpeech, language);
      setVideoCallHistory((prev) => [...prev, `Dr. Kwame: "${response}"`]);
    } catch (err) {
      console.error(err);
    } finally {
      setVideoLoading(false);
    }
  };

  return (
    <PhoneFrame>
      {/* Header */}
      <header className="px-5 pt-6 pb-3 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0F6236] text-white flex items-center justify-center font-bold text-lg">
            K
          </div>
          <div>
            <h1 className="text-base font-extrabold text-gray-900 flex items-center gap-1.5">
              {t("aiAssistant")} (Kofi)
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </h1>
            <p className="text-xs text-gray-500 font-medium">Powered by Gemini 2.5 Flash • {language}</p>
          </div>
        </div>

        {/* Video Call Trigger Button */}
        <button
          onClick={() => setIsVideoCallOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0F6236] text-white text-xs font-bold shadow-md shadow-[#0F6236]/20 hover:bg-[#0B502B] transition-all cursor-pointer"
        >
          <Video className="w-4 h-4" /> Live AI Video Call
        </button>
      </header>

      {/* Chat Messages List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#F8FAF8] min-h-[460px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                msg.sender === "user"
                  ? "bg-[#0F6236] text-white font-medium rounded-br-none shadow-xs"
                  : "bg-white text-gray-800 border border-gray-200/80 rounded-bl-none shadow-xs"
              }`}
            >
              {msg.sender === "ai" && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-[#0F6236] mb-1">
                  <Sparkles className="w-3 h-3" /> Kofi AI
                </div>
              )}
              {msg.text}
            </div>
            <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.time}</span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-[#0F6236] font-bold bg-white p-3 rounded-2xl border border-gray-200 w-fit">
            <Loader2 className="w-4 h-4 animate-spin" /> Kofi is thinking with Gemini...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggested Questions */}
      <div className="px-4 py-2 bg-white border-t border-gray-100 flex gap-2 overflow-x-auto">
        {[
          "Best feed for 1kg Catfish?",
          "How to test pH level?",
          "Why is fish gasping?",
          "Market price in Kumasi?",
        ].map((q) => (
          <button
            key={q}
            onClick={() => handleSend(q)}
            className="shrink-0 text-[11px] font-semibold text-[#0F6236] bg-[#0F6236]/10 px-3 py-1.5 rounded-full hover:bg-[#0F6236]/20 transition-all cursor-pointer"
          >
            💬 {q}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={`Ask Kofi in ${language}...`}
          className="flex-1 h-12 bg-gray-50 border border-gray-200 rounded-full px-4 text-xs font-medium outline-none focus:ring-2 focus:ring-[#0F6236]/20"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="w-12 h-12 rounded-full bg-[#0F6236] text-white flex items-center justify-center shadow-md shadow-[#0F6236]/20 disabled:opacity-50 cursor-pointer shrink-0"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* Interactive AI Video Call Modal */}
      {isVideoCallOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between items-center p-4 animate-in fade-in">
          
          {/* Top Call Info */}
          <div className="w-full flex items-center justify-between text-white z-10 pt-4 px-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <div>
                <h3 className="font-bold text-sm">Dr. Kwame (AI Consultant)</h3>
                <p className="text-[10px] text-gray-300">Live Video Consultation • Gemini 2.5</p>
              </div>
            </div>
            <button
              onClick={() => setIsVideoCallOpen(false)}
              className="p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-full"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>

          {/* Video Feeds Container */}
          <div className="w-full max-w-sm flex-1 my-4 relative rounded-3xl overflow-hidden bg-gray-900 border border-gray-800 flex flex-col justify-between p-4 shadow-2xl">
            
            {/* Dr. Kwame Main Video Simulation */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 via-[#0F6236]/40 to-gray-950">
              <div className="w-28 h-28 rounded-full bg-[#0F6236] border-4 border-white/20 flex items-center justify-center text-white text-3xl font-extrabold shadow-2xl animate-pulse">
                Dr. K
              </div>
              <p className="text-white text-sm font-bold mt-3">Dr. Kwame • Aquatic Specialist</p>
              <p className="text-emerald-400 text-xs mt-0.5">Listening & Responding Live</p>
            </div>

            {/* User Camera Preview (Top Right) */}
            <div className="absolute top-4 right-4 w-24 h-32 rounded-2xl bg-gray-800 border-2 border-white/20 overflow-hidden shadow-lg flex items-center justify-center text-white text-xs">
              {isCameraOff ? (
                <VideoOff className="w-6 h-6 text-gray-500" />
              ) : (
                <img src={farmerImg} alt="User Camera" className="w-full h-full object-cover" />
              )}
            </div>

            {/* Video Call Subtitles / Dialogue */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-white text-xs space-y-1.5 max-h-36 overflow-y-auto z-10">
              {videoCallHistory.map((line, idx) => (
                <p key={idx} className={line.startsWith("Dr. Kwame") ? "text-emerald-300 font-semibold" : "text-gray-200"}>
                  {line}
                </p>
              ))}
              {videoLoading && <p className="text-yellow-400 animate-pulse font-bold">Dr. Kwame is answering...</p>}
            </div>
          </div>

          {/* Video Controls & Speech Input */}
          <div className="w-full max-w-sm space-y-3 z-10 pb-4">
            <form onSubmit={handleVideoSpeak} className="flex gap-2">
              <input
                type="text"
                value={videoCallText}
                onChange={(e) => setVideoCallText(e.target.value)}
                placeholder="Speak or type to Dr. Kwame..."
                className="flex-1 h-12 bg-gray-900 border border-gray-700 text-white px-4 rounded-full text-xs outline-none focus:ring-2 focus:ring-[#0F6236]"
              />
              <button
                type="submit"
                disabled={videoLoading}
                className="w-12 h-12 rounded-full bg-[#0F6236] text-white flex items-center justify-center font-bold"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setIsCallMuted(!isCallMuted)}
                className={`p-3.5 rounded-full ${isCallMuted ? "bg-red-600 text-white" : "bg-gray-800 text-white"}`}
              >
                {isCallMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsCameraOff(!isCameraOff)}
                className={`p-3.5 rounded-full ${isCameraOff ? "bg-red-600 text-white" : "bg-gray-800 text-white"}`}
              >
                {isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsVideoCallOpen(false)}
                className="p-3.5 rounded-full bg-red-600 text-white shadow-lg"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </PhoneFrame>
  );
}
