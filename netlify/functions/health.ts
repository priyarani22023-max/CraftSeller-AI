import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import dotenv from 'dotenv';
import { testGemmaHealth } from '../../server/ai.js';

dotenv.config();

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cache-Control, X-Requested-With',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json',
};

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: '',
    };
  }

  try {
    const health = await testGemmaHealth();
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(health),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        connected: false,
        error: err?.message || 'Failed checking Gemma health in Netlify function',
        testedAt: new Date().toISOString(),
      }),
    };
  }
};
