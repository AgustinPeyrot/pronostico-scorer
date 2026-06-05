// ── components/RoundPrediction.jsx ───────────────────────────────────────────
// Paso A: cada jugador ingresa su pronóstico para la ronda actual.
//
// En modo 'obligado':
//   - Se muestra quién reparte y el orden de carga (repartidor al final).
//   - El repartidor tiene un valor prohibido que no puede elegir.
//   - El valor prohibido = cartas_ronda - suma(pronósticos de los demás).
//   - Si el repartidor elige ese valor, el botón "Confirmar" queda bloqueado.

import { useState } from 'react';
import NumberStepper from './NumberStepper';
import Footer from './Footer';
import {
  getDealerForRound,
  getPredictionOrder,
  getForbiddenDealerPrediction,
  isDealerPredictionValid,
} from '../helpers/gameLogic';

export default function RoundPrediction({ game, roundIndex, onConfirm, onHistoryClick, onResetClick }) {
  const { players, rounds, config } = game;
  const cards = rounds[roundIndex];
  const roundNumber = roundIndex + 1;
  const totalRounds = rounds.length;

  // Modalidad: retrocompatibilidad con partidas sin gameMode guardado
  const gameMode = config.gameMode || 'libre';
  const isObligado = gameMode === 'obligado';

  // ── Repartidor de esta ronda ─────────────────────────────────────────────
  const dealer = getDealerForRound(roundIndex, players);

  // En modo obligado el repartidor va al final; en libre, orden normal
  const predictionOrder = getPredictionOrder(players, dealer.id, gameMode);

  // ── Estado: pronósticos de cada jugador ─────────────────────────────────
  const [predictions, setPredictions] = useState(
    Object.fromEntries(players.map((p) => [p.id, 0]))
  );

  const updatePrediction = (playerId, value) =>
    setPredictions((prev) => ({ ...prev, [playerId]: value }));

  // ── Valor prohibido para el repartidor (modo obligado) ───────────────────
  // Se recalcula de forma derivada con cada cambio de predictions.
  // Es la única restricción que impide que la suma de pronósticos = cartas.
  const nonDealerPredictionValues = isObligado
    ? players.filter((p) => p.id !== dealer.id).map((p) => predictions[p.id])
    : [];
  const forbidden = isObligado
    ? getForbiddenDealerPrediction(cards, nonDealerPredictionValues)
    : null;

  // El confirm queda bloqueado si el repartidor eligió el valor prohibido
  const dealerPredictionInvalid =
    isObligado && !isDealerPredictionValid(predictions[dealer.id], forbidden);

  // ── Confirmar pronósticos ────────────────────────────────────────────────
  const handleConfirm = () => {
    if (dealerPredictionInvalid) return;
    const result = players.map((p) => ({
      playerId: p.id,
      prediction: predictions[p.id],
    }));
    onConfirm(result);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="bg-indigo-700 px-4 py-4 shadow-lg">
        <div className="max-w-lg mx-auto">
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

          {/* Quién reparte + info de modalidad */}
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
        </div>
      </header>

      {/* ── Lista de jugadores en orden de pronóstico ────────────────────────── */}
      <main className="flex-1 px-4 py-5 max-w-lg mx-auto w-full">
        <div className="flex flex-col gap-3">
          {predictionOrder.map((player, orderIdx) => {
            const isDealer = player.id === dealer.id;
            // El forbidden solo aplica al repartidor en modo obligado
            const stepperForbidden = isObligado && isDealer ? forbidden : null;
            const currentVal = predictions[player.id];
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
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white font-semibold">{player.name}</p>
                    {/* Badge "Reparte" solo en modo obligado */}
                    {isDealer && isObligado && (
                      <span className="bg-amber-500/30 text-amber-300 text-xs px-2 py-0.5
                                       rounded-full border border-amber-400/50">
                        Reparte · pronostica último
                      </span>
                    )}
                  </div>
                  {/* Número de orden en la ronda */}
                  <span className="text-slate-500 text-xs">#{orderIdx + 1}</span>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <p className="text-slate-400 text-xs">Pronóstico</p>
                  <NumberStepper
                    value={currentVal}
                    onChange={(v) => updatePrediction(player.id, v)}
                    min={0}
                    max={cards}
                    forbiddenValue={stepperForbidden}
                  />
                </div>

                {/* Advertencia si el repartidor está en el valor prohibido */}
                {isDealer && isObligado && isInvalid && forbidden !== null && (
                  <p className="mt-2 text-red-300 text-xs bg-red-500/20 rounded-lg px-3 py-1.5">
                    ⚠️ <strong>{player.name}</strong> no puede pedir{' '}
                    <strong>{forbidden}</strong> porque permitiría que todos acierten.
                    Tiene que elegir otro valor.
                  </p>
                )}

                {/* Info proactiva: muestra el valor prohibido aunque no esté seleccionado */}
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

      {/* ── Botón confirmar ──────────────────────────────────────────────────── */}
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
