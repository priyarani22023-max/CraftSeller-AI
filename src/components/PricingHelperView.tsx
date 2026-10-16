import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Copy,
  Check,
  RotateCw,
  BookmarkPlus,
  BookmarkCheck,
  AlertCircle,
  Sparkles,
  Info,
  DollarSign,
  TrendingUp,
  Clock,
  Package,
  Layers,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import { PricingInput, PricingResult, SavedItem } from '../types';
import { explainPricingApi, saveItem } from '../services/api';

interface PricingHelperViewProps {
  onNotify: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
  onItemSaved: (item: SavedItem) => void;
  defaultCurrency?: string;
}

const PRESETS: { label: string; data: PricingInput }[] = [
  {
    label: 'Ceramic Coffee Mug',
    data: {
      materialCost: 4.8,
      labourHours: 1.25,
      hourlyRate: 20.0,
      packagingCost: 2.2,
      otherExpenses: 2.5,
      profitMargin: 40,
      currency: '$',
    },
  },
  {
    label: 'Macrame Wall Hanging',
    data: {
      materialCost: 12.0,
      labourHours: 3.5,
      hourlyRate: 18.0,
      packagingCost: 4.0,
      otherExpenses: 5.0,
      profitMargin: 45,
      currency: '$',
    },
  },
  {
    label: 'हस्तनिर्मित चांदी की अंगूठी (Silver Ring)',
    data: {
      materialCost: 550,
      labourHours: 2.5,
      hourlyRate: 200,
      packagingCost: 90,
      otherExpenses: 120,
      profitMargin: 35,
      currency: '₹',
    },
  },
];

