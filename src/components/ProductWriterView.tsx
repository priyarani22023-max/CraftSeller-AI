import React, { useState } from 'react';
import {
  PenTool,
  Copy,
  Check,
  RotateCw,
  BookmarkPlus,
  BookmarkCheck,
  AlertCircle,
  Sparkles,
  Info,
  Globe2,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { ProductListingInput, ProductListingOutput, SavedItem } from '../types';
import { generateProductListingApi, saveItem } from '../services/api';

interface ProductWriterViewProps {
  onNotify: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
  onItemSaved: (item: SavedItem) => void;
}

const CATEGORIES = [
  'Ceramics & Pottery',
  'Handwoven Textiles & Macrame',
  'Jewelry & Metalsmithing',
  'Woodworking & Carving',
  'Candles & Wax Melts',
  'Leathercraft & Bags',
  'Paper Goods & Stationery',
  'Hand-Painted Art & Prints',
  'Crochet & Knitting',
  'Natural Soaps & Apothecary',
];

const PLATFORMS: ProductListingInput['platform'][] = [
  'Etsy',
  'Instagram Shop',
  'Amazon Handmade',
  'Shopify',
  'Craft Fair & Markets',
];

const TONES: ProductListingInput['tone'][] = [
  'Friendly',
  'Professional',
  'Premium',
  'Traditional',
];

const SAMPLE_PRESETS: { label: string; data: ProductListingInput }[] = [
  {
    label: 'Ceramic Coffee Mug',
    data: {
      name: 'Rustic Terracotta Speckled Mug',
      category: 'Ceramics & Pottery',
      material: 'Stoneware terracotta clay with food-safe non-toxic glaze',
      color: 'Warm earth terracotta with matte cream speckles',
      features: 'Wheel-thrown by hand, 350ml (12oz) liquid capacity, ergonomic rounded comfort handle, durable stoneware fired to 1220°C, microwave and dishwasher safe',
      targetAudience: 'Artisan coffee enthusiasts, slow living fans, mindful morning routine lovers',
      platform: 'Etsy',
      language: 'English',
      tone: 'Friendly',
    },
  },
  {
    label: 'Macrame Wall Hanging (Hindi)',
    data: {
      name: 'बोहो कॉटन मैक्रैम वॉल हैंगिंग (Boho Cotton Macrame Wall Hanging)',
      category: 'Handwoven Textiles & Macrame',
      material: '100% प्राकृतिक शुद्ध अनब्लीच्ड कॉटन डोरी (Natural Unbleached Cotton Cord)',
      color: 'प्राकृतिक ऑफ-व्हाइट (Natural Cream Off-White)',
      features: 'पूरी तरह से हाथ से बुनी गई जटिल ज्यामितीय डिजाइन, टिकाऊ ड्रिफ्टवुड छड़ी पर बंधी हुई, लंबाई 24 इंच, चौड़ाई 14 इंच',
      targetAudience: 'गृह सज्जा प्रेमी, बोहेमियन डेकोर के शौकीन, हस्तनिर्मित उपहार की तलाश करने वाले',
      platform: 'Instagram Shop',
      language: 'Hindi',
      tone: 'Traditional',
    },
  },
  {
    label: 'Sterling Silver Ring',
    data: {
      name: 'Botanical Leaf Filigree Ring',
      category: 'Jewelry & Metalsmithing',
      material: 'Solid 925 sterling silver, nickel-free',
      color: 'Bright polished silver with subtle oxidized leaf vein shadows',
      features: 'Hand-pierced and sculpted leaf motif, adjustable comfort band fitting US sizes 6-8, lightweight 3.2 grams, smooth inner edges',
      targetAudience: 'Nature lovers, botanical jewelry collectors, thoughtful birthday and anniversary gifting',
      platform: 'Shopify',
      language: 'English',
      tone: 'Premium',
    },
  },
];

export const ProductWriterView: React.FC<ProductWriterViewProps> = ({
  onNotify,
  onItemSaved,
}) => {
  const [formData, setFormData] = useState<ProductListingInput>({
    name: '',
    category: CATEGORIES[0],
    material: '',
    color: '',
    features: '',
    targetAudience: '',
    platform: 'Etsy',
    language: 'English',
    tone: 'Friendly',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProductListingOutput | null>(null);
  const [modelUsed, setModelUsed] = useState<string>('gemma-4-26b-a4b-it');
  const [saved, setSaved] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    onNotify('Copied to clipboard', `${keyName} copied successfully.`, 'success');
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.name.trim() || !formData.features.trim()) {
      setError('Please provide at least a Product Name and key Product Features.');
      return;
    }

    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const response = await generateProductListingApi(formData);
      setResult(response.data);
      setModelUsed(response.modelUsed);
      onNotify('Listing Generated', 'Craft listing created using open-weight Gemma.', 'success');
    } catch (err: any) {
      const msg = err?.message || 'Failed to generate product listing with Gemma.';
      setError(msg);
      onNotify('Generation Failed', msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async () => {
    if (!result) return;
    try {
      const savedItem = await saveItem({
        type: 'product',
        title: result.title || formData.name,
        language: formData.language,
        modelUsed,
        tags: [formData.category, formData.platform, formData.language],
        data: result,
      });
      setSaved(true);
      onItemSaved(savedItem);
      onNotify('Listing Saved', 'Available in your Saved Content collection.', 'success');
    } catch (err: any) {
      onNotify('Save Failed', err?.message || 'Could not save item.', 'error');
    }
  };

  const loadPreset = (preset: (typeof SAMPLE_PRESETS)[0]) => {
    setFormData(preset.data);
    setError(null);
    onNotify('Preset Loaded', `Loaded details for "${preset.label}". Click "Generate Listing" below.`, 'info');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Title & Preset Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E3DA]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-editorial">
            AI Product Listing Writer
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Produce SEO titles, descriptions, tags, and highlights strictly grounded in your provided handmade specifications.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-medium text-stone-500 uppercase font-mono mr-1">
            Quick Examples:
          </span>
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => loadPreset(preset)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-[#E7E3DA] text-stone-700 hover:bg-[#FAF9F5] hover:border-stone-400 transition-colors cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Form (5 cols on lg) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E7E3DA] p-6 shadow-2xs">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#1E3A2B] uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#C86D51]" />
                Craft Details
              </span>
              <span className="text-[11px] text-stone-400 font-mono">Gemma Guardrails Active</span>
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Speckled Terracotta Ceramic Coffee Mug"
                className="w-full px-3 py-2 text-xs text-stone-900 bg-[#FAF9F5] border border-[#E7E3DA] rounded-lg focus:outline-none focus:border-[#2D5A3F] focus:bg-white transition-colors"
              />
            </div>

            {/* Category & Platform Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Craft Category
                </label>
                <div className="relative">
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full appearance-none px-3 py-2 text-xs text-stone-900 bg-[#FAF9F5] border border-[#E7E3DA] rounded-lg focus:outline-none focus:border-[#2D5A3F] focus:bg-white transition-colors pr-8 cursor-pointer"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Selling Platform
                </label>
                <div className="relative">
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value as any })}
                    className="w-full appearance-none px-3 py-2 text-xs text-stone-900 bg-[#FAF9F5] border border-[#E7E3DA] rounded-lg focus:outline-none focus:border-[#2D5A3F] focus:bg-white transition-colors pr-8 cursor-pointer"
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Material & Color */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Material
                </label>
                <input
                  type="text"
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  placeholder="e.g. Terracotta clay, Food-safe glaze"
                  className="w-full px-3 py-2 text-xs text-stone-900 bg-[#FAF9F5] border border-[#E7E3DA] rounded-lg focus:outline-none focus:border-[#2D5A3F] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Color / Finish
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="e.g. Earthy terracotta, cream speckled"
                  className="w-full px-3 py-2 text-xs text-stone-900 bg-[#FAF9F5] border border-[#E7E3DA] rounded-lg focus:outline-none focus:border-[#2D5A3F] focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Product Features */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-stone-800">
                  Key Product Features & Dimensions <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-stone-400">Be specific</span>
              </div>
              <textarea
                required
                rows={3}
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                placeholder="e.g. Hand-thrown on wheel, 350ml capacity, ergonomic handle, dishwasher and microwave safe, high-fired stoneware."
                className="w-full px-3 py-2 text-xs text-stone-900 bg-[#FAF9F5] border border-[#E7E3DA] rounded-lg focus:outline-none focus:border-[#2D5A3F] focus:bg-white transition-colors"
              />
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                Target Audience & Ideal Buyer
              </label>
              <input
                type="text"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                placeholder="e.g. Artisan coffee enthusiasts, thoughtful birthday gift buyers"
                className="w-full px-3 py-2 text-xs text-stone-900 bg-[#FAF9F5] border border-[#E7E3DA] rounded-lg focus:outline-none focus:border-[#2D5A3F] focus:bg-white transition-colors"
              />
            </div>

            {/* Language & Tone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1 flex items-center gap-1">
                  <Globe2 className="w-3.5 h-3.5 text-[#C86D51]" />
                  Language
                </label>
                <div className="flex items-center gap-1 p-1 bg-[#FAF9F5] border border-[#E7E3DA] rounded-lg">
                  {(['English', 'Hindi'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setFormData({ ...formData, language: lang })}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        formData.language === lang
                          ? 'bg-[#1E3A2B] text-white shadow-2xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {lang === 'Hindi' ? 'हिंदी (Hindi)' : 'English'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Brand Tone
                </label>
                <div className="relative">
                  <select
                    value={formData.tone}
                    onChange={(e) => setFormData({ ...formData, tone: e.target.value as any })}
                    className="w-full appearance-none px-3 py-2 text-xs text-stone-900 bg-[#FAF9F5] border border-[#E7E3DA] rounded-lg focus:outline-none focus:border-[#2D5A3F] focus:bg-white transition-colors pr-8 cursor-pointer"
                  >
                    {TONES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Ethical Guardrail Disclaimer */}
            <div className="p-3 rounded-lg bg-[#FAF8F3] border border-[#E7E3DA] text-[11px] text-stone-600 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-[#C86D51] shrink-0 mt-0.5" />
              <span>
                <strong>Gemma Guardrail:</strong> Output is strictly grounded in your inputs. Gemma will not invent certifications, false materials, or unverified claims.
              </span>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Generation Error</p>
                  <p className="text-[11px] mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1E3A2B] text-[#FAF9F5] text-xs sm:text-sm font-semibold hover:bg-[#14281E] disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-[#E88C72]" />
                  <span>Generating with Gemma (open-weight)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#E88C72]" />
                  <span>Generate Complete Listing</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Generated Output Cards (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-5">
          {!result && !loading && (
            <div className="h-full min-h-[460px] flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-[#E7E3DA] bg-white">
              <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#E7E3DA] flex items-center justify-center text-stone-400 mb-3">
                <PenTool className="w-6 h-6 text-[#C86D51]" />
              </div>
              <h3 className="text-base font-semibold text-stone-800 font-editorial">
                Your Listing Assets Will Appear Here
              </h3>
              <p className="text-xs text-stone-500 max-w-md mt-1 leading-relaxed">
                Fill in the craft specifications on the left or click one of the quick presets at the top to let Gemma craft your listing.
              </p>
            </div>
          )}

          {loading && (
            <div className="h-full min-h-[460px] flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-[#E7E3DA] bg-white animate-pulse">
              <RotateCw className="w-8 h-8 text-[#2D5A3F] animate-spin mb-3" />
              <p className="text-sm font-semibold text-stone-800 font-editorial">
                Gemma is weaving your craft story...
              </p>
              <p className="text-xs text-stone-500 mt-1 max-w-xs">
                Formatting SEO title, storytelling paragraphs, bullet highlights, and Etsy keywords.
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Header Bar with Model badge and Save button */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E7E3DA]">
                <div className="flex items-center gap-2 text-xs text-stone-600">
                  <span className="font-mono text-[11px] text-[#2D5A3F] bg-[#E7EFEA] px-2 py-0.5 rounded font-medium">
                    {modelUsed}
                  </span>
                  <span>·</span>
                  <span>{formData.language}</span>
                  <span>·</span>
                  <span>{formData.platform}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleGenerate()}
                    disabled={loading}
                    className="p-1.5 text-xs text-stone-600 hover:text-stone-900 border border-[#E7E3DA] rounded-lg hover:bg-stone-50 flex items-center gap-1 transition-colors"
                    title="Regenerate listing"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Regenerate</span>
                  </button>

                  <button
                    onClick={handleSaveItem}
                    disabled={saved}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
                      saved
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-[#1E3A2B] text-white hover:bg-[#14281E]'
                    }`}
                  >
                    {saved ? (
                      <>
                        <BookmarkCheck className="w-3.5 h-3.5" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="w-3.5 h-3.5 text-[#E88C72]" />
                        <span>Save to Content</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 1. SEO Title Card */}
              <div className="rounded-xl border border-[#E7E3DA] bg-white p-4 shadow-2xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C86D51]">
                      1. SEO Product Title
                    </span>
                    <span className="text-[11px] text-stone-400 font-mono">
                      ({result.title.length} characters)
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(result.title, 'Title')}
                    className="flex items-center gap-1 text-[11px] font-medium text-stone-600 hover:text-[#1E3A2B] transition-colors"
                  >
                    {copiedKey === 'Title' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'Title' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-sm font-semibold text-stone-900 leading-snug">
                  {result.title}
                </p>
              </div>

              {/* 2. Storytelling Description Card */}
              <div className="rounded-xl border border-[#E7E3DA] bg-white p-4 shadow-2xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C86D51]">
                    2. Product Description
                  </span>
                  <button
                    onClick={() => handleCopy(result.description, 'Description')}
                    className="flex items-center gap-1 text-[11px] font-medium text-stone-600 hover:text-[#1E3A2B] transition-colors"
                  >
                    {copiedKey === 'Description' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'Description' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="text-xs text-stone-700 leading-relaxed whitespace-pre-line">
                  {result.description}
                </div>
              </div>

              {/* 3. Product Highlights Card */}
              <div className="rounded-xl border border-[#E7E3DA] bg-white p-4 shadow-2xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C86D51]">
                    3. Key Product Highlights
                  </span>
                  <button
                    onClick={() => handleCopy(result.highlights.join('\n• '), 'Highlights')}
                    className="flex items-center gap-1 text-[11px] font-medium text-stone-600 hover:text-[#1E3A2B] transition-colors"
                  >
                    {copiedKey === 'Highlights' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'Highlights' ? 'Copied' : 'Copy All'}</span>
                  </button>
                </div>
                <ul className="space-y-1.5 text-xs text-stone-700">
                  {result.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#2D5A3F] font-bold mt-0.5">•</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 4. Search Keywords & Tags Card */}
              <div className="rounded-xl border border-[#E7E3DA] bg-white p-4 shadow-2xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C86D51]">
                    4. Search Keywords & Tags ({result.keywords.length})
                  </span>
                  <button
                    onClick={() => handleCopy(result.keywords.join(', '), 'Keywords')}
                    className="flex items-center gap-1 text-[11px] font-medium text-stone-600 hover:text-[#1E3A2B] transition-colors"
                  >
                    {copiedKey === 'Keywords' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'Keywords' ? 'Copied' : 'Copy CSV'}</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="inline-block px-2 py-0.5 text-xs rounded bg-[#FAF7F2] text-stone-700 border border-[#E7E3DA] font-mono"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* 5. Short Marketplace Listing & 6. CTA Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-[#E7E3DA] bg-white p-4 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C86D51]">
                        5. Short Listing (Mobile/Etsy)
                      </span>
                      <button
                        onClick={() => handleCopy(result.shortListing, 'Short Listing')}
                        className="text-[11px] font-medium text-stone-600 hover:text-[#1E3A2B]"
                      >
                        {copiedKey === 'Short Listing' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-xs text-stone-700 leading-relaxed">
                      {result.shortListing}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-[#E7E3DA] bg-white p-4 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C86D51]">
                        6. Call to Action (CTA)
                      </span>
                      <button
                        onClick={() => handleCopy(result.cta, 'CTA')}
                        className="text-[11px] font-medium text-stone-600 hover:text-[#1E3A2B]"
                      >
                        {copiedKey === 'CTA' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-xs font-medium text-[#1E3A2B] leading-relaxed italic">
                      "{result.cta}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
