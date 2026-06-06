// ── components/Scoreboard.jsx ────────────────────────────────────────────────
// Tabla de posiciones actualizada tras cada ronda.

import { useState } from 'react';
import Footer from './Footer';
import ScoreboardModal from './ScoreboardModal';

export default function Scoreboard({
  players,
  totals,
  onNext,
  currentRoundIndex,
  totalRounds,
  onHistoryClick,
  onResetClick,
}) {
  const ranked = [...players]
    .map((p) => ({ ...p, total: totals[p.id] ?? 0 }))
    .sort((a, b) => b.total - a.total);

  const maxScore = ranked[0]?.total ?? 0;
  const isLastRound = currentRoundIndex >= totalRounds - 1;
  const medals = ['🥇', '🥈', '🥉'];
  const [showScoreboard, setShowScoreboard] = useState(false);

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

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <header className="bg-slate-800 px-4 py-4 shadow-md border-b border-white/10">
        <div className="max-w-lg mx-auto">

          {/* Fila superior: ronda + botones */}
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <span className="text-slate-400 text-sm font-medium pt-1">
              Ronda {currentRoundIndex + 1} / {totalRounds} completada
            </span>

            {/* Botones sólidos */}
            <div className="flex gap-2 shrink-0 flex-wrap">
              <button
                id="scoreboard-btn"
                onClick={() => setShowScoreboard(true)}
                className="flex items-center gap-1 bg-slate-600 hover:bg-slate-500
                           active:bg-slate-700 text-white text-xs font-semibold
                           px-3 py-2 rounded-lg shadow transition-colors"
              >
                🏆 Puntajes
              </button>
              <button
                id="history-btn"
                onClick={onHistoryClick}
                className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600
                           active:bg-slate-800 text-white text-xs font-semibold
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

          <h2 className="text-white text-xl font-bold mt-2">Tabla de posiciones</h2>
        </div>
      </header>

      {/* ── Ranking ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 px-4 py-5 max-w-lg mx-auto w-full">
        <div className="flex flex-col gap-3">
          {ranked.map((player, idx) => {
            const barWidth = maxScore > 0 ? Math.round((player.total / maxScore) * 100) : 0;
            return (
              <div
                key={player.id}
                className={`rounded-xl px-4 py-3 border transition-all
                  ${idx === 0
                    ? 'bg-amber-500/20 border-amber-400/60 shadow-lg'
                    : 'bg-white/8 border-white/15'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 text-center">
                    {idx < 3
                      ? <span className="text-xl">{medals[idx]}</span>
                      : <span className="text-slate-500 font-bold">{idx + 1}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${idx === 0 ? 'text-amber-300' : 'text-white'}`}>
                      {player.name}
                    </p>
                    <div className="mt-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500
                          ${idx === 0 ? 'bg-amber-400' : 'bg-indigo-500'}`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-extrabold tabular-nums
                      ${idx === 0 ? 'text-amber-300' : 'text-white'}`}>
                      {player.total}
                    </p>
                    <p className="text-slate-500 text-xs">pts</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ── Botón siguiente ────────────────────────────────────────────────────── */}
      <footer className="px-4 pt-2 max-w-lg mx-auto w-full">
        <button
          id="next-round-btn"
          onClick={onNext}
          className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 active:bg-indigo-600
                     text-white font-bold text-lg rounded-xl shadow-lg transition-colors"
        >
          {isLastRound ? 'Ver resultado final 🏆' : 'Siguiente ronda →'}
        </button>
      </footer>

      <Footer />
    </div>
    </>
  );
}