export const PricingHelperView: React.FC<PricingHelperViewProps> = ({
  onNotify,
  onItemSaved,
  defaultCurrency = '$',
}) => {
  const [inputs, setInputs] = useState<PricingInput>({
    materialCost: 5.0,
    labourHours: 1.5,
    hourlyRate: 20.0,
    packagingCost: 2.0,
    otherExpenses: 2.5,
    profitMargin: 40,
    currency: defaultCurrency,
  });

  const [aiResult, setAiResult] = useState<PricingResult | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Real-time pure math calculation
  const calculations = useMemo(() => {
    const mat = Math.max(0, inputs.materialCost);
    const lab = Math.max(0, inputs.labourHours * inputs.hourlyRate);
    const pack = Math.max(0, inputs.packagingCost);
    const other = Math.max(0, inputs.otherExpenses);
    const totalCost = mat + lab + pack + other;

    let margin = inputs.profitMargin;
    let isValidMargin = true;
    let marginError = '';

    if (margin >= 100) {
      isValidMargin = false;
      marginError = 'Profit margin must be strictly less than 100%.';
    } else if (margin < 0) {
      isValidMargin = false;
      marginError = 'Profit margin cannot be negative.';
    }

    let sellingPrice = 0;
    let profitAmount = 0;

    if (isValidMargin && totalCost > 0) {
      // Standard margin formula: selling price = total cost / (1 - profit margin / 100)
      sellingPrice = totalCost / (1 - margin / 100);
      profitAmount = sellingPrice - totalCost;
    }

    return {
      mat,
      lab,
      pack,
      other,
      totalCost,
      sellingPrice,
      profitAmount,
      isValidMargin,
      marginError,
    };
  }, [inputs]);

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    onNotify('Copied', `${keyName} copied to clipboard.`, 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGetGemmaAdvice = async () => {
    if (!calculations.isValidMargin) {
      onNotify('Invalid Margin', calculations.marginError, 'error');
      return;
    }
    if (calculations.totalCost <= 0) {
      onNotify('Zero Cost', 'Please enter costs greater than zero.', 'error');
      return;
    }

    setLoadingAi(true);
    setAiError(null);
    setSaved(false);

    try {
      const response = await explainPricingApi(inputs);
      setAiResult(response.data);
      onNotify('Gemma Analysis Ready', 'Artisan pricing considerations generated.', 'success');
    } catch (err: any) {
      const msg = err?.message || 'Failed to generate pricing advice with Gemma.';
      setAiError(msg);
      onNotify('Analysis Failed', msg, 'error');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSavePricing = async () => {
    const title = `Pricing Estimate · ${inputs.currency}${calculations.sellingPrice.toFixed(2)} (${inputs.profitMargin}% margin)`;
    try {
      const savedItem = await saveItem({
        type: 'pricing',
        title,
        language: 'English',
        modelUsed: 'gemma-4-26b-a4b-it',
        tags: ['Pricing', `${inputs.profitMargin}% Margin`, inputs.currency],
        data: {
          inputs,
          calculations: {
            totalCost: calculations.totalCost,
            sellingPrice: calculations.sellingPrice,
            profitAmount: calculations.profitAmount,
            labourCost: calculations.lab,
          },
          aiAdvice: aiResult,
        },
      });
      setSaved(true);
      onItemSaved(savedItem);
      onNotify('Pricing Saved', 'Saved to your content collection.', 'success');
    } catch (err: any) {
      onNotify('Save Failed', err?.message || 'Could not save pricing.', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Title & Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E3DA]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-editorial">
            Artisan Pricing Calculator
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Calculate sustainable retail pricing using industry standard margin formulas. Let Gemma explain the value buffer.
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-medium text-stone-500 uppercase font-mono mr-1">
            Presets:
          </span>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setInputs(p.data);
                setAiResult(null);
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
        {/* Left Inputs Column (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E7E3DA] p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <span className="text-xs font-semibold text-[#1E3A2B] uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#C86D51]" />
              Cost Inputs
            </span>

            {/* Currency Selector */}
            <div className="flex items-center gap-1">
              {['$', '₹', '€', '£'].map((curr) => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => setInputs({ ...inputs, currency: curr })}
                  className={`w-6 h-6 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
                    inputs.currency === curr
                      ? 'bg-[#1E3A2B] text-white'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>

          {/* 1. Material Cost */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              Material Cost per Unit ({inputs.currency})
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                value={inputs.materialCost}
                onChange={(e) => setInputs({ ...inputs, materialCost: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs font-mono text-stone-900 bg-[#FAF9F5] border border-[#E7E3DA] rounded-lg focus:outline-none focus:border-[#2D5A3F] focus:bg-white transition-colors pl-7"
              />
              <span className="absolute left-2.5 top-2 text-stone-400 text-xs font-mono">
                {inputs.currency}
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-0.5">Raw clay, glaze, silver wire, wax, yarn, etc.</p>
          </div>

          {/* 2. Labour Cost: Hours × Rate */}
          <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E7E3DA] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#2D5A3F]" />
                Artisan Hands-On Labour
              </span>
              <span className="text-xs font-mono font-semibold text-[#1E3A2B] tabular-nums">
                = {inputs.currency}{calculations.lab.toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-stone-600 mb-1">
                  Crafting Hours
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={inputs.labourHours}
                  onChange={(e) => setInputs({ ...inputs, labourHours: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 text-xs font-mono text-stone-900 bg-white border border-[#E7E3DA] rounded-md focus:outline-none focus:border-[#2D5A3F]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-600 mb-1">
                  Hourly Rate ({inputs.currency}/hr)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={inputs.hourlyRate}
                  onChange={(e) => setInputs({ ...inputs, hourlyRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 text-xs font-mono text-stone-900 bg-white border border-[#E7E3DA] rounded-md focus:outline-none focus:border-[#2D5A3F]"
                />
              </div>
            </div>
            <p className="text-[10px] text-stone-500 italic">
              Crucial: Never value your artisan crafting time at zero!
            </p>
          </div>

          {/* 3. Packaging Cost */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              Packaging & Presentation ({inputs.currency})
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                value={inputs.packagingCost}
                onChange={(e) => setInputs({ ...inputs, packagingCost: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs font-mono text-stone-900 bg-[#FAF9F5] border border-[#E7E3DA] rounded-lg focus:outline-none focus:border-[#2D5A3F] focus:bg-white transition-colors pl-7"
              />
              <span className="absolute left-2.5 top-2 text-stone-400 text-xs font-mono">
                {inputs.currency}
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-0.5">Box, custom tissue, ribbon, care card, sticker.</p>
          </div>

          {/* 4. Other Expenses */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              Other Overhead & Fees ({inputs.currency})
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                value={inputs.otherExpenses}
                onChange={(e) => setInputs({ ...inputs, otherExpenses: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs font-mono text-stone-900 bg-[#FAF9F5] border border-[#E7E3DA] rounded-lg focus:outline-none focus:border-[#2D5A3F] focus:bg-white transition-colors pl-7"
              />
              <span className="absolute left-2.5 top-2 text-stone-400 text-xs font-mono">
                {inputs.currency}
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-0.5">Kiln electricity, tool wear, booth fee portion, Etsy transaction fee.</p>
          </div>

          {/* 5. Desired Profit Margin Slider & Input */}
          <div className="pt-2 border-t border-stone-100">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-stone-800">
                Desired Profit Margin (%)
              </label>
              <span className="text-xs font-mono font-bold text-[#C86D51] px-2 py-0.5 bg-[#FAF7F2] rounded border border-[#E7E3DA]">
                {inputs.profitMargin}%
              </span>
            </div>

            <input
              type="range"
              min="5"
              max="95"
              step="1"
              value={inputs.profitMargin}
              onChange={(e) => setInputs({ ...inputs, profitMargin: parseInt(e.target.value) || 0 })}
              className="w-full accent-[#C86D51] cursor-pointer"
            />

            <div className="flex justify-between text-[10px] text-stone-400 font-mono mt-1">
              <span>5% (Thin)</span>
              <span>35-45% (Healthy Artisan)</span>
              <span>95% (Max)</span>
            </div>

            {!calculations.isValidMargin && (
              <p className="text-xs text-red-600 mt-1 font-medium">
                {calculations.marginError}
              </p>
            )}
          </div>

          {/* Ask Gemma Button */}
          <button
            type="button"
            onClick={handleGetGemmaAdvice}
            disabled={loadingAi || !calculations.isValidMargin}
            className="w-full py-2.5 px-4 rounded-xl bg-[#1E3A2B] text-[#FAF9F5] text-xs sm:text-sm font-semibold hover:bg-[#14281E] disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            {loadingAi ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin text-[#E88C72]" />
                <span>Consulting Gemma Advisor...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#E88C72]" />
                <span>Get Gemma Pricing Insights</span>
              </>
            )}
          </button>
        </div>

        {/* Right Output: Calculation Results & Gemma Insights (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Price Card */}
          <div className="rounded-2xl border border-[#E7E3DA] bg-white p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#C86D51]">
                Formula Pricing Breakdown
              </span>
              <button
                onClick={handleSavePricing}
                disabled={saved || calculations.totalCost <= 0}
                className={`px-3 py-1 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
                  saved
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-[#FAF7F2] text-stone-800 border border-[#E7E3DA] hover:bg-stone-100'
                }`}
              >
                {saved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                <span>{saved ? 'Saved' : 'Save Calculation'}</span>
              </button>
            </div>

            {/* Big Numbers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
              {/* Total Cost */}
              <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E7E3DA]">
                <span className="text-[11px] uppercase tracking-wider text-stone-500 font-mono block mb-1">
                  Total Unit Cost
                </span>
                <span className="text-2xl font-mono font-bold text-stone-900 tabular-nums">
                  {inputs.currency}{calculations.totalCost.toFixed(2)}
                </span>
                <span className="text-[10px] text-stone-400 block mt-1">
                  Materials + Labour + Overhead
                </span>
              </div>

              {/* Suggested Retail Price */}
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#C86D51]/30 ring-1 ring-[#C86D51]/20">
                <span className="text-[11px] uppercase tracking-wider text-[#C86D51] font-mono font-semibold block mb-1">
                  Suggested Retail Price
                </span>
                <span className="text-3xl font-mono font-bold text-[#1E3A2B] tabular-nums">
                  {inputs.currency}{calculations.sellingPrice.toFixed(2)}
                </span>
                <span className="text-[10px] text-stone-500 block mt-1">
                  At {inputs.profitMargin}% desired margin
                </span>
              </div>

              {/* Net Profit */}
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
                <span className="text-[11px] uppercase tracking-wider text-emerald-800 font-mono font-semibold block mb-1">
                  Net Profit / Unit
                </span>
                <span className="text-2xl font-mono font-bold text-emerald-900 tabular-nums">
                  {inputs.currency}{calculations.profitAmount.toFixed(2)}
                </span>
                <span className="text-[10px] text-emerald-700 block mt-1">
                  Reinvestment buffer
                </span>
              </div>
            </div>

            {/* Formula Explanation Callout */}
            <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E7E3DA] space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-stone-800">
                <Info className="w-4 h-4 text-[#2D5A3F]" />
                <span>Transparent Mathematical Formula:</span>
              </div>
              <div className="p-2.5 bg-white rounded border border-[#E7E3DA] font-mono text-[11px] text-stone-800 text-center">
                Selling Price = Total Cost ÷ (1 - Margin% / 100)
              </div>
              <div className="text-[11px] text-stone-600 leading-relaxed font-mono">
                {inputs.currency}{calculations.sellingPrice.toFixed(2)} = {inputs.currency}{calculations.totalCost.toFixed(2)} ÷ (1 - {(inputs.profitMargin / 100).toFixed(2)})
                <span className="block mt-1 text-stone-500">
                  Proof: Profit ({inputs.currency}{calculations.profitAmount.toFixed(2)}) ÷ Selling Price ({inputs.currency}{calculations.sellingPrice.toFixed(2)}) = {((calculations.profitAmount / calculations.sellingPrice) * 100).toFixed(1)}% margin.
                </span>
              </div>
            </div>

            {/* Cost Breakdown Items */}
            <div className="mt-4 pt-3 border-t border-stone-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-stone-600">
              <div>
                <span className="text-stone-400 block text-[10px]">Materials:</span>
                <span className="font-semibold text-stone-800 tabular-nums">
                  {inputs.currency}{calculations.mat.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">Labour:</span>
                <span className="font-semibold text-stone-800 tabular-nums">
                  {inputs.currency}{calculations.lab.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">Packaging:</span>
                <span className="font-semibold text-stone-800 tabular-nums">
                  {inputs.currency}{calculations.pack.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">Overhead:</span>
                <span className="font-semibold text-stone-800 tabular-nums">
                  {inputs.currency}{calculations.other.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Gemma AI Explanation & Considerations */}
          {aiResult && (
            <div className="rounded-2xl border border-[#E7E3DA] bg-white p-6 shadow-2xs space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C86D51]" />
                  <h3 className="text-sm font-bold text-stone-900 font-editorial">
                    Gemma Business Advisor Insights
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-[#2D5A3F] bg-[#E7EFEA] px-2 py-0.5 rounded">
                  Open-Weight Gemma
                </span>
              </div>

              {/* AI Explanation */}
              <div className="text-xs text-stone-700 leading-relaxed whitespace-pre-line">
                {aiResult.explanation}
              </div>

              {/* Considerations List */}
              {aiResult.considerations && aiResult.considerations.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
                    Artisan Pricing Considerations
                  </h4>
                  <ul className="space-y-1.5 text-xs text-stone-700">
                    {aiResult.considerations.map((c, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#C86D51] font-bold mt-0.5">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Transparent Disclaimer */}
              <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#E7E3DA] text-[11px] text-stone-500 italic">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2D5A3F] inline mr-1 -mt-0.5" />
                {aiResult.disclaimer || 'This estimate is based on your stated costs and target margin formula. Always verify with actual local market conditions.'}
              </div>
            </div>
          )}

          {/* AI Loading State */}
          {loadingAi && (
            <div className="p-8 text-center rounded-2xl border border-[#E7E3DA] bg-white animate-pulse">
              <RotateCw className="w-6 h-6 text-[#2D5A3F] animate-spin mx-auto mb-2" />
              <p className="text-xs font-semibold text-stone-800">
                Gemma is evaluating your pricing strategy...
              </p>
              <p className="text-[11px] text-stone-500 mt-1">
                Formulating artisan positioning notes and sustainable margin considerations.
              </p>
            </div>
          )}

          {aiError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">AI Advice Error</p>
                <p className="text-[11px] mt-0.5">{aiError}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
