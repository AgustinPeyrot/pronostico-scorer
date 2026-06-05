// ── components/RoundPrediction.jsx ───────────────────────────────────────────
// Paso A: cada jugador ingresa su pronóstico para la ronda actual.
//
// Nuevas funcionalidades:
//   - limitPredictionSum: bloquea el "+" cuando la suma global alcanza las cartas.
//     El max efectivo de cada stepper = currentVal + remaining (cartas sin asignar).
//   - Modo obligado: sigue funcionando de forma independiente.
//     El valor prohibido del repartidor se computa sobre la suma de los demás.
//   - Cuando ambas restricciones coexisten, el stepper respeta ambas.

import { useState } from 'react';
import NumberStepper from './NumberStepper';
import Footer from './Footer';
import {
  getDealerForRound,
  getPredictionOrder,
  getForbiddenDealerPrediction,
  isDealerPredictionValid,
} from '../helpers/gameLogic';
import { sumValues } from '../helpers/inputUtils';

export default function RoundPrediction({ game, roundIndex, onConfirm, onHistoryClick, onResetClick }) {
  const { players, rounds, config } = game;
  const cards = rounds[roundIndex];
  const roundNumber = roundIndex + 1;
  const totalRounds = rounds.length;

  // Retrocompatibilidad: si no hay config guardada, usar defaults seguros
  const gameMode = config.gameMode || 'libre';
  const isObligado = gameMode === 'obligado';
  const limitPredictionSum = config.limitPredictionSum !== false; // default true

  // ── Repartidor ─────────────────────────────────────────────────────────────
  const dealer = getDealerForRound(roundIndex, players);
  const predictionOrder = getPredictionOrder(players, dealer.id, gameMode);

  // ── Estado: pronósticos ────────────────────────────────────────────────────
  const [predictions, setPredictions] = useState(
    Object.fromEntries(players.map((p) => [p.id, 0]))
  );

  const updatePrediction = (playerId, value) =>
    setPredictions((prev) => ({ ...prev, [playerId]: value }));

  // ── Derivados: suma total y cartas restantes ────────────────────────────────
  const totalPredictions = sumValues(predictions);
  // Cuántas cartas quedan sin asignar (puede ser negativo si hay bug, pero nunca debería)
  const globalRemaining = cards - totalPredictions;

  // ── Valor prohibido para el repartidor (modo obligado) ─────────────────────
  // Se recalcula reactivamente con cada cambio en predictions.
  const nonDealerPredictionValues = isObligado
    ? players.filter((p) => p.id !== dealer.id).map((p) => predictions[p.id])
    : [];
  const forbidden = isObligado
    ? getForbiddenDealerPrediction(cards, nonDealerPredictionValues)
    : null;

  const dealerPredictionInvalid =
    isObligado && !isDealerPredictionValid(predictions[dealer.id], forbidden);

  // ── Calcular el max efectivo para cada jugador ─────────────────────────────
  // Si limitPredictionSum está activo, el max es: currentVal + globalRemaining
  // Así el stepper bloquea el "+" cuando ya no hay cartas disponibles globalmente.
  // Si está desactivo, el max siempre es el total de cartas de la ronda.
  const getPlayerMax = (playerId) => {
    if (!limitPredictionSum) return cards;
    const currentVal = predictions[playerId];
    // El jugador puede crecer hasta su valor actual + lo que queda global
    return Math.min(cards, currentVal + Math.max(0, globalRemaining));
  };

  // ── Confirmar ──────────────────────────────────────────────────────────────
  const handleConfirm = () => {
    if (dealerPredictionInvalid) return;
    const result = players.map((p) => ({
      playerId: p.id,
      prediction: predictions[p.id],
    }));
    onConfirm(result);
  };

  // ── Mensaje de ayuda global ────────────────────────────────────────────────
  const showLimitReached = limitPredictionSum && globalRemaining <= 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col">

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <header className="bg-indigo-700 px-4 py-4 shadow-lg">
        <div className="max-w-lg mx-auto">

          {/* Fila: info de ronda + botones */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-indigo-200 text-sm font-medium">
                Ronda {roundNumber} / {totalRounds}
              </span>
              <span className="bg-white/20 text-white text-sm font-semibold px-3 py-1 rounded-full">
                🃏 {cards} {cards === 1 ? 'carta' : 'cartas'}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                id="history-btn"
                onClick={onHistoryClick}
                className="bg-white/15 text-white text-xs px-3 py-1.5 rounded-full
                           border border-white/30 hover:bg-white/25 active:bg-white/10
                           transition-colors font-medium"
              >
                📋 Historial
              </button>
              <button
                id="reset-btn"
                onClick={onResetClick}
                className="bg-red-500/20 text-red-300 text-xs px-3 py-1.5 rounded-full
                           border border-red-400/40 hover:bg-red-500/30 active:bg-red-500/10
                           transition-colors font-medium"
              >
                ↺ Reiniciar
              </button>
            </div>
          </div>

          <h2 className="text-white text-xl font-bold mt-2">Pronósticos</h2>

          {/* Reparte + modalidad */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-indigo-200 text-xs">
              🃏 Reparte: <span className="font-semibold text-white">{dealer.name}</span>
            </span>
            {isObligado && (
              <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded-full
                               border border-amber-400/40">
                Modo obligado · pronostica último
              </span>
            )}
          </div>

          {/* Contador de cartas asignadas (solo si limitPredictionSum está activo) */}
          {limitPredictionSum && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300
                    ${globalRemaining <= 0 ? 'bg-emerald-400' : 'bg-white/60'}`}
                  style={{ width: `${Math.min(100, (totalPredictions / cards) * 100)}%` }}
                />
              </div>
              <span className={`text-xs font-medium whitespace-nowrap
                ${globalRemaining <= 0 ? 'text-emerald-300' : 'text-indigo-200'}`}>
                {totalPredictions}/{cards} asignadas
              </span>
            </div>
          )}
        </div>
      </header>

      {/* ── Lista de jugadores ─────────────────────────────────────────────────── */}
      <main className="flex-1 px-4 py-5 max-w-lg mx-auto w-full">

        {/* Aviso global cuando se alcanzó el límite */}
        {showLimitReached && (
          <div className="mb-3 bg-indigo-500/15 border border-indigo-400/40 rounded-xl px-4 py-2.5
                          flex items-start gap-2">
            <span className="text-indigo-300 text-sm mt-0.5">ℹ️</span>
            <p className="text-indigo-200 text-sm">
              Ya se asignaron todas las cartas disponibles para esta ronda.
              Para cambiar un valor, primero bajá el de otro jugador.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {predictionOrder.map((player, orderIdx) => {
            const isDealer = player.id === dealer.id;
            const currentVal = predictions[player.id];
            const playerMax = getPlayerMax(player.id);
            const stepperForbidden = isObligado && isDealer ? forbidden : null;
            const isInvalid = isDealer && isObligado && !isDealerPredictionValid(currentVal, forbidden);

            return (
              <div
                key={player.id}
                className={`backdrop-blur rounded-xl px-4 py-4 border transition-all
                  ${isDealer && isObligado
                    ? isInvalid
                      ? 'bg-red-500/10 border-red-400/60'
                      : 'bg-amber-500/10 border-amber-400/50'
                    : 'bg-white/10 border-white/20'}`}
              >
                {/* Nombre + badges */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white font-semibold">{player.name}</p>
                    {isDealer && isObligado && (
                      <span className="bg-amber-500/30 text-amber-300 text-xs px-2 py-0.5
                                       rounded-full border border-amber-400/50">
                        Reparte · pronostica último
                      </span>
                    )}
                  </div>
                  <span className="text-slate-500 text-xs">#{orderIdx + 1}</span>
                </div>

                {/* Stepper */}
                <div className="flex items-center justify-between mt-2">
                  <p className="text-slate-400 text-xs">Pronóstico</p>
                  <NumberStepper
                    value={currentVal}
                    onChange={(v) => updatePrediction(player.id, v)}
                    min={0}
                    max={playerMax}
                    forbiddenValue={stepperForbidden}
                  />
                </div>

                {/* Advertencia: repartidor en valor prohibido */}
                {isDealer && isObligado && isInvalid && forbidden !== null && (
                  <p className="mt-2 text-red-300 text-xs bg-red-500/20 rounded-lg px-3 py-1.5">
                    ⚠️ <strong>{player.name}</strong> no puede pedir{' '}
                    <strong>{forbidden}</strong> porque permitiría que todos acierten.
                    Tiene que elegir otro valor.
                  </p>
                )}

                {/* Info proactiva: valor prohibido (cuando no está en él) */}
                {isDealer && isObligado && !isInvalid && forbidden !== null && (
                  <p className="mt-2 text-amber-300/70 text-xs">
                    No puede pedir: <strong className="text-amber-300">{forbidden}</strong>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* ── Botón confirmar ────────────────────────────────────────────────────── */}
      <footer className="px-4 pt-2 max-w-lg mx-auto w-full">
        {dealerPredictionInvalid && (
          <p className="text-red-300 text-xs text-center mb-2">
            El repartidor debe cambiar su pronóstico antes de confirmar.
          </p>
        )}
        <button
          id="confirm-predictions-btn"
          onClick={handleConfirm}
          disabled={dealerPredictionInvalid}
          className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 active:bg-indigo-600
                     text-white font-bold text-lg rounded-xl shadow-lg transition-colors
                     disabled:opacity-40"
        >
          Confirmar pronósticos →
        </button>
      </footer>

      <Footer />
    </div>
  );
}
