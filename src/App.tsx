import React, { useState, useEffect, useCallback } from 'react';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { ProductWriterView } from './components/ProductWriterView';
import { SocialStudioView } from './components/SocialStudioView';
import { PricingHelperView } from './components/PricingHelperView';
import { SavedContentView } from './components/SavedContentView';
import { SettingsView } from './components/SettingsView';
import { ToastContainer, ToastMessage } from './components/Toast';
import { GemmaHealthStatus, SavedItem } from './types';
import { checkGemmaHealth, fetchSavedItems, loadSellerProfile } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [gemmaStatus, setGemmaStatus] = useState<GemmaHealthStatus | null>(null);
  const [checkingHealth, setCheckingHealth] = useState<boolean>(true);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const notify = useCallback(
    (title: string, description?: string, type: 'success' | 'error' | 'info' = 'success') => {
      const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      setToasts((prev) => [...prev, { id, title, description, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadHealth = useCallback(async () => {
    setCheckingHealth(true);
    try {
      const status = await checkGemmaHealth();
      setGemmaStatus(status);
    } catch {
      setGemmaStatus({
        connected: false,
        model: 'gemma-4-26b-a4b-it',
        availableGemmaModels: [],
        latencyMs: 0,
        message: 'Could not connect to Gemma inference service.',
        testedAt: new Date().toISOString(),
      });
    } finally {
      setCheckingHealth(false);
    }
  }, []);

  const loadItems = useCallback(async () => {
    try {
      const { items } = await fetchSavedItems();
      setSavedItems(items);
    } catch (err) {
      console.warn('Error loading saved items:', err);
    }
  }, []);

  useEffect(() => {
    loadHealth();
    loadItems();
  }, [loadHealth, loadItems]);

  const handleItemSaved = (newItem: SavedItem) => {
    setSavedItems((prev) => [newItem, ...prev.filter((i) => i.id !== newItem.id)]);
  };

  const handleOpenSample = (_item: SavedItem) => {
    setActiveTab('saved-content');
  };

  const profile = loadSellerProfile();

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-800 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        gemmaStatus={gemmaStatus}
        checkingHealth={checkingHealth}
        onRefreshHealth={loadHealth}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigate={setActiveTab}
            gemmaStatus={gemmaStatus}
            checkingHealth={checkingHealth}
            onRefreshHealth={loadHealth}
            savedItems={savedItems}
            onOpenSample={handleOpenSample}
          />
        )}

        {activeTab === 'product-writer' && (
          <ProductWriterView
            onNotify={notify}
            onItemSaved={handleItemSaved}
          />
        )}

        {activeTab === 'social-studio' && (
          <SocialStudioView
            onNotify={notify}
            onItemSaved={handleItemSaved}
          />
        )}

        {activeTab === 'pricing-helper' && (
          <PricingHelperView
            onNotify={notify}
            onItemSaved={handleItemSaved}
            defaultCurrency={profile.defaultCurrency}
          />
        )}

        {activeTab === 'saved-content' && (
          <SavedContentView
            items={savedItems}
            onItemsChange={loadItems}
            onNotify={notify}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            gemmaStatus={gemmaStatus}
            checkingHealth={checkingHealth}
            onRefreshHealth={loadHealth}
            onNotify={notify}
          />
        )}
      </main>

      {/* Clean, Quiet Footer */}
      <footer className="border-t border-[#E7E3DA] bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-800 font-editorial">
              CraftSeller AI
            </span>
            <span>·</span>
            <span>Hacktoberfest Open-Source AI Challenge Week 2</span>
            <span>·</span>
            <span>Side Hustle Track</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-stone-500">
            <span>Model: {gemmaStatus?.model || 'gemma-4-26b-a4b-it'}</span>
            <span>·</span>
            <span>Open-Weight AI</span>
          </div>
        </div>
      </footer>

      {/* Floating Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
