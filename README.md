# CraftSeller AI 🎨✂️
> **Turn handmade creativity into a thriving business.**
> Built for the **Hacktoberfest Open-Source AI Challenge Week 2: Side Hustle**.

CraftSeller AI is an AI-powered business copilot tailored for independent craftspeople, Etsy shop owners, local artisans, and small Instagram creators. It empowers makers to generate SEO-rich product listings, platform-optimized social media copy, bilingual marketing (English & Hindi), and mathematically sound pricing estimates using Google’s open-weight **Gemma** model.

---

## 🎯 Target Users & Problem Statement

Independent craft sellers and artisans possess incredible tactile skills, but frequently struggle with the digital demands of modern e-commerce:
- **Writing Product Listings:** Crafting SEO titles, structured highlights, and customer-converting descriptions takes hours away from the workbench.
- **Social Media Marketing:** Writing engaging captions, discovering relevant niche hashtags, and producing festive broadcast messages for WhatsApp/Instagram.
- **The "Underpricing Trap":** Artisans often tally only material costs and guess selling prices, effectively giving away their skilled crafting hours for free and destroying long-term business viability.
- **Multilingual Craft Markets:** Many talented artisans in India and diverse global communities communicate naturally in Hindi or regional languages but lack accessible tools to reach both local and international markets.

---

## ✨ Core Features

1. **AI Product Listing Writer**
   - Generates 6 distinct listing assets: SEO Product Title, Rich Storytelling Description, 4 Bullet Highlights, 8+ Search Keywords/Tags, Short Marketplace Snippet (for mobile/Etsy cards), and Call to Action.
   - **Strict Grounding Guardrails:** Gemma is prompted to never hallucinate materials, certifications (e.g. "GOTS organic"), dimensions, or awards not supplied by the maker.
   - Supports 4 brand tones: *Friendly*, *Professional*, *Premium*, and *Traditional*.

2. **Social Media Studio**
   - Platform-optimized copy for **Instagram** (emojis, aesthetic line breaks), **Facebook** (community storytelling), and **WhatsApp** (punchy broadcast/status messages).
   - Dynamic hashtags cluster and optional festive/seasonal marketing angles (e.g. Diwali, Holi, seasonal craft markets).

3. **Artisan Pricing Helper**
   - Interactive calculator enforcing standard commercial margin math:  
     $$\text{Selling Price} = \frac{\text{Total Cost}}{1 - \frac{\text{Profit Margin}}{100}}$$
   - Separate accounting for: Materials, Artisan Labour (Hours $\times$ Hourly Wage), Packaging, and Overhead/Market fees.
   - Prevents fatal divide-by-zero errors (margins $\ge 100\%$).
   - Gemma business advisor provides practical considerations: wholesale discount buffers, batch production efficiencies, and value perception without fabricating ungrounded competitor scraping data.

4. **Bilingual Support (English & Hindi)**
   - First-class support for English and natural Devanagari script हिंदी (Hindi), preserving artisan nuance and cultural festive contexts.

5. **Saved Content & Export**
   - Save, preview, copy, edit, and delete generated assets.
   - Synchronized file persistence (`data/saved_items.json`) with resilient local browser storage fallback.
   - Full JSON export and import capabilities.

6. **Live Gemma Model Health & Diagnostics**
   - Real-time backend ping to test connectivity and latency to the open-weight Gemma model.
   - Truthful indicators: no fake connection states or hardcoded mock text.

---

## 🧠 AI Model Integration: Gemma Open-Weight Model

CraftSeller AI is powered strictly by **Gemma**, Google’s family of lightweight, state-of-the-art open-weight models.

- **Configured Model:** `gemma-4-26b-a4b-it` (Google Gemma 4 26B A4B Instruction-Tuned)
- **Fallback Tested Model:** `gemma-4-31b-it`
- **SDK:** Official `@google/genai` TypeScript SDK (server-side only)
- **Zero Client-Side Key Exposure:** All inference calls run on the Node.js Express backend (`server/ai.ts`). The API key never touches the browser DOM or client-side bundles.

