import { useState, useRef } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
}

export function VoiceRecorder({ onTranscript, placeholder = "Tap mic & speak in Twi or English..." }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your browser. Please type your message.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US"; // Accepts natural speech

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onTranscript(transcript);
        }
        setIsRecording(false);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error("Speech recognition start failed:", e);
      setIsRecording(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  return (
    <button
      type="button"
      onClick={isRecording ? stopListening : startListening}
      className={`px-3 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
        isRecording
          ? "bg-red-500 text-white animate-pulse"
          : "bg-emerald-50 text-[#0F6236] hover:bg-emerald-100 border border-emerald-200/80"
      }`}
      title="Speak Voice Message"
    >
      {isRecording ? (
        <>
          <MicOff className="w-4 h-4 text-white" />
          <span>Recording...</span>
        </>
      ) : (
        <>
          <Mic className="w-4 h-4 text-[#0F6236]" />
          <span>Voice Note</span>
        </>
      )}
    </button>
  );
}
