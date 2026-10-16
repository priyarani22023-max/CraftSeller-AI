import React, { useState, useEffect } from 'react';
import {
  Settings,
  Cpu,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  User,
  Store,
  DollarSign,
  Globe2,
  Sparkles,
  ShieldCheck,
  HardDrive,
  GitBranch,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { GemmaHealthStatus, SellerProfile } from '../types';
import { loadSellerProfile, saveSellerProfile, checkGemmaHealth } from '../services/api';

interface SettingsViewProps {
  gemmaStatus: GemmaHealthStatus | null;
  checkingHealth: boolean;
  onRefreshHealth: () => void;
  onNotify: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  gemmaStatus,
  checkingHealth,
  onRefreshHealth,
  onNotify,
}) => {
  const [profile, setProfile] = useState<SellerProfile>(loadSellerProfile());
  const [testingModel, setTestingModel] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    setProfile(loadSellerProfile());
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    saveSellerProfile(profile);
    onNotify('Profile Saved', 'Your studio defaults have been updated.', 'success');
  };

  const handleRunModelTest = async () => {
    setTestingModel(true);
    setTestResult(null);
    try {
      const status = await checkGemmaHealth();
      if (status.connected) {
        setTestResult(`Success! Model responded in ${status.latencyMs}ms. Details: ${status.message}`);
        onNotify('Live Test Succeeded', `Latency: ${status.latencyMs}ms`, 'success');
      } else {
        setTestResult(`Connection failed: ${status.error || status.message}`);
        onNotify('Test Failed', status.error || status.message, 'error');
      }
    } catch (err: any) {
      setTestResult(`Error: ${err?.message || String(err)}`);
    } finally {
      setTestingModel(false);
      onRefreshHealth();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-5xl mx-auto">
      {/* Title */}
      <div className="pb-4 border-b border-[#E7E3DA]">
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-editorial">
          Settings & AI Configuration
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          Configure artisan studio defaults, verify live Gemma open-weight inference, and explore open-source architecture.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Model Configuration & Diagnostics (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Gemma Model Status Card */}
          <div className="bg-white rounded-2xl border border-[#E7E3DA] p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <span className="text-xs font-semibold text-[#1E3A2B] uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#C86D51]" />
                Configured Gemma Model
              </span>
              <span className="text-[11px] font-mono text-stone-400">Open-Weight</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-[#FAF9F5] rounded-xl border border-[#E7E3DA]">
                <div>
                  <span className="text-[10px] text-stone-400 uppercase font-mono block">Active Model ID</span>
                  <span className="text-xs font-mono font-bold text-[#1E3A2B]">
                    {gemmaStatus?.model || 'gemma-4-26b-a4b-it'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-stone-400 uppercase font-mono block">Status</span>
                  {checkingHealth ? (
                    <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                      <RefreshCw className="w-3 h-3 animate-spin text-amber-600" /> Checking...
                    </span>
                  ) : gemmaStatus?.connected ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-rose-700 font-medium" title={gemmaStatus?.error || gemmaStatus?.message || 'Connection failed'}>
                      <AlertCircle className="w-3 h-3 text-rose-600" /> Connection Failed
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-stone-600 font-mono text-[11px]">
                <div className="p-2.5 rounded-lg border border-[#E7E3DA] bg-white">
                  <span className="text-stone-400 block text-[10px]">Round-trip Ping:</span>
                  <span className="font-semibold text-stone-800">
                    {gemmaStatus?.latencyMs ? `${gemmaStatus.latencyMs} ms` : '—'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg border border-[#E7E3DA] bg-white">
                  <span className="text-stone-400 block text-[10px]">SDK Client:</span>
                  <span className="font-semibold text-stone-800">@google/genai</span>
                </div>
              </div>

              {/* Security & Architecture Note */}
              <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#E7E3DA] text-[11px] text-stone-600 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-stone-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2D5A3F]" />
                  <span>Zero Client-Side Key Exposure</span>
                </div>
                <p className="leading-relaxed">
                  All requests execute server-side in <code>server/ai.ts</code>. Your <code>GEMINI_API_KEY</code> credential authenticates the Gemma model without ever exposing secrets to browser network bundles.
                </p>
              </div>

              {/* Connection Test Action */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleRunModelTest}
                  disabled={testingModel}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-[#D6CFC4] hover:bg-[#FAF9F5] text-stone-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingModel ? 'animate-spin text-[#2D5A3F]' : ''}`} />
                  <span>{testingModel ? 'Pinging Gemma endpoint...' : 'Run Live Inference Verification'}</span>
                </button>
              </div>

              {testResult && (
                <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 text-[11px] font-mono text-stone-700 whitespace-pre-wrap">
                  {testResult}
                </div>
              )}
            </div>
          </div>

          {/* Hacktoberfest Open-Weight AI Philosophy Card */}
          <div className="bg-white rounded-2xl border border-[#E7E3DA] p-6 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1E3A2B] uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5 text-[#C86D51]" />
              <span>Why Open-Weight AI Matters for Artisans</span>
            </div>

            <h3 className="text-sm font-bold text-stone-900 font-editorial">
              Craft Sovereignty & Independence
            </h3>

            <div className="text-xs text-stone-600 space-y-2.5 leading-relaxed">
              <p>
                <strong>1. No Vendor Lock-In:</strong> Unlike proprietary closed APIs, open-weight models like Gemma allow independent developers and makers to audit model weights, fine-tune them on local craft traditions, and switch inference backends seamlessly.
              </p>
              <p>
                <strong>2. On-Premises & Offline Freedom:</strong> Gemma 4 / Gemma 2 models can be deployed locally using open-source tools such as <em>Ollama, llama.cpp, or vLLM</em>. An artisan working off-grid at a remote workshop or craft studio can run local inference with zero internet connection.
              </p>
              <p>
                <strong>3. Intellectual Property Protection:</strong> Proprietary recipe glaze formulas, secret natural textile dye recipes, and bespoke jewelry patterns can stay strictly on local hardware without sending trade secrets to third-party data collection pipelines.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Artisan Studio Profile (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-[#E7E3DA] p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <span className="text-xs font-semibold text-[#1E3A2B] uppercase tracking-wider flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-[#C86D51]" />
              Artisan Studio Profile
            </span>
            <span className="text-[11px] text-stone-400">Default Presets</span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                Studio / Brand Name
              </label>
              <input
                type="text"
                value={profile.shopName}
                onChange={(e) => setProfile({ ...profile, shopName: e.target.value })}
                placeholder="e.g. Earth & Loom Studio"
                className="w-full px-3 py-2 text-xs text-stone-900 bg-[#FAF9F5] border border-[#E7E3DA] rounded-lg focus:outline-none focus:border-[#2D5A3F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                Artisan / Creator Name
              </label>
              <input
                type="text"
                value={profile.artisanName}
                onChange={(e) => setProfile({ ...profile, artisanName: e.target.value })}
                placeholder="e.g. Priya Sharma"
                className="w-full px-3 py-2 text-xs text-stone-900 bg-[#FAF9F5] border border-[#E7E3DA] rounded-lg focus:outline-none focus:border-[#2D5A3F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                Craft Specialty
              </label>
              <input
                type="text"
                value={profile.craftSpecialty}
                onChange={(e) => setProfile({ ...profile, craftSpecialty: e.target.value })}
                placeholder="e.g. Hand-thrown Terracotta Pottery & Macrame"
                className="w-full px-3 py-2 text-xs text-stone-900 bg-[#FAF9F5] border border-[#E7E3DA] rounded-lg focus:outline-none focus:border-[#2D5A3F]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Default Currency
                </label>
                <select
                  value={profile.defaultCurrency}
                  onChange={(e) => setProfile({ ...profile, defaultCurrency: e.target.value })}
                  className="w-full px-3 py-2 text-xs text-stone-900 bg-[#FAF9F5] border border-[#E7E3DA] rounded-lg focus:outline-none focus:border-[#2D5A3F]"
                >
                  <option value="$">$ (USD / International)</option>
                  <option value="₹">₹ (INR - Indian Rupee)</option>
                  <option value="€">€ (EUR - Euro)</option>
                  <option value="£">£ (GBP - British Pound)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Default Language
                </label>
                <select
                  value={profile.defaultLanguage}
                  onChange={(e) => setProfile({ ...profile, defaultLanguage: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs text-stone-900 bg-[#FAF9F5] border border-[#E7E3DA] rounded-lg focus:outline-none focus:border-[#2D5A3F]"
                >
                  <option value="English">English</option>
                  <option value="Hindi">हिंदी (Hindi)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                Default Brand Tone
              </label>
              <select
                value={profile.defaultTone}
                onChange={(e) => setProfile({ ...profile, defaultTone: e.target.value as any })}
                className="w-full px-3 py-2 text-xs text-stone-900 bg-[#FAF9F5] border border-[#E7E3DA] rounded-lg focus:outline-none focus:border-[#2D5A3F]"
              >
                <option value="Friendly">Friendly (Warm, welcoming, conversational)</option>
                <option value="Professional">Professional (Crisp, authoritative, clean)</option>
                <option value="Premium">Premium (Quiet luxury, heritage, bespoke)</option>
                <option value="Traditional">Traditional (Artisanal roots, cultural heritage)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-[#1E3A2B] text-[#FAF9F5] text-xs font-semibold hover:bg-[#14281E] transition-colors cursor-pointer shadow-sm"
            >
              Save Studio Settings
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
