import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      id="toast-notification-container"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full px-4 sm:px-0 pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const bgStyles =
    toast.type === 'success'
      ? 'bg-emerald-600 text-white shadow-emerald-700/20'
      : toast.type === 'error'
      ? 'bg-rose-600 text-white shadow-rose-700/20'
      : 'bg-blue-600 text-white shadow-blue-700/20';

  return (
    <div
      id={`toast-${toast.id}`}
      className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-lg transition-all duration-300 transform translate-y-0 ${bgStyles}`}
      role="alert"
    >
      <div className="flex items-center gap-2.5">
        {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
        {toast.type === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
        {toast.type === 'info' && <Info className="w-5 h-5 flex-shrink-0" />}
        <span className="text-sm font-medium leading-snug">{toast.message}</span>
      </div>
      <button
        id={`btn-close-toast-${toast.id}`}
        onClick={() => onDismiss(toast.id)}
        className="p-1 rounded-lg hover:bg-white/20 transition-colors"
        aria-label="Đóng thông báo"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
