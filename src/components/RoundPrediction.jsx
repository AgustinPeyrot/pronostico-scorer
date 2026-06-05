// ── components/RoundPrediction.jsx ───────────────────────────────────────────
// Paso A: cada jugador ingresa su pronóstico para la ronda actual.

import { useState } from 'react';
import NumberStepper from './NumberStepper';

export default function RoundPrediction({ game, roundIndex, onConfirm }) {
  const { players, rounds, config } = game;
  const cards = rounds[roundIndex]; // cantidad de cartas para esta ronda
  const roundNumber = roundIndex + 1;

  // Estado local: pronóstico de cada jugador (inicializado en 0)
  const [predictions, setPredictions] = useState(
    Object.fromEntries(players.map((p) => [p.id, 0]))
  );

  const updatePrediction = (playerId, value) =>
    setPredictions((prev) => ({ ...prev, [playerId]: value }));

  const handleConfirm = () => {
    // Arma el array de pronósticos para pasarlo al padre
    const result = players.map((p) => ({
      playerId: p.id,
      prediction: predictions[p.id],
    }));
    onConfirm(result);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col">
      {/* Header de ronda */}
      <header className="bg-indigo-600 px-4 py-4 shadow-lg">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <span className="text-indigo-200 text-sm font-medium">
              Ronda {roundNumber} / {rounds.length}
            </span>
            <span className="bg-white/20 text-white text-sm font-semibold px-3 py-1 rounded-full">
              🃏 {cards} {cards === 1 ? 'carta' : 'cartas'}
            </span>
          </div>
          <h2 className="text-white text-xl font-bold mt-1">Pronósticos</h2>
          <p className="text-indigo-200 text-xs mt-0.5">¿Cuántas bazas creés que vas a ganar?</p>
        </div>
      </header>

      {/* Lista de jugadores */}
      <main className="flex-1 px-4 py-5 max-w-md mx-auto w-full">
        <div className="flex flex-col gap-3">
          {players.map((player) => (
            <div
              key={player.id}
              className="bg-white/10 backdrop-blur rounded-xl px-4 py-4 border border-white/20
                         flex items-center justify-between"
            >
              <div>
                <p className="text-white font-semibold">{player.name}</p>
                <p className="text-slate-400 text-xs">Pronóstico</p>
              </div>
              <NumberStepper
                value={predictions[player.id]}
                onChange={(v) => updatePrediction(player.id, v)}
                min={0}
                max={cards}
              />
            </div>
          ))}
        </div>
      </main>

      {/* Botón confirmar */}
      <footer className="px-4 pb-6 pt-2 max-w-md mx-auto w-full">
        <button
          id="confirm-predictions-btn"
          onClick={handleConfirm}
          className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 active:bg-indigo-600
                     text-white font-bold text-lg rounded-xl shadow-lg transition-colors"
        >
          Confirmar pronósticos →
        </button>
      </footer>
    </div>
  );
}
