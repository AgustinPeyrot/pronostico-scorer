// ── components/ScoreboardModal.jsx ──────────────────────────────────────────
// Modal de tabla general de puntajes, accessible desde el header durante el juego.
// Se abre con el botón "Puntajes" y se cierra con "Cerrar" o tocando el fondo.

export default function ScoreboardModal({ players, totals, onClose }) {
  // Ordenar de mayor a menor puntaje
  const ranked = [...players]
    .map((p) => ({ ...p, total: totals[p.id] ?? 0 }))
    .sort((a, b) => b.total - a.total);

  const maxScore = ranked[0]?.total ?? 0;
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.70)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-slate-900 border border-white/20 rounded-2xl
                   shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado del modal */}
        <div className="bg-gradient-to-r from-indigo-700 to-violet-700 px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">Tabla general</h2>
            <p className="text-indigo-200 text-xs mt-0.5">Puntajes acumulados hasta ahora</p>
          </div>
          <button
            id="close-scoreboard-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white
                       flex items-center justify-center text-sm transition-colors"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Lista de jugadores */}
        <div className="p-4 flex flex-col gap-2">
          {ranked.map((player, idx) => {
            const barWidth = maxScore > 0 ? Math.round((player.total / maxScore) * 100) : 0;
            const isLeader = idx === 0;

            return (
              <div
                key={player.id}
                className={`flex items-center gap-3 rounded-xl px-3 py-3
                  ${isLeader
                    ? 'bg-amber-500/15 border border-amber-400/40'
                    : 'bg-white/5 border border-white/10'}`}
              >
                {/* Posición / medalla */}
                <div className="w-7 text-center shrink-0">
                  {idx < 3
                    ? <span className="text-lg">{medals[idx]}</span>
                    : <span className={`text-sm font-bold ${isLeader ? 'text-amber-400' : 'text-slate-500'}`}>{idx + 1}</span>}
                </div>

                {/* Nombre + barra */}
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm truncate ${isLeader ? 'text-amber-300' : 'text-white'}`}>
                    {player.name}
                  </p>
                  <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500
                        ${isLeader ? 'bg-amber-400' : 'bg-indigo-500'}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>

                {/* Puntos */}
                <div className="text-right shrink-0">
                  <p className={`text-lg font-extrabold tabular-nums
                    ${isLeader ? 'text-amber-300' : 'text-white'}`}>
                    {player.total}
                  </p>
                  <p className="text-slate-600 text-xs">pts</p>
                </div>
              </div>
            );
          })}

          {ranked.length === 0 && (
            <p className="text-slate-500 text-center py-6 text-sm">
              Todavía no hay puntajes cargados.
            </p>
          )}
        </div>

        {/* Botón cerrar */}
        <div className="px-4 pb-4">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/5
                       text-slate-300 font-semibold text-sm border border-white/15 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
