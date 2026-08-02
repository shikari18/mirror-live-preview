import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, Send, Phone, MoreVertical, ShieldCheck, CheckCheck, Users, Loader2
} from "lucide-react";
import { useLanguage } from "@/lib/languageContext";
import { 
  CommunityChatMessage, 
  fetchLiveCommunityMessages, 
  postLiveCommunityMessage, 
  getRealActiveFarmersCount,
  getMyDeviceId
} from "@/lib/sharedCommunity";

export const Route = createFileRoute("/community-chat")({
  component: CommunityChatPage,
  head: () => ({
    meta: [
      { title: "Ghana Farmers Live Community Chat — WhatsApp Style" },
      { name: "description", content: "Chat live with fish farmers across Ghana in real-time." },
    ],
  }),
});

export function CommunityChatPage() {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<CommunityChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [activeOnlineCount, setActiveOnlineCount] = useState(1);
  const [currentFarmerName, setCurrentFarmerName] = useState("");
  const [myDeviceId, setMyDeviceId] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load real user profile & messages on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setMyDeviceId(getMyDeviceId());
      try {
        const farmProfile = JSON.parse(localStorage.getItem("fish_farm_profile") || "{}");
        const activeUser = JSON.parse(localStorage.getItem("active_user") || "{}");
        const name = farmProfile.farmerName || activeUser.fullName || activeUser.phone || "Farmer";
        setCurrentFarmerName(name);
      } catch (e) {}

      fetchLiveCommunityMessages().then((data) => {
        setMessages(data);
        setLoading(false);
        setActiveOnlineCount(getRealActiveFarmersCount());
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Live Real-Time Polling & Storage Sync
  useEffect(() => {
    const refreshData = async () => {
      const liveData = await fetchLiveCommunityMessages();
      setMessages(liveData);
      setActiveOnlineCount(getRealActiveFarmersCount());
    };

    const interval = setInterval(refreshData, 3500);

    const handleStorageChange = () => {
      refreshData();
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // BroadcastChannel for instant tab sync
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

  // Request System Push Notification Permission on Mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, []);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMsgText = input.trim();
    setInput("");

    try {
      const updatedMessages = await postLiveCommunityMessage(userMsgText);
      setMessages(updatedMessages);
      setActiveOnlineCount(getRealActiveFarmersCount());

      // Trigger System OS Push Notification to all farmers
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        try {
          const sentMsg = updatedMessages[updatedMessages.length - 1];
          if (sentMsg) {
            new Notification(`💬 ${sentMsg.senderName} (${sentMsg.senderRegion})`, {
              body: sentMsg.text,
              tag: "ghana_farmers_community_" + sentMsg.id,
              renotify: true,
            });
          }
        } catch (err) {}
      }
    } catch (err) {
      console.warn("Send message error", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#E5DDD5] flex flex-col justify-between font-sans">
      {/* WhatsApp Header Bar */}
      <header className="bg-[#075E54] text-[#075E54] text-white px-3 py-2.5 flex items-center justify-between shadow-md sticky top-0 z-40">
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
              {activeOnlineCount} {activeOnlineCount === 1 ? "Farmer Active" : "Farmers Active"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://chat.whatsapp.com/GOVXg6hC7g5DJ9h6lsLJ87?s=cl&p=i&mlu=4"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-xl bg-white text-[#075E54] text-[11px] font-black shadow-xs flex items-center gap-1 hover:bg-emerald-50 transition-all cursor-pointer"
          >
            WhatsApp App ↗
          </a>
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
        {messages.map((msg) => {
          const isSelf = Boolean(
            (myDeviceId && msg.senderId === myDeviceId) ||
            (currentFarmerName && msg.senderName === currentFarmerName) ||
            msg.senderName === "You (Farmer)"
          );

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isSelf ? "items-end ml-auto" : "items-start mr-auto"} space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-200`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 shadow-xs relative ${
                  isSelf
                    ? "bg-[#DCF8C6] text-gray-900 rounded-tr-none border border-emerald-200"
                    : "bg-white text-gray-900 rounded-tl-none border border-gray-200"
                }`}
              >
                {/* Sender Name & Region */}
                {!isSelf && (
                  <div className="flex items-center gap-1.5 mb-1 border-b border-gray-100 pb-1">
                    <div className={`w-5 h-5 rounded-full ${msg.avatarBg || "bg-[#0F6236]"} text-white text-[10px] font-black flex items-center justify-center uppercase`}>
                      {msg.senderName ? msg.senderName[0] : "F"}
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
                  {isSelf && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                </div>
              </div>
            </div>
          );
        })}
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
