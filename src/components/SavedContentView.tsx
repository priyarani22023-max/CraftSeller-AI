import React, { useState } from 'react';
import {
  BookmarkCheck,
  Search,
  Copy,
  Check,
  Trash2,
  Edit2,
  Download,
  Upload,
  HardDrive,
  Globe2,
  Eye,
  X,
  Tag,
  Share2,
  PenTool,
  Calculator,
  AlertCircle,
} from 'lucide-react';
import { SavedItem } from '../types';
import { deleteSavedItem, updateSavedItem } from '../services/api';

interface SavedContentViewProps {
  items: SavedItem[];
  onItemsChange: () => void;
  onNotify: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
}

export const SavedContentView: React.FC<SavedContentViewProps> = ({
  items,
  onItemsChange,
  onNotify,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewingItem, setViewingItem] = useState<SavedItem | null>(null);
  const [editingItem, setEditingItem] = useState<SavedItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTags, setEditTags] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      (item.tags && item.tags.some((t) => t.toLowerCase().includes(q))) ||
      JSON.stringify(item.data).toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  const handleCopyText = (item: SavedItem) => {
    let textToCopy = '';
    if (item.type === 'product') {
      textToCopy = `TITLE: ${item.data.title}\n\nDESCRIPTION:\n${item.data.description}\n\nHIGHLIGHTS:\n${item.data.highlights?.join('\n• ')}\n\nKEYWORDS: ${item.data.keywords?.join(', ')}\n\nSHORT LISTING: ${item.data.shortListing}\n\nCTA: ${item.data.cta}`;
    } else if (item.type === 'social') {
      textToCopy = `CAPTION:\n${item.data.caption}\n\nHASHTAGS:\n${item.data.hashtags?.join(' ')}\n\nBROADCAST / WHATSAPP:\n${item.data.shortPromo}\n\nCTA:\n${item.data.cta}\n\nFESTIVE COPY:\n${item.data.festiveCopy || ''}`;
    } else if (item.type === 'pricing') {
      textToCopy = `PRICING ESTIMATE:\nTotal Cost: ${item.data.inputs?.currency || '$'}${item.data.calculations?.totalCost?.toFixed(2)}\nSuggested Price: ${item.data.inputs?.currency || '$'}${item.data.calculations?.sellingPrice?.toFixed(2)}\nProfit: ${item.data.inputs?.currency || '$'}${item.data.calculations?.profitAmount?.toFixed(2)}\n\nADVICE:\n${item.data.aiAdvice?.explanation || ''}`;
    } else {
      textToCopy = JSON.stringify(item.data, null, 2);
    }

    navigator.clipboard.writeText(textToCopy);
    setCopiedId(item.id);
    onNotify('Copied Content', `Full text for "${item.title}" copied.`, 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteSavedItem(id);
      onItemsChange();
      if (viewingItem?.id === id) setViewingItem(null);
      onNotify('Deleted', `"${title}" removed from saved items.`, 'info');
    } catch (err: any) {
      onNotify('Delete Failed', err?.message || 'Could not delete item.', 'error');
    }
  };

  const handleStartEdit = (item: SavedItem) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditTags(item.tags?.join(', ') || '');
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    try {
      const parsedTags = editTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await updateSavedItem(editingItem.id, {
        title: editTitle.trim() || editingItem.title,
        tags: parsedTags,
      });

      onItemsChange();
      if (viewingItem?.id === editingItem.id) {
        setViewingItem({
          ...viewingItem,
          title: editTitle.trim() || editingItem.title,
          tags: parsedTags,
        });
      }
      setEditingItem(null);
      onNotify('Updated', 'Item details saved.', 'success');
    } catch (err: any) {
      onNotify('Update Failed', err?.message || 'Could not update item.', 'error');
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `craftseller_saved_items_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onNotify('Export Complete', `${items.length} items exported to JSON.`, 'success');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          // Store directly into localStorage
          localStorage.setItem('craftseller_saved_items_v1', JSON.stringify(imported));
          onItemsChange();
          onNotify('Import Complete', `Successfully loaded ${imported.length} items.`, 'success');
        } else {
          throw new Error('File does not contain a JSON array of items.');
        }
      } catch (err: any) {
        onNotify('Import Failed', err?.message || 'Invalid JSON file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Storage Truth Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E3DA]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-editorial">
            Saved Content Library
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Browse, copy, export, and organize your Gemma-generated product listings, social posts, and pricing estimates.
          </p>
        </div>

        {/* Export / Import Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="px-3 py-1.5 rounded-lg border border-[#E7E3DA] bg-white text-stone-700 text-xs font-medium hover:bg-[#FAF9F5] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <label className="px-3 py-1.5 rounded-lg border border-[#E7E3DA] bg-white text-stone-700 text-xs font-medium hover:bg-[#FAF9F5] transition-colors flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Honest Storage Disclosure Banner */}
      <div className="p-3.5 rounded-xl border border-[#E7E3DA] bg-[#FAF8F5] flex items-start gap-3">
        <HardDrive className="w-4 h-4 text-[#2D5A3F] shrink-0 mt-0.5" />
        <div className="text-xs text-stone-700 leading-relaxed">
          <span className="font-semibold text-stone-900">Storage Disclosure: </span>
          Content is saved simultaneously to your local backend file storage (<code>data/saved_items.json</code>) and your browser's private local storage. Data is <strong>not</strong> synchronized to a remote third-party cloud database without your explicit setup.
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1 p-1 bg-white border border-[#E7E3DA] rounded-xl overflow-x-auto">
          {[
            { id: 'all', label: `All (${items.length})` },
            { id: 'product', label: `Listings (${items.filter((i) => i.type === 'product').length})` },
            { id: 'social', label: `Social (${items.filter((i) => i.type === 'social').length})` },
            { id: 'pricing', label: `Pricing (${items.filter((i) => i.type === 'pricing').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedType === tab.id
                  ? 'bg-[#1E3A2B] text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved content..."
            className="w-full pl-8 pr-3 py-1.5 text-xs text-stone-900 bg-white border border-[#E7E3DA] rounded-xl focus:outline-none focus:border-[#2D5A3F]"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-[#E7E3DA] bg-white p-8">
          <BookmarkCheck className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-stone-800 font-editorial">
            No Saved Items Found
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
            {searchQuery
              ? `No items matching "${searchQuery}". Try a different keyword.`
              : 'Save generated product listings, social captions, or pricing calculations to see them here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const isProduct = item.type === 'product';
            const isSocial = item.type === 'social';
            const isPricing = item.type === 'pricing';

            return (
              <div
                key={item.id}
                className="rounded-xl border border-[#E7E3DA] bg-white p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Meta */}
                  <div className="flex items-center justify-between text-[11px] text-stone-500 mb-2">
                    <span className="flex items-center gap-1 font-semibold uppercase tracking-wider text-[#C86D51]">
                      {isProduct && <PenTool className="w-3 h-3" />}
                      {isSocial && <Share2 className="w-3 h-3" />}
                      {isPricing && <Calculator className="w-3 h-3" />}
                      <span>{item.type}</span>
                    </span>
                    <span className="font-mono text-stone-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-stone-900 font-editorial line-clamp-2 leading-snug">
                    {item.title}
                  </h3>

                  {/* Content Preview Snippet */}
                  <div className="mt-2.5 text-xs text-stone-600 line-clamp-3 leading-relaxed">
                    {isProduct && item.data?.description}
                    {isSocial && item.data?.caption}
                    {isPricing &&
                      `Selling Price: ${item.data?.inputs?.currency || '$'}${item.data?.calculations?.sellingPrice?.toFixed(2)} (${item.data?.inputs?.profitMargin}% margin) — Total unit cost: ${item.data?.inputs?.currency || '$'}${item.data?.calculations?.totalCost?.toFixed(2)}`}
                  </div>

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-[10px] bg-[#FAF7F2] text-stone-600 rounded border border-[#E7E3DA] font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="text-[10px] text-stone-400 self-center">
                          +{item.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <button
                    onClick={() => setViewingItem(item)}
                    className="text-xs font-semibold text-[#1E3A2B] hover:text-[#C86D51] transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Full</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyText(item)}
                      title="Copy full content"
                      className="p-1.5 text-stone-500 hover:text-stone-900 rounded hover:bg-stone-100 transition-colors cursor-pointer"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => handleStartEdit(item)}
                      title="Edit title & tags"
                      className="p-1.5 text-stone-500 hover:text-stone-900 rounded hover:bg-stone-100 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      title="Delete item"
                      className="p-1.5 text-stone-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Item Detail Modal */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E7E3DA] max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#C86D51]">
                  {viewingItem.type} · {viewingItem.language} · Gemma Model
                </span>
                <h3 className="text-lg font-bold text-stone-900 font-editorial mt-0.5">
                  {viewingItem.title}
                </h3>
              </div>
              <button
                onClick={() => setViewingItem(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Details */}
            <div className="space-y-4 text-xs text-stone-800">
              {viewingItem.type === 'product' && (
                <>
                  <div>
                    <h4 className="font-semibold text-stone-900 uppercase text-[11px] text-[#C86D51] mb-1">
                      SEO Title
                    </h4>
                    <p className="bg-[#FAF9F5] p-2.5 rounded border border-[#E7E3DA] font-semibold text-stone-900">
                      {viewingItem.data?.title}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-stone-900 uppercase text-[11px] text-[#C86D51] mb-1">
                      Description
                    </h4>
                    <div className="bg-[#FAF9F5] p-3 rounded border border-[#E7E3DA] whitespace-pre-line leading-relaxed">
                      {viewingItem.data?.description}
                    </div>
                  </div>

                  {viewingItem.data?.highlights && (
                    <div>
                      <h4 className="font-semibold text-stone-900 uppercase text-[11px] text-[#C86D51] mb-1">
                        Highlights
                      </h4>
                      <ul className="list-disc pl-4 space-y-1">
                        {viewingItem.data.highlights.map((h: string, idx: number) => (
                          <li key={idx}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {viewingItem.data?.keywords && (
                    <div>
                      <h4 className="font-semibold text-stone-900 uppercase text-[11px] text-[#C86D51] mb-1">
                        Keywords
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {viewingItem.data.keywords.map((k: string, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 bg-stone-100 rounded font-mono text-[11px]">
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {viewingItem.data?.shortListing && (
                    <div>
                      <h4 className="font-semibold text-stone-900 uppercase text-[11px] text-[#C86D51] mb-1">
                        Marketplace Snippet
                      </h4>
                      <p className="bg-[#FAF9F5] p-2.5 rounded border border-[#E7E3DA]">
                        {viewingItem.data.shortListing}
                      </p>
                    </div>
                  )}

                  {viewingItem.data?.cta && (
                    <div>
                      <h4 className="font-semibold text-stone-900 uppercase text-[11px] text-[#C86D51] mb-1">
                        Call to Action
                      </h4>
                      <p className="italic text-stone-800">"{viewingItem.data.cta}"</p>
                    </div>
                  )}
                </>
              )}

              {viewingItem.type === 'social' && (
                <>
                  <div>
                    <h4 className="font-semibold text-stone-900 uppercase text-[11px] text-[#C86D51] mb-1">
                      Caption
                    </h4>
                    <div className="bg-[#FAF9F5] p-3 rounded border border-[#E7E3DA] whitespace-pre-line leading-relaxed">
                      {viewingItem.data?.caption}
                    </div>
                  </div>

                  {viewingItem.data?.hashtags && (
                    <div>
                      <h4 className="font-semibold text-stone-900 uppercase text-[11px] text-[#C86D51] mb-1">
                        Hashtags
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {viewingItem.data.hashtags.map((tag: string, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 bg-stone-100 text-[#2D5A3F] rounded font-mono text-[11px]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {viewingItem.data?.shortPromo && (
                    <div>
                      <h4 className="font-semibold text-stone-900 uppercase text-[11px] text-[#C86D51] mb-1">
                        WhatsApp / Status Broadcast
                      </h4>
                      <p className="bg-[#FAF9F5] p-2.5 rounded border border-[#E7E3DA]">
                        {viewingItem.data.shortPromo}
                      </p>
                    </div>
                  )}

                  {viewingItem.data?.festiveCopy && (
                    <div>
                      <h4 className="font-semibold text-stone-900 uppercase text-[11px] text-[#C86D51] mb-1">
                        Festive / Seasonal Angle
                      </h4>
                      <p className="bg-[#FAF7F2] p-2.5 rounded border border-[#E7E3DA]">
                        {viewingItem.data.festiveCopy}
                      </p>
                    </div>
                  )}
                </>
              )}

              {viewingItem.type === 'pricing' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3 p-3 bg-[#FAF7F2] rounded-xl border border-[#E7E3DA]">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-mono block">Total Cost</span>
                      <span className="text-base font-bold font-mono text-stone-900">
                        {viewingItem.data?.inputs?.currency}{viewingItem.data?.calculations?.totalCost?.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-mono block">Selling Price</span>
                      <span className="text-base font-bold font-mono text-[#1E3A2B]">
                        {viewingItem.data?.inputs?.currency}{viewingItem.data?.calculations?.sellingPrice?.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-mono block">Profit / Unit</span>
                      <span className="text-base font-bold font-mono text-emerald-800">
                        {viewingItem.data?.inputs?.currency}{viewingItem.data?.calculations?.profitAmount?.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {viewingItem.data?.aiAdvice?.explanation && (
                    <div>
                      <h4 className="font-semibold text-stone-900 uppercase text-[11px] text-[#C86D51] mb-1">
                        Gemma Advisor Explanation
                      </h4>
                      <p className="leading-relaxed bg-[#FAF9F5] p-3 rounded border border-[#E7E3DA]">
                        {viewingItem.data.aiAdvice.explanation}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
              <span className="text-[11px] text-stone-400 font-mono">
                Model: {viewingItem.modelUsed}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyText(viewingItem)}
                  className="px-3 py-1.5 rounded-lg bg-[#1E3A2B] text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Full Text</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Title & Tags Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E7E3DA] max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-stone-900 font-editorial">
              Edit Item Title & Tags
            </h3>

            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                Title
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs text-stone-900 bg-[#FAF9F5] border border-[#E7E3DA] rounded-lg focus:outline-none focus:border-[#2D5A3F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                placeholder="e.g. Ceramics, Etsy, Holiday 2026"
                className="w-full px-3 py-2 text-xs text-stone-900 bg-[#FAF9F5] border border-[#E7E3DA] rounded-lg focus:outline-none focus:border-[#2D5A3F]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-3 py-1.5 rounded-lg border border-[#E7E3DA] text-xs font-medium text-stone-600 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-1.5 rounded-lg bg-[#1E3A2B] text-white text-xs font-semibold hover:bg-[#14281E]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
