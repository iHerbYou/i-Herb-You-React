import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface ToastOptions {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  durationMs?: number;
  position?: 'top' | 'bottom';
}

interface ToastContextValue {
  showToast: (opts: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [opts, setOpts] = useState<ToastOptions | null>(null);
  const [timer, setTimer] = useState<number | null>(null);

  const hide = useCallback(() => {
    setVisible(false);
  }, []);

  const showToast = useCallback((next: ToastOptions) => {
    if (timer) window.clearTimeout(timer);
    setOpts(next);
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), next.durationMs ?? 2500);
    setTimer(t);
  }, [timer]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast UI */}
      <div
        aria-live="polite"
        className={`fixed inset-x-0 ${opts?.position === 'top' ? 'top-6' : 'bottom-6'} flex justify-center px-4 pointer-events-none transition-opacity ${visible ? 'opacity-100' : 'opacity-0'}`}
      >
        {opts && (
          <div className="pointer-events-auto max-w-md w-full bg-brand-gray-900 text-white rounded-lg shadow-lg border border-brand-gray-800">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <p className="text-sm">{opts.message}</p>
              <div className="flex items-center gap-2">
                {opts.actionLabel && (
                  <button
                    onClick={() => { hide(); opts.onAction?.(); }}
                    className="text-sm font-semibold text-brand-pink hover:text-white/90"
                  >
                    {opts.actionLabel}
                  </button>
                )}
                <button onClick={hide} aria-label="닫기" className="text-white/70 hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
};