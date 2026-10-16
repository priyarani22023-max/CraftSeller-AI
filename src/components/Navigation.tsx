import React from 'react';
import {
  Sparkles,
  PenTool,
  Share2,
  Calculator,
  BookmarkCheck,
  Settings,
  LayoutDashboard,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { GemmaHealthStatus } from '../types';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  gemmaStatus: GemmaHealthStatus | null;
  checkingHealth: boolean;
  onRefreshHealth: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  gemmaStatus,
  checkingHealth,
  onRefreshHealth,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'product-writer', label: 'Product Writer', icon: PenTool },
    { id: 'social-studio', label: 'Social Studio', icon: Share2 },
    { id: 'pricing-helper', label: 'Pricing Helper', icon: Calculator },
    { id: 'saved-content', label: 'Saved Content', icon: BookmarkCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-[#E7E3DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single Text Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="text-left group cursor-pointer focus-visible:outline-none"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#2D5A3F] flex items-center justify-center text-[#FAF9F5] shadow-sm">
                  <Sparkles className="w-4 h-4 text-[#E88C72]" />
                </div>
                <span className="text-xl font-bold tracking-tight text-[#1E3A2B] font-editorial whitespace-nowrap">
                  CraftSeller <span className="text-[#C86D51]">AI</span>
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Concise single-line navigation links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs lg:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#1E3A2B] text-[#FAF9F5]'
                      : 'text-[#5C554E] hover:text-[#1E3A2B] hover:bg-[#EFECE5]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Live Gemma Status Indicator */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border border-[#E7E3DA] bg-white shadow-2xs">
              <span className="text-stone-500 font-mono text-[11px] hidden sm:inline">Gemma Model:</span>
              <span className="font-mono text-stone-700 font-medium text-[11px] truncate max-w-[130px]">
                {gemmaStatus?.model || 'gemma-4-26b-a4b-it'}
              </span>
              {checkingHealth ? (
                <span className="inline-flex items-center gap-1 text-amber-700 font-medium" title="Checking Gemma connection...">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
                  <span className="hidden lg:inline text-[11px]">Checking</span>
                </span>
              ) : gemmaStatus?.connected ? (
                <span className="inline-flex items-center gap-1 text-[#2D5A3F] font-medium" title={`Connected (${gemmaStatus.latencyMs}ms)`}>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden lg:inline text-[11px]">Ready</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-rose-700 font-medium" title={gemmaStatus?.message || 'Connection failed'}>
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span className="hidden lg:inline text-[11px]">Unavailable</span>
                </span>
              )}

              <button
                onClick={onRefreshHealth}
                disabled={checkingHealth}
                title="Verify Gemma connection"
                className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${checkingHealth ? 'animate-spin text-[#2D5A3F]' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-[#E7E3DA] overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 px-2 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                  isActive ? 'text-[#1E3A2B] font-semibold' : 'text-[#7D756C]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
