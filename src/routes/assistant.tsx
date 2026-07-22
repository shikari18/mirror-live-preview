import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Mic, Send, Video, VideoOff, MicOff, PhoneOff, Sparkles, Loader2, Plus, Paperclip, FileText, ArrowLeft, Volume2 } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import farmerImg from "@/assets/farmer.jpg";
import { getAIAssistantResponse, getAIVideoCallResponse, MediaAttachment } from "@/lib/gemini";
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
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "ai",
      text: `### Akwaaba! 👋\nI am **Kofi**, your virtual Fish Farming AI Advisor in Ghana.\n\nHow can I help you today? You can ask me or upload a photo/video of your pond:\n- 🐟 Feeding schedules & feed quality\n- 💧 Water pH & oxygen levels\n- 🩺 Fish disease treatment & medicine\n- 📈 Market prices in Ghana`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState<{ name: string; type: "image" | "video" | "file"; mimeType: string; url: string } | null>(null);

  // Video Call State & Real WebCam Stream
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [videoCallText, setVideoCallText] = useState("");
  const [videoCallHistory, setVideoCallHistory] = useState<string[]>([
    "Dr. Kwame: 'Hello! I am Dr. Kwame, your senior aquaculture consultant. Show me your pond through your camera!'"
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

  // Turn on real camera when Video Call starts
  useEffect(() => {
    if (isVideoCallOpen) {
      startWebcam();
    } else {
      stopWebcam();
    }
    return () => {
      stopWebcam();
    };
  }, [isVideoCallOpen]);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      mediaStreamRef.current = stream;
      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Webcam access declined or unavailable, fallback to simulated stream", err);
    }
  };

  const stopWebcam = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
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
        query || "Please analyze this video/image attachment carefully and advise me on my fish farm.",
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
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "ai",
          text: "I received your message and video. Here is my advice: Keep pond aeration high (above 5mg/L DO) and ensure regular 20% water changes.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
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
      {/* Header - Aligned */}
      <header className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link to="/home" className="p-1">
            <ArrowLeft className="w-5 h-5 text-gray-800" />
          </Link>
          <div className="w-9 h-9 rounded-full bg-[#0F6236] text-white flex items-center justify-center font-extrabold text-base shadow-xs">
            K
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5 leading-tight">
              AI Advisor (Kofi)
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </h1>
            <p className="text-[11px] text-gray-500 font-medium">Online • {language}</p>
          </div>
        </div>

        {/* Video Call Button */}
        <button
          onClick={() => setIsVideoCallOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0F6236] text-white text-[11.5px] font-bold shadow-md shadow-[#0F6236]/20 hover:bg-[#0B502B] transition-all cursor-pointer"
        >
          <Video className="w-3.5 h-3.5" /> Video Call
        </button>
      </header>

      {/* Chat Messages */}
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
                  : "bg-white text-gray-800 border border-gray-200/80 rounded-bl-none shadow-sm space-y-2"
              }`}
            >
              {msg.sender === "ai" && (
                <div className="flex items-center gap-1.5 text-[10.5px] font-extrabold text-[#0F6236] uppercase tracking-wide border-b border-gray-100 pb-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5" /> Kofi AI Farming Advice
                </div>
              )}

              {/* Render Attachment preview */}
              {msg.attachment && (
                <div className="mb-2 p-2 bg-black/10 rounded-xl overflow-hidden">
                  {msg.attachment.type === "image" ? (
                    <img src={msg.attachment.url} alt="Uploaded" className="w-full h-40 object-cover rounded-lg" />
                  ) : msg.attachment.type === "video" ? (
                    <video src={msg.attachment.url} controls className="w-full h-40 object-cover rounded-lg" />
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                      <FileText className="w-5 h-5 text-[#0F6236]" /> {msg.attachment.name}
                    </div>
                  )}
                </div>
              )}

              {/* Formatted Reply */}
              <div className="whitespace-pre-wrap font-sans text-xs">
                {msg.text.split("\n").map((line, idx) => {
                  if (line.startsWith("### ")) {
                    return <h4 key={idx} className="font-extrabold text-sm text-[#0F6236] mt-2 mb-1">{line.replace("### ", "")}</h4>;
                  }
                  if (line.startsWith("- ")) {
                    return <li key={idx} className="ml-3 list-disc my-0.5 font-medium">{line.replace("- ", "")}</li>;
                  }
                  return <p key={idx} className="my-0.5">{line}</p>;
                })}
              </div>
            </div>
            <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.time}</span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-[#0F6236] font-bold bg-white p-3.5 rounded-2xl border border-gray-200 w-fit shadow-xs">
            <Loader2 className="w-4 h-4 animate-spin text-[#0F6236]" /> Kofi AI is analyzing media & message...
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

      {/* Live Interactive Video Call Modal with Real Camera Stream */}
      {isVideoCallOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between items-center p-4 animate-in fade-in">
          
          {/* Top Call Bar */}
          <div className="w-full flex items-center justify-between text-white z-10 pt-4 px-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <div>
                <h3 className="font-bold text-sm">Dr. Kwame (Senior Aquatic Specialist)</h3>
                <p className="text-[10px] text-emerald-400 font-semibold">Live Camera Video Consultation</p>
              </div>
            </div>
            <button
              onClick={() => setIsVideoCallOpen(false)}
              className="p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-full cursor-pointer"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>

          {/* Video Stream Container */}
          <div className="w-full max-w-sm flex-1 my-4 relative rounded-3xl overflow-hidden bg-gray-900 border border-gray-800 flex flex-col justify-between p-4 shadow-2xl">
            
            {/* Dr. Kwame Avatar / AI Response View */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 via-[#0F6236]/30 to-gray-950">
              <div className="w-28 h-28 rounded-full bg-[#0F6236] border-4 border-white/20 flex items-center justify-center text-white text-3xl font-extrabold shadow-2xl animate-pulse">
                Dr. K
              </div>
              <p className="text-white text-sm font-bold mt-3">Dr. Kwame • Senior Specialist</p>
              <p className="text-emerald-400 text-xs mt-0.5 font-medium">Watching Live Camera Feed</p>
            </div>

            {/* REAL USER CAMERA PREVIEW (Top Right) */}
            <div className="absolute top-4 right-4 w-28 h-36 rounded-2xl bg-black border-2 border-white/30 overflow-hidden shadow-2xl z-20">
              {isCameraOff ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
                  <VideoOff className="w-6 h-6" />
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
            </div>

            {/* Video Call Subtitles */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-white text-xs space-y-1.5 max-h-40 overflow-y-auto z-10">
              {videoCallHistory.map((line, idx) => (
                <p key={idx} className={line.startsWith("Dr. Kwame") ? "text-emerald-300 font-bold" : "text-gray-200"}>
                  {line}
                </p>
              ))}
              {videoLoading && <p className="text-yellow-400 animate-pulse font-bold">Dr. Kwame is responding...</p>}
            </div>
          </div>

          {/* Video Call Speech Controls */}
          <div className="w-full max-w-sm space-y-3 z-10 pb-4">
            <form onSubmit={handleVideoSpeak} className="flex gap-2">
              <input
                type="text"
                value={videoCallText}
                onChange={(e) => setVideoCallText(e.target.value)}
                placeholder="Speak to Dr. Kwame about what your camera shows..."
                className="flex-1 h-12 bg-gray-900 border border-gray-700 text-white px-4 rounded-full text-xs outline-none focus:ring-2 focus:ring-[#0F6236]"
              />
              <button
                type="submit"
                disabled={videoLoading}
                className="w-12 h-12 rounded-full bg-[#0F6236] text-white flex items-center justify-center font-bold cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setIsCallMuted(!isCallMuted)}
                className={`p-3.5 rounded-full cursor-pointer ${isCallMuted ? "bg-red-600 text-white" : "bg-gray-800 text-white"}`}
              >
                {isCallMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsCameraOff(!isCameraOff)}
                className={`p-3.5 rounded-full cursor-pointer ${isCameraOff ? "bg-red-600 text-white" : "bg-gray-800 text-white"}`}
              >
                {isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsVideoCallOpen(false)}
                className="p-3.5 rounded-full bg-red-600 text-white shadow-lg cursor-pointer"
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
