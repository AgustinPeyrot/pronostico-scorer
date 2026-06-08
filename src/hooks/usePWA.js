// ── hooks/usePWA.js ───────────────────────────────────────────────────────────
// Hook centralizado para manejo de Service Worker, actualizaciones y estado offline.
//
// Expone:
//   needsUpdate  → boolean: hay una nueva versión disponible
//   isOffline    → boolean: el dispositivo no tiene conexión
//   updateApp()  → función: aplica la actualización y recarga

import { useState, useEffect, useCallback, useRef } from 'react';

export function usePWA() {
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const registrationRef = useRef(null);

  useEffect(() => {
    // ── Detectar cambios de conectividad ──────────────────────────────────────
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    // ── Registrar Service Worker y escuchar actualizaciones ───────────────────
    // vite-plugin-pwa genera el archivo virtual 'virtual:pwa-register'
    // que exporta registerSW. Lo importamos dinámicamente para evitar errores
    // en desarrollo (donde el SW está desactivado).
    if ('serviceWorker' in navigator) {
      import('virtual:pwa-register')
        .then(({ registerSW }) => {
          registerSW({
            // Se llama cuando hay una versión nueva esperando activarse
            onNeedRefresh() {
              setNeedsUpdate(true);
            },
            // Se llama cuando el SW está listo (primera instalación)
            onOfflineReady() {
              // App lista para uso offline — podríamos mostrar un toast si queremos
              console.log('[PWA] Listo para uso offline');
            },
            // Guardamos la función de actualización para llamarla desde la UI
            onRegistered(registration) {
              registrationRef.current = registration;
            },
          });
        })
        .catch(() => {
          // En desarrollo el módulo virtual no existe — ignorar silenciosamente
        });
    }

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // Función que activa la actualización y recarga la página
  const updateApp = useCallback(() => {
    setNeedsUpdate(false);
    // Decirle al SW en espera que tome el control y recargar
    if (registrationRef.current?.waiting) {
      registrationRef.current.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  }, []);

  return { needsUpdate, isOffline, updateApp };
}
