import React from 'react';
import {
  PenTool,
  Share2,
  Calculator,
  BookmarkCheck,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Globe2,
} from 'lucide-react';
import { GemmaHealthStatus, SavedItem } from '../types';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  gemmaStatus: GemmaHealthStatus | null;
  checkingHealth: boolean;
  onRefreshHealth: () => void;
  savedItems: SavedItem[];
  onOpenSample: (item: SavedItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  gemmaStatus,
  checkingHealth,
  onRefreshHealth,
  savedItems,
  onOpenSample,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Section */}
      <section className="relative overflow-hidden rounded-2xl border border-[#E7E3DA] bg-gradient-to-br from-[#F5F2EB] via-[#FAF9F5] to-[#F3EDE2] p-8 md:p-10 shadow-sm">
        {/* Decorative artisan background watermark pattern (subtle SVG) */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-5 pointer-events-none flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-full h-full text-[#1E3A2B]" fill="currentColor">
            <path d="M45.5,12.5 C60.2,19.8 72.8,32.2 80.5,47.4 C88.2,62.6 91.1,80.5 83.7,94.2 C76.3,107.9 58.7,117.4 42.1,120.2 C25.5,123.1 9.9,119.3 -3.8,112.5 C-17.5,105.7 -29.3,95.9 -38.4,83.1 C-47.5,70.3 -53.9,54.5 -50.9,40.1 C-47.9,25.7 -35.5,12.7 -21.8,4.7 C-8.1,-3.3 6.9,-6.3 21.6,-3.5 C36.3,-0.7 50.7,7.9 45.5,12.5 Z" transform="translate(100 100)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[#1E3A2B]/10 text-[#1E3A2B] mb-4">
            <span className="w-2 h-2 rounded-full bg-[#C86D51]"></span>
            <span>Hacktoberfest Open-Source AI Challenge · Week 2: Side Hustle</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1E3A2B] tracking-tight font-editorial leading-tight">
            Turn handmade creativity into a thriving business.
          </h1>

          <p className="mt-4 text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl">
            Designed specifically for independent artisans, Etsy creators, and local craft makers. Generate SEO-optimized listings, high-engagement social copy, and mathematically sustainable pricing powered by Google’s open-weight <strong className="text-stone-900 font-semibold font-mono">Gemma</strong> model.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('product-writer')}
              className="px-5 py-2.5 rounded-xl bg-[#1E3A2B] text-[#FAF9F5] text-sm font-medium hover:bg-[#15291E] transition-all shadow-sm flex items-center gap-2 cursor-pointer group"
            >
              <PenTool className="w-4 h-4 text-[#E88C72]" />
              <span>Write Product Listing</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>

            <button
              onClick={() => onNavigate('pricing-helper')}
              className="px-5 py-2.5 rounded-xl border border-[#D6CFC4] bg-white text-stone-800 text-sm font-medium hover:bg-[#FAF9F5] hover:border-stone-400 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Calculator className="w-4 h-4 text-[#C86D51]" />
              <span>Calculate Fair Price</span>
            </button>

            <button
              onClick={() => onNavigate('social-studio')}
              className="px-5 py-2.5 rounded-xl border border-transparent text-[#2D5A3F] text-sm font-medium hover:bg-[#1E3A2B]/5 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Social Media Studio</span>
            </button>
          </div>
        </div>
      </section>

      {/* Gemma Engine Status & Open-Weight Banner */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Verified Gemma AI Status */}
        <div className="md:col-span-2 rounded-xl border border-[#E7E3DA] bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#FAF7F2] border border-[#E7E3DA] flex items-center justify-center text-[#1E3A2B]">
                <Cpu className="w-5 h-5 text-[#C86D51]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                  <span>Gemma Inference Engine</span>
                  {checkingHealth ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                      <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
                      <span>Verifying Connection...</span>
                    </span>
                  ) : gemmaStatus?.connected ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Live &amp; Connected</span>
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-800 border border-rose-200"
                      title={gemmaStatus?.error || gemmaStatus?.message || 'Connection failed'}
                    >
                      <AlertCircle className="w-3 h-3 text-rose-600" />
                      <span>Connection Failed</span>
                    </span>
                  )}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5 font-mono">
                  Model: {gemmaStatus?.model || 'gemma-4-26b-a4b-it'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-right">
              <div>
                <span className="text-[11px] text-stone-400 block uppercase font-mono">Response Time</span>
                <span className="text-sm font-mono font-semibold text-stone-800 tabular-nums">
                  {checkingHealth ? (
                    <span className="text-stone-400 font-sans text-xs">Testing...</span>
                  ) : gemmaStatus?.connected && gemmaStatus?.latencyMs ? (
                    `${gemmaStatus.latencyMs} ms`
                  ) : (
                    '—'
                  )}
                </span>
              </div>

              {/* Explicit Retry button on Dashboard */}
              <button
                type="button"
                onClick={onRefreshHealth}
                disabled={checkingHealth}
                title="Retry Gemma connection health check"
                className="px-2.5 py-1.5 rounded-lg border border-[#D6CFC4] bg-[#FAF9F5] hover:bg-white text-stone-700 hover:text-stone-900 text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#2D5A3F] ${checkingHealth ? 'animate-spin' : ''}`} />
                <span className="font-sans text-[11px]">{checkingHealth ? 'Checking...' : 'Retry'}</span>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between text-xs text-stone-600 gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2D5A3F] shrink-0" />
              <span className="text-stone-700 truncate max-w-[340px] sm:max-w-none">
                {checkingHealth
                  ? 'Verifying live server-side inference with Gemma...'
                  : gemmaStatus?.connected
                  ? `Real server-side inference · Genuine open-weight Gemma (${gemmaStatus.latencyMs}ms)`
                  : gemmaStatus?.message || 'Gemma inference service is unavailable.'}
              </span>
            </div>
            <span className="text-stone-400 font-mono text-[11px]">
              {gemmaStatus?.availableGemmaModels?.length ? `${gemmaStatus.availableGemmaModels.length} Gemma endpoints verified` : 'Official @google/genai'}
            </span>
          </div>
        </div>

        {/* Multilingual & Artisan Pride */}
        <div className="rounded-xl border border-[#E7E3DA] bg-[#FAF8F5] p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1E3A2B] uppercase tracking-wider">
            <Globe2 className="w-4 h-4 text-[#C86D51]" />
            <span>Bilingual Artisan Studio</span>
          </div>
          <p className="text-xs text-stone-600 my-2 leading-relaxed">
            Create listings in English and <strong>हिंदी (Hindi)</strong> with authentic cultural and festival marketing tailored for Indian and global craft marketplaces.
          </p>
          <div className="flex items-center gap-2 text-[11px] font-medium text-stone-700">
            <span className="px-2 py-0.5 bg-white rounded border border-[#E7E3DA]">English</span>
            <span className="px-2 py-0.5 bg-white rounded border border-[#E7E3DA]">हिंदी (Hindi)</span>
            <span className="px-2 py-0.5 bg-[#C86D51]/10 text-[#C86D51] rounded font-mono">Diwali/Holi Ready</span>
          </div>
        </div>
      </section>

      {/* Main Feature Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Feature 1 */}
        <div
          onClick={() => onNavigate('product-writer')}
          className="group rounded-xl border border-[#E7E3DA] bg-white p-6 shadow-2xs hover:shadow-md hover:border-[#2D5A3F]/50 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#1E3A2B]/5 border border-[#1E3A2B]/10 flex items-center justify-center text-[#1E3A2B] mb-4 group-hover:bg-[#1E3A2B] group-hover:text-white transition-colors">
              <PenTool className="w-5 h-5 text-[#C86D51] group-hover:text-[#FAF9F5] transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 font-editorial group-hover:text-[#1E3A2B] transition-colors">
              AI Product Writer
            </h3>
            <p className="mt-2 text-xs text-stone-600 leading-relaxed">
              Generate 6 listing assets in seconds: SEO titles, descriptive storytelling, key highlights, 8+ tags, mobile Etsy snippets, and calls to action.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-[#2D5A3F] group-hover:translate-x-1 transition-transform">
            <span>Open Writer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Feature 2 */}
        <div
          onClick={() => onNavigate('social-studio')}
          className="group rounded-xl border border-[#E7E3DA] bg-white p-6 shadow-2xs hover:shadow-md hover:border-[#2D5A3F]/50 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#C86D51]/5 border border-[#C86D51]/15 flex items-center justify-center text-[#C86D51] mb-4 group-hover:bg-[#C86D51] group-hover:text-white transition-colors">
              <Share2 className="w-5 h-5 text-[#C86D51] group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 font-editorial group-hover:text-[#1E3A2B] transition-colors">
              Social Media Studio
            </h3>
            <p className="mt-2 text-xs text-stone-600 leading-relaxed">
              Tailored captions for Instagram Reels, Facebook posts, and quick WhatsApp broadcast updates with curated hashtags and festive angles.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-[#2D5A3F] group-hover:translate-x-1 transition-transform">
            <span>Create Social Post</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Feature 3 */}
        <div
          onClick={() => onNavigate('pricing-helper')}
          className="group rounded-xl border border-[#E7E3DA] bg-white p-6 shadow-2xs hover:shadow-md hover:border-[#2D5A3F]/50 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#2D5A3F]/5 border border-[#2D5A3F]/15 flex items-center justify-center text-[#2D5A3F] mb-4 group-hover:bg-[#2D5A3F] group-hover:text-white transition-colors">
              <Calculator className="w-5 h-5 text-[#2D5A3F] group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 font-editorial group-hover:text-[#1E3A2B] transition-colors">
              Artisan Pricing Helper
            </h3>
            <p className="mt-2 text-xs text-stone-600 leading-relaxed">
              Calculate mathematically sound selling prices using standard margin formulas. Gemma explains the margin buffer and value positioning.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-[#2D5A3F] group-hover:translate-x-1 transition-transform">
            <span>Calculate Pricing</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </section>

      {/* Recent Saved Items & Inspiration Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Saved Items Quick Panel */}
        <div className="lg:col-span-2 rounded-xl border border-[#E7E3DA] bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookmarkCheck className="w-5 h-5 text-[#2D5A3F]" />
              <h2 className="text-base font-bold text-stone-900 font-editorial">
                Recent Saved Content ({savedItems.length})
              </h2>
            </div>
            <button
              onClick={() => onNavigate('saved-content')}
              className="text-xs font-medium text-[#2D5A3F] hover:text-[#1E3A2B] hover:underline"
            >
              View all
            </button>
          </div>

          {savedItems.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-stone-200 rounded-xl bg-stone-50">
              <BookmarkCheck className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <p className="text-xs font-medium text-stone-600">No saved items yet</p>
              <p className="text-[11px] text-stone-400 mt-1">Generate a listing or social post to save it here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedItems.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  onClick={() => onOpenSample(item)}
                  className="flex items-center justify-between p-3.5 rounded-lg border border-[#E7E3DA] hover:bg-[#FAF9F5] transition-colors cursor-pointer group"
                >
                  <div className="min-w-0 pr-4">
                    <div className="flex items-center gap-2 text-[11px] text-stone-500 mb-1">
                      <span className="font-medium uppercase tracking-wider text-[#C86D51]">
                        {item.type}
                      </span>
                      <span>·</span>
                      <span>{item.language}</span>
                      <span>·</span>
                      <span className="font-mono text-stone-400">Gemma</span>
                    </div>
                    <h4 className="text-xs font-semibold text-stone-900 truncate group-hover:text-[#1E3A2B]">
                      {item.title}
                    </h4>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-stone-700 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Artisan Side Hustle Tips Card */}
        <div className="rounded-xl border border-[#E7E3DA] bg-[#F7F5EF] p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1E3A2B] uppercase tracking-wider mb-3">
              <HeartHandshake className="w-4 h-4 text-[#C86D51]" />
              <span>Handmade Business Rule</span>
            </div>
            <h3 className="text-sm font-bold text-stone-900 font-editorial mb-2">
              Never Give Away Your Labor
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Many artisans price products by adding a small markup onto material costs alone. Always track your crafting hours and multiply by an hourly wage before calculating your profit margin.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-200/60">
            <button
              onClick={() => onNavigate('pricing-helper')}
              className="w-full py-2 px-3 rounded-lg bg-white border border-[#D6CFC4] text-xs font-medium text-stone-800 hover:bg-[#FAF9F5] transition-colors text-center"
            >
              Test with Pricing Helper
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