> **Important Distinction:** The environment variable name `GEMINI_API_KEY` is the credential name used by Google AI Studio's infrastructure to access Google's hosted endpoints. However, the model executed is strictly the open-weight **Gemma** model, **never** a Gemini model.

---

## 💡 Why Open-Weight AI Matters for Artisans

Proprietary, closed-source models pose distinct risks for independent artisans and small creative businesses:

1. **Vendor Independence & Anti-Lock-In:**  
   Closed-source models can change their pricing, censor domains, or shut down APIs overnight. Open-weight models like Gemma provide algorithmic transparency and architectural stability.

2. **Local Deployment & Offline Workshop Freedom:**  
   Because Gemma’s model weights are openly accessible, artisans can run compatible Gemma models locally using open-source engines like [Ollama](https://ollama.ai), [llama.cpp](https://github.com/ggerganov/llama.cpp), or [vLLM](https://github.com/vllm-project/vllm). A craft studio in a remote mountain pottery village or off-grid workshop can generate listings and analyze pricing without active internet connectivity.

3. **Intellectual Property & Recipe Protection:**  
   Ceramic glaze chemistry formulas, proprietary herbal soap recipes, and unique woodworking joinery methods can be processed completely privately on local hardware without sending trade secrets to third-party data collection pipelines.

### Honest Limitations:
- *Hosted Inference vs Local:* When using the hosted Google API endpoint, internet access is required and usage is subject to provider rate limits.
- *Open Weights vs Open Source:* While Gemma weights are freely distributable under the Gemma Terms of Use, the underlying training data is proprietary.

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Browser                        │
│   React 19 + TypeScript + Tailwind CSS + Lucide Icons       │
│                                                             │
│  [ Dashboard ]  [ Product Writer ]  [ Social Studio ]       │
│  [ Pricing Calculator ]  [ Saved Content ]  [ Settings ]    │
└──────────────────────────────┬──────────────────────────────┘
                               │
               HTTP / REST API (JSON payloads)
               (No API keys exposed in browser)
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    Node.js Express Server                   │
│                        (server.ts)                          │
│                                                             │
│  ├── GET  /api/ai/health          (Live Gemma ping & ping)  │
│  ├── POST /api/ai/generate-product (Listing generator)      │
│  ├── POST /api/ai/generate-social  (Social captions & tags) │
│  ├── POST /api/ai/explain-pricing  (Artisan pricing review) │
│  └── CRUD /api/saved               (Content persistence)    │
│                                                             │
│  Storage: data/saved_items.json (with browser localStorage) │
└──────────────────────────────┬──────────────────────────────┘
                               │
                  Official @google/genai SDK
                  (Authenticated Server-to-Server)
                               │
┌──────────────────────────────▼──────────────────────────────┐
│            Google Gemma Open-Weight Model Engine            │
│                 Model: gemma-4-26b-a4b-it                   │
│         (Alternative: gemma-4-31b-it / Local Ollama)        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Motion
- **Icons:** Lucide React
- **Typography:** Fraunces (editorial artisanal serif), Plus Jakarta Sans (UI body), JetBrains Mono (numbers/prices)
- **Backend:** Node.js, Express, tsx
- **AI Engine:** Google Gemma (`gemma-4-26b-a4b-it`) via `@google/genai`
- **Build Tool:** Vite 8

---

## 🚀 Local Development Setup

### 1. Prerequisites
- Node.js 20+ installed
- A Google AI Studio API key with access to Gemma models

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your `.env` file:
```env
# API Key for authenticating the Google Gemma endpoint
GEMINI_API_KEY="your-api-key-here"

# Configured open-weight Gemma model ID
GEMMA_MODEL="gemma-4-26b-a4b-it"

# Port (defaults to 3000)
PORT=3000
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Typecheck & Build
```bash
# Typecheck
npm run lint

# Production build
npm run build

# Start production server
npm start
```

---

## ⚖️ License & Acknowledgements

- Built for **Hacktoberfest Open-Source AI Challenge Week 2: Side Hustle**.
- Powered by Google's open-weight **Gemma** models.
- Licensed under the Apache-2.0 License.
