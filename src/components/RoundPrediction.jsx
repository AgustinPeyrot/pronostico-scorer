// ── components/RoundPrediction.jsx ───────────────────────────────────────────
// Paso A: cada jugador carga su pedido para la ronda actual.
//
// Orden de jugadores:
//   - La lista siempre ROTA a partir del jugador siguiente al repartidor.
//   - El repartidor queda SIEMPRE al final.
//   - Esto aplica en AMBOS modos (libre y desafío).
//   - Ejemplo: [agus, fabri, mozzi, lean], reparte fabri → [mozzi, lean, agus, fabri]
//
// Modo desafío ('obligado' internamente):
//   - Además, el último no puede pedir el valor que cierre la suma igual a las cartas.

import { useState } from 'react';
import NumberStepper from './NumberStepper';
import Footer from './Footer';
import ScoreboardModal from './ScoreboardModal';
import {
  getDealerForRound,
  getPredictionOrder,
  getForbiddenDealerPrediction,
  isDealerPredictionValid,
} from '../helpers/gameLogic';

export default function RoundPrediction({
  game,
  roundIndex,
  onConfirm,
  onHistoryClick,
  onResetClick,
}) {
  const { players, rounds, config, totals } = game;
  const cards = rounds[roundIndex];
  const roundNumber = roundIndex + 1;
  const totalRounds = rounds.length;

  const gameMode = config.gameMode || 'libre';
  const isDesafio = gameMode === 'obligado';

  // ── Repartidor y orden correcto ────────────────────────────────────────────
  // getPredictionOrder aplica la rotación en AMBOS modos:
  // el siguiente al repartidor va primero; el repartidor va último.
  const dealer = getDealerForRound(roundIndex, players);
  const predictionOrder = getPredictionOrder(players, dealer.id);

  // ── Estado: pedidos ────────────────────────────────────────────────────────
  const [predictions, setPredictions] = useState(
    Object.fromEntries(players.map((p) => [p.id, 0]))
  );

  // ── Modal de puntajes ──────────────────────────────────────────────────────
  const [showScoreboard, setShowScoreboard] = useState(false);

  const updatePrediction = (playerId, value) =>
    setPredictions((prev) => ({ ...prev, [playerId]: value }));

  // ── Valor prohibido para el repartidor (solo modo desafío) ──────────────────
  const nonDealerValues = isDesafio
    ? players.filter((p) => p.id !== dealer.id).map((p) => predictions[p.id])
    : [];
  const forbidden = isDesafio ? getForbiddenDealerPrediction(cards, nonDealerValues) : null;
  const sumOfOthers = nonDealerValues.reduce((a, b) => a + b, 0);
  const dealerPredictionInvalid =
    isDesafio && !isDealerPredictionValid(predictions[dealer.id], forbidden);

  // ── Confirmar ──────────────────────────────────────────────────────────────
  const handleConfirm = () => {
    if (dealerPredictionInvalid) return;
    const result = players.map((p) => ({
      playerId: p.id,
      prediction: predictions[p.id],
    }));
    onConfirm(result);
  };

  return (
    <>
      {showScoreboard && (
        <ScoreboardModal
          players={players}
          totals={totals}
          onClose={() => setShowScoreboard(false)}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col">

        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <header className="bg-indigo-700 px-4 py-4 shadow-lg">
          <div className="max-w-lg mx-auto">

            {/* Fila: ronda + cartas | botones */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-indigo-200 text-sm font-medium">
                  Ronda {roundNumber} / {totalRounds}
                </span>
                <span className="bg-white/20 text-white text-sm font-semibold px-3 py-0.5 rounded-full">
                  🃏 {cards} {cards === 1 ? 'carta' : 'cartas'}
                </span>
              </div>

              {/* Botones sólidos */}
              <div className="flex gap-2 shrink-0 flex-wrap">
                <button
                  id="scoreboard-btn"
                  onClick={() => setShowScoreboard(true)}
                  className="flex items-center gap-1 bg-indigo-500 hover:bg-indigo-400
                             active:bg-indigo-600 text-white text-xs font-semibold
                             px-3 py-2 rounded-lg shadow transition-colors"
                >
                  🏆 Puntajes
                </button>
                <button
                  id="history-btn"
                  onClick={onHistoryClick}
                  className="flex items-center gap-1 bg-indigo-900 hover:bg-indigo-800
                             active:bg-indigo-950 text-white text-xs font-semibold
                             px-3 py-2 rounded-lg shadow transition-colors"
                >
                  📋 Historial
                </button>
                <button
                  id="reset-btn"
                  onClick={onResetClick}
                  className="flex items-center gap-1 bg-red-900/70 hover:bg-red-800/80
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
                {isDesafio && (
                  <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5
                                   rounded-full border border-amber-400/40">
                    ⚡ Modo desafío · pide último
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ── Lista de jugadores ───────────────────────────────────────────────── */}
        <main className="flex-1 px-4 py-5 max-w-lg mx-auto w-full">
          <div className="flex flex-col gap-3">
            {predictionOrder.map((player, orderIdx) => {
              const isDealer = player.id === dealer.id;
              const currentVal = predictions[player.id];
              const stepperForbidden = isDesafio && isDealer ? forbidden : null;
              const isInvalid = isDealer && isDesafio && !isDealerPredictionValid(currentVal, forbidden);

              return (
                <div
                  key={player.id}
                  className={`backdrop-blur rounded-xl px-4 py-4 border transition-all
                    ${isDealer && isDesafio
                      ? isInvalid
                        ? 'bg-red-500/10 border-red-400/60'
                        : 'bg-amber-500/10 border-amber-400/50'
                      : 'bg-white/10 border-white/20'}`}
                >
                  {/* Nombre + badge + número de orden */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-semibold">{player.name}</p>
                      {isDealer && isDesafio && (
                        <span className="bg-amber-500/30 text-amber-300 text-xs px-2 py-0.5
                                         rounded-full border border-amber-400/50">
                          Reparte · pide último
                        </span>
                      )}
                    </div>
                    <span className="text-slate-500 text-xs">#{orderIdx + 1}</span>
                  </div>

                  {/* Pregunta + stepper */}
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-slate-400 text-xs">
                      ¿Cuántas manos creés que vas a ganar?
                    </p>
                    <NumberStepper
                      value={currentVal}
                      onChange={(v) => updatePrediction(player.id, v)}
                      min={0}
                      max={cards}
                      forbiddenValue={stepperForbidden}
                    />
                  </div>

                  {/* Error: en valor prohibido */}
                  {isDealer && isDesafio && isInvalid && forbidden !== null && (
                    <div className="mt-2 bg-red-500/20 rounded-lg px-3 py-2">
                      <p className="text-red-300 text-xs font-medium">
                        ⚠️ En modo desafío,{' '}
                        <strong>{player.name}</strong> no puede pedir{' '}
                        <strong>{forbidden}</strong> porque permitiría que todos cumplan.
                      </p>
                      <p className="text-red-300/60 text-xs mt-1">
                        Pedidos previos: {sumOfOthers} · Cartas: {cards} · No permitido: {forbidden}
                      </p>
                    </div>
                  )}

                  {/* Info proactiva: valor prohibido */}
                  {isDealer && isDesafio && !isInvalid && forbidden !== null && (
                    <p className="mt-2 text-amber-300/70 text-xs">
                      No puede pedir:{' '}
                      <strong className="text-amber-300">{forbidden}</strong>
                      <span className="text-amber-300/50 ml-1">
                        ({sumOfOthers} + {forbidden} = {cards} cartas)
                      </span>
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
    </>
  );
}
