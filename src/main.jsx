// ── main.jsx ──────────────────────────────────────────────────────────────────
// Punto de entrada de la app.
// Registra el Service Worker (PWA) y monta los banners de actualización/offline.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { usePWA } from './hooks/usePWA.js';
import { UpdateBanner, OfflineBanner } from './components/PWABanners.jsx';

// Wrapper que inyecta los banners PWA sin contaminar App.jsx
function Root() {
  const { needsUpdate, isOffline, updateApp } = usePWA();

  return (
    <>
      <OfflineBanner isOffline={isOffline} />
      <App />
      {needsUpdate && <UpdateBanner onUpdate={updateApp} />}
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
