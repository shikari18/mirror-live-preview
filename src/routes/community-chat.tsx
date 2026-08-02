import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, Send, Phone, Video, MoreVertical, Paperclip, 
  Smile, CheckCheck, Users, Volume2, ShieldCheck, Image as ImageIcon,
  Sparkles, MessageSquare
} from "lucide-react";
import { useLanguage } from "@/lib/languageContext";
import farmerImg from "@/assets/farmer.jpg";

export const Route = createFileRoute("/community-chat")({
  component: CommunityChatPage,
  head: () => ({
    meta: [
      { title: "Ghana Farmers Live Community Chat — WhatsApp Style" },
      { name: "description", content: "Chat live with fish farmers across Ghana in real-time." },
    ],
  }),
});

interface ChatMsg {
  id: string;
  senderName: string;
  senderRegion: string;
  avatarBg: string;
  text: string;
  time: string;
  isSelf: boolean;
  role?: string;
  mediaUrl?: string;
}

const INITIAL_MESSAGES: ChatMsg[] = [
  {
    id: "m1",
    senderName: "Dimples (Extension Officer)",
    senderRegion: "Kumasi, Ashanti",
    avatarBg: "bg-emerald-600",
    text: "Akwaaba akuafoɔ! 👋 Catfish fingerlings (High-grade Dutch Clarias) are available in Kumasi today at GH¢0.30 each. Contact me for pickup!",
    time: "11:42 AM",
    isSelf: false,
    role: "Officer",
  },
  {
    id: "m2",
    senderName: "Papa Quandoh",
    senderRegion: "Accra, Greater Accra",
    avatarBg: "bg-blue-600",
    text: "Good afternoon farmers. Please monitor your dissolved oxygen levels tonight. High humidity around Accra may cause surface piping.",
    time: "12:05 PM",
    isSelf: false,
    role: "Senior Farmer",
  },
  {
    id: "m3",
    senderName: "Madam Abena",
    senderRegion: "Sunyani, Bono Region",
    avatarBg: "bg-purple-600",
    text: "What is the current wholesale market price for 1kg fresh Tilapia in Techiman today?",
    time: "12:18 PM",
    isSelf: false,
  },
  {
    id: "m4",
    senderName: "Brother Kofi",
    senderRegion: "Kpandu, Volta Region",
    avatarBg: "bg-amber-600",
    text: "We are selling 1kg+ fresh Tilapia for GH¢34.00 per kg at the farm gate in Volta! Demand is very high.",
    time: "12:30 PM",
    isSelf: false,
  },
];

const FARMER_BOT_RESPONSES = [
  {
    name: "Dimples (Extension Officer)",
    region: "Kumasi, Ashanti",
    bg: "bg-emerald-600",
    role: "Officer",
    texts: [
      "Great point! Always ensure your water pH stays between 6.8 and 8.0 for optimum feed conversion ratio.",
      "If you notice any fin rot or skin redness, treat immediately with 3kg salt per 1000L water bath.",
      "Don't forget to record your daily feeding logs in the Fish Doctor app to track growth rates!"
    ]
  },
  {
    name: "Papa Quandoh",
    region: "Accra, Greater Accra",
    bg: "bg-blue-600",
    role: "Senior Farmer",
    texts: [
      "I just completed a 30% water exchange on my 5000L tank. Fish appetite increased immediately!",
      "Pro-tip: Feed 2mm floating pellets for fingerlings under 15g to avoid water pollution.",
      "Anyone buying Coppens feed in bulk? Let's pool orders together to get wholesale prices!"
    ]
  },
  {
    name: "Farmer Mensah",
    region: "Tamale, Northern Region",
    bg: "bg-teal-600",
    texts: [
      "Solar aerators are performing excellently during afternoon heat in Northern region!",
      "Make sure to shade your earthen ponds during peak sunshine to prevent temperature spikes above 31°C."
    ]
  }
];

