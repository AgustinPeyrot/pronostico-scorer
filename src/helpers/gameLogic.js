// ── helpers/gameLogic.js ─────────────────────────────────────────────────────
// Pure functions for game logic. No side effects, easy to unit-test.

/**
 * Genera la secuencia de rondas subiendo de 1 hasta maxCards y luego bajando.
 * Ejemplo maxCards=7 → [1,2,3,4,5,6,7,6,5,4,3,2,1]
 */
export function generateRounds(maxCards) {
  const up = Array.from({ length: maxCards }, (_, i) => i + 1);
  const down = Array.from({ length: maxCards - 1 }, (_, i) => maxCards - 1 - i);
  return [...up, ...down];
}

/**
 * Calcula los puntos de una ronda para un jugador.
 * puntosBase = bazasGanadas
 * bonus      = bonusPoints si acertó exactamente, 0 si no
 */
export function calcPlayerRoundScore(prediction, won, bonusPoints = 5) {
  const base = won;
  const bonus = won === prediction ? bonusPoints : 0;
  return base + bonus;
}

/**
 * Recalcula los puntajes totales de todos los jugadores
 * recorriendo todo el historial de rondas cerradas.
 * Devuelve un objeto { [playerId]: totalPoints }
 */
export function recalcTotals(players, roundHistory, bonusPoints = 5) {
  const totals = {};
  players.forEach((p) => {
    totals[p.id] = 0;
  });

  roundHistory.forEach((round) => {
    round.results.forEach(({ playerId, prediction, won }) => {
      totals[playerId] =
        (totals[playerId] || 0) + calcPlayerRoundScore(prediction, won, bonusPoints);
    });
  });

  return totals;
}

// ── Helpers de modalidad de juego ─────────────────────────────────────────────

/**
 * Devuelve el jugador que reparte en la ronda indicada.
 * La rotación es circular según el orden original de jugadores.
 * Ronda 0 → jugador 0, Ronda 1 → jugador 1, etc.
 */
export function getDealerForRound(roundIndex, players) {
  return players[roundIndex % players.length];
}

/**
 * Devuelve el orden en que los jugadores deben cargar sus pronósticos.
 * En modo 'obligado': el repartidor va al final.
 * En modo 'libre': orden normal.
 */
export function getPredictionOrder(players, dealerPlayerId, gameMode) {
  if (gameMode !== 'obligado') return players;
  const others = players.filter((p) => p.id !== dealerPlayerId);
  const dealer = players.find((p) => p.id === dealerPlayerId);
  // Si por algún motivo no se encuentra, devuelve el orden original
  return dealer ? [...others, dealer] : players;
}

/**
 * Calcula el valor prohibido para el pronóstico del repartidor en modo obligado.
 *
 * valorProhibido = cantidadCartas - suma(pronosticosDeLosDemás)
 *
 * Solo se prohíbe si el valor resultante está en el rango válido [0, cantidadCartas].
 * Si está fuera del rango, devuelve null (sin restricción).
 *
 * Ejemplo: 4 cartas, otros pidieron [1, 2, 0] → suma = 3 → prohibido = 1
 */
export function getForbiddenDealerPrediction(cardsInRound, otherPredictionValues) {
  const sum = otherPredictionValues.reduce((a, b) => a + b, 0);
  const forbidden = cardsInRound - sum;
  // Solo es restricción real si es un valor que el repartidor podría elegir
  if (forbidden >= 0 && forbidden <= cardsInRound) return forbidden;
  return null;
}

/**
 * Verifica si el pronóstico del repartidor es válido.
 * Devuelve false si la predicción coincide con el valor prohibido.
 */
export function isDealerPredictionValid(dealerPrediction, forbidden) {
  if (forbidden === null) return true;
  return dealerPrediction !== forbidden;
}
