// ── components/GameSetup.jsx ─────────────────────────────────────────────────
// Pantalla inicial: carga de jugadores y configuración de la partida.

import { useState } from 'react';

export default function GameSetup({ onStart }) {
  const [players, setPlayers] = useState(['', '']);
  const [maxCards, setMaxCards] = useState(7);
  const [bonus, setBonus] = useState(5);
  const [error, setError] = useState('');

  // Agrega un jugador vacío
  const addPlayer = () => setPlayers((prev) => [...prev, '']);

  // Elimina el jugador en la posición idx
  const removePlayer = (idx) =>
    setPlayers((prev) => prev.filter((_, i) => i !== idx));

  // Actualiza el nombre del jugador en la posición idx
  const updateName = (idx, value) =>
    setPlayers((prev) => prev.map((n, i) => (i === idx ? value : n)));

  const handleStart = () => {
    const cleaned = players.map((n) => n.trim()).filter(Boolean);

    // Validaciones
    if (cleaned.length < 2) {
      setError('Necesitás al menos 2 jugadores.');
      return;
    }
    const unique = new Set(cleaned.map((n) => n.toLowerCase()));
    if (unique.size !== cleaned.length) {
      setError('Los nombres de los jugadores no pueden repetirse.');
      return;
    }
    if (maxCards < 1 || maxCards > 15) {
      setError('La cantidad máxima de cartas debe estar entre 1 y 15.');
      return;
    }
    if (bonus < 0) {
      setError('El bonus no puede ser negativo.');
      return;
    }

    setError('');
    onStart({ playerNames: cleaned, maxCards, bonus });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900 flex flex-col items-center justify-center p-4">
      {/* Encabezado */}
      <div className="mb-8 text-center">
        <div className="text-5xl mb-3">🃏</div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Pronóstico</h1>
        <p className="text-indigo-300 mt-1 text-sm">Anotador de cartas</p>
      </div>

      <div className="w-full max-w-md bg-white/10 backdrop-blur rounded-2xl p-6 shadow-2xl border border-white/20">

        {/* Configuración */}
        <section className="mb-6">
          <h2 className="text-white font-semibold text-sm uppercase tracking-widest mb-3">Configuración</h2>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-indigo-200 text-xs mb-1">Máx. cartas</label>
              <input
                id="max-cards-input"
                type="number"
                min={1}
                max={15}
                value={maxCards}
                onChange={(e) => setMaxCards(Number(e.target.value))}
                className="w-full rounded-lg px-3 py-2 text-center bg-white/20 text-white border border-white/30
                           focus:outline-none focus:ring-2 focus:ring-indigo-400 text-lg font-bold"
              />
            </div>
            <div className="flex-1">
              <label className="block text-indigo-200 text-xs mb-1">Bonus por acierto</label>
              <input
                id="bonus-input"
                type="number"
                min={0}
                value={bonus}
                onChange={(e) => setBonus(Number(e.target.value))}
                className="w-full rounded-lg px-3 py-2 text-center bg-white/20 text-white border border-white/30
                           focus:outline-none focus:ring-2 focus:ring-indigo-400 text-lg font-bold"
              />
            </div>
          </div>
          <p className="text-indigo-300/70 text-xs mt-2">
            Rondas: {Array.from({ length: maxCards }, (_, i) => i + 1)
              .concat(Array.from({ length: maxCards - 1 }, (_, i) => maxCards - 1 - i))
              .join(' · ')}
          </p>
        </section>

        <hr className="border-white/20 mb-6" />

        {/* Jugadores */}
        <section>
          <h2 className="text-white font-semibold text-sm uppercase tracking-widest mb-3">Jugadores</h2>
          <div className="flex flex-col gap-2">
            {players.map((name, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  id={`player-name-${idx}`}
                  type="text"
                  placeholder={`Jugador ${idx + 1}`}
                  value={name}
                  maxLength={20}
                  onChange={(e) => updateName(idx, e.target.value)}
                  className="flex-1 rounded-lg px-3 py-2 bg-white/20 text-white placeholder-indigo-300/60
                             border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                {players.length > 2 && (
                  <button
                    onClick={() => removePlayer(idx)}
                    className="w-9 h-9 rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/40 transition-colors
                               flex items-center justify-center text-lg leading-none"
                    aria-label={`Eliminar jugador ${idx + 1}`}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            id="add-player-btn"
            onClick={addPlayer}
            className="mt-3 w-full py-2 rounded-lg border border-dashed border-indigo-400/60
                       text-indigo-300 text-sm hover:bg-white/10 transition-colors"
          >
            + Agregar jugador
          </button>
        </section>

        {/* Error */}
        {error && (
          <p className="mt-4 text-red-300 text-sm bg-red-500/20 rounded-lg px-3 py-2">{error}</p>
        )}

        {/* Botón iniciar */}
        <button
          id="start-game-btn"
          onClick={handleStart}
          className="mt-6 w-full py-4 rounded-xl bg-indigo-500 hover:bg-indigo-400 active:bg-indigo-600
                     text-white font-bold text-lg transition-colors shadow-lg"
        >
          ¡Empezar partida!
        </button>
      </div>
    </div>
  );
}
