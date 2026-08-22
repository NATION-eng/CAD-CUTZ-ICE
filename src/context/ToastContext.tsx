import React, { createContext, useContext, useState, useCallback } from "react";
import type { ToastMessage } from "../types";
import { LuxuryIcon } from "../components/LuxuryIcon";
import "../components/Toast.css";

interface ToastContextType {
  showToast: (message: string, type?: ToastMessage["type"], title?: string, duration?: number) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastMessage["type"] = "info", title?: string, duration: number = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastMessage = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title: string = "Success") => showToast(message, "success", title),
    [showToast]
  );
  const error = useCallback(
    (message: string, title: string = "Notice") => showToast(message, "error", title),
    [showToast]
  );
  const info = useCallback(
    (message: string, title: string = "Information") => showToast(message, "info", title),
    [showToast]
  );
  const warning = useCallback(
    (message: string, title: string = "Attention") => showToast(message, "warning", title),
    [showToast]
  );

  const renderIcon = (type: ToastMessage["type"]) => {
    switch (type) {
      case "success":
        return <LuxuryIcon name="check" size={18} color="#22c55e" />;
      case "error":
        return <LuxuryIcon name="alert" size={18} color="#ef4444" />;
      case "warning":
        return <LuxuryIcon name="lightning" size={18} color="#f59e0b" />;
      case "info":
      default:
        return <LuxuryIcon name="sparkle" size={18} color="#c5a059" />;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-item ${t.type}`}>
            <div className="toast-icon">{renderIcon(t.type)}</div>
            <div className="toast-content">
              {t.title && <div className="toast-title">{t.title}</div>}
              <div className="toast-message">{t.message}</div>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="toast-close-btn"
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
