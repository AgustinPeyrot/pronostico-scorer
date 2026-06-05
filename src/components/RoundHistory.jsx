// ── components/RoundHistory.jsx ──────────────────────────────────────────────
// Muestra el historial de rondas jugadas con opción de editar cada una.

import { useState } from 'react';

export default function RoundHistory({ game, onEditRound, onBack }) {
  const { players, rounds, roundHistory, config } = game;
  const [expanded, setExpanded] = useState(null); // índice de ronda expandida

  const toggle = (idx) => setExpanded((prev) => (prev === idx ? null : idx));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col">
      <header className="bg-slate-800 px-4 py-4 shadow-md border-b border-white/10">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-indigo-300 hover:text-white transition-colors text-sm"
            aria-label="Volver"
          >
            ← Volver
          </button>
          <h2 className="text-white text-xl font-bold">Historial</h2>
        </div>
      </header>

      <main className="flex-1 px-4 py-5 max-w-md mx-auto w-full">
        {roundHistory.length === 0 ? (
          <p className="text-slate-500 text-center mt-12">
            Todavía no se jugó ninguna ronda.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {roundHistory.map((round, idx) => (
              <div
                key={idx}
                className="bg-white/8 border border-white/15 rounded-xl overflow-hidden"
              >
                {/* Encabezado de la ronda (siempre visible) */}
                <button
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                  aria-expanded={expanded === idx}
                >
                  <div>
                    <span className="text-white font-semibold text-sm">
                      Ronda {round.roundIndex + 1}
                    </span>
                    <span className="ml-2 text-slate-400 text-xs">
                      · {rounds[round.roundIndex]} carta{rounds[round.roundIndex] !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <span className="text-slate-400 text-xs">
                    {expanded === idx ? '▲' : '▼'}
                  </span>
                </button>

                {/* Detalle expandible */}
                {expanded === idx && (
                  <div className="px-4 pb-4 border-t border-white/10">
                    {/* Tabla compacta de resultados */}
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-slate-500 text-xs uppercase">
                            <th className="text-left py-1 font-medium">Jugador</th>
                            <th className="text-center py-1 font-medium">Pidió</th>
                            <th className="text-center py-1 font-medium">Ganó</th>
                            <th className="text-right py-1 font-medium">Pts</th>
                          </tr>
                        </thead>
                        <tbody>
                          {round.results.map((r) => {
                            const player = players.find((p) => p.id === r.playerId);
                            const hit = r.won === r.prediction;
                            return (
                              <tr key={r.playerId} className={hit ? 'text-emerald-400' : 'text-slate-300'}>
                                <td className="py-1 font-medium truncate max-w-[100px]">
                                  {player?.name}
                                  {hit && <span className="ml-1 text-xs">✓</span>}
                                </td>
                                <td className="text-center py-1 tabular-nums">{r.prediction}</td>
                                <td className="text-center py-1 tabular-nums">{r.won}</td>
                                <td className="text-right py-1 tabular-nums font-bold">+{r.points}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Botón editar */}
                    <button
                      id={`edit-round-${idx}-btn`}
                      onClick={() => onEditRound(idx)}
                      className="mt-4 w-full py-2 rounded-lg border border-indigo-500/60
                                 text-indigo-300 text-sm hover:bg-indigo-500/20 transition-colors"
                    >
                      ✎ Editar esta ronda
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
