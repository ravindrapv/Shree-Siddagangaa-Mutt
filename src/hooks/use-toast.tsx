"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const success = useCallback((message: string) => toast(message, "success"), [toast]);
  const error = useCallback((message: string) => toast(message, "error"), [toast]);
  const warning = useCallback((message: string) => toast(message, "warning"), [toast]);
  const info = useCallback((message: string) => toast(message, "info"), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm w-full no-print">
        {toasts.map((t) => {
          const icons = {
            success: <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={20} />,
            error: <XCircle className="text-rose-500 flex-shrink-0" size={20} />,
            warning: <AlertTriangle className="text-amber-500 flex-shrink-0" size={20} />,
            info: <CheckCircle2 className="text-blue-500 flex-shrink-0" size={20} />
          };

          const bgClasses = {
            success: "bg-white border-emerald-100 shadow-emerald-500/5",
            error: "bg-white border-rose-100 shadow-rose-500/5",
            warning: "bg-white border-amber-100 shadow-amber-500/5",
            info: "bg-white border-blue-100 shadow-blue-500/5"
          };

          return (
            <div
              key={t.id}
              className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg animate-in slide-in-from-bottom-5 duration-300 ${bgClasses[t.type]}`}
            >
              {icons[t.type]}
              <div className="flex-1 text-sm font-semibold text-gray-800 leading-tight pt-0.5">
                {t.message}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-0.5 transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
