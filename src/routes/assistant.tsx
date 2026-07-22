import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Mic, Send, Video, VideoOff, MicOff, PhoneOff, Sparkles, Loader2, Plus, Paperclip, FileText, ArrowLeft, RefreshCw, Volume2, CheckCircle2 } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import { getAIAssistantResponse, getAIVideoCallResponse, translateToTwiAudioText, MediaAttachment } from "@/lib/gemini";
import { useLanguage } from "@/lib/languageContext";

export const Route = createFileRoute("/assistant")({
  component: AssistantPage,
  head: () => ({
    meta: [
      { title: "AI Assistant & Live Video Call — FishFarm OS Ghana" },
      { name: "description", content: "Voice & Video AI Fish Farming Consultant." },
    ],
  }),
});

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  attachment?: {
    name: string;
    type: "image" | "video" | "file";
    mimeType: string;
    url: string;
  };
  time: string;
}

export function AssistantPage() {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "ai",
      text: `### Fish Farming Advice\nHow can I help you today? You can ask a question or upload a photo/video:\n- 🐟 **Feeding schedules** & feed quality\n- 💧 **Water pH** & oxygen levels\n- 🩺 **Fish disease** treatment & medicine\n- 📈 **Market prices** in Ghana`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState<{ name: string; type: "image" | "video" | "file"; mimeType: string; url: string } | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  // Fullscreen Camera Video Call State
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("environment");
  const [videoCallText, setVideoCallText] = useState("");
  const [videoCallHistory, setVideoCallHistory] = useState<string[]>([
    "Dr. Kwame: 'Point your camera at your pond or fish and ask me your question.'"
  ]);
  const [isCallMuted, setIsCallMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const webcamVideoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isVideoCallOpen && !isCameraOff) {
      startWebcam(cameraFacing);
    } else {
      stopWebcam();
    }
    return () => {
      stopWebcam();
    };
  }, [isVideoCallOpen, cameraFacing, isCameraOff]);

  const startWebcam = async (facing: "user" | "environment") => {
    stopWebcam();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facing } },
        audio: true,
      });
      mediaStreamRef.current = stream;
      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Fallback camera constraints", err);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        mediaStreamRef.current = stream;
        if (webcamVideoRef.current) {
          webcamVideoRef.current.srcObject = stream;
        }
      } catch (e) {
        console.error("Camera access denied", e);
      }
    }
  };

  const stopWebcam = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const toggleCameraFacing = () => {
    setCameraFacing((prev) => (prev === "user" ? "environment" : "user"));
  };

  // Google Realistic Voice & Twi Speech Synthesis
  const speakText = async (text: string, msgId?: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      if (speakingMsgId === msgId && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setSpeakingMsgId(null);
        return;
      }

      window.speechSynthesis.cancel();
      if (msgId) setSpeakingMsgId(msgId);

      let textToSpeak = text;
      // If language in settings is Twi, translate to Twi for spoken audio!
      if (language === "Twi" || language.toLowerCase().includes("twi")) {
        try {
          textToSpeak = await translateToTwiAudioText(text);
        } catch (e) {
          console.warn("Twi translation error", e);
        }
      }

      const cleanText = textToSpeak.replace(/[#*`_]/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Select Google Realistic Voice or Natural Voice
      const voices = window.speechSynthesis.getVoices();
      const googleVoice = voices.find(
        (v) =>
          v.name.includes("Google") ||
          v.name.includes("Natural") ||
          v.name.includes("Premium") ||
          v.lang.includes("en-GH") ||
          v.lang.includes("ak-GH")
      );

      if (googleVoice) {
        utterance.voice = googleVoice;
      }

      utterance.rate = 0.92;
      utterance.pitch = 1.0;

      utterance.onend = () => setSpeakingMsgId(null);
      utterance.onerror = () => setSpeakingMsgId(null);

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const fileType = file.type.startsWith("image")
          ? "image"
          : file.type.startsWith("video")
          ? "video"
          : "file";

        setAttachment({
          name: file.name,
          type: fileType,
          mimeType: file.type || (fileType === "video" ? "video/mp4" : "image/jpeg"),
          url: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if ((!query.trim() && !attachment) || loading) return;

    let mediaList: MediaAttachment[] = [];
    if (attachment) {
      mediaList.push({
        mimeType: attachment.mimeType,
        data: attachment.url,
      });
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: query || (attachment ? `Uploaded ${attachment.type}: ${attachment.name}` : ""),
      attachment: attachment || undefined,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setAttachment(null);
    setLoading(true);

    try {
      const aiReply = await getAIAssistantResponse(
        query || "Analyze this attached media and give me step-by-step guidance for my fish farm.",
        language,
        mediaList
      );

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: aiReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error("AI Response Error:", err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: `⚠️ **Connection Error**: Unable to reach AI server. Please check your internet connection and tap send to try again.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
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
      setVideoCallHistory((prev) => [...prev, `Dr. Kwame: "Connection issue. Please repeat your question."`]);
    } finally {
      setVideoLoading(false);
    }
  };

  const parseInlineBold = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
        return (
          <strong key={i} className="font-extrabold text-gray-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <PhoneFrame>
      {/* Header */}
      <header className="px-5 pt-3 pb-3 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link to="/home" className="p-1 cursor-pointer">
            <ArrowLeft className="w-5 h-5 text-gray-800" />
          </Link>
          <div className="w-9 h-9 rounded-full bg-[#0F6236] text-white flex items-center justify-center font-extrabold text-base shadow-xs">
            K
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5 leading-tight">
              AI Advisor
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </h1>
            <p className="text-[11px] text-gray-500 font-medium">Online • Mode: {language}</p>
          </div>
        </div>

        {/* Video Call Button */}
        <button
          onClick={() => setIsVideoCallOpen(true)}
          className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#0F6236] text-white text-[11.5px] font-bold shadow-md shadow-[#0F6236]/20 hover:bg-[#0B502B] transition-all cursor-pointer"
        >
          <Video className="w-4 h-4" /> Live Video Call
        </button>
      </header>

      {/* Chat Messages List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#F8FAF8] min-h-[460px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[88%] p-4 rounded-2xl text-xs leading-relaxed ${
                msg.sender === "user"
                  ? "bg-[#0F6236] text-white font-medium rounded-br-none shadow-xs"
                  : "bg-white text-gray-900 border border-emerald-100/80 rounded-bl-none shadow-sm space-y-2"
              }`}
            >
              {msg.sender === "ai" && (
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#0F6236] uppercase tracking-wide border-b border-emerald-100 pb-2 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#0F6236]" /> AI Advice
                </div>
              )}

              {/* Render Attachment preview */}
              {msg.attachment && (
                <div className="mb-2 p-2 bg-black/10 rounded-xl overflow-hidden">
                  {msg.attachment.type === "image" ? (
                    <img src={msg.attachment.url} alt="Uploaded" className="w-full h-44 object-cover rounded-lg" />
                  ) : msg.attachment.type === "video" ? (
                    <video src={msg.attachment.url} controls className="w-full h-44 object-cover rounded-lg" />
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                      <FileText className="w-5 h-5 text-[#0F6236]" /> {msg.attachment.name}
                    </div>
                  )}
                </div>
              )}

              {/* Rich Styled AI Reply Content */}
              <div className="space-y-1.5">
                {msg.text.split("\n").map((line, idx) => {
                  if (line.startsWith("### ")) {
                    return (
                      <div key={idx} className="font-extrabold text-sm text-[#0F6236] pt-1 pb-0.5 border-b border-[#0F6236]/10 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0F6236]" /> {parseInlineBold(line.replace("### ", ""))}
                      </div>
                    );
                  }
                  if (line.startsWith("- ") || line.startsWith("* ")) {
                    const content = line.substring(2);
                    return (
                      <div key={idx} className="flex items-start gap-1.5 text-xs text-gray-800 pl-1 font-medium my-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0F6236] shrink-0 mt-0.5" />
                        <span>{parseInlineBold(content)}</span>
                      </div>
                    );
                  }
                  return <p key={idx} className="text-xs text-gray-800 font-medium my-0.5">{parseInlineBold(line)}</p>;
                })}
              </div>

              {/* Speaker Button at the END of AI Reply (Supports Twi Spoken Audio & Google Realistic Voice) */}
              {msg.sender === "ai" && (
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between mt-2">
                  <span className="text-[10px] text-gray-400 font-medium">{msg.time}</span>
                  <button
                    onClick={() => speakText(msg.text, msg.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                      speakingMsgId === msg.id
                        ? "bg-emerald-600 text-white animate-pulse"
                        : "bg-emerald-50 text-[#0F6236] hover:bg-emerald-100 border border-emerald-200"
                    }`}
                    title={language === "Twi" ? "Click to Listen in Twi" : "Click to Listen Voice"}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    {speakingMsgId === msg.id ? "Speaking..." : language === "Twi" ? "🔊 Listen in Twi" : "🔊 Listen Voice"}
                  </button>
                </div>
              )}
            </div>

            {msg.sender === "user" && (
              <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.time}</span>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-[#0F6236] font-bold bg-white p-3.5 rounded-2xl border border-gray-200 w-fit shadow-xs">
            <Loader2 className="w-4 h-4 animate-spin text-[#0F6236]" /> AI is analyzing media & question...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Preview Bar */}
      {attachment && (
        <div className="px-4 py-2 bg-emerald-50 border-t border-emerald-200 flex items-center justify-between text-xs font-bold text-emerald-800">
          <div className="flex items-center gap-2 truncate">
            <Paperclip className="w-4 h-4 text-[#0F6236]" /> Attached {attachment.type}: {attachment.name}
          </div>
          <button onClick={() => setAttachment(null)} className="text-red-500 font-bold px-1 cursor-pointer">✕</button>
        </div>
      )}

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

      {/* Input Bar with Plus (+) Upload Button */}
      <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-11 h-11 rounded-full bg-gray-100 hover:bg-[#0F6236]/10 text-gray-700 hover:text-[#0F6236] flex items-center justify-center font-extrabold text-xl shrink-0 transition-all cursor-pointer"
          title="Upload photo or video of your fish"
        >
          <Plus className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={`Ask AI Advisor in ${language}...`}
          className="flex-1 h-11 bg-gray-50 border border-gray-200 rounded-full px-4 text-xs font-medium outline-none focus:ring-2 focus:ring-[#0F6236]/20"
        />

        <button
          onClick={() => handleSend()}
          disabled={loading || (!input.trim() && !attachment)}
          className="w-11 h-11 rounded-full bg-[#0F6236] text-white flex items-center justify-center shadow-md shadow-[#0F6236]/20 disabled:opacity-50 cursor-pointer shrink-0"
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* FULLSCREEN REAL CAMERA LIVE VIDEO CALL MODAL */}
      {isVideoCallOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between items-center animate-in fade-in">
          
          {/* Real Camera Stream Background */}
          <div className="absolute inset-0 w-full h-full bg-gray-900 overflow-hidden">
            {isCameraOff ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-900">
                <VideoOff className="w-12 h-12 mb-2 text-gray-600" />
                <span className="text-xs font-bold">Camera Turned Off</span>
              </div>
            ) : (
              <video
                ref={webcamVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90 pointer-events-none" />
          </div>

          {/* Top Bar with Camera Switcher */}
          <div className="w-full flex items-center justify-between text-white z-20 pt-6 px-5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <div>
                <h3 className="font-extrabold text-sm text-white">Dr. Kwame (Senior Specialist)</h3>
                <p className="text-[11px] text-emerald-400 font-semibold">Live Camera Stream Active</p>
              </div>
            </div>

            {/* Switch Camera Button (Front / Back Camera) */}
            <button
              onClick={toggleCameraFacing}
              className="px-3.5 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold rounded-full flex items-center gap-1.5 cursor-pointer shadow-md"
              title="Switch Front / Back Camera"
            >
              <RefreshCw className="w-3.5 h-3.5" /> {cameraFacing === "environment" ? "Back Cam" : "Front Cam"}
            </button>
          </div>

          {/* Dr. Kwame Avatar Badge (Top Center) */}
          <div className="z-20 my-auto text-center">
            <div className="w-20 h-20 rounded-full bg-[#0F6236]/90 border-4 border-white/30 shadow-2xl flex items-center justify-center text-white text-2xl font-extrabold mx-auto animate-pulse">
              Dr. K
            </div>
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold border border-white/20">
              Dr. Kwame • Senior Consultant
            </span>
          </div>

          {/* Subtitles & Controls (Bottom) */}
          <div className="w-full max-w-md px-5 pb-6 space-y-3 z-20">
            {/* Live Subtitles Log */}
            <div className="bg-black/80 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-white text-xs space-y-1.5 max-h-36 overflow-y-auto">
              {videoCallHistory.map((line, idx) => (
                <p key={idx} className={line.startsWith("Dr. Kwame") ? "text-emerald-300 font-bold" : "text-gray-200 font-medium"}>
                  {line}
                </p>
              ))}
              {videoLoading && <p className="text-yellow-400 animate-pulse font-bold">Dr. Kwame is responding...</p>}
            </div>

            {/* Speech Input */}
            <form onSubmit={handleVideoSpeak} className="flex gap-2">
              <input
                type="text"
                value={videoCallText}
                onChange={(e) => setVideoCallText(e.target.value)}
                placeholder="Speak to Dr. Kwame about what your camera shows..."
                className="flex-1 h-12 bg-black/70 backdrop-blur-md border border-white/30 text-white px-4 rounded-full text-xs outline-none focus:ring-2 focus:ring-[#0F6236]"
              />
              <button
                type="submit"
                disabled={videoLoading}
                className="w-12 h-12 rounded-full bg-[#0F6236] text-white flex items-center justify-center font-bold cursor-pointer shrink-0 shadow-lg"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Action Buttons Bar */}
            <div className="flex justify-center items-center gap-5 pt-1">
              <button
                onClick={() => setIsCallMuted(!isCallMuted)}
                className={`p-3.5 rounded-full cursor-pointer transition-all ${isCallMuted ? "bg-red-600 text-white" : "bg-white/20 text-white hover:bg-white/30"}`}
              >
                {isCallMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              
              <button
                onClick={() => setIsCameraOff(!isCameraOff)}
                className={`p-3.5 rounded-full cursor-pointer transition-all ${isCameraOff ? "bg-red-600 text-white" : "bg-white/20 text-white hover:bg-white/30"}`}
              >
                {isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>

              <button
                onClick={toggleCameraFacing}
                className="p-3.5 rounded-full bg-white/20 text-white hover:bg-white/30 cursor-pointer"
                title="Switch Camera"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsVideoCallOpen(false)}
                className="p-4 rounded-full bg-red-600 text-white shadow-xl hover:bg-red-700 cursor-pointer"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </PhoneFrame>
  );
}
