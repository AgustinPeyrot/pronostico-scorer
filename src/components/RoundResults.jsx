// ── components/RoundResults.jsx ──────────────────────────────────────────────
// Paso B: se carga cuántas bazas ganó cada jugador.
// Valida que la suma total = cantidad de cartas de la ronda.

import { useState } from 'react';
import NumberStepper from './NumberStepper';
import { calcPlayerRoundScore } from '../helpers/gameLogic';

export default function RoundResults({ game, roundIndex, predictions, onClose, isEditing = false }) {
  const { players, rounds, config } = game;
  const cards = rounds[roundIndex];
  const roundNumber = roundIndex + 1;

  // Estado local: bazas ganadas por cada jugador (inicializado en 0)
  const [won, setWon] = useState(
    Object.fromEntries(players.map((p) => {
      // Si estamos editando, pre-llenamos con los valores existentes
      const existing = predictions.find((pr) => pr.playerId === p.id);
      return [p.id, existing?.won ?? 0];
    }))
  );

  const [error, setError] = useState('');

  const updateWon = (playerId, value) =>
    setWon((prev) => ({ ...prev, [playerId]: value }));

  // Suma total de bazas ingresadas
  const totalWon = Object.values(won).reduce((a, b) => a + b, 0);
  const remaining = cards - totalWon;

  const handleClose = () => {
    // Validación clave: la suma debe ser exactamente igual a las cartas repartidas
    if (totalWon !== cards) {
      setError(`La suma de bazas ganadas debe ser exactamente ${cards}. Ahora suma ${totalWon}.`);
      return;
    }
    setError('');

    // Construye el array de resultados
    const results = players.map((p) => {
      const pred = predictions.find((pr) => pr.playerId === p.id);
      const prediction = pred?.prediction ?? 0;
      const wonValue = won[p.id];
      return {
        playerId: p.id,
        prediction,
        won: wonValue,
        points: calcPlayerRoundScore(prediction, wonValue, config.bonus),
      };
    });

    onClose(results);
  };

  // Color del indicador de suma restante
  const remainingColor =
    remaining === 0 ? 'text-emerald-400' :
    remaining > 0 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-violet-950 flex flex-col">
      {/* Header */}
      <header className="bg-violet-600 px-4 py-4 shadow-lg">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <span className="text-violet-200 text-sm font-medium">
              {isEditing ? `Editando ronda ${roundNumber}` : `Ronda ${roundNumber} / ${rounds.length}`}
            </span>
            <span className="bg-white/20 text-white text-sm font-semibold px-3 py-1 rounded-full">
              🃏 {cards} {cards === 1 ? 'carta' : 'cartas'}
            </span>
          </div>
          <h2 className="text-white text-xl font-bold mt-1">Resultados</h2>
          {/* Indicador de cuántas bazas faltan por asignar */}
          <p className={`text-sm font-medium mt-0.5 ${remainingColor}`}>
            {remaining === 0
              ? '✓ Suma correcta'
              : remaining > 0
              ? `Faltan ${remaining} baza${remaining !== 1 ? 's' : ''} por asignar`
              : `Te pasaste por ${Math.abs(remaining)} baza${Math.abs(remaining) !== 1 ? 's' : ''}`}
          </p>
        </div>
      </header>

      {/* Lista de jugadores */}
      <main className="flex-1 px-4 py-5 max-w-md mx-auto w-full">
        <div className="flex flex-col gap-3">
          {players.map((player) => {
            const pred = predictions.find((pr) => pr.playerId === player.id);
            const prediction = pred?.prediction ?? 0;
            const wonValue = won[player.id];
            const hit = wonValue === prediction;
            const pts = calcPlayerRoundScore(prediction, wonValue, config.bonus);

            return (
              <div
                key={player.id}
                className={`bg-white/10 backdrop-blur rounded-xl px-4 py-4 border transition-colors
                  ${hit ? 'border-emerald-400/60' : 'border-white/20'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-white font-semibold">{player.name}</p>
                    {/* Muestra el pronóstico para referencia */}
                    <p className="text-slate-400 text-xs">
                      Pidió: <span className="text-indigo-300 font-bold">{prediction}</span>
                    </p>
                  </div>
                  {/* Preview de puntos en tiempo real */}
                  <div className="text-right">
                    <p className={`text-lg font-bold ${hit ? 'text-emerald-400' : 'text-slate-300'}`}>
                      +{pts} pts
                    </p>
                    {hit && (
                      <p className="text-emerald-400 text-xs">+{config.bonus} bonus ✓</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Ganó:</span>
                  <NumberStepper
                    value={wonValue}
                    onChange={(v) => updateWon(player.id, v)}
                    min={0}
                    max={cards}
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

      {/* Botón cerrar ronda */}
      <footer className="px-4 pb-6 pt-2 max-w-md mx-auto w-full">
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
    </div>
  );
}
