import { createContext, useCallback, useContext, useRef, useState } from "react";
import Icon from "../../components/Icon.jsx";

/**
 * Lightweight toast system for admin feedback. No dependency; a single stack
 * of transient messages rendered top-right (bottom on mobile).
 */
const ToastContext = createContext(null);

const TONES = {
  success: { icon: "checkCircle", ring: "border-wa-600/30", dot: "text-wa-600" },
  error: { icon: "alert", ring: "border-red-500/30", dot: "text-red-600" },
  info: { icon: "info", ring: "border-accent-500/30", dot: "text-accent-600" },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, tone = "info", ms = 3800) => {
      const id = ++idRef.current;
      setToasts((list) => [...list, { id, message, tone }]);
      if (ms > 0) setTimeout(() => dismiss(id), ms);
      return id;
    },
    [dismiss]
  );

  const toast = {
    success: (m, ms) => push(m, "success", ms),
    error: (m, ms) => push(m, "error", ms),
    info: (m, ms) => push(m, "info", ms),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[80] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:top-0 sm:bottom-auto sm:items-end">
        {toasts.map((t) => {
          const tone = TONES[t.tone] || TONES.info;
          return (
            <div
              key={t.id}
              role="status"
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-[var(--radius-md)] border ${tone.ring} bg-white px-4 py-3 shadow-[var(--shadow-lift)]`}
            >
              <span className={`mt-0.5 shrink-0 ${tone.dot}`}>
                <Icon name={tone.icon} size={18} />
              </span>
              <p className="flex-1 text-[0.875rem] leading-snug text-ink-800">{t.message}</p>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
                className="shrink-0 text-ink-400 transition-colors hover:text-ink-700"
              >
                <Icon name="x" size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
