// ── helpers/gameLogic.js ─────────────────────────────────────────────────────
// Pure functions for game logic. No side effects, easy to unit-test.

/**
 * Genera la secuencia de rondas subiendo de 1 hasta maxCards y luego bajando.
 * Ejemplo maxCards=7 → [1,2,3,4,5,6,7,6,5,4,3,2,1]
 */
export function generateRounds(maxCards) {
  const up = Array.from({ length: maxCards }, (_, i) => i + 1);
  const down = Array.from({ length: maxCards - 1 }, (_, i) => maxCards - 1 - i);
  return [...up, ...down]; // [1,2,...,max,max-1,...,1]
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
