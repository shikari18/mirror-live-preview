// Real-Time Global Shared Marketplace Service for Fish Doctor App

export interface MarketItem {
  id: string;
  category: "feeds" | "equipment" | "supplies" | "fish" | "harvest";
  title: string;
  priceGHS: number;
  unit: string;
  seller: string;
  phone: string;
  location: string;
  tag?: string;
  image?: string;
  isUserListing?: boolean;
  createdAt: string;
}

const SHARED_BLOB_URL = "https://jsonblob.com/api/jsonBlob/019fc23b-97d7-77ee-a822-a4759df522a7";
const LOCAL_STORAGE_KEY = "custom_marketplace_listings_v1";

export async function fetchGlobalMarketItems(): Promise<MarketItem[]> {
  try {
    const res = await fetch(SHARED_BLOB_URL, {
      headers: { "Accept": "application/json" }
    });
    if (res.ok) {
      const cloudItems: MarketItem[] = await res.json();
      if (Array.isArray(cloudItems)) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cloudItems));
        return cloudItems;
      }
    }
  } catch (e) {
    console.warn("Global Market API fetch warning, using local cache:", e);
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

export async function publishMarketItem(newItem: Omit<MarketItem, "id" | "createdAt">): Promise<MarketItem[]> {
  const item: MarketItem = {
    ...newItem,
    id: "m_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
    createdAt: new Date().toISOString(),
    isUserListing: true,
  };

  // 1. Get current items
  let existingItems: MarketItem[] = [];
  try {
    existingItems = await fetchGlobalMarketItems();
  } catch (e) {
    console.warn("Fetch before publish error", e);
  }

  const updated = [item, ...existingItems];

  // 2. Save locally for instant UI responsiveness
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("storage"));

  // 3. Upload to cloud shared store so everyone sees it globally
  try {
    await fetch(SHARED_BLOB_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(updated)
    });
  } catch (e) {
    console.warn("Cloud publish sync warning:", e);
  }

  return updated;
}
