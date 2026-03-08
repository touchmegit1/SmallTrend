import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  createContext,
  useContext,
} from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLES = {
  success: {
    bg: "bg-emerald-50 border-emerald-200",
    icon: "text-emerald-500",
    title: "text-emerald-800",
    text: "text-emerald-700",
    progress: "bg-emerald-400",
  },
  error: {
    bg: "bg-red-50 border-red-200",
    icon: "text-red-500",
    title: "text-red-800",
    text: "text-red-700",
    progress: "bg-red-400",
  },
  warning: {
    bg: "bg-amber-50 border-amber-200",
    icon: "text-amber-500",
    title: "text-amber-800",
    text: "text-amber-700",
    progress: "bg-amber-400",
  },
  info: {
    bg: "bg-blue-50 border-blue-200",
    icon: "text-blue-500",
    title: "text-blue-800",
    text: "text-blue-700",
    progress: "bg-blue-400",
  },
};

function ToastItem({ toast, onRemove }) {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const style = STYLES[toast.type] || STYLES.info;
  const Icon = ICONS[toast.type] || ICONS.info;
  const duration = toast.duration || 4000;

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [duration]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [toast.id, duration, onRemove]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div
      className={`
        relative overflow-hidden w-96 border rounded-xl shadow-lg backdrop-blur-sm
        transition-all duration-300 ease-out
        ${style.bg}
        ${isExiting ? "opacity-0 translate-x-8 scale-95" : "opacity-100 translate-x-0 scale-100"}
      `}
      style={{
        animation: !isExiting
          ? "slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
          : undefined,
      }}
    >
      <div className="flex items-start gap-3 p-4">
        <div className={`flex-shrink-0 mt-0.5 ${style.icon}`}>
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          {toast.title && (
            <p className={`text-sm font-semibold ${style.title}`}>
              {toast.title}
            </p>
          )}
          <p className={`text-sm ${style.text} ${toast.title ? "mt-0.5" : ""}`}>
            {toast.message}
          </p>
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-0.5 rounded-lg hover:bg-black/5 transition-colors"
        >
          <X size={16} className="text-slate-400" />
        </button>
      </div>
      {/* Progress bar */}
      <div className="h-0.5 w-full bg-black/5">
        <div
          className={`h-full ${style.progress} transition-all duration-100 ease-linear rounded-full`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type, message, options = {}) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message, ...options }]);
    return id;
  }, []);

  const toast = useMemo(
    () => ({
      success: (message, options) => addToast("success", message, options),
      error: (message, options) => addToast("error", message, options),
      warning: (message, options) => addToast("warning", message, options),
      info: (message, options) => addToast("info", message, options),
    }),
    [addToast],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container - top right */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={removeToast} />
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export default ToastProvider;
