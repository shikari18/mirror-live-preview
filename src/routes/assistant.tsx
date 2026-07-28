import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Mic, Send, Video, VideoOff, MicOff, PhoneOff, Loader2, Plus, Paperclip, FileText, ArrowLeft, RefreshCw, Volume2, MapPin, Download, Phone, MessageSquare, UserCheck, Stethoscope } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import { getAIAssistantResponse, getAIVideoCallResponse, getGeminiLiveVoiceAudio, MediaAttachment } from "@/lib/gemini";
import { useLanguage } from "@/lib/languageContext";

export const Route = createFileRoute("/assistant")({
  component: AssistantPage,
  head: () => ({
    meta: [
      { title: "Fish Doctor AI & Real-Life Extension Support" },
      { name: "description", content: "AI Aquatic Veterinarian & Real-Life On-Site Extension Assistant." },
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
  const [activeTab, setActiveTab] = useState<"ai_doctor" | "extension_support">("ai_doctor");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "ai",
      text: `### Fish Doctor AI\nWelcome! I am your official Fish Doctor AI. I assist with both fish health/diseases and pond engineering/water/feed calculations:\n- 🐟 Fish disease diagnosis & medicines\n- 💧 Pond sizing, water pH & oxygen\n- 📊 Feed calculation & weight targets\n- 👨‍🌾 Real-life on-site assistant dispatch`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState<{ name: string; type: "image" | "video" | "file"; mimeType: string; url: string } | null>(null);
  
  // Voice playback state
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const [voiceProgress, setVoiceProgress] = useState<string>("");

  // Extension support request form state
  const [farmerName, setFarmerName] = useState("");
  const [farmerPhone, setFarmerPhone] = useState("+233 248785807");
  const [farmLocation, setFarmLocation] = useState("");
  const [issueSummary, setIssueSummary] = useState("");
  const [requestSent, setRequestSent] = useState(false);

  // Location & Weather state
  const [userLocationInfo, setUserLocationInfo] = useState<{ coords?: string; city?: string; weather?: string; time?: string }>({
    city: "Accra, Ghana",
    weather: "29.5°C, Tropical Climate",
    time: new Date().toLocaleTimeString()
  });

  // Video Call State
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("environment");
  const [isListeningSpeech, setIsListeningSpeech] = useState(false);
  const [isCallMuted, setIsCallMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const webcamVideoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setUserLocationInfo({
            coords: `${lat.toFixed(3)}° N, ${lon.toFixed(3)}° W`,
            city: `GPS: ${lat.toFixed(2)}°, ${lon.toFixed(2)}° (Ghana)`,
            weather: `29.5°C, Sunny`,
            time: new Date().toLocaleTimeString()
          });
        },
        () => {}
      );
    }
  }, []);

  useEffect(() => {
    return () => {
      stopWebcam();
      stopSpeechRecognition();
      stopAudio();
    };
  }, []);

  useEffect(() => {
    if (isVideoCallOpen && !isCameraOff) {
      startWebcam(cameraFacing);
      startSpeechRecognition();
    } else {
      stopWebcam();
      stopSpeechRecognition();
      stopAudio();
    }
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
      console.warn("Camera fallback", err);
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

  const stopAudio = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      } catch (e) {}
      currentAudioRef.current = null;
    }
    setPlayingMsgId(null);
    setVoiceProgress("");
  };

  const playVoice = async (text: string, msgId?: string) => {
    if (msgId && playingMsgId === msgId) {
      stopAudio();
      return;
    }

    stopAudio();
    await new Promise((r) => setTimeout(r, 40));

    if (msgId) setPlayingMsgId(msgId);

    let pct = 20;
    setVoiceProgress(`Downloading Voice ${pct}%...`);
    
    progressIntervalRef.current = setInterval(() => {
      pct += Math.floor(Math.random() * 20) + 15;
      if (pct >= 95) pct = 95;
      setVoiceProgress(`Downloading Voice ${pct}%...`);
    }, 120);

    const audioUrl = await getGeminiLiveVoiceAudio(text, language);

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    if (audioUrl) {
      setVoiceProgress("Downloading Voice 100%!");
      try {
        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;

        audio.onplay = () => setVoiceProgress("Playing Voice...");
        audio.onended = () => stopAudio();
        audio.onerror = () => stopAudio();
        await audio.play();
        return;
      } catch (e) {
        console.warn("Audio play error", e);
      }
    }
    stopAudio();
  };

  const startSpeechRecognition = () => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => setIsListeningSpeech(true);
      recognition.onend = () => {
        setIsListeningSpeech(false);
        if (isVideoCallOpen) {
          try { recognition.start(); } catch (e) {}
        }
      };

      recognition.onresult = async (event: any) => {
        const lastIndex = event.results.length - 1;
        const spokenText = event.results[lastIndex][0].transcript;
        if (spokenText && spokenText.trim()) {
          handleUserVoiceInCall(spokenText.trim());
        }
      };

      try {
        recognition.start();
        recognitionRef.current = recognition;
      } catch (e) {}
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
    }
  };

  const handleUserVoiceInCall = async (userSpeech: string) => {
    if (isCallMuted || videoLoading) return;
    setVideoLoading(true);

    try {
      const response = await getAIVideoCallResponse(userSpeech, language);
      playVoice(response);
    } catch (err) {
      console.error(err);
    } finally {
      setVideoLoading(false);
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
        query || "Analyze my fish farm and give me step-by-step advice.",
        language,
        mediaList,
        userLocationInfo
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
        text: `⚠️ Unable to reach AI Fish Doctor. Please check internet connection.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const parseInlineBold = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
        return (
          <strong key={i} className="font-extrabold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const handleWhatsappClick = () => {
    const text = encodeURIComponent("hello, im messaging from the fish doctor app");
    window.open(`https://wa.me/233248785807?text=${text}`, "_blank");
  };

  const handleCallClick = () => {
    window.location.href = "tel:+233248785807";
  };

  const handleExtensionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRequestSent(true);
  };

  return (
    <PhoneFrame>
      {/* Header */}
      <header className="px-5 pt-3 pb-3 flex items-center justify-between border-b border-sky-100 bg-white sticky top-0 z-20 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link to="/home" className="p-1 cursor-pointer hover:bg-sky-50 rounded-full">
            <ArrowLeft className="w-5 h-5 text-slate-800" />
          </Link>
          <div className="w-9 h-9 rounded-full bg-[#0284C7] text-white flex items-center justify-center font-extrabold text-base shadow-xs">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 leading-tight">
              Fish Doctor AI
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
            </h1>
            <p className="text-[10.5px] text-slate-500 font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#0284C7] shrink-0" />
              <span className="truncate max-w-[140px]">{userLocationInfo.city}</span>
            </p>
          </div>
        </div>

        {/* Video Call Button */}
        <button
          onClick={() => setIsVideoCallOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0284C7] text-white text-[11px] font-bold shadow-md shadow-[#0284C7]/20 hover:bg-sky-600 transition-all cursor-pointer"
        >
          <Video className="w-3.5 h-3.5" /> Video Call
        </button>
      </header>

      {/* Navigation Switcher Tabs */}
      <div className="px-4 py-2 bg-sky-50/60 border-b border-sky-100 flex gap-2">
        <button
          onClick={() => setActiveTab("ai_doctor")}
          className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "ai_doctor"
              ? "bg-[#0284C7] text-white shadow-xs"
              : "bg-white text-slate-600 border border-sky-100"
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" /> AI Fish Doctor
        </button>
        <button
          onClick={() => setActiveTab("extension_support")}
          className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "extension_support"
              ? "bg-[#0284C7] text-white shadow-xs"
              : "bg-white text-slate-600 border border-sky-100"
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" /> Extension Support
        </button>
      </div>

      {activeTab === "ai_doctor" ? (
        <>
          {/* AI Chat Messages UI */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#F0F9FF] min-h-[460px]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-[#0284C7] text-white font-medium rounded-br-none shadow-xs"
                      : "bg-white text-slate-900 border border-sky-100 rounded-bl-none shadow-xs"
                  }`}
                >
                  {/* Attachment Preview */}
                  {msg.attachment && (
                    <div className="mb-2 p-1.5 bg-slate-100 rounded-xl overflow-hidden">
                      {msg.attachment.type === "image" ? (
                        <img src={msg.attachment.url} alt="Uploaded" className="w-full h-40 object-cover rounded-lg" />
                      ) : msg.attachment.type === "video" ? (
                        <video src={msg.attachment.url} controls className="w-full h-40 object-cover rounded-lg" />
                      ) : (
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                          <FileText className="w-5 h-5 text-[#0284C7]" /> {msg.attachment.name}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Text Content */}
                  <div className="space-y-1">
                    {msg.text.split("\n").map((line, idx) => {
                      if (line.startsWith("### ")) {
                        return (
                          <h4 key={idx} className="font-extrabold text-xs text-[#0284C7] pt-1 pb-0.5">
                            {parseInlineBold(line.replace("### ", ""))}
                          </h4>
                        );
                      }
                      if (line.startsWith("- ") || line.startsWith("* ")) {
                        const content = line.substring(2);
                        return (
                          <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-800 font-medium my-0.5">
                            <span className="text-[#0284C7] font-bold">•</span>
                            <span>{parseInlineBold(content)}</span>
                          </div>
                        );
                      }
                      return <p key={idx} className="text-xs text-slate-800 font-medium my-0.5">{parseInlineBold(line)}</p>;
                    })}
                  </div>

                  {/* Audio Player Button */}
                  {msg.sender === "ai" && (
                    <div className="pt-2 border-t border-sky-100 flex items-center justify-between mt-2">
                      <span className="text-[10px] text-slate-400 font-medium">{msg.time}</span>
                      <button
                        onClick={() => playVoice(msg.text, msg.id)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                          playingMsgId === msg.id
                            ? "bg-[#0284C7] text-white animate-pulse"
                            : "bg-sky-50 text-[#0284C7] hover:bg-sky-100"
                        }`}
                      >
                        {playingMsgId === msg.id && voiceProgress.includes("Downloading") ? (
                          <Download className="w-3.5 h-3.5 animate-bounce" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                        {playingMsgId === msg.id ? (voiceProgress || "Downloading Voice 0%...") : `Listen Voice`}
                      </button>
                    </div>
                  )}
                </div>

                {msg.sender === "user" && (
                  <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-[#0284C7] font-bold bg-white p-3.5 rounded-2xl border border-sky-100 w-fit shadow-xs">
                <Loader2 className="w-4 h-4 animate-spin text-[#0284C7]" /> Fish Doctor AI thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Attachment Preview Bar */}
          {attachment && (
            <div className="px-4 py-2 bg-sky-100 border-t border-sky-200 flex items-center justify-between text-xs font-bold text-sky-900">
              <div className="flex items-center gap-2 truncate">
                <Paperclip className="w-4 h-4 text-[#0284C7]" /> Attached {attachment.type}: {attachment.name}
              </div>
              <button onClick={() => setAttachment(null)} className="text-red-500 font-bold px-1 cursor-pointer">✕</button>
            </div>
          )}

          {/* Suggested Questions */}
          <div className="px-4 py-2 bg-white border-t border-sky-100 flex gap-2 overflow-x-auto">
            {[
              "Best feed for 1kg Catfish?",
              "How to calculate pond volume?",
              "Why is fish gasping for air?",
              "Fish prices today?",
            ].map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="shrink-0 text-[11px] font-semibold text-[#0284C7] bg-[#0284C7]/10 px-3 py-1.5 rounded-full hover:bg-[#0284C7]/20 transition-all cursor-pointer"
              >
                💬 {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-sky-100 flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,video/*,.pdf,.doc,.docx"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-11 h-11 rounded-full bg-slate-100 hover:bg-[#0284C7]/10 text-slate-700 hover:text-[#0284C7] flex items-center justify-center font-extrabold text-xl shrink-0 transition-all cursor-pointer"
              title="Upload photo or video of your fish"
            >
              <Plus className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask Fish Doctor AI..."
              className="flex-1 h-11 bg-slate-50 border border-slate-200 rounded-full px-4 text-xs font-medium outline-none focus:ring-2 focus:ring-[#0284C7]/30"
            />

            <button
              onClick={() => handleSend()}
              disabled={loading || (!input.trim() && !attachment)}
              className="w-11 h-11 rounded-full bg-[#0284C7] text-white flex items-center justify-center shadow-md shadow-[#0284C7]/20 disabled:opacity-50 cursor-pointer shrink-0"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </div>
        </>
      ) : (
        /* Extension Support Tab */
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#F0F9FF]">
          <div className="bg-white rounded-2xl p-4 border border-sky-100 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#0284C7] text-white flex items-center justify-center font-extrabold shrink-0 shadow-md">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Request Real-Life Extension Assistant</h3>
                <p className="text-xs text-slate-600">If the app isn't giving you what you need, call or request a certified field extension agent to visit your farm in person.</p>
              </div>
            </div>

            {/* Direct Contact Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleWhatsappClick}
                className="h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
              >
                <MessageSquare className="w-4.5 h-4.5" /> Chat on WhatsApp
              </button>
              <button
                onClick={handleCallClick}
                className="h-12 rounded-xl bg-[#0284C7] hover:bg-sky-600 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
              >
                <Phone className="w-4.5 h-4.5" /> Direct Call Assistant
              </button>
            </div>

            <div className="text-[11px] text-center font-bold text-slate-500 pt-1">
              Direct Emergency Line: <span className="text-[#0284C7] font-extrabold">+233 248785807</span>
            </div>
          </div>

          {/* On-Site Visit Dispatch Form */}
          <div className="bg-white rounded-2xl p-4 border border-sky-100 shadow-sm space-y-3">
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-sky-100 pb-2">
              📋 Request On-Site Farm Inspection
            </h4>

            {requestSent ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <span className="text-2xl">✅</span>
                <h5 className="font-extrabold text-sm text-emerald-900">Extension Request Received!</h5>
                <p className="text-xs text-emerald-700">A real-life aquaculture assistant will call you back at <strong>{farmerPhone}</strong> within 30 minutes to confirm your farm visit.</p>
                <button
                  onClick={() => setRequestSent(false)}
                  className="mt-2 text-xs font-bold text-[#0284C7] underline cursor-pointer"
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleExtensionSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    placeholder="e.g. Kwame Mensah"
                    className="w-full h-11 px-3 text-xs font-medium rounded-xl border border-slate-200 outline-none bg-slate-50 focus:ring-2 focus:ring-[#0284C7]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone / WhatsApp Number</label>
                  <input
                    type="tel"
                    required
                    value={farmerPhone}
                    onChange={(e) => setFarmerPhone(e.target.value)}
                    className="w-full h-11 px-3 text-xs font-medium rounded-xl border border-slate-200 outline-none bg-slate-50 focus:ring-2 focus:ring-[#0284C7]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Farm Location / Region</label>
                  <input
                    type="text"
                    required
                    value={farmLocation}
                    onChange={(e) => setFarmLocation(e.target.value)}
                    placeholder="e.g. Dawhenya, Greater Accra / Kumasi"
                    className="w-full h-11 px-3 text-xs font-medium rounded-xl border border-slate-200 outline-none bg-slate-50 focus:ring-2 focus:ring-[#0284C7]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Describe Issue Needed on Site</label>
                  <textarea
                    rows={3}
                    required
                    value={issueSummary}
                    onChange={(e) => setIssueSummary(e.target.value)}
                    placeholder="e.g. High fish mortality in concrete pond 2, water turning green, need in-person water test and antibiotic treatment."
                    className="w-full p-3 text-xs font-medium rounded-xl border border-slate-200 outline-none bg-slate-50 focus:ring-2 focus:ring-[#0284C7]/30"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-[#0284C7] hover:bg-sky-600 text-white font-extrabold text-xs shadow-md shadow-[#0284C7]/25 cursor-pointer transition-all active:scale-95"
                >
                  Dispatch Real-Life Assistant (+233 248785807)
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FULLSCREEN REAL CAMERA LIVE VIDEO CALL MODAL */}
      {isVideoCallOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between items-center animate-in fade-in">
          <div className="absolute inset-0 w-full h-full bg-slate-900 overflow-hidden">
            {isCameraOff ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-900">
                <VideoOff className="w-12 h-12 mb-2 text-slate-600" />
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
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
          </div>

          <div className="w-full flex items-center justify-between text-white z-20 pt-6 px-5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <div>
                <h3 className="font-extrabold text-sm text-white">Live Fish Doctor Video Consultation</h3>
                <p className="text-[11px] text-sky-400 font-semibold flex items-center gap-1">
                  <Mic className="w-3 h-3 animate-pulse" /> Speech Active ({language})
                </p>
              </div>
            </div>

            <button
              onClick={toggleCameraFacing}
              className="px-3.5 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold rounded-full flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5" /> {cameraFacing === "environment" ? "Back Cam" : "Front Cam"}
            </button>
          </div>

          <div className="z-20 my-auto text-center">
            {videoLoading && (
              <div className="px-4 py-2 rounded-full bg-black/70 backdrop-blur-md text-yellow-300 font-bold text-xs animate-pulse border border-white/20">
                Fish Doctor AI is evaluating...
              </div>
            )}
            {isListeningSpeech && !videoLoading && (
              <div className="px-4 py-2 rounded-full bg-black/70 backdrop-blur-md text-sky-400 font-bold text-xs animate-pulse border border-white/20 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5" /> Listening to your speech...
              </div>
            )}
          </div>

          <div className="w-full max-w-md px-5 pb-8 z-20">
            <div className="flex justify-center items-center gap-6">
              <button
                onClick={() => setIsCallMuted(!isCallMuted)}
                className={`p-4 rounded-full cursor-pointer transition-all shadow-lg ${isCallMuted ? "bg-red-600 text-white" : "bg-white/25 text-white hover:bg-white/35 backdrop-blur-md"}`}
              >
                {isCallMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
              
              <button
                onClick={() => setIsCameraOff(!isCameraOff)}
                className={`p-4 rounded-full cursor-pointer transition-all shadow-lg ${isCameraOff ? "bg-red-600 text-white" : "bg-white/25 text-white hover:bg-white/35 backdrop-blur-md"}`}
              >
                {isCameraOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
              </button>

              <button
                onClick={() => setIsVideoCallOpen(false)}
                className="p-4.5 rounded-full bg-red-600 text-white shadow-2xl hover:bg-red-700 cursor-pointer"
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