export function CommunityChatPage() {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<ChatMsg[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("community_farmer_chat_history");
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return INITIAL_MESSAGES;
  });

  const [input, setInput] = useState("");
  const [activeOnlineCount, setActiveOnlineCount] = useState(342);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Auto Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    if (typeof window !== "undefined") {
      localStorage.setItem("community_farmer_chat_history", JSON.stringify(messages));
    }
  }, [messages]);

  // Real-Time Cross-Tab Synchronization via BroadcastChannel
  useEffect(() => {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const bc = new BroadcastChannel("ghana_farmers_community_chat");
      broadcastChannelRef.current = bc;

      bc.onmessage = (event) => {
        if (event.data && event.data.id) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === event.data.id)) return prev;
            return [...prev, event.data];
          });
        }
      };

      return () => bc.close();
    }
  }, []);

  // Fluctuate live online counter dynamically for realistic community feel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveOnlineCount((prev) => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMsgText = input.trim();
    setInput("");

    const newMsg: ChatMsg = {
      id: "usr_" + Date.now(),
      senderName: "You (Farmer)",
      senderRegion: "Ghana",
      avatarBg: "bg-[#0F6236]",
      text: userMsgText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isSelf: true,
    };

    setMessages((prev) => [...prev, newMsg]);

    // Broadcast message to other open windows/tabs
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage(newMsg);
    }

    // Simulate Live Community Farmer Reply after 1.5 - 3 seconds
    setTimeout(() => {
      const bot = FARMER_BOT_RESPONSES[Math.floor(Math.random() * FARMER_BOT_RESPONSES.length)];
      const botText = bot.texts[Math.floor(Math.random() * bot.texts.length)];

      const botReplyMsg: ChatMsg = {
        id: "bot_" + Date.now(),
        senderName: bot.name,
        senderRegion: bot.region,
        avatarBg: bot.bg,
        role: bot.role,
        text: botText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isSelf: false,
      };

      setMessages((prev) => [...prev, botReplyMsg]);

      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage(botReplyMsg);
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#E5DDD5] flex flex-col justify-between font-sans">
      {/* WhatsApp Header Bar */}
      <header className="bg-[#075E54] text-white px-3 py-2.5 flex items-center justify-between shadow-md sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <Link to="/home" className="p-1 rounded-full hover:bg-white/10 text-white cursor-pointer">
            <ArrowLeft className="w-5.5 h-5.5" />
          </Link>

          {/* Group Avatar Stack */}
          <div className="relative w-10 h-10 rounded-full bg-[#128C7E] flex items-center justify-center border-2 border-white/30 text-white overflow-hidden shadow-inner">
            <Users className="w-5.5 h-5.5 text-white" />
          </div>

          <div className="leading-tight">
            <h1 className="font-extrabold text-sm flex items-center gap-1.5 text-white">
              Ghana Fish Farmers 🇬🇭
              <span className="bg-emerald-500/30 text-emerald-200 text-[10px] px-1.5 py-0.2 rounded-md font-bold">Verified</span>
            </h1>
            <p className="text-[11px] text-emerald-100 flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {activeOnlineCount} Farmers online • Dimples, Papa...
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a href="tel:+233248785807" className="p-2 rounded-full hover:bg-white/10 text-white cursor-pointer" title="Call Extension Officer">
            <Phone className="w-4.5 h-4.5" />
          </a>
          <button className="p-2 rounded-full hover:bg-white/10 text-white cursor-pointer" title="More Options">
            <MoreVertical className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* WhatsApp Chat Pattern Area */}
      <main className="flex-1 p-3 space-y-3 overflow-y-auto max-w-2xl mx-auto w-full pb-20">
        {/* Security Encryption Banner */}
        <div className="bg-[#FFF5C4] border border-[#FFE792] p-2.5 rounded-xl text-center shadow-xs mx-auto max-w-sm">
          <p className="text-[11px] text-amber-900 font-semibold flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            Messages are shared live with verified fish farmers across Ghana.
          </p>
        </div>

        {/* Date Divider */}
        <div className="text-center my-2">
          <span className="bg-white/80 backdrop-blur-xs text-gray-600 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase shadow-2xs tracking-wider">
            Today • Ghana Aquaculture Feed & Market Network
          </span>
        </div>

        {/* Chat Messages List */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.isSelf ? "items-end" : "items-start"} space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-200`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 shadow-xs relative ${
                msg.isSelf
                  ? "bg-[#DCF8C6] text-gray-900 rounded-tr-none border border-emerald-200"
                  : "bg-white text-gray-900 rounded-tl-none border border-gray-200"
              }`}
            >
              {/* Sender Name & Region */}
              {!msg.isSelf && (
                <div className="flex items-center gap-1.5 mb-1 border-b border-gray-100 pb-1">
                  <div className={`w-5 h-5 rounded-full ${msg.avatarBg} text-white text-[10px] font-black flex items-center justify-center uppercase`}>
                    {msg.senderName[0]}
                  </div>
                  <span className="text-xs font-black text-[#075E54] flex items-center gap-1">
                    {msg.senderName}
                    {msg.role && (
                      <span className="bg-[#075E54] text-white text-[9px] px-1.5 py-0.2 rounded-md font-bold uppercase">
                        {msg.role}
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium ml-auto">{msg.senderRegion}</span>
                </div>
              )}

              {/* Message Content */}
              <p className="text-xs font-medium text-gray-800 leading-relaxed whitespace-pre-wrap">{msg.text}</p>

              {/* Timestamp & Double Checkmarks */}
              <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-gray-400">
                <span>{msg.time}</span>
                {msg.isSelf && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* WhatsApp Input Bar at Bottom */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#F0F0F0] p-2 border-t border-gray-300 z-40">
        <form onSubmit={handleSendMessage} className="max-w-2xl mx-auto flex items-center gap-2">
          <div className="flex-1 bg-white rounded-full flex items-center px-3 py-1.5 border border-gray-300 shadow-inner">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type message to all Ghana farmers..."
              className="flex-1 bg-transparent border-none outline-none text-xs font-medium text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim()}
            className={`w-10.5 h-10.5 rounded-full flex items-center justify-center text-white shadow-md transition-all cursor-pointer ${
              input.trim()
                ? "bg-[#128C7E] hover:bg-[#075E54] active:scale-95"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </form>
      </footer>
    </div>
  );
}
