/**
 * Dedicated Server-Side Gemma AI Service for CraftSeller AI
 *
 * IMPORTANT: This service strictly uses Google's open-weight Gemma model (preferred: 'gemma-4-26b-a4b-it').
 * It never silently falls back to Gemini.
 */

import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Configurable model helper
export function getConfiguredModel(): string {
  return process.env.GEMMA_MODEL || 'gemma-4-26b-a4b-it';
}

export const CONFIGURED_GEMMA_MODEL = process.env.GEMMA_MODEL || 'gemma-4-26b-a4b-it';

export function getApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
}

let aiClient: GoogleGenAI | null = null;

export function getAiClient(): GoogleGenAI {
  const key = getApiKey();
  if (!key) {
    throw new Error('GEMINI_API_KEY environment variable is not configured. Please provide GEMINI_API_KEY in your environment settings.');
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export interface ModelHealthResult {
  connected: boolean;
  model: string;
  availableGemmaModels: string[];
  latencyMs: number;
  message: string;
  error?: string;
  testedAt: string;
}

function sanitizeErrorMessage(msg: string): string {
  if (!msg) return 'Unknown error';
  return msg.replace(/key=[a-zA-Z0-9_\-]+/gi, 'key=***');
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMsg: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${errorMsg} (timed out after ${timeoutMs}ms)`)), timeoutMs)
    ),
  ]);
}

function isGemmaModel(modelId: string): boolean {
  const normalized = modelId.toLowerCase();
  return normalized.includes('gemma') && !normalized.includes('gemini');
}

// In-memory cache for available Gemma models list so we don't paginate the full model catalog on every ping
let cachedGemmaModels: { models: string[]; timestamp: number } | null = null;
const GEMMA_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function discoverAvailableGemmaModels(client: GoogleGenAI): Promise<string[]> {
  if (cachedGemmaModels && Date.now() - cachedGemmaModels.timestamp < GEMMA_CACHE_TTL_MS) {
    return cachedGemmaModels.models;
  }
  try {
    const list = await withTimeout(client.models.list(), 4000, 'Listing Gemma models');
    const models: string[] = [];
    for await (const m of list) {
      if (m.name && m.name.toLowerCase().includes('gemma')) {
        models.push(m.name.replace('models/', ''));
      }
    }
    if (models.length > 0) {
      cachedGemmaModels = { models, timestamp: Date.now() };
      return models;
    }
  } catch {
    // If discovery list fails or times out, proceed without blocking
  }
  return cachedGemmaModels ? cachedGemmaModels.models : [CONFIGURED_GEMMA_MODEL];
}

/**
 * Verifies live connectivity with the Gemma inference endpoint.
 * Performs a genuine, lightweight inference request to ensure the model responds.
 * Strictly verifies Gemma models and does not silently fall back to Gemini.
 */
export async function testGemmaHealth(): Promise<ModelHealthResult> {
  const testTimestamp = new Date().toISOString();

  const key = getApiKey();
  const currentModel = getConfiguredModel();

  // 1. Verify API Key is available on server
  if (!key) {
    return {
      connected: false,
      model: currentModel,
      availableGemmaModels: [],
      latencyMs: 0,
      message: 'GEMINI_API_KEY is not configured in the server environment. On Netlify, add GEMINI_API_KEY in Site configuration > Environment variables.',
      error: 'Missing server API key (GEMINI_API_KEY)',
      testedAt: testTimestamp,
    };
  }

  // 2. Verify that configured model is strictly an open-weight Gemma model
  if (!isGemmaModel(currentModel)) {
    return {
      connected: false,
      model: currentModel,
      availableGemmaModels: [],
      latencyMs: 0,
      message: `Configured model "${currentModel}" is not an open-weight Gemma model. CraftSeller AI requires a Gemma model and never silently switches to Gemini.`,
      error: 'Invalid model configuration: non-Gemma model requested',
      testedAt: testTimestamp,
    };
  }

  const client = getAiClient();

  // 3. Perform a genuine, lightweight server-side Gemma inference request
  const pingStart = Date.now();
  try {
    let testResponse: any = null;
    let lastErr: any = null;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        testResponse = await withTimeout(
          client.models.generateContent({
            model: currentModel,
            contents: 'Ping test. Reply with exactly the single word "READY".',
          }),
          10000,
          `Gemma inference request to ${currentModel}`
        );
        if (testResponse?.text?.trim()) {
          break;
        }
      } catch (err: any) {
        lastErr = err;
        const msg = err?.message || String(err);
        if (attempt < 2 && (msg.includes('INTERNAL') || msg.includes('503') || msg.includes('overloaded'))) {
          await new Promise((r) => setTimeout(r, 600));
          continue;
        }
        throw err;
      }
    }

    if (!testResponse && lastErr) {
      throw lastErr;
    }

    const latencyMs = Date.now() - pingStart;
    const replyText = testResponse?.text?.trim() || '';

    // Only declare Connected if real Gemma request returned valid output
    if (!replyText) {
      return {
        connected: false,
        model: currentModel,
        availableGemmaModels: [currentModel],
        latencyMs,
        message: 'Gemma model responded with an empty output.',
        error: 'Empty model response',
        testedAt: testTimestamp,
      };
    }

    // Attempt non-blocking retrieval of catalog Gemma models
    const availableGemmaModels = await discoverAvailableGemmaModels(client);

    return {
      connected: true,
      model: currentModel,
      availableGemmaModels: availableGemmaModels.length > 0 ? availableGemmaModels : [currentModel],
      latencyMs,
      message: `Gemma model ${currentModel} responded in ${latencyMs}ms (${replyText.slice(0, 30)})`,
      testedAt: testTimestamp,
    };
  } catch (err: any) {
    const latencyMs = Date.now() - pingStart;
    const rawError = err?.message || String(err);
    const sanitized = sanitizeErrorMessage(rawError);

    let specificFailure = sanitized;
    if (rawError.includes('404') || rawError.includes('not found')) {
      specificFailure = `Model "${currentModel}" is not supported or not found on the current inference provider.`;
    } else if (rawError.includes('403') || rawError.includes('API_KEY_INVALID')) {
      specificFailure = 'Authentication failed: Invalid or unauthorized GEMINI_API_KEY.';
    } else if (rawError.includes('429') || rawError.includes('RESOURCE_EXHAUSTED')) {
      specificFailure = 'Rate limit reached on Google Gemma endpoint (HTTP 429). Please wait a moment and click Retry.';
    } else if (rawError.includes('timed out')) {
      specificFailure = `Inference ping timed out (${latencyMs}ms).`;
    }

    return {
      connected: false,
      model: currentModel,
      availableGemmaModels: [],
      latencyMs,
      message: `Connection Failed: ${specificFailure}`,
      error: sanitized,
      testedAt: testTimestamp,
    };
  }
}

/**
 * Generate Product Listing Output using Gemma
 */
export async function generateProductListing(params: {
  name: string;
  category: string;
  material: string;
  color: string;
  features: string;
  targetAudience: string;
  platform: string;
  language: 'English' | 'Hindi';
  tone: 'Professional' | 'Friendly' | 'Premium' | 'Traditional';
}) {
  const client = getAiClient();

  const prompt = `You are a specialist e-commerce copywriter for handmade artisans and craft sellers.
You are generating content strictly using the user's provided details.

STRICT ACCURACY RULES:
- Do NOT invent certifications (e.g. "certified organic", "GOTS certified", "fair-trade") unless explicitly provided.
- Do NOT invent materials, dimensions, specific weight, or origin locations not supplied by the user.
- Do NOT invent false handmade claims or unverifiable awards.
- Tone: ${params.tone}
- Selling Platform: ${params.platform}
- Output Language: ${params.language === 'Hindi' ? 'Hindi (clean, natural, readable Devanagari script, preserving original product details accurately)' : 'English'}

USER PRODUCT DETAILS:
- Product Name: ${params.name}
- Category: ${params.category}
- Material: ${params.material || 'Handcrafted material'}
- Color / Finish: ${params.color || 'Artisanal finish'}
- Product Features: ${params.features}
- Target Audience: ${params.targetAudience || 'Art lovers, craft enthusiasts, and mindful shoppers'}

REQUIRED OUTPUT FORMAT:
You MUST respond with a valid JSON object only (no markdown code blocks, no other text before or after). The JSON must match this structure:
{
  "title": "SEO-friendly product title (60-80 chars, includes material and craft type)",
  "description": "Engaging, sensory-rich 2-3 paragraph product description highlighting the artisanal care and quality without hallucinating unmentioned specs",
  "highlights": [
    "Key highlight 1",
    "Key highlight 2",
    "Key highlight 3",
    "Key highlight 4"
  ],
  "keywords": [
    "keyword1",
    "keyword2",
    "keyword3",
    "keyword4",
    "keyword5",
    "keyword6",
    "keyword7",
    "keyword8"
  ],
  "shortListing": "Concise marketplace listing suitable for mobile preview or Etsy quick card (under 50 words)",
  "cta": "Compelling call to action encouraging the buyer to order or support the artisan"
}`;

  const response = await client.models.generateContent({
    model: getConfiguredModel(),
    contents: prompt,
  });

  const rawText = response.text || '';
  return parseJsonFromModel(rawText, 'ProductListing');
}

/**
 * Generate Social Media Content using Gemma
 */
export async function generateSocialContent(params: {
  productName: string;
  productDetails: string;
  platform: 'Instagram' | 'Facebook' | 'WhatsApp';
  targetAudience: string;
  language: 'English' | 'Hindi';
  campaignGoal: string;
}) {
  const client = getAiClient();

  const prompt = `You are an expert social media manager for handmade artisans, indie makers, and small Instagram shops.

STRICT ACCURACY RULES:
- Do not invent specs, certifications, or materials not provided by the seller.
- Target Social Platform: ${params.platform}
- Campaign Goal: ${params.campaignGoal}
- Output Language: ${params.language === 'Hindi' ? 'Hindi (readable, modern Devanagari script suitable for social media captions)' : 'English'}

PRODUCT & CAMPAIGN DETAILS:
- Product Name: ${params.productName}
- Product Information: ${params.productDetails}
- Target Audience: ${params.targetAudience || 'Conscious shoppers & handmade lovers'}

REQUIRED OUTPUT FORMAT:
You MUST respond with a valid JSON object only (no markdown code blocks, no other text before or after). The JSON must match this structure:
{
  "caption": "Platform-tailored caption with storytelling hook, artisan essence, and line breaks suitable for ${params.platform}",
  "hashtags": [
    "#hashtag1",
    "#hashtag2",
    "#hashtag3",
    "#hashtag4",
    "#hashtag5",
    "#hashtag6",
    "#hashtag7",
    "#hashtag8"
  ],
  "shortPromo": "Short punchy broadcast / status message (under 35 words, perfect for WhatsApp status or SMS)",
  "cta": "Direct action prompt (e.g., 'DM to claim', 'Link in bio', 'Reply with your favorite color')",
  "festiveCopy": "Optional seasonal or festive angle (e.g. for upcoming celebrations, festive gifting, or artisan weekend market)"
}`;

  const response = await client.models.generateContent({
    model: getConfiguredModel(),
    contents: prompt,
  });

  const rawText = response.text || '';
  return parseJsonFromModel(rawText, 'SocialContent');
}

/**
 * Explain Pricing Calculation using Gemma
 */
export async function explainPricingEstimate(params: {
  materialCost: number;
  labourCost: number;
  packagingCost: number;
  otherExpenses: number;
  profitMargin: number;
  totalCost: number;
  sellingPrice: number;
  profitAmount: number;
  currency: string;
}) {
  const client = getAiClient();

  const prompt = `You are an experienced handmade business advisor helping an artisan or craft seller evaluate their pricing.

THE EXACT MATHEMATICAL CALCULATION:
- Material Cost: ${params.currency}${params.materialCost.toFixed(2)}
- Labour Cost: ${params.currency}${params.labourCost.toFixed(2)}
- Packaging Cost: ${params.currency}${params.packagingCost.toFixed(2)}
- Other Expenses (fees, depreciation, shipping): ${params.currency}${params.otherExpenses.toFixed(2)}
- Total Base Cost: ${params.currency}${params.totalCost.toFixed(2)}
- Desired Profit Margin: ${params.profitMargin}%
- Calculated Suggested Selling Price [Total Cost / (1 - Margin/100)]: ${params.currency}${params.sellingPrice.toFixed(2)}
- Net Profit per unit: ${params.currency}${params.profitAmount.toFixed(2)}

GUIDELINES & DISCLAIMERS:
- Transparently explain how the formula ensures the artisan actually earns their target margin after covering all expenses.
- Do NOT fabricate or claim you have live real-time market data or competitor scraping data.
- Offer 3-4 practical artisan pricing considerations (such as wholesale buffer if selling to shops, batching efficiency, perceived value of handmade uniqueness, and avoiding the trap of underpricing artisan labour).

REQUIRED OUTPUT FORMAT:
You MUST respond with a valid JSON object only (no markdown code blocks, no other text before or after). The JSON must match this structure:
{
  "explanation": "Clear 2-3 paragraph explanation of the pricing math, why paying oneself fair artisan labour is essential, and how this selling price protects business sustainability.",
  "considerations": [
    "Point 1 on perceived value and craft positioning",
    "Point 2 on wholesale or craft fair commission buffer",
    "Point 3 on tracking actual hands-on crafting hours",
    "Point 4 on tiered pricing or bundle strategies"
  ],
  "disclaimer": "This estimate is based on your input costs and target margin formula. Always verify with your actual local market demand and platform transaction fees."
}`;

  const response = await client.models.generateContent({
    model: getConfiguredModel(),
    contents: prompt,
  });

  const rawText = response.text || '';
  return parseJsonFromModel(rawText, 'PricingEstimate');
}

/**
 * Safe JSON parser for model outputs that strips markdown code fences if present
 */
function parseJsonFromModel(text: string, contextName: string): any {
  let cleaned = text.trim();
  // Strip ```json ... ``` or ``` ... ```
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // If JSON parsing fails, attempt regex extraction
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        // Fall through
      }
    }
    throw new Error(`Failed to parse structured JSON from Gemma for ${contextName}. Raw output: ${cleaned.slice(0, 300)}...`);
  }
}
