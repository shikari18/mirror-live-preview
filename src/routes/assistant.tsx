import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Send, Mic, ArrowLeft, Stethoscope, Loader2, MapPin, Video, PhoneOff, MicOff, RefreshCw, Volume2, Download, Paperclip, FileText, Camera, Check, VideoOff, SwitchCamera, UserCheck, Plus } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import { getAIAssistantResponse, getAIVideoCallResponse, getGeminiLiveVoiceAudio, MediaAttachment } from "@/lib/gemini";
import { useLanguage } from "@/lib/languageContext";

export const Route = createFileRoute("/assistant")({
  component: AssistantPage,
  head: () => ({
    meta: [
      { title: "AI Fish Doctor — Live Chat & Video Call" },
      { name: "description", content: "Talk with AI Fish Doctor for instant aquaculture guidance." },
    ],
  }),
});

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  attachment?: { name: string; type: string; mimeType: string; url: string };
  time: string;
}

export function AssistantPage() {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "ai",
      text: "Hello! I am your official Fish Doctor AI. How can I assist you with your fish farm, water parameters, or feeding ration today?",
      time: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userLocationInfo, setUserLocationInfo] = useState<{ coords?: string; city?: string }>({ city: "Accra & Ashanti Region, Ghana" });

  // Voice Speech Audio Player State
  const [voiceProgress, setVoiceProgress] = useState<string>("");
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<any>(null);

  // Attachment State
  const [attachment, setAttachment] = useState<{ name: string; type: string; mimeType: string; url: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fullscreen Live Video Call State
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [isCallMuted, setIsCallMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("user");
  const [isListeningSpeech, setIsListeningSpeech] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);

  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setUserLocationInfo({ coords: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`, city: `GPS (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)` });
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
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setPlayingMsgId(null);
    setVoiceProgress("");
  };

  const playVoice = async (text: string, msgId?: string) => {
    if (playingMsgId === msgId && currentAudioRef.current) {
      stopAudio();
      return;
    }

    stopAudio();
    if (msgId) setPlayingMsgId(msgId);

    setVoiceProgress("Downloading Voice 10%...");
    let pct = 10;
    progressIntervalRef.current = setInterval(() => {
      pct = Math.min(pct + 15, 90);
      setVoiceProgress(`Downloading Voice ${pct}%...`);
    }, 150);

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
          : "document";
        setAttachment({
          name: file.name,
          type: fileType,
          mimeType: file.type || "image/jpeg",
          url: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input.trim();
    if (!query && !attachment) return;

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
        query || "Analyze my fish farm and give guidance.",
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
        text: `Hello farmer! Fish Doctor AI is online. Perform a 20-30% fresh water exchange if water quality or oxygen is low.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const parseInlineBold = (str: string) => {
    if (!str) return "";
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part && part.startsWith("**") && part.endsWith("**") && part.length > 4) {
        return (
          <strong key={i} className="font-extrabold text-gray-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part || "";
    });
  };

  return (
    <PhoneFrame>
      {/* Header */}
      <header className="px-5 pt-3.5 pb-3.5 flex items-center justify-between border-b border-[#0F6236]/10 bg-white/80 backdrop-blur-md sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <Link to="/home" className="p-1.5 cursor-pointer hover:bg-emerald-50 rounded-full transition-all">
            <ArrowLeft className="w-5.5 h-5.5 text-gray-900" />
          </Link>
          <div className="w-10 h-10 rounded-2xl bg-[#0F6236] text-white flex items-center justify-center font-extrabold text-base shadow-md shadow-[#0F6236]/20">
            <Stethoscope className="w-5.5 h-5.5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5 leading-tight">
              Fish Doctor AI
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </h1>
            <p className="text-[10.5px] text-gray-500 font-semibold flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#0F6236] shrink-0" />
              <span className="truncate max-w-[140px]">{userLocationInfo.city}</span>
            </p>
          </div>
        </div>

        {/* Extension Link & Video Call */}
        <div className="flex items-center gap-2">
          <Link
            to="/extension-support"
            className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-[#0F6236]/10 text-[#0F6236] border border-[#0F6236]/20 text-[11px] font-extrabold cursor-pointer hover:bg-[#0F6236]/20 transition-all"
          >
            <UserCheck className="w-3.5 h-3.5" /> Extension
          </Link>

          <button
            onClick={() => setIsVideoCallOpen(true)}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-2xl bg-[#0F6236] hover:bg-[#0B4A28] text-white text-[11px] font-extrabold shadow-md shadow-[#0F6236]/25 transition-all cursor-pointer active:scale-95"
          >
            <Video className="w-3.5 h-3.5" /> Video Call
          </button>
        </div>
      </header>

      {/* AI Chat Messages UI */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#F4FAF5] min-h-[460px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[88%] p-4 rounded-3xl text-xs leading-relaxed ${
                msg.sender === "user"
                  ? "bg-[#0F6236] text-white font-medium rounded-br-xs shadow-md shadow-[#0F6236]/20"
                  : "bg-white text-gray-900 border border-gray-200/90 rounded-bl-xs shadow-md"
              }`}
            >
              {/* Attachment Preview */}
              {msg.attachment && (
                <div className="mb-2.5 p-1.5 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
                  {msg.attachment.type === "image" ? (
                    <img src={msg.attachment.url} alt="Uploaded" className="w-full h-44 object-cover rounded-xl" />
                  ) : msg.attachment.type === "video" ? (
                    <video src={msg.attachment.url} controls className="w-full h-44 object-cover rounded-xl" />
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                      <FileText className="w-5 h-5 text-[#0F6236]" /> {msg.attachment.name}
                    </div>
                  )}
                </div>
              )}

              {/* Text Content */}
              <div className="space-y-1.5">
                {msg.text.split("\n").map((line, idx) => {
                  if (line.startsWith("### ")) {
                    return (
                      <h4 key={idx} className="font-extrabold text-xs text-[#0F6236] pt-1 pb-0.5">
                        {parseInlineBold(line.replace("### ", ""))}
                      </h4>
                    );
                  }
                  if (line.startsWith("- ") || line.startsWith("* ")) {
                    const content = line.substring(2);
                    return (
                      <div key={idx} className="flex items-start gap-1.5 text-xs text-gray-800 font-medium my-0.5">
                        <span className="text-[#0F6236] font-bold">•</span>
                        <span>{parseInlineBold(content)}</span>
                      </div>
                    );
                  }
                  return <p key={idx} className="text-xs font-medium my-0.5">{parseInlineBold(line)}</p>;
                })}
              </div>

              {/* Audio Player Button */}
              {msg.sender === "ai" && (
                <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between mt-2.5">
                  <span className="text-[10px] text-gray-400 font-medium">{msg.time}</span>
                  <button
                    onClick={() => playVoice(msg.text, msg.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-extrabold transition-all cursor-pointer shadow-xs ${
                      playingMsgId === msg.id
                        ? "bg-[#0F6236] text-white animate-pulse"
                        : "bg-emerald-50 text-[#0F6236] hover:bg-emerald-100 border border-[#0F6236]/20"
                    }`}
                  >
                    {playingMsgId === msg.id && voiceProgress.includes("Downloading") ? (
                      <Download className="w-3.5 h-3.5 animate-bounce" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                    {playingMsgId === msg.id ? (voiceProgress || "Downloading Voice 0%...") : `Listen Voice (${language})`}
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
          <div className="flex items-center gap-2 text-xs text-[#0F6236] font-extrabold bg-white p-3.5 rounded-2xl border border-gray-200 w-fit shadow-md">
            <Loader2 className="w-4 h-4 animate-spin text-[#0F6236]" /> Fish Doctor AI thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Preview Bar */}
      {attachment && (
        <div className="px-4 py-2 bg-emerald-50 border-t border-emerald-200 flex items-center justify-between text-xs font-extrabold text-emerald-900">
          <div className="flex items-center gap-2 truncate">
            <Paperclip className="w-4 h-4 text-[#0F6236]" /> Attached {attachment.type}: {attachment.name}
          </div>
          <button onClick={() => setAttachment(null)} className="text-red-600 font-extrabold px-1 cursor-pointer">✕</button>
        </div>
      )}

      {/* Suggested Questions */}
      <div className="px-4 py-2 bg-white border-t border-gray-200/80 flex gap-2 overflow-x-auto">
        {[
          "Best feed for 1kg Catfish?",
          "How to calculate pond volume?",
          "Why is fish gasping for air?",
          "Fish prices today?",
        ].map((q) => (
          <button
            key={q}
            onClick={() => handleSend(q)}
            className="shrink-0 text-[11px] font-extrabold text-[#0F6236] bg-[#0F6236]/10 px-3.5 py-1.5 rounded-full hover:bg-[#0F6236]/20 transition-all cursor-pointer shadow-2xs border border-[#0F6236]/20"
          >
            💬 {q}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-11 h-11 rounded-2xl bg-gray-100 hover:bg-[#0F6236]/10 text-gray-700 hover:text-[#0F6236] flex items-center justify-center font-extrabold text-xl shrink-0 transition-all cursor-pointer border border-gray-200"
          title="Upload photo or video of your fish"
        >
          <Plus className="w-5 h-5 text-gray-700" />
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask Fish Doctor AI..."
          className="flex-1 h-11 bg-gray-50 border border-gray-200/80 rounded-2xl px-4 text-xs font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#0F6236]/20"
        />

        <button
          onClick={() => handleSend()}
          disabled={loading || (!input.trim() && !attachment)}
          className="w-11 h-11 rounded-2xl bg-[#0F6236] hover:bg-[#0B4A28] text-white flex items-center justify-center shadow-md shadow-[#0F6236]/25 disabled:opacity-50 cursor-pointer shrink-0 transition-all active:scale-95"
        >
          <Send className="w-4.5 h-4.5 text-white" />
        </button>
      </div>

      {/* FULLSCREEN VIDEO CALL MODAL */}
      {isVideoCallOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between items-center animate-in fade-in">
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
          </div>

          <div className="w-full flex items-center justify-between text-white z-20 pt-6 px-5 bg-gradient-to-b from-black/80 to-transparent pb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-extrabold text-sm text-white">Live Video Call — Fish Doctor AI</h3>
            </div>
            <button
              onClick={() => setIsVideoCallOpen(false)}
              className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="w-full max-w-sm bg-black/80 backdrop-blur-md rounded-3xl p-5 m-5 z-20 space-y-4 border border-white/20 text-center shadow-2xl">
            <div className="flex items-center justify-center gap-2">
              <Stethoscope className="w-6 h-6 text-emerald-400 animate-bounce" />
              <span className="text-sm font-extrabold text-white">AI Doctor Listening...</span>
            </div>

            <p className="text-xs text-gray-300 font-medium">
              Speak into your microphone in {language}. AI Doctor will answer live in spoken audio!
            </p>

            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={() => setIsCallMuted((prev) => !prev)}
                className={`p-3.5 rounded-full transition-all cursor-pointer ${
                  isCallMuted ? "bg-red-600 text-white" : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                <MicOff className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsVideoCallOpen(false)}
                className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg cursor-pointer transition-all active:scale-95"
              >
                <PhoneOff className="w-6 h-6" />
              </button>

              <button
                onClick={toggleCameraFacing}
                className="p-3.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all cursor-pointer"
              >
                <SwitchCamera className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </PhoneFrame>
  );
}
