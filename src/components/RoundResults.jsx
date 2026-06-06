// ── components/RoundResults.jsx ──────────────────────────────────────────────
// Paso B: se carga cuántas manos ganó cada jugador.
//
// Orden de jugadores:
//   - Mismo orden que en pedidos: rota desde el siguiente al repartidor,
//     repartidor al final. Garantiza consistencia visual entre ambas pantallas.
//
// Reglas de validación:
//   - Mínimo 0, máximo cartas de la ronda, por jugador.
//   - La suma total de manos ganadas debe ser exactamente igual a las cartas.
//   - El botón "+" se bloquea cuando ya no hay más manos disponibles.
//   - El botón confirmar se habilita solo cuando la suma es exactamente correcta.

import { useState } from 'react';
import NumberStepper from './NumberStepper';
import Footer from './Footer';
import ScoreboardModal from './ScoreboardModal';
import { calcPlayerRoundScore, getDealerForRound, getPredictionOrder } from '../helpers/gameLogic';
import { sumValues } from '../helpers/inputUtils';

export default function RoundResults({
  game,
  roundIndex,
  predictions,
  onClose,
  isEditing = false,
  onHistoryClick,
  onResetClick,
}) {
  const { players, rounds, config, totals } = game;
  const cards = rounds[roundIndex];
  const roundNumber = roundIndex + 1;
  const totalRounds = rounds.length;
  const bonus = config?.bonus ?? 5;

  // ── Orden de jugadores: mismo que en pedidos ───────────────────────────────
  const dealer = getDealerForRound(roundIndex, players);
  const playerOrder = getPredictionOrder(players, dealer.id);

  // ── Estado: manos ganadas ──────────────────────────────────────────────────
  const [won, setWon] = useState(() =>
    Object.fromEntries(players.map((p) => {
      // En modo edición, pre-llenar con valores existentes
      const existing = predictions.find((pr) => pr.playerId === p.id);
      return [p.id, existing?.won ?? 0];
    }))
  );
  const [error, setError] = useState('');

  // ── Modal de puntajes ──────────────────────────────────────────────────────
  const [showScoreboard, setShowScoreboard] = useState(false);

  const updateWon = (playerId, value) =>
    setWon((prev) => ({ ...prev, [playerId]: value }));

  // ── Derivados ─────────────────────────────────────────────────────────────
  const totalWon = sumValues(won);
  const remaining = cards - totalWon;

  // Max efectivo por jugador: bloquea "+" cuando no quedan manos disponibles
  const getPlayerMax = (playerId) => {
    const currentVal = won[playerId] ?? 0;
    return Math.min(cards, currentVal + Math.max(0, remaining));
  };

  // ── Confirmar ──────────────────────────────────────────────────────────────
  const handleClose = () => {
    if (totalWon !== cards) {
      setError(
        `La suma de manos ganadas debe ser exactamente ${cards}. ` +
        `Ahora suma ${totalWon} ` +
        `(${remaining > 0 ? `faltan ${remaining}` : `sobran ${Math.abs(remaining)}`}).`
      );
      return;
    }
    setError('');
    const results = players.map((p) => {
      const pred = predictions.find((pr) => pr.playerId === p.id);
      const prediction = pred?.prediction ?? 0;
      const wonValue = won[p.id] ?? 0;
      return {
        playerId: p.id,
        prediction,
        won: wonValue,
        points: calcPlayerRoundScore(prediction, wonValue, bonus),
      };
    });
    onClose(results);
  };

  // ── Colores del indicador de progreso ─────────────────────────────────────
  const remainingColor =
    remaining === 0 ? 'text-emerald-400' :
    remaining > 0   ? 'text-amber-400'   : 'text-red-400';

  const barColor =
    remaining === 0 ? 'bg-emerald-400' :
    remaining < 0   ? 'bg-red-400'     : 'bg-white/60';

  return (
    <>
      {showScoreboard && (
        <ScoreboardModal
          players={players}
          totals={totals}
          onClose={() => setShowScoreboard(false)}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-violet-950 flex flex-col">

        {/* ── Header ────────────────────────────────────────────────────────────── */}
        <header className="bg-violet-700 px-4 py-4 shadow-lg">
          <div className="max-w-lg mx-auto">

            {/* Fila: ronda + cartas | botones */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-violet-200 text-sm font-medium">
                  {isEditing
                    ? `Editando ronda ${roundNumber}`
                    : `Ronda ${roundNumber} / ${totalRounds}`}
                </span>
                <span className="bg-white/20 text-white text-sm font-semibold px-3 py-0.5 rounded-full">
                  🃏 {cards} {cards === 1 ? 'carta' : 'cartas'}
                </span>
              </div>

              {!isEditing && (
                <div className="flex gap-2 shrink-0 flex-wrap">
                  <button
                    id="scoreboard-btn"
                    onClick={() => setShowScoreboard(true)}
                    className="flex items-center gap-1 bg-violet-500 hover:bg-violet-400
                               active:bg-violet-600 text-white text-xs font-semibold
                               px-3 py-2 rounded-lg shadow transition-colors"
                  >
                    🏆 Puntajes
                  </button>
                  <button
                    id="history-btn"
                    onClick={onHistoryClick}
                    className="flex items-center gap-1 bg-violet-900 hover:bg-violet-800
                               active:bg-violet-950 text-white text-xs font-semibold
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
              )}
            </div>

            {/* Título + progreso */}
            <div className="mt-2">
              <h2 className="text-white text-xl font-bold">Resultados</h2>
              <p className={`text-sm font-medium mt-0.5 ${remainingColor}`}>
                {remaining === 0
                  ? '✓ Suma correcta — listo para confirmar'
                  : remaining > 0
                  ? `Faltan ${remaining} mano${remaining !== 1 ? 's' : ''} por asignar`
                  : `Te pasaste por ${Math.abs(remaining)} mano${Math.abs(remaining) !== 1 ? 's' : ''}`}
              </p>
            </div>

            {/* Barra de progreso */}
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                  style={{ width: `${cards > 0 ? Math.min(100, (totalWon / cards) * 100) : 0}%` }}
                />
              </div>
              <span className={`text-xs font-medium whitespace-nowrap ${remainingColor}`}>
                {totalWon}/{cards} manos
              </span>
            </div>
          </div>
        </header>

        {/* ── Lista de jugadores ─────────────────────────────────────────────────── */}
        <main className="flex-1 px-4 py-5 max-w-lg mx-auto w-full">

          {/* Banner confirmación */}
          {remaining === 0 && (
            <div className="mb-3 bg-emerald-500/15 border border-emerald-400/40 rounded-xl px-4 py-2.5
                            flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              <p className="text-emerald-200 text-sm">
                Las {cards} mano{cards !== 1 ? 's' : ''} de la ronda están asignadas.
                Podés confirmar o ajustar bajando algún valor.
              </p>
            </div>
          )}

          {/* Jugadores en el mismo orden que los pedidos */}
          <div className="flex flex-col gap-3">
            {playerOrder.map((player) => {
              const pred = predictions.find((pr) => pr.playerId === player.id);
              const prediction = pred?.prediction ?? 0;
              const wonValue = won[player.id] ?? 0;
              const hit = wonValue === prediction;
              const pts = calcPlayerRoundScore(prediction, wonValue, bonus);
              const playerMax = getPlayerMax(player.id);

              return (
                <div
                  key={player.id}
                  className={`bg-white/10 backdrop-blur rounded-xl px-4 py-4 border transition-colors
                    ${hit ? 'border-emerald-400/60' : 'border-white/20'}`}
                >
                  {/* Nombre + puntos en tiempo real */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-white font-semibold">{player.name}</p>
                      <p className="text-slate-400 text-xs">
                        Pidió: <span className="text-indigo-300 font-bold">{prediction}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${hit ? 'text-emerald-400' : 'text-slate-300'}`}>
                        +{pts} pts
                      </p>
                      {hit && (
                        <p className="text-emerald-400 text-xs">+{bonus} bonus ✓</p>
                      )}
                    </div>
                  </div>

                  {/* Stepper de manos ganadas */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Manos ganadas:</span>
                    <NumberStepper
                      value={wonValue}
                      onChange={(v) => updateWon(player.id, v)}
                      min={0}
                      max={playerMax}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {error && (
            <p className="mt-4 text-red-300 text-sm bg-red-500/20 rounded-lg px-3 py-2">{error}</p>
          )}
        </main>

        {/* ── Botón confirmar ────────────────────────────────────────────────────── */}
        <footer className="px-4 pt-2 max-w-lg mx-auto w-full">
          <button
            id="close-round-btn"
            onClick={handleClose}
            disabled={totalWon !== cards}
            className="w-full py-4 bg-violet-500 hover:bg-violet-400 active:bg-violet-600
                       text-white font-bold text-lg rounded-xl shadow-lg transition-colors
                       disabled:opacity-40"
          >
            {isEditing ? 'Guardar cambios ✓' : 'Cerrar ronda y sumar puntos →'}
          </button>
        </footer>

        <Footer />
      </div>
    </>
  );
}
