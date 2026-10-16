import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import {
  CONFIGURED_GEMMA_MODEL,
  testGemmaHealth,
  generateProductListing,
  generateSocialContent,
  explainPricingEstimate,
} from './ai.js';

export const apiRouter = Router();

// File persistence path for saved items
const DATA_DIR = path.resolve(process.cwd(), 'data');
const SAVED_ITEMS_FILE = path.join(DATA_DIR, 'saved_items.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface SavedItemRecord {
  id: string;
  type: 'product' | 'social' | 'pricing';
  title: string;
  createdAt: string;
  updatedAt: string;
  language: string;
  modelUsed: string;
  data: any;
  tags?: string[];
}

function readSavedItems(): SavedItemRecord[] {
  try {
    if (fs.existsSync(SAVED_ITEMS_FILE)) {
      const content = fs.readFileSync(SAVED_ITEMS_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading saved items from disk:', err);
  }
  return [];
}

function writeSavedItems(items: SavedItemRecord[]) {
  try {
    fs.writeFileSync(SAVED_ITEMS_FILE, JSON.stringify(items, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing saved items to disk:', err);
  }
}

// In-memory cache synced with disk
let savedItemsStore: SavedItemRecord[] = readSavedItems();

// 1. AI Health Check
apiRouter.get('/ai/health', async (_req: Request, res: Response) => {
  try {
    const health = await testGemmaHealth();
    res.json(health);
  } catch (error: any) {
    res.status(500).json({
      connected: false,
      model: CONFIGURED_GEMMA_MODEL,
      latencyMs: 0,
      message: error?.message || 'Server error checking Gemma health',
      error: String(error),
      testedAt: new Date().toISOString(),
    });
  }
});

// 2. Generate Product Listing
apiRouter.post('/ai/generate-product', async (req: Request, res: Response) => {
  const { name, category, material, color, features, targetAudience, platform, language, tone } = req.body;

  if (!name || !category || !features) {
    res.status(400).json({
      error: 'Product name, category, and features are required.',
    });
    return;
  }

  try {
    const result = await generateProductListing({
      name: String(name).trim(),
      category: String(category).trim(),
      material: String(material || '').trim(),
      color: String(color || '').trim(),
      features: String(features).trim(),
      targetAudience: String(targetAudience || '').trim(),
      platform: String(platform || 'Etsy').trim(),
      language: language === 'Hindi' ? 'Hindi' : 'English',
      tone: ['Professional', 'Friendly', 'Premium', 'Traditional'].includes(tone) ? tone : 'Friendly',
    });

    res.json({
      success: true,
      data: result,
      modelUsed: CONFIGURED_GEMMA_MODEL,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Product listing generation failed:', err);
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to generate product listing using Gemma.',
      modelUsed: CONFIGURED_GEMMA_MODEL,
    });
  }
});

// 3. Generate Social Media Content
apiRouter.post('/ai/generate-social', async (req: Request, res: Response) => {
  const { productName, productDetails, platform, targetAudience, language, campaignGoal } = req.body;

  if (!productName || !productDetails) {
    res.status(400).json({
      error: 'Product name and product details are required.',
    });
    return;
  }

  try {
    const result = await generateSocialContent({
      productName: String(productName).trim(),
      productDetails: String(productDetails).trim(),
      platform: ['Instagram', 'Facebook', 'WhatsApp'].includes(platform) ? platform : 'Instagram',
      targetAudience: String(targetAudience || '').trim(),
      language: language === 'Hindi' ? 'Hindi' : 'English',
      campaignGoal: String(campaignGoal || 'Product Launch').trim(),
    });

    res.json({
      success: true,
      data: result,
      modelUsed: CONFIGURED_GEMMA_MODEL,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Social media generation failed:', err);
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to generate social media content using Gemma.',
      modelUsed: CONFIGURED_GEMMA_MODEL,
    });
  }
});

// 4. Explain Pricing Calculation
apiRouter.post('/ai/explain-pricing', async (req: Request, res: Response) => {
  const { materialCost, labourCost, packagingCost, otherExpenses, profitMargin, currency } = req.body;

  const mat = Number(materialCost) || 0;
  const lab = Number(labourCost) || 0;
  const pack = Number(packagingCost) || 0;
  const other = Number(otherExpenses) || 0;
  const margin = Number(profitMargin) || 0;

  if (margin >= 100) {
    res.status(400).json({
      error: 'Profit margin cannot be 100% or greater. In standard margin pricing, margin must be under 100%.',
    });
    return;
  }
  if (margin < 0) {
    res.status(400).json({
      error: 'Profit margin cannot be negative.',
    });
    return;
  }

  const totalCost = mat + lab + pack + other;
  if (totalCost <= 0) {
    res.status(400).json({
      error: 'Total cost must be greater than zero.',
    });
    return;
  }

  // Formula: selling price = total cost / (1 - profit margin / 100)
  const sellingPrice = totalCost / (1 - margin / 100);
  const profitAmount = sellingPrice - totalCost;

  try {
    const result = await explainPricingEstimate({
      materialCost: mat,
      labourCost: lab,
      packagingCost: pack,
      otherExpenses: other,
      profitMargin: margin,
      totalCost,
      sellingPrice,
      profitAmount,
      currency: currency || '$',
    });

    res.json({
      success: true,
      data: {
        totalCost,
        sellingPrice,
        profitAmount,
        formula: 'selling price = total cost / (1 - profit margin / 100)',
        explanation: result.explanation,
        considerations: result.considerations,
        disclaimer: result.disclaimer,
      },
      modelUsed: CONFIGURED_GEMMA_MODEL,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Pricing explanation failed:', err);
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to generate pricing explanation with Gemma.',
      modelUsed: CONFIGURED_GEMMA_MODEL,
    });
  }
});

// 5. Saved Content CRUD
apiRouter.get('/saved', (_req: Request, res: Response) => {
  res.json({
    items: savedItemsStore,
    storageType: 'server-json',
    total: savedItemsStore.length,
  });
});

apiRouter.post('/saved', (req: Request, res: Response) => {
  const { type, title, data, language, tags } = req.body;

  if (!type || !title || !data) {
    res.status(400).json({ error: 'Type, title, and data are required.' });
    return;
  }

  const newItem: SavedItemRecord = {
    id: 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    type,
    title: String(title).trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    language: language || 'English',
    modelUsed: CONFIGURED_GEMMA_MODEL,
    data,
    tags: Array.isArray(tags) ? tags : [],
  };

  savedItemsStore.unshift(newItem);
  writeSavedItems(savedItemsStore);

  res.status(201).json({ success: true, item: newItem });
});

apiRouter.put('/saved/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, data, tags } = req.body;

  const index = savedItemsStore.findIndex((i) => i.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }

  const existing = savedItemsStore[index];
  const updated: SavedItemRecord = {
    ...existing,
    title: title ? String(title).trim() : existing.title,
    data: data || existing.data,
    tags: Array.isArray(tags) ? tags : existing.tags,
    updatedAt: new Date().toISOString(),
  };

  savedItemsStore[index] = updated;
  writeSavedItems(savedItemsStore);

  res.json({ success: true, item: updated });
});

apiRouter.delete('/saved/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLength = savedItemsStore.length;
  savedItemsStore = savedItemsStore.filter((i) => i.id !== id);

  if (savedItemsStore.length === initialLength) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }

  writeSavedItems(savedItemsStore);
  res.json({ success: true, message: 'Item deleted' });
});
