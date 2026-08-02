// Real-Time Global Shared Community Chat Store for Fish Doctor App

export interface CommunityChatMessage {
  id: string;
  senderName: string;
  senderRegion: string;
  senderPhone?: string;
  avatarBg: string;
  text: string;
  time: string;
  timestamp: number;
  isSelf?: boolean;
  role?: string;
  mediaUrl?: string;
}

const COMMUNITY_BLOB_URL = "https://jsonblob.com/api/jsonBlob/019fc23b-97d7-77ee-a822-b98341df9001";
const LOCAL_STORAGE_KEY = "ghana_farmers_community_chat_history_v2";
const SESSION_TIMESTAMP_KEY = "farmer_last_active_timestamp";

// Calculate REAL DYNAMIC ACTIVE FARMERS COUNT (based on registered profiles & active session participants)
export function getRealActiveFarmersCount(): number {
  if (typeof window === "undefined") return 1;

  try {
    const farmProfile = JSON.parse(localStorage.getItem("fish_farm_profile") || "{}");
    const cachedHistory = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");

    const uniqueSenders = new Set<string>();
    if (Array.isArray(cachedHistory)) {
      cachedHistory.forEach((m: any) => {
        if (m.senderName) uniqueSenders.add(m.senderName);
      });
    }

    if (farmProfile.farmerName) uniqueSenders.add(farmProfile.farmerName);

    return Math.max(uniqueSenders.size, 1);
  } catch (e) {
    return 1;
  }
}

// Fetch Global Live Community Chat Messages
export async function fetchLiveCommunityMessages(): Promise<CommunityChatMessage[]> {
  try {
    const res = await fetch(COMMUNITY_BLOB_URL, {
      headers: { "Accept": "application/json" }
    });
    if (res.ok) {
      const cloudMsgs: CommunityChatMessage[] = await res.json();
      if (Array.isArray(cloudMsgs) && cloudMsgs.length > 0) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cloudMsgs));
        return cloudMsgs;
      }
    }
  } catch (e) {
    console.warn("Global Community Chat fetch warning, using local storage:", e);
  }

  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.warn("Cache parse error", e);
  }

  return [];
}

// Publish New Live Message to Global Community Cloud & Local Storage
export async function postLiveCommunityMessage(text: string, senderName?: string, senderRegion?: string): Promise<CommunityChatMessage[]> {
  let name = senderName;
  let region = senderRegion;

  if (!name || !region) {
    try {
      const farmProfile = JSON.parse(localStorage.getItem("fish_farm_profile") || "{}");
      const activeUser = JSON.parse(localStorage.getItem("active_user") || "{}");

      name = name || farmProfile.farmerName || activeUser.fullName || activeUser.phone || "Farmer";
      region = region || farmProfile.farmLocation || activeUser.region || "Ghana";
    } catch (e) {
      name = name || "Farmer";
      region = region || "Ghana";
    }
  }

  const newMsg: CommunityChatMessage = {
    id: "msg_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    senderName: name!,
    senderRegion: region!,
    avatarBg: "bg-[#0F6236]",
    text,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    timestamp: Date.now(),
  };

  let existing: CommunityChatMessage[] = [];
  try {
    existing = await fetchLiveCommunityMessages();
  } catch (e) {}

  const updated = [...existing, newMsg].slice(-100);

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  localStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString());

  window.dispatchEvent(new Event("storage"));
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    try {
      const bc = new BroadcastChannel("ghana_farmers_community_chat");
      bc.postMessage(newMsg);
      bc.close();
    } catch (e) {}
  }

  try {
    await fetch(COMMUNITY_BLOB_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(updated)
    });
  } catch (e) {
    console.warn("Cloud sync error for community chat:", e);
  }

  return updated;
}
