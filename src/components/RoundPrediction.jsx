// ── components/RoundPrediction.jsx ───────────────────────────────────────────
// Paso A: cada jugador carga su pedido para la ronda actual.
//
// Modo libre:    todos pueden pedir entre 0 y cartas_de_la_ronda sin restricción.
// Modo con restricción ('obligado' internamente):
//   - El jugador que reparte pide último.
//   - No puede elegir el valor que haría que la suma total de pedidos
//     sea igual a la cantidad de cartas de la ronda.
//   - Fórmula: sumaDeLosDemás + pedidoUltimoJugador ≠ cartasRonda
//
// La suma total de pedidos NO está limitada (puede ser mayor, menor o igual
// a la cantidad de cartas de la ronda). La única restricción es individual:
//   mínimo 0, máximo cartas_de_la_ronda.

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

  const gameMode = config.gameMode || 'libre';
  const isRestringido = gameMode === 'obligado'; // valor interno 'obligado' = "Modo con restricción"

  // ── Repartidor ─────────────────────────────────────────────────────────────
  const dealer = getDealerForRound(roundIndex, players);
  // En modo con restricción el repartidor pide último; en libre, orden normal
  const predictionOrder = getPredictionOrder(players, dealer.id, gameMode);

  // ── Estado: pedidos ────────────────────────────────────────────────────────
  const [predictions, setPredictions] = useState(
    Object.fromEntries(players.map((p) => [p.id, 0]))
  );

  const updatePrediction = (playerId, value) =>
    setPredictions((prev) => ({ ...prev, [playerId]: value }));

  // ── Valor prohibido para el repartidor (solo modo con restricción) ──────────
  // Recalculado reactivamente. Es el único número que el repartidor no puede pedir.
  const nonDealerPredictionValues = isRestringido
    ? players.filter((p) => p.id !== dealer.id).map((p) => predictions[p.id])
    : [];
  const forbidden = isRestringido
    ? getForbiddenDealerPrediction(cards, nonDealerPredictionValues)
    : null;

  // Suma de pedidos de los demás (para mostrar en el mensaje explicativo)
  const sumOfOthers = nonDealerPredictionValues.reduce((a, b) => a + b, 0);

  const dealerPredictionInvalid =
    isRestringido && !isDealerPredictionValid(predictions[dealer.id], forbidden);

  // ── Confirmar pedidos ──────────────────────────────────────────────────────
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

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <header className="bg-indigo-700 px-4 py-4 shadow-lg">
        <div className="max-w-lg mx-auto">

          {/* Fila superior: ronda + cartas + botones */}
          <div className="flex items-start justify-between gap-3 flex-wrap">
            {/* Info de ronda */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-indigo-200 text-sm font-medium">
                Ronda {roundNumber} / {totalRounds}
              </span>
              <span className="bg-white/20 text-white text-sm font-semibold px-3 py-0.5 rounded-full">
                🃏 {cards} {cards === 1 ? 'carta' : 'cartas'}
              </span>
            </div>

            {/* Botones sólidos */}
            <div className="flex gap-2 shrink-0">
              <button
                id="history-btn"
                onClick={onHistoryClick}
                className="flex items-center gap-1.5 bg-indigo-900 hover:bg-indigo-800
                           active:bg-indigo-950 text-white text-xs font-semibold
                           px-3 py-2 rounded-lg shadow transition-colors"
              >
                📋 Historial
              </button>
              <button
                id="reset-btn"
                onClick={onResetClick}
                className="flex items-center gap-1.5 bg-red-900/70 hover:bg-red-800/80
                           active:bg-red-950 text-red-300 text-xs font-semibold
                           px-3 py-2 rounded-lg shadow transition-colors"
              >
                ↺ Reiniciar
              </button>
            </div>
          </div>

          {/* Título + quién reparte */}
          <div className="mt-2">
            <h2 className="text-white text-xl font-bold">Pedidos</h2>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-indigo-200 text-xs">
                🃏 Reparte: <span className="font-semibold text-white">{dealer.name}</span>
              </span>
              {isRestringido && (
                <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded-full
                                 border border-amber-400/40">
                  Modo con restricción · pide último
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Lista de jugadores ─────────────────────────────────────────────────── */}
      <main className="flex-1 px-4 py-5 max-w-lg mx-auto w-full">
        <div className="flex flex-col gap-3">
          {predictionOrder.map((player, orderIdx) => {
            const isDealer = player.id === dealer.id;
            const currentVal = predictions[player.id];
            const stepperForbidden = isRestringido && isDealer ? forbidden : null;
            const isInvalid = isDealer && isRestringido && !isDealerPredictionValid(currentVal, forbidden);

            return (
              <div
                key={player.id}
                className={`backdrop-blur rounded-xl px-4 py-4 border transition-all
                  ${isDealer && isRestringido
                    ? isInvalid
                      ? 'bg-red-500/10 border-red-400/60'
                      : 'bg-amber-500/10 border-amber-400/50'
                    : 'bg-white/10 border-white/20'}`}
              >
                {/* Nombre + badge + número de orden */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white font-semibold">{player.name}</p>
                    {isDealer && isRestringido && (
                      <span className="bg-amber-500/30 text-amber-300 text-xs px-2 py-0.5
                                       rounded-full border border-amber-400/50">
                        Reparte · pide último
                      </span>
                    )}
                  </div>
                  <span className="text-slate-500 text-xs">#{orderIdx + 1}</span>
                </div>

                {/* Stepper */}
                <div className="flex items-center justify-between mt-2">
                  <p className="text-slate-400 text-xs">
                    {isDealer && isRestringido ? 'Su pedido' : '¿Cuántas manos creés que vas a ganar?'}
                  </p>
                  <NumberStepper
                    value={currentVal}
                    onChange={(v) => updatePrediction(player.id, v)}
                    min={0}
                    max={cards}
                    forbiddenValue={stepperForbidden}
                  />
                </div>

                {/* Advertencia: repartidor está en valor prohibido */}
                {isDealer && isRestringido && isInvalid && forbidden !== null && (
                  <div className="mt-2 bg-red-500/20 rounded-lg px-3 py-2">
                    <p className="text-red-300 text-xs font-medium">
                      ⚠️ En este modo, <strong>{player.name}</strong> no puede pedir{' '}
                      <strong>{forbidden}</strong> porque permitiría que todos cumplan.
                    </p>
                    <p className="text-red-300/70 text-xs mt-1">
                      Pedidos previos: {sumOfOthers} · Cartas de la ronda: {cards} · No permitido: {forbidden}
                    </p>
                  </div>
                )}

                {/* Info proactiva: valor prohibido cuando no está en él todavía */}
                {isDealer && isRestringido && !isInvalid && forbidden !== null && (
                  <p className="mt-2 text-amber-300/70 text-xs">
                    No puede pedir: <strong className="text-amber-300">{forbidden}</strong>
                    <span className="text-amber-300/50 ml-1">
                      (pedidos previos {sumOfOthers} + {forbidden} = {cards} cartas)
                    </span>
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
            El jugador que reparte debe cambiar su pedido antes de confirmar.
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
          Confirmar pedidos →
        </button>
      </footer>

      <Footer />
    </div>
  );
}
