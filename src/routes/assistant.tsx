import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Mic, Send, Video, VideoOff, MicOff, PhoneOff, Loader2, Plus, Paperclip, FileText, ArrowLeft, RefreshCw, Volume2 } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import { getAIAssistantResponse, getAIVideoCallResponse, getGeminiLiveVoiceAudio, translateToTwiAudioText, MediaAttachment } from "@/lib/gemini";
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
      text: `### Fish Farming Advice\nHow can I help you today? You can ask a question or upload a photo/video:\n- 🐟 Feeding schedules & feed quality\n- 💧 Water pH & oxygen levels\n- 🩺 Fish disease treatment & medicine\n- 📈 Market prices in Ghana`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState<{ name: string; type: "image" | "video" | "file"; mimeType: string; url: string } | null>(null);
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);

  // Fullscreen Camera Video Call & Speech-to-Speech State
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
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Clean up audio & camera stream on unmount or modal close
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

  const stopAudio = () => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setPlayingMsgId(null);
  };

  // Decode & Play 24kHz Raw PCM Audio with Resume Protection
  const playPCM24kAudio = (base64Data: string): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        const binaryString = window.atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const int16Array = new Int16Array(bytes.buffer);
        const numSamples = int16Array.length;
        const float32Array = new Float32Array(numSamples);
        for (let i = 0; i < numSamples; i++) {
          float32Array[i] = int16Array[i] / 32768.0;
        }

        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioCtx({ sampleRate: 24000 });
        audioCtxRef.current = audioCtx;

        if (audioCtx.state === "suspended") {
          await audioCtx.resume();
        }

        const audioBuffer = audioCtx.createBuffer(1, numSamples, 24000);
        audioBuffer.getChannelData(0).set(float32Array);

        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        source.onended = () => resolve();
        source.start(0);
      } catch (err) {
        console.warn("PCM audio playback error:", err);
        reject(err);
      }
    });
  };

  // PURE NEURAL AUDIO VOICE ("Kore" Female Voice)
  const playVoice = async (text: string, msgId?: string) => {
    if (msgId && playingMsgId === msgId) {
      stopAudio();
      return;
    }

    stopAudio();
    if (msgId) setPlayingMsgId(msgId);

    let speechText = text;
    const isTwi = language === "Twi" || language.toLowerCase().includes("twi");

    if (isTwi) {
      try {
        speechText = await translateToTwiAudioText(text);
      } catch (e) {}
    }

    const base64PCM = await getGeminiLiveVoiceAudio(speechText, "Kore");

    if (base64PCM) {
      try {
        await playPCM24kAudio(base64PCM);
        setPlayingMsgId(null);
        return;
      } catch (e) {
        console.warn("PCM playback failed", e);
      }
    }

    setPlayingMsgId(null);
  };

  // Pure Speech-to-Speech Loop for Live Video Call
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
      } catch (e) {
        console.warn("Speech recognition error", e);
      }
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
      playVoice(response); // Instant Neural Voice reply!
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
      <header className="px-5 pt-3 pb-3 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-20 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link to="/home" className="p-1 cursor-pointer hover:bg-gray-100 rounded-full">
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
            <p className="text-[11px] text-gray-500 font-medium">Smart Voice Active</p>
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

      {/* Clean AI Chat UI */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#F8FAF8] min-h-[460px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                msg.sender === "user"
                  ? "bg-[#0F6236] text-white font-medium rounded-br-none shadow-xs"
                  : "bg-white text-gray-900 border border-gray-200 rounded-bl-none shadow-xs"
              }`}
            >
              {/* Attachment Preview */}
              {msg.attachment && (
                <div className="mb-2 p-1.5 bg-black/5 rounded-xl overflow-hidden">
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

              {/* English Written Text */}
              <div className="space-y-1">
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
                  return <p key={idx} className="text-xs text-gray-800 font-medium my-0.5">{parseInlineBold(line)}</p>;
                })}
              </div>

              {/* Speaker Button at the BOTTOM of AI Reply */}
              {msg.sender === "ai" && (
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between mt-2">
                  <span className="text-[10px] text-gray-400 font-medium">{msg.time}</span>
                  <button
                    onClick={() => playVoice(msg.text, msg.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                      playingMsgId === msg.id
                        ? "bg-[#0F6236] text-white animate-pulse"
                        : "bg-gray-100 text-[#0F6236] hover:bg-gray-200"
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    {playingMsgId === msg.id ? "Playing Voice..." : "Listen Voice"}
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
            <Loader2 className="w-4 h-4 animate-spin text-[#0F6236]" /> AI is evaluating...
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
      <div className="p-3 bg-[#FFFFFF] border-t border-gray-100 flex items-center gap-2">
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
          placeholder={`Ask AI Advisor...`}
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

      {/* FULLSCREEN REAL CAMERA LIVE VIDEO CALL MODAL (CLEAN VIDEO CALL SCREEN) */}
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
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
          </div>

          {/* Top Bar with Camera Switcher */}
          <div className="w-full flex items-center justify-between text-white z-20 pt-6 px-5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <div>
                <h3 className="font-extrabold text-sm text-white">Live AI Video Call</h3>
                <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Mic className="w-3 h-3 animate-pulse" /> Live Speech Active
                </p>
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

          {/* Status Indicator (Center Screen) */}
          <div className="z-20 my-auto text-center">
            {videoLoading && (
              <div className="px-4 py-2 rounded-full bg-black/70 backdrop-blur-md text-yellow-300 font-bold text-xs animate-pulse border border-white/20">
                AI is responding...
              </div>
            )}
            {isListeningSpeech && !videoLoading && (
              <div className="px-4 py-2 rounded-full bg-black/70 backdrop-blur-md text-emerald-400 font-bold text-xs animate-pulse border border-white/20 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5" /> Listening to your voice...
              </div>
            )}
          </div>

          {/* Action Controls Bar (Bottom) */}
          <div className="w-full max-w-md px-5 pb-8 z-20">
            <div className="flex justify-center items-center gap-6">
              <button
                onClick={() => setIsCallMuted(!isCallMuted)}
                className={`p-4 rounded-full cursor-pointer transition-all shadow-lg ${isCallMuted ? "bg-red-600 text-white" : "bg-white/25 text-white hover:bg-white/35 backdrop-blur-md"}`}
                title={isCallMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {isCallMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
              
              <button
                onClick={() => setIsCameraOff(!isCameraOff)}
                className={`p-4 rounded-full cursor-pointer transition-all shadow-lg ${isCameraOff ? "bg-red-600 text-white" : "bg-white/25 text-white hover:bg-white/35 backdrop-blur-md"}`}
                title={isCameraOff ? "Turn Camera On" : "Turn Camera Off"}
              >
                {isCameraOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
              </button>

              <button
                onClick={toggleCameraFacing}
                className="p-4 rounded-full bg-white/25 text-white hover:bg-white/35 backdrop-blur-md cursor-pointer shadow-lg"
                title="Switch Camera"
              >
                <RefreshCw className="w-6 h-6" />
              </button>

              <button
                onClick={() => setIsVideoCallOpen(false)}
                className="p-4.5 rounded-full bg-red-600 text-white shadow-2xl hover:bg-red-700 cursor-pointer"
                title="End Video Call"
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
