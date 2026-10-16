export interface ProductListingInput {
  name: string;
  category: string;
  material: string;
  color: string;
  features: string;
  targetAudience: string;
  platform: 'Etsy' | 'Instagram Shop' | 'Amazon Handmade' | 'Shopify' | 'Craft Fair & Markets';
  language: 'English' | 'Hindi';
  tone: 'Professional' | 'Friendly' | 'Premium' | 'Traditional';
}

export interface ProductListingOutput {
  title: string;
  description: string;
  highlights: string[];
  keywords: string[];
  shortListing: string;
  cta: string;
}

export interface SocialMediaInput {
  productName: string;
  productDetails: string;
  platform: 'Instagram' | 'Facebook' | 'WhatsApp';
  targetAudience: string;
  language: 'English' | 'Hindi';
  campaignGoal: 'Product Launch' | 'Behind-the-Scenes' | 'Limited Edition' | 'Festive / Seasonal Sale' | 'Customer Appreciation';
}

export interface SocialMediaOutput {
  caption: string;
  hashtags: string[];
  shortPromo: string;
  cta: string;
  festiveCopy?: string;
}

export interface PricingInput {
  materialCost: number;
  labourHours: number;
  hourlyRate: number;
  packagingCost: number;
  otherExpenses: number;
  profitMargin: number; // percentage e.g. 35%
  currency: string;
}

export interface PricingResult {
  totalCost: number;
  sellingPrice: number;
  profitAmount: number;
  labourCostTotal: number;
  formula: string;
  explanation: string;
  considerations: string[];
  disclaimer: string;
}

export interface GemmaHealthStatus {
  connected: boolean;
  model: string;
  availableGemmaModels: string[];
  latencyMs: number;
  message: string;
  error?: string;
  testedAt: string;
}

export interface SavedItem {
  id: string;
  type: 'product' | 'social' | 'pricing';
  title: string;
  createdAt: string;
  updatedAt: string;
  language: string;
  modelUsed: string;
  data: any;
  tags?: string[];
  isLocalOnly?: boolean;
}

export interface SellerProfile {
  shopName: string;
  artisanName: string;
  defaultCurrency: string;
  defaultLanguage: 'English' | 'Hindi';
  defaultTone: 'Professional' | 'Friendly' | 'Premium' | 'Traditional';
  craftSpecialty: string;
}
