// ── helpers/inputUtils.js ─────────────────────────────────────────────────────
// Helpers puros para sanitización y validación de inputs numéricos.

/**
 * Limita un número entre min y max (inclusive).
 * clampNumber(10, 1, 5) → 5
 * clampNumber(-2, 0, 4) → 0
 */
export function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Sanitiza un valor de input de texto a un entero válido.
 * - Elimina todo lo que no sea dígito (letras, signos, decimales).
 * - Elimina ceros a la izquierda ("0654" → 654).
 * - Si queda vacío, devuelve `fallback`.
 * - Aplica clamp entre min y max.
 *
 * @param {string|number} rawValue  Valor crudo del input
 * @param {number} min              Valor mínimo permitido
 * @param {number} max              Valor máximo permitido
 * @param {number} fallback         Valor de retorno si el input está vacío/inválido
 */
export function sanitizeIntegerInput(rawValue, min, max, fallback = 0) {
  const cleaned = String(rawValue ?? '').replace(/[^0-9]/g, '');
  if (cleaned === '') return fallback;
  const num = parseInt(cleaned, 10);
  if (isNaN(num)) return fallback;
  return clampNumber(num, min, max);
}

/**
 * Suma todos los valores de un objeto { [key]: number }.
 * sumValues({ a: 2, b: 3, c: 0 }) → 5
 */
export function sumValues(valuesObj) {
  return Object.values(valuesObj).reduce((a, b) => a + (b || 0), 0);
}

/**
 * Devuelve la cantidad de bazas disponibles para un jugador específico,
 * restando del total de cartas la suma de los DEMÁS jugadores.
 *
 * Ejemplo: 5 cartas, otros jugadores tienen [1, 2] → disponible = 5 - 3 = 2
 *
 * @param {number} cardsInRound       Total de cartas de la ronda
 * @param {{ [playerId]: number }} valuesObj  Valores actuales de todos los jugadores
 * @param {string} currentPlayerId    ID del jugador actual (se excluye del cálculo)
 * @returns {number} Bazas disponibles para ese jugador (nunca negativo)
 */
export function getRemainingForPlayer(cardsInRound, valuesObj, currentPlayerId) {
  const othersSum = Object.entries(valuesObj)
    .filter(([id]) => id !== currentPlayerId)
    .reduce((sum, [, val]) => sum + (val || 0), 0);
  return Math.max(0, cardsInRound - othersSum);
}
