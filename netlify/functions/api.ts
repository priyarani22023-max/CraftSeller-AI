import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import dotenv from 'dotenv';
import {
  getConfiguredModel,
  testGemmaHealth,
  generateProductListing,
  generateSocialContent,
  explainPricingEstimate,
} from '../../server/ai.js';

dotenv.config();

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cache-Control, X-Requested-With',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

// In-memory store for serverless functions runtime (with client localStorage sync)
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

let inMemorySavedItems: SavedItemRecord[] = [];

function normalizeSubPath(rawPath: string): string {
  let p = rawPath || '';
  if (p.includes('?')) {
    p = p.split('?')[0];
  }
  p = p
    .replace(/^\/\.netlify\/functions\/api/, '')
    .replace(/^\/api/, '');
  if (!p || p === '') return '/';
  if (!p.startsWith('/')) p = '/' + p;
  return p;
}

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  // 1. Handle CORS Preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: '',
    };
  }

  const subPath = normalizeSubPath(event.path);
  const method = event.httpMethod.toUpperCase();
  const configuredModel = getConfiguredModel();

  try {
    // 2. Health Check: GET /ai/health or /health or /
    if ((subPath === '/ai/health' || subPath === '/health') && method === 'GET') {
      const health = await testGemmaHealth();
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(health),
      };
    }

    // 3. Generate Product Listing: POST /ai/generate-product
    if (subPath === '/ai/generate-product' && method === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      const { name, category, material, color, features, targetAudience, platform, language, tone } = body;

      if (!name || !category || !features) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Product name, category, and features are required.' }),
        };
      }

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

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          success: true,
          data: result,
          modelUsed: configuredModel,
          generatedAt: new Date().toISOString(),
        }),
      };
    }

    // 4. Generate Social Content: POST /ai/generate-social
    if (subPath === '/ai/generate-social' && method === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      const { productName, productDetails, platform, targetAudience, language, campaignGoal } = body;

      if (!productName || !productDetails) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Product name and product details are required.' }),
        };
      }

      const result = await generateSocialContent({
        productName: String(productName).trim(),
        productDetails: String(productDetails).trim(),
        platform: ['Instagram', 'Facebook', 'WhatsApp'].includes(platform) ? platform : 'Instagram',
        targetAudience: String(targetAudience || '').trim(),
        language: language === 'Hindi' ? 'Hindi' : 'English',
        campaignGoal: String(campaignGoal || 'Product Launch').trim(),
      });

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          success: true,
          data: result,
          modelUsed: configuredModel,
          generatedAt: new Date().toISOString(),
        }),
      };
    }

    // 5. Explain Pricing: POST /ai/explain-pricing
    if (subPath === '/ai/explain-pricing' && method === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      const { materialCost, labourCost, packagingCost, otherExpenses, profitMargin, currency } = body;

      const mat = Number(materialCost) || 0;
      const lab = Number(labourCost) || 0;
      const pack = Number(packagingCost) || 0;
      const other = Number(otherExpenses) || 0;
      const margin = Number(profitMargin) || 0;

      if (margin >= 100) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Profit margin cannot be 100% or greater.' }),
        };
      }
      if (margin < 0) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Profit margin cannot be negative.' }),
        };
      }

      const totalCost = mat + lab + pack + other;
      if (totalCost <= 0) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Total cost must be greater than zero.' }),
        };
      }

      const sellingPrice = totalCost / (1 - margin / 100);
      const profitAmount = sellingPrice - totalCost;

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

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
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
          modelUsed: configuredModel,
          generatedAt: new Date().toISOString(),
        }),
      };
    }

    // 6. Saved Items CRUD: /saved
    if (subPath === '/saved' || subPath.startsWith('/saved/')) {
      if (method === 'GET') {
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({
            items: inMemorySavedItems,
            storageType: 'netlify-function',
            total: inMemorySavedItems.length,
          }),
        };
      }

      if (method === 'POST') {
        const body = event.body ? JSON.parse(event.body) : {};
        const { type, title, data, language, tags } = body;
        if (!type || !title || !data) {
          return {
            statusCode: 400,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Type, title, and data are required.' }),
          };
        }

        const newItem: SavedItemRecord = {
          id: 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          type,
          title: String(title).trim(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          language: language || 'English',
          modelUsed: configuredModel,
          data,
          tags: Array.isArray(tags) ? tags : [],
        };
        inMemorySavedItems.unshift(newItem);

        return {
          statusCode: 201,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: true, item: newItem }),
        };
      }

      if (method === 'PUT' && subPath.startsWith('/saved/')) {
        const id = subPath.replace('/saved/', '');
        const body = event.body ? JSON.parse(event.body) : {};
        const index = inMemorySavedItems.findIndex((i) => i.id === id);
        if (index === -1) {
          return {
            statusCode: 404,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Item not found' }),
          };
        }
        inMemorySavedItems[index] = {
          ...inMemorySavedItems[index],
          title: body.title ? String(body.title).trim() : inMemorySavedItems[index].title,
          data: body.data || inMemorySavedItems[index].data,
          tags: Array.isArray(body.tags) ? body.tags : inMemorySavedItems[index].tags,
          updatedAt: new Date().toISOString(),
        };
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: true, item: inMemorySavedItems[index] }),
        };
      }

      if (method === 'DELETE' && subPath.startsWith('/saved/')) {
        const id = subPath.replace('/saved/', '');
        inMemorySavedItems = inMemorySavedItems.filter((i) => i.id !== id);
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: true, message: 'Item deleted' }),
        };
      }
    }

    // Default 404 if no route matched
    return {
      statusCode: 404,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: `Route not found: ${method} ${event.path} (subPath: ${subPath})`,
      }),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: false,
        error: err?.message || 'Internal server error in Netlify function',
        modelUsed: configuredModel,
      }),
    };
  }
};
