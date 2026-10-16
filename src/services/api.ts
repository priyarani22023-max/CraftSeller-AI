import {
  GemmaHealthStatus,
  ProductListingInput,
  ProductListingOutput,
  SocialMediaInput,
  SocialMediaOutput,
  PricingInput,
  PricingResult,
  SavedItem,
  SellerProfile,
} from '../types';

const LOCAL_STORAGE_KEY = 'craftseller_saved_items_v1';
const LOCAL_PROFILE_KEY = 'craftseller_profile_v1';

export const DEFAULT_PROFILE: SellerProfile = {
  shopName: 'Earth & Loom Studio',
  artisanName: 'Priya Sharma',
  defaultCurrency: '$',
  defaultLanguage: 'English',
  defaultTone: 'Friendly',
  craftSpecialty: 'Ceramics & Handwoven Textiles',
};

// Initial sample items to populate if empty
export const SAMPLE_SAVED_ITEMS: SavedItem[] = [
  {
    id: 'sample_1',
    type: 'product',
    title: 'Terracotta Handcrafted Speckled Mug',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    language: 'English',
    modelUsed: 'gemma-4-26b-a4b-it',
    tags: ['Ceramics', 'Etsy', 'Kitchenware'],
    data: {
      title: 'Handmade Speckled Terracotta Ceramic Mug | 350ml Artisan Coffee Cup',
      description: 'Crafted with earthy terracotta clay and finished with a food-safe matte speckled glaze, this coffee mug brings tactile warmth to your slow morning ritual. Each piece is hand-thrown on the potter’s wheel, bearing subtle artisanal variations that make it exclusively yours.\n\nDesigned with an ergonomic comfort handle and sturdy base, it holds your favorite brew while retaining heat naturally.',
      highlights: [
        'Wheel-thrown with natural terracotta clay',
        'Lead-free, food-safe matte speckled glaze',
        'Generous 350ml capacity with ergonomic grip',
        'Dishwasher & microwave safe for daily ease'
      ],
      keywords: ['terracotta mug', 'ceramic coffee cup', 'handmade pottery', 'artisan mug', 'pottery wheel mug', 'speckled ceramic', 'rustic kitchenware', 'slow living gift'],
      shortListing: 'Handmade terracotta ceramic mug (350ml) wheel-thrown with food-safe speckled glaze. Ergonomic comfort handle, earthy warmth, dishwasher safe.',
      cta: 'Claim your one-of-a-kind handmade mug today and bring artisanal serenity to your daily brew.'
    }
  },
  {
    id: 'sample_2',
    type: 'social',
    title: 'Diwali Festive Hand-Poured Soy Wax Diyas',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    language: 'Hindi',
    modelUsed: 'gemma-4-26b-a4b-it',
    tags: ['Diwali', 'Instagram', 'Home Decor'],
    data: {
      caption: '🪔 इस दीवाली अपने घर को प्राकृतिक खुशबू और हस्तनिर्मित दीयों की सौम्य रोशनी से सजाएं।\n\nशुद्ध सोया वैक्स और प्राकृतिक आवश्यक तेलों से हाथ से तैयार किए गए ये दीये 100% धुआं-मुक्त और पर्यावरण के अनुकूल हैं। मिट्टी के पारंपरिक रूप को आधुनिक सुगंध के साथ जोड़कर बनाया गया हर दीया आपके त्योहार को खास बनाएगा।\n\n✨ सीमित उत्सव संग्रह अब उपलब्ध है!',
      hashtags: ['#हस्तनिर्मितदीवाली', '#सस्टेनेबलदीया', '#HandmadeIndia', '#ArtisanCrafts', '#DiwaliGifting', '#EcoFriendlyCelebration', '#LocalArtisan', '#DesiCrafts'],
      shortPromo: '🪔 प्राकृतिक सोया वैक्स हस्तनिर्मित दीये अब उपलब्ध! दीवाली उपहार के लिए सीमित स्टॉक। तुरंत ऑर्डर करें।',
      cta: 'सीधे संदेश (DM) भेजकर या प्रोफाइल के लिंक पर क्लिक करके अपना फेस्टिव पैक बुक करें।',
      festiveCopy: 'दीवाली के पावन अवसर पर अपनों को दें प्रकृति का उपहार। कारीगरी की शुद्धता से जगमगाएं हर कोना।'
    }
  }
];

