// ── components/RoundHistory.jsx ──────────────────────────────────────────────
// Historial de rondas jugadas con opción de editar cada una.
// Usa el término "pedido" y "mano" en lugar de "pronóstico" y "baza".

import { useState } from 'react';
import Footer from './Footer';
import { getDealerForRound } from '../helpers/gameLogic';

export default function RoundHistory({ game, onEditRound, onBack }) {
  const { players, rounds, roundHistory, config } = game;
  const gameMode = config.gameMode || 'libre';
  const isDesafio = gameMode === 'obligado'; // valor interno 'obligado' = modo desafío

  const [expanded, setExpanded] = useState(null);
  const toggle = (idx) => setExpanded((prev) => (prev === idx ? null : idx));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col">

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <header className="bg-slate-800 px-4 py-4 shadow-md border-b border-white/10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-indigo-300 hover:text-white transition-colors text-sm font-medium"
            aria-label="Volver"
          >
            ← Volver
          </button>
          <h2 className="text-white text-xl font-bold">Historial de rondas</h2>
          {/* Badge de modalidad */}
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ml-auto
            ${isDesafio
              ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
              : 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40'}`}>
            {isDesafio ? '⚡ Modo desafío' : '🎯 Modo libre'}
          </span>
        </div>
      </header>

      {/* ── Lista de rondas ───────────────────────────────────────────────────── */}
      <main className="flex-1 px-4 py-5 max-w-lg mx-auto w-full">
        {roundHistory.length === 0 ? (
          <p className="text-slate-500 text-center mt-12">
            Todavía no se jugó ninguna ronda.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {roundHistory.map((round, idx) => {
              const dealer = getDealerForRound(round.roundIndex, players);

              return (
                <div
                  key={idx}
                  className="bg-white/8 border border-white/15 rounded-xl overflow-hidden"
                >
                  {/* Encabezado siempre visible */}
                  <button
                    onClick={() => toggle(idx)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                    aria-expanded={expanded === idx}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-semibold text-sm">
                        Ronda {round.roundIndex + 1}
                      </span>
                      <span className="text-slate-400 text-xs">
                        · {rounds[round.roundIndex]} carta{rounds[round.roundIndex] !== 1 ? 's' : ''}
                      </span>
                      <span className="text-slate-500 text-xs">
                        · Repartió: <span className="text-slate-400">{dealer.name}</span>
                      </span>
                    </div>
                    <span className="text-slate-400 text-xs ml-2 shrink-0">
                      {expanded === idx ? '▲' : '▼'}
                    </span>
                  </button>

                  {/* Detalle expandible */}
                  {expanded === idx && (
                    <div className="px-4 pb-4 border-t border-white/10">
                      {isDesafio && (
                        <p className="mt-3 text-amber-300/80 text-xs">
                          ⚡ Modo desafío · Repartió:{' '}
                          <span className="font-semibold">{dealer.name}</span>
                        </p>
                      )}

                      {/* Tabla de resultados */}
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
                              const isRoundDealer = r.playerId === dealer.id;
                              return (
                                <tr
                                  key={r.playerId}
                                  className={hit ? 'text-emerald-400' : 'text-slate-300'}
                                >
                                  <td className="py-1.5 font-medium">
                                    <span className="truncate max-w-[100px] inline-block align-bottom">
                                      {player?.name}
                                    </span>
                                    {hit && <span className="ml-1 text-xs">✓</span>}
                                    {isRoundDealer && isDesafio && (
                                      <span className="ml-1 text-amber-400/70 text-xs" title="Repartió">🃏</span>
                                    )}
                                  </td>
                                  <td className="text-center py-1.5 tabular-nums">{r.prediction}</td>
                                  <td className="text-center py-1.5 tabular-nums">{r.won}</td>
                                  <td className="text-right py-1.5 tabular-nums font-bold">+{r.points}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Resumen en formato legible: "Agus: pidió 2 / ganó 2 / sumó 7" */}
                      <div className="mt-3 border-t border-white/10 pt-3 flex flex-col gap-1">
                        {round.results.map((r) => {
                          const player = players.find((p) => p.id === r.playerId);
                          const hit = r.won === r.prediction;
                          return (
                            <p
                              key={r.playerId}
                              className={`text-xs ${hit ? 'text-emerald-400/80' : 'text-slate-500'}`}
                            >
                              <span className="font-medium">{player?.name}</span>
                              {': pidió '}<span className="font-bold">{r.prediction}</span>
                              {' / ganó '}<span className="font-bold">{r.won}</span>
                              {' / sumó '}<span className="font-bold">+{r.points}</span>
                              {hit && ' 🎯'}
                            </p>
                          );
                        })}
                      </div>

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
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
