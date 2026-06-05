// ── components/FinalScreen.jsx ───────────────────────────────────────────────
// Pantalla final: muestra el ranking definitivo y al/los ganador/es.

import Footer from './Footer';

export default function FinalScreen({ players, totals, onNewGame }) {
  // Ordena de mayor a menor
  const ranked = [...players]
    .map((p) => ({ ...p, total: totals[p.id] ?? 0 }))
    .sort((a, b) => b.total - a.total);

  const maxScore = ranked[0]?.total ?? 0;
  // Puede haber empate → todos los que tengan el puntaje máximo son ganadores
  const winners = ranked.filter((p) => p.total === maxScore);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-violet-900 to-purple-950
                    flex flex-col items-center justify-center p-4">
      {/* Trofeo y título */}
      <div className="text-center mb-6 w-full max-w-lg">
        <div className="text-6xl mb-3 animate-bounce">🏆</div>
        <h1 className="text-3xl font-extrabold text-white">¡Partida terminada!</h1>

        {/* Anuncio del ganador */}
        <div className="mt-4 bg-amber-400/20 border border-amber-400/60 rounded-xl px-6 py-4">
          {winners.length === 1 ? (
            <>
              <p className="text-amber-300 text-sm uppercase tracking-widest font-medium">Ganador</p>
              <p className="text-white text-2xl font-extrabold mt-1">{winners[0].name}</p>
              <p className="text-amber-300 text-xl font-bold">{maxScore} puntos</p>
            </>
          ) : (
            <>
              <p className="text-amber-300 text-sm uppercase tracking-widest font-medium">¡Empate!</p>
              <p className="text-white text-xl font-extrabold mt-1">
                {winners.map((w) => w.name).join(' & ')}
              </p>
              <p className="text-amber-300 text-xl font-bold">{maxScore} puntos c/u</p>
            </>
          )}
        </div>
      </div>

      {/* Ranking final */}
      <div className="w-full max-w-lg">
        <h2 className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-3 text-center">
          Ranking final
        </h2>
        <div className="flex flex-col gap-2">
          {ranked.map((player, idx) => (
            <div
              key={player.id}
              className={`rounded-xl px-4 py-3 flex items-center gap-3 border
                ${idx === 0
                  ? 'bg-amber-400/20 border-amber-400/50'
                  : 'bg-white/8 border-white/15'}`}
            >
              <div className="w-8 text-center text-xl">
                {idx < 3 ? medals[idx] : <span className="text-slate-500 font-bold">{idx + 1}</span>}
              </div>
              <p className={`flex-1 font-semibold ${idx === 0 ? 'text-amber-300' : 'text-white'}`}>
                {player.name}
              </p>
              <p className={`text-xl font-extrabold tabular-nums ${idx === 0 ? 'text-amber-300' : 'text-white'}`}>
                {player.total}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Nueva partida */}
      <div className="w-full max-w-lg mt-8">
        <button
          id="new-game-btn"
          onClick={onNewGame}
          className="w-full py-4 bg-indigo-500 hover:bg-indigo-400
                     text-white font-bold text-lg rounded-xl shadow-lg transition-colors"
        >
          Nueva partida 🃏
        </button>
      </div>

      <Footer />
    </div>
  );
}
