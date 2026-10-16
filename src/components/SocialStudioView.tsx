import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  RotateCw,
  BookmarkPlus,
  BookmarkCheck,
  AlertCircle,
  Sparkles,
  MessageCircle,
  Instagram,
  Facebook,
  Globe2,
  SlidersHorizontal,
  Hash,
  Send,
  Calendar,
} from 'lucide-react';
import { SocialMediaInput, SocialMediaOutput, SavedItem } from '../types';
import { generateSocialContentApi, saveItem } from '../services/api';

interface SocialStudioViewProps {
  onNotify: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
  onItemSaved: (item: SavedItem) => void;
}

const CAMPAIGN_GOALS: SocialMediaInput['campaignGoal'][] = [
  'Product Launch',
  'Behind-the-Scenes',
  'Limited Edition',
  'Festive / Seasonal Sale',
  'Customer Appreciation',
];

const PRESETS: { label: string; data: SocialMediaInput }[] = [
  {
    label: 'Instagram Launch (Ceramics)',
    data: {
      productName: 'Wheel-Thrown Terracotta Speckled Coffee Mug',
      productDetails: 'Handmade pottery mug fired with non-toxic lead-free speckled glaze. 350ml capacity. Warm earthy terracotta clay with tactile grooves.',
      platform: 'Instagram',
      targetAudience: 'Slow living enthusiasts, specialty coffee lovers, handmade pottery collectors',
      language: 'English',
      campaignGoal: 'Product Launch',
    },
  },
  {
    label: 'WhatsApp Festive Offer (Hindi)',
    data: {
      productName: 'प्राकृतिक सोया वैक्स दीवाली दीया सेट (Natural Soy Wax Diya Gift Set)',
      productDetails: 'हाथ से बने मिट्टी के दीयों में शुद्ध सोया मोम और इलायची-गुलाब की प्राकृतिक सुगंध। 100% धुआं-मुक्त, पर्यावरण अनुकूल, 6 दीयों का सेट।',
      platform: 'WhatsApp',
      targetAudience: 'त्योहारी खरीदार, पर्यावरण-सचेत परिवार, हस्तशिल्प प्रेमी',
      language: 'Hindi',
      campaignGoal: 'Festive / Seasonal Sale',
    },
  },
  {
    label: 'Weekend Craft Market (Facebook)',
    data: {
      productName: 'Hand-Dyed Indigo Linen Scarves & Totes',
      productDetails: 'Pure organic linen dyed with fermented plant indigo. Soft texture with natural marbling patterns. Available at this Saturday’s artisan farmers market stall #14.',
      platform: 'Facebook',
      targetAudience: 'Local community members, sustainable fashion shoppers, craft market visitors',
      language: 'English',
      campaignGoal: 'Behind-the-Scenes',
    },
  },
];

