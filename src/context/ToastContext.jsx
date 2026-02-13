/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

/**
 * Toast notification types with their styles and icons
 */
const TOAST_TYPES = {
  success: {
    icon: CheckCircle,
    bgClass: 'bg-emerald-50 dark:bg-emerald-900/30',
    borderClass: 'border-emerald-200 dark:border-emerald-800',
    iconClass: 'text-emerald-700 dark:text-emerald-700',
    titleClass: 'text-emerald-800 dark:text-emerald-300'
  },
  error: {
    icon: XCircle,
    bgClass: 'bg-red-50 dark:bg-red-900/30',
    borderClass: 'border-red-200 dark:border-red-800',
    iconClass: 'text-red-600 dark:text-red-400',
    titleClass: 'text-red-800 dark:text-red-300'
  },
  warning: {
    icon: AlertTriangle,
    bgClass: 'bg-amber-50 dark:bg-amber-900/30',
    borderClass: 'border-amber-200 dark:border-amber-800',
    iconClass: 'text-amber-600 dark:text-amber-400',
    titleClass: 'text-amber-800 dark:text-amber-300'
  },
  info: {
    icon: Info,
    bgClass: 'bg-blue-50 dark:bg-blue-900/30',
    borderClass: 'border-blue-200 dark:border-blue-800',
    iconClass: 'text-blue-600 dark:text-blue-400',
    titleClass: 'text-blue-800 dark:text-blue-300'
  }
};

/**
 * Single Toast component
 */
const Toast = ({ id, type = 'info', title, message, onClose }) => {
  const config = TOAST_TYPES[type] || TOAST_TYPES.info;
  const Icon = config.icon;

  return (
    <div
      className={`${config.bgClass} ${config.borderClass} border rounded-xl p-4 shadow-md flex items-start gap-3 min-w-[320px] max-w-md animate-slide-in`}
      role="alert"
      aria-live="polite"
    >
      <Icon className={`w-5 h-5 ${config.iconClass} flex-shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        {title && (
          <p className={`font-semibold text-sm ${config.titleClass}`}>{title}</p>
        )}
        {message && (
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">{message}</p>
        )}
      </div>
      <button
        onClick={() => onClose(id)}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex-shrink-0"
        aria-label="Fechar notificAção"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

/**
 * Toast Container - renders all active toasts
 */
const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={removeToast} />
      ))}
    </div>
  );
};

/**
 * Toast Provider - manages toast state
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ type = 'info', title, message, duration = 5000 }) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    setToasts((prev) => [...prev, { id, type, title, message }]);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [removeToast]);

  // Shorthand methods
  const toast = {
    success: (title, message) => addToast({ type: 'success', title, message }),
    error: (title, message) => addToast({ type: 'error', title, message }),
    warning: (title, message) => addToast({ type: 'warning', title, message }),
    info: (title, message) => addToast({ type: 'info', title, message }),
    custom: addToast
  };

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

/**
 * Hook to use toast notifications
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
