// ── components/PWABanners.jsx ─────────────────────────────────────────────────
// Banners discretos para notificaciones de la PWA:
//   1. UpdateBanner  → nueva versión disponible
//   2. OfflineBanner → sin conexión / conexión restaurada

import { useState, useEffect } from 'react';

// ── Banner de actualización ────────────────────────────────────────────────────
export function UpdateBanner({ onUpdate }) {
  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50
                 flex items-center gap-3
                 bg-indigo-700 border border-indigo-500/60
                 text-white text-sm font-medium
                 px-4 py-3 rounded-xl shadow-2xl
                 animate-in slide-in-from-bottom duration-300"
      role="alert"
      aria-live="polite"
    >
      <span>🔄 Nueva versión disponible</span>
      <button
        onClick={onUpdate}
        className="bg-white text-indigo-700 font-bold text-xs px-3 py-1.5
                   rounded-lg hover:bg-indigo-50 active:bg-indigo-100 transition-colors"
      >
        Actualizar
      </button>
    </div>
  );
}

// ── Banner de estado de conexión ──────────────────────────────────────────────
export function OfflineBanner({ isOffline }) {
  // "Conexión restaurada" desaparece solo después de 3 s
  const [showRestored, setShowRestored] = useState(false);
  const [prevOffline, setPrevOffline] = useState(isOffline);

  useEffect(() => {
    // Detectar transición offline → online
    if (prevOffline && !isOffline) {
      setShowRestored(true);
      const t = setTimeout(() => setShowRestored(false), 3000);
      return () => clearTimeout(t);
    }
    setPrevOffline(isOffline);
  }, [isOffline, prevOffline]);

  if (!isOffline && !showRestored) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50
                  flex items-center justify-center gap-2
                  text-xs font-semibold py-1.5 px-4
                  transition-colors duration-300
                  ${isOffline
                    ? 'bg-amber-600/90 text-white'
                    : 'bg-emerald-600/90 text-white'}`}
      role="status"
      aria-live="polite"
    >
      {isOffline ? (
        <>
          <span className="inline-block w-2 h-2 rounded-full bg-amber-300 shrink-0" />
          Sin conexión — la app sigue funcionando
        </>
      ) : (
        <>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-300 shrink-0" />
          Conexión restaurada
        </>
      )}
    </div>
  );
}