export const SocialStudioView: React.FC<SocialStudioViewProps> = ({
  onNotify,
  onItemSaved,
}) => {
  const [formData, setFormData] = useState<SocialMediaInput>({
    productName: '',
    productDetails: '',
    platform: 'Instagram',
    targetAudience: '',
    language: 'English',
    campaignGoal: 'Product Launch',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SocialMediaOutput | null>(null);
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
    if (!formData.productName.trim() || !formData.productDetails.trim()) {
      setError('Please provide the product name and key product details.');
      return;
    }

    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const response = await generateSocialContentApi(formData);
      setResult(response.data);
      setModelUsed(response.modelUsed);
      onNotify('Social Post Generated', 'Captions and hashtags prepared with Gemma.', 'success');
    } catch (err: any) {
      const msg = err?.message || 'Failed to generate social media content with Gemma.';
      setError(msg);
      onNotify('Generation Failed', msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    try {
      const savedItem = await saveItem({
        type: 'social',
        title: `${formData.platform} · ${formData.productName}`,
        language: formData.language,
        modelUsed,
        tags: [formData.platform, formData.campaignGoal, formData.language],
        data: result,
      });
      setSaved(true);
      onItemSaved(savedItem);
      onNotify('Social Post Saved', 'Available in your Saved Content collection.', 'success');
    } catch (err: any) {
      onNotify('Save Failed', err?.message || 'Could not save post.', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Title & Presets Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E3DA]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-editorial">
            Social Media Studio
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Generate authentic captions, hashtags, and quick WhatsApp broadcast updates for your handmade craft brand.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-medium text-stone-500 uppercase font-mono mr-1">
            Try Preset:
          </span>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setFormData(p.data);
                setError(null);
                onNotify('Preset Loaded', `Loaded "${p.label}".`, 'info');
              }}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-[#E7E3DA] text-stone-700 hover:bg-[#FAF9F5] hover:border-stone-400 transition-colors cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Inputs (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E7E3DA] p-6 shadow-2xs">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#1E3A2B] uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#C86D51]" />
                Campaign Parameters
              </span>
              <span className="text-[11px] text-stone-400 font-mono">Gemma Social Engine</span>
            </div>

            {/* Platform Selector Buttons */}
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                Target Platform
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Instagram', icon: Instagram, label: 'Instagram' },
                  { id: 'Facebook', icon: Facebook, label: 'Facebook' },
                  { id: 'WhatsApp', icon: MessageCircle, label: 'WhatsApp' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = formData.platform === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, platform: item.id as any })}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#1E3A2B] text-white border-[#1E3A2B] shadow-2xs'
                          : 'bg-[#FAF9F5] text-stone-700 border-[#E7E3DA] hover:bg-stone-100'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                placeholder="e.g. Hand-Carved Wooden Butter Knife"
                className="w-full px-3 py-2 text-xs text-stone-900 bg-[#FAF9F5] border border-[#E7E3DA] rounded-lg focus:outline-none focus:border-[#2D5A3F] focus:bg-white transition-colors"
              />
            </div>

            {/* Product Details */}
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                Product Details & Story <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={formData.productDetails}
                onChange={(e) => setFormData({ ...formData, productDetails: e.target.value })}
                placeholder="Describe materials, how it was made, artisan technique, size, or what makes it special..."
                className="w-full px-3 py-2 text-xs text-stone-900 bg-[#FAF9F5] border border-[#E7E3DA] rounded-lg focus:outline-none focus:border-[#2D5A3F] focus:bg-white transition-colors"
              />
            </div>

            {/* Campaign Goal */}
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                Campaign Goal
              </label>
              <select
                value={formData.campaignGoal}
                onChange={(e) => setFormData({ ...formData, campaignGoal: e.target.value as any })}
                className="w-full px-3 py-2 text-xs text-stone-900 bg-[#FAF9F5] border border-[#E7E3DA] rounded-lg focus:outline-none focus:border-[#2D5A3F] focus:bg-white transition-colors cursor-pointer"
              >
                {CAMPAIGN_GOALS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                Target Audience
              </label>
              <input
                type="text"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                placeholder="e.g. Eco-friendly shoppers, handmade pottery enthusiasts"
                className="w-full px-3 py-2 text-xs text-stone-900 bg-[#FAF9F5] border border-[#E7E3DA] rounded-lg focus:outline-none focus:border-[#2D5A3F] focus:bg-white transition-colors"
              />
            </div>

            {/* Language Selection */}
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1 flex items-center gap-1">
                <Globe2 className="w-3.5 h-3.5 text-[#C86D51]" />
                Content Language
              </label>
              <div className="flex items-center gap-1 p-1 bg-[#FAF9F5] border border-[#E7E3DA] rounded-lg">
                {(['English', 'Hindi'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setFormData({ ...formData, language: lang })}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
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

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Error</p>
                  <p className="text-[11px] mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1E3A2B] text-[#FAF9F5] text-xs sm:text-sm font-semibold hover:bg-[#14281E] disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-[#E88C72]" />
                  <span>Drafting with Gemma (open-weight)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#E88C72]" />
                  <span>Generate Social Content</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Output: (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {!result && !loading && (
            <div className="h-full min-h-[460px] flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-[#E7E3DA] bg-white">
              <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#E7E3DA] flex items-center justify-center text-stone-400 mb-3">
                <Share2 className="w-6 h-6 text-[#C86D51]" />
              </div>
              <h3 className="text-base font-semibold text-stone-800 font-editorial">
                Your Social Media Copy Will Appear Here
              </h3>
              <p className="text-xs text-stone-500 max-w-md mt-1 leading-relaxed">
                Choose a platform, supply your craft notes, and let Gemma generate tailored captions, hashtags, and broadcast snippets.
              </p>
            </div>
          )}

          {loading && (
            <div className="h-full min-h-[460px] flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-[#E7E3DA] bg-white animate-pulse">
              <RotateCw className="w-8 h-8 text-[#2D5A3F] animate-spin mb-3" />
              <p className="text-sm font-semibold text-stone-800 font-editorial">
                Gemma is creating your social campaign...
              </p>
              <p className="text-xs text-stone-500 mt-1 max-w-xs">
                Crafting platform-tailored hooks, hashtags, and promotional broadcasts.
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Header Info */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E7E3DA]">
                <div className="flex items-center gap-2 text-xs text-stone-600">
                  <span className="font-mono text-[11px] text-[#2D5A3F] bg-[#E7EFEA] px-2 py-0.5 rounded font-medium">
                    {modelUsed}
                  </span>
                  <span>·</span>
                  <span>{formData.platform}</span>
                  <span>·</span>
                  <span>{formData.language}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleGenerate()}
                    disabled={loading}
                    className="p-1.5 text-xs text-stone-600 hover:text-stone-900 border border-[#E7E3DA] rounded-lg hover:bg-stone-50 flex items-center gap-1 transition-colors"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Regenerate</span>
                  </button>

                  <button
                    onClick={handleSave}
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
                        <span>Save Post</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 1. Main Caption Card */}
              <div className="rounded-xl border border-[#E7E3DA] bg-white p-4 shadow-2xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C86D51]">
                      1. {formData.platform} Caption
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(result.caption, 'Caption')}
                    className="flex items-center gap-1 text-[11px] font-medium text-stone-600 hover:text-[#1E3A2B] transition-colors"
                  >
                    {copiedKey === 'Caption' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'Caption' ? 'Copied' : 'Copy Caption'}</span>
                  </button>
                </div>
                <div className="text-xs text-stone-800 leading-relaxed whitespace-pre-line font-sans">
                  {result.caption}
                </div>
              </div>

              {/* 2. Hashtags Card */}
              <div className="rounded-xl border border-[#E7E3DA] bg-white p-4 shadow-2xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C86D51] flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5" />
                    2. Curated Hashtags ({result.hashtags.length})
                  </span>
                  <button
                    onClick={() => handleCopy(result.hashtags.join(' '), 'Hashtags')}
                    className="flex items-center gap-1 text-[11px] font-medium text-stone-600 hover:text-[#1E3A2B] transition-colors"
                  >
                    {copiedKey === 'Hashtags' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'Hashtags' ? 'Copied' : 'Copy All'}</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.hashtags.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-block px-2 py-0.5 text-xs rounded bg-[#FAF7F2] text-[#2D5A3F] border border-[#E7E3DA] font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* 3. Short Promotional Message (WhatsApp status / SMS) */}
              <div className="rounded-xl border border-[#E7E3DA] bg-white p-4 shadow-2xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C86D51] flex items-center gap-1">
                    <Send className="w-3.5 h-3.5" />
                    3. Short Broadcast / WhatsApp Status
                  </span>
                  <button
                    onClick={() => handleCopy(result.shortPromo, 'Short Promo')}
                    className="flex items-center gap-1 text-[11px] font-medium text-stone-600 hover:text-[#1E3A2B] transition-colors"
                  >
                    {copiedKey === 'Short Promo' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'Short Promo' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-xs text-stone-800 leading-relaxed bg-[#FAF9F5] p-3 rounded-lg border border-[#E7E3DA]">
                  {result.shortPromo}
                </p>
              </div>

              {/* 4. CTA & 5. Festival Copy */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-[#E7E3DA] bg-white p-4 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C86D51]">
                        4. Action Prompt (CTA)
                      </span>
                      <button
                        onClick={() => handleCopy(result.cta, 'CTA')}
                        className="text-[11px] font-medium text-stone-600 hover:text-[#1E3A2B]"
                      >
                        {copiedKey === 'CTA' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-xs text-stone-800 font-medium italic">
                      "{result.cta}"
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-[#E7E3DA] bg-white p-4 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C86D51] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        5. Festival / Seasonal Angle
                      </span>
                      {result.festiveCopy && (
                        <button
                          onClick={() => handleCopy(result.festiveCopy || '', 'Festive Copy')}
                          className="text-[11px] font-medium text-stone-600 hover:text-[#1E3A2B]"
                        >
                          {copiedKey === 'Festive Copy' ? 'Copied' : 'Copy'}
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-stone-800 leading-relaxed">
                      {result.festiveCopy || 'No seasonal angle requested.'}
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
