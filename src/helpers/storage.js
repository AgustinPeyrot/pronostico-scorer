// ── helpers/storage.js ───────────────────────────────────────────────────────
// Wrapper simple sobre localStorage para guardar/leer el estado de la partida.

const STORAGE_KEY = 'pronostico_game_state';

/** Guarda el estado completo en localStorage (serializado como JSON). */
export function saveGame(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('No se pudo guardar en localStorage', e);
  }
}

/** Lee el estado guardado. Devuelve null si no hay nada. */
export function loadGame() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('No se pudo leer localStorage', e);
    return null;
  }
}

/** Borra la partida guardada. */
export function clearGame() {
  localStorage.removeItem(STORAGE_KEY);
}
