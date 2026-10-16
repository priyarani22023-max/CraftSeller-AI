import React from 'react';
import { Check, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2 duration-200 ${
            toast.type === 'success'
              ? 'bg-[#FAF9F5] border-[#2D5A3F]/30 text-stone-900'
              : toast.type === 'error'
              ? 'bg-[#FFF5F5] border-red-200 text-stone-900'
              : 'bg-white border-stone-200 text-stone-900'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {toast.type === 'success' && <Check className="w-4 h-4 text-[#2D5A3F]" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-600" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-stone-600" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-stone-900">{toast.title}</p>
            {toast.description && (
              <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">{toast.description}</p>
            )}
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-stone-400 hover:text-stone-600 p-1 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