export async function checkGemmaHealth(): Promise<GemmaHealthStatus> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch('/api/ai/health', {
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        connected: false,
        model: errorData.model || 'gemma-4-26b-a4b-it',
        availableGemmaModels: errorData.availableGemmaModels || [],
        latencyMs: errorData.latencyMs || 0,
        message: errorData.message || `Server returned HTTP ${res.status}`,
        error: errorData.error || `HTTP error ${res.status}`,
        testedAt: errorData.testedAt || new Date().toISOString(),
      };
    }
    return await res.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    const isTimeout = err?.name === 'AbortError';
    return {
      connected: false,
      model: 'gemma-4-26b-a4b-it',
      availableGemmaModels: [],
      latencyMs: 0,
      message: isTimeout
        ? 'Connection check timed out after 12s'
        : (err?.message || 'Failed to connect to backend AI server'),
      error: isTimeout ? 'Request timed out' : (err?.message || String(err)),
      testedAt: new Date().toISOString(),
    };
  }
}

export async function generateProductListingApi(input: ProductListingInput): Promise<{
  data: ProductListingOutput;
  modelUsed: string;
}> {
  const res = await fetch('/api/ai/generate-product', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to generate product listing with Gemma.');
  }

  return {
    data: json.data,
    modelUsed: json.modelUsed,
  };
}

export async function generateSocialContentApi(input: SocialMediaInput): Promise<{
  data: SocialMediaOutput;
  modelUsed: string;
}> {
  const res = await fetch('/api/ai/generate-social', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to generate social media copy with Gemma.');
  }

  return {
    data: json.data,
    modelUsed: json.modelUsed,
  };
}

export async function explainPricingApi(input: PricingInput): Promise<{
  data: PricingResult;
  modelUsed: string;
}> {
  const labourCostTotal = input.labourHours * input.hourlyRate;
  const res = await fetch('/api/ai/explain-pricing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      materialCost: input.materialCost,
      labourCost: labourCostTotal,
      packagingCost: input.packagingCost,
      otherExpenses: input.otherExpenses,
      profitMargin: input.profitMargin,
      currency: input.currency,
    }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to calculate pricing explanation with Gemma.');
  }

  return {
    data: {
      ...json.data,
      labourCostTotal,
    },
    modelUsed: json.modelUsed,
  };
}

// Local Storage & Server Synchronized Saved Content
export async function fetchSavedItems(): Promise<{ items: SavedItem[]; source: 'backend' | 'local' }> {
  try {
    const res = await fetch('/api/saved');
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.items) && json.items.length > 0) {
        // Cache to local storage as fallback
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(json.items));
        return { items: json.items, source: 'backend' };
      }
    }
  } catch (err) {
    console.warn('Backend saved items fetch failed, checking local storage:', err);
  }

  // Fallback to local storage
  const local = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      return { items: parsed, source: 'local' };
    } catch {
      // invalid JSON
    }
  }

  // Seed sample items
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SAMPLE_SAVED_ITEMS));
  return { items: SAMPLE_SAVED_ITEMS, source: 'local' };
}

export async function saveItem(item: Omit<SavedItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<SavedItem> {
  // Try backend first
  try {
    const res = await fetch('/api/saved', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.item) {
        // Also update local storage
        const current = getLocalSavedItems();
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([json.item, ...current.filter((i) => i.id !== json.item.id)]));
        return json.item;
      }
    }
  } catch (err) {
    console.warn('Backend save failed, saving to local browser storage:', err);
  }

  // Local storage fallback
  const localItem: SavedItem = {
    ...item,
    id: 'local_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isLocalOnly: true,
  };

  const current = getLocalSavedItems();
  const updated = [localItem, ...current];
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  return localItem;
}

export async function deleteSavedItem(id: string): Promise<void> {
  try {
    await fetch(`/api/saved/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('Backend delete failed, deleting from local storage:', err);
  }

  const current = getLocalSavedItems();
  const updated = current.filter((i) => i.id !== id);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
}

export async function updateSavedItem(id: string, updates: Partial<SavedItem>): Promise<void> {
  try {
    await fetch(`/api/saved/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  } catch (err) {
    console.warn('Backend update failed:', err);
  }

  const current = getLocalSavedItems();
  const updated = current.map((i) => (i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i));
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
}

function getLocalSavedItems(): SavedItem[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function loadSellerProfile(): SellerProfile {
  try {
    const data = localStorage.getItem(LOCAL_PROFILE_KEY);
    return data ? { ...DEFAULT_PROFILE, ...JSON.parse(data) } : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveSellerProfile(profile: SellerProfile): void {
  localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));
}
