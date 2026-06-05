// ── components/GameSetup.jsx ─────────────────────────────────────────────────
// Pantalla inicial: carga de jugadores y configuración de la partida.
//
// Modalidades:
//   'libre'    → todos pueden pedir libremente
//   'obligado' → modo desafío (valor interno sin cambio para compat localStorage)
//
// Validaciones:
//   maxCards  → mínimo 1, máximo 15, default 7
//   bonus     → mínimo 1, máximo 20, default 5

import { useState } from 'react';
import Footer from './Footer';
import { clampNumber, sanitizeIntegerInput } from '../helpers/inputUtils';

const MAX_CARDS_MIN = 1;
const MAX_CARDS_MAX = 15;
const MAX_CARDS_DEFAULT = 7;
const BONUS_MIN = 1;
const BONUS_MAX = 20;
const BONUS_DEFAULT = 5;

export default function GameSetup({ onStart }) {
  const [players, setPlayers] = useState(['', '']);
  const [maxCardsStr, setMaxCardsStr] = useState(String(MAX_CARDS_DEFAULT));
  const [bonusStr, setBonusStr] = useState(String(BONUS_DEFAULT));
  const [gameMode, setGameMode] = useState('libre');
  const [error, setError] = useState('');

  const maxCards = sanitizeIntegerInput(maxCardsStr, MAX_CARDS_MIN, MAX_CARDS_MAX, MAX_CARDS_DEFAULT);
  const bonus = sanitizeIntegerInput(bonusStr, BONUS_MIN, BONUS_MAX, BONUS_DEFAULT);

  const handleMaxCardsChange = (e) => {
    const digitsOnly = e.target.value.replace(/[^0-9]/g, '');
    if (digitsOnly === '') { setMaxCardsStr(''); return; }
    setMaxCardsStr(String(Math.min(MAX_CARDS_MAX, parseInt(digitsOnly, 10))));
  };
  const handleMaxCardsBlur = () => {
    setMaxCardsStr(String(sanitizeIntegerInput(maxCardsStr, MAX_CARDS_MIN, MAX_CARDS_MAX, MAX_CARDS_DEFAULT)));
  };

  const handleBonusChange = (e) => {
    const digitsOnly = e.target.value.replace(/[^0-9]/g, '');
    if (digitsOnly === '') { setBonusStr(''); return; }
    setBonusStr(String(Math.min(BONUS_MAX, parseInt(digitsOnly, 10))));
  };
  const handleBonusBlur = () => {
    setBonusStr(String(sanitizeIntegerInput(bonusStr, BONUS_MIN, BONUS_MAX, BONUS_DEFAULT)));
  };

  const addPlayer = () => setPlayers((prev) => [...prev, '']);
  const removePlayer = (idx) => setPlayers((prev) => prev.filter((_, i) => i !== idx));
  const updateName = (idx, value) => setPlayers((prev) => prev.map((n, i) => (i === idx ? value : n)));

  const handleStart = () => {
    const cleaned = players.map((n) => n.trim()).filter(Boolean);
    if (cleaned.length < 2) { setError('Necesitás al menos 2 jugadores.'); return; }
    const unique = new Set(cleaned.map((n) => n.toLowerCase()));
    if (unique.size !== cleaned.length) { setError('Los nombres no pueden repetirse.'); return; }
    if (maxCards < MAX_CARDS_MIN || maxCards > MAX_CARDS_MAX) {
      setError(`La cantidad máxima de cartas debe estar entre ${MAX_CARDS_MIN} y ${MAX_CARDS_MAX}.`);
      return;
    }
    if (bonus < BONUS_MIN || bonus > BONUS_MAX) {
      setError(`El bonus debe estar entre ${BONUS_MIN} y ${BONUS_MAX}.`);
      return;
    }
    setError('');
    onStart({ playerNames: cleaned, maxCards, bonus, gameMode });
  };

  const roundsPreview = Array.from({ length: maxCards }, (_, i) => i + 1)
    .concat(Array.from({ length: maxCards - 1 }, (_, i) => maxCards - 1 - i))
    .join(' · ');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900
                    flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <div className="text-5xl mb-3">🃏</div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Pronóstico</h1>
        <p className="text-indigo-300 mt-1 text-sm">Anotador de cartas</p>
      </div>

      <div className="w-full max-w-lg bg-white/10 backdrop-blur rounded-2xl p-6 shadow-2xl border border-white/20">

        {/* ── Modalidad ───────────────────────────────────────────────────────── */}
        <section className="mb-6">
          <h2 className="text-white font-semibold text-sm uppercase tracking-widest mb-3">
            Modalidad de juego
          </h2>
          <div className="grid grid-cols-2 gap-3">

            {/* Modo libre */}
            <button
              id="mode-libre-btn"
              onClick={() => setGameMode('libre')}
              className={`rounded-xl p-4 border text-left transition-all
                ${gameMode === 'libre'
                  ? 'border-indigo-400 bg-indigo-500/25 ring-1 ring-indigo-400/60'
                  : 'border-white/20 bg-white/5 hover:bg-white/10'}`}
            >
              <div className="text-2xl mb-2">🎯</div>
              <p className="text-white font-semibold text-sm leading-tight">Modo libre</p>
              <p className="text-indigo-300/70 text-xs mt-1 leading-snug">
                Todos pueden pedir libremente. Puede pasar que todos cumplan.
              </p>
              {gameMode === 'libre' && (
                <div className="mt-2 text-indigo-300 text-xs font-semibold">✓ Seleccionado</div>
              )}
            </button>

            {/* Modo desafío (valor interno: 'obligado' para compat con localStorage) */}
            <button
              id="mode-desafio-btn"
              onClick={() => setGameMode('obligado')}
              className={`rounded-xl p-4 border text-left transition-all
                ${gameMode === 'obligado'
                  ? 'border-amber-400 bg-amber-500/20 ring-1 ring-amber-400/60'
                  : 'border-white/20 bg-white/5 hover:bg-white/10'}`}
            >
              <div className="text-2xl mb-2">⚡</div>
              <p className="text-white font-semibold text-sm leading-tight">Modo desafío</p>
              <p className="text-amber-300/70 text-xs mt-1 leading-snug">
                El jugador que pide último puede quedar condicionado para asegurar que no todos cumplan.
              </p>
              {gameMode === 'obligado' && (
                <div className="mt-2 text-amber-300 text-xs font-semibold">✓ Seleccionado</div>
              )}
            </button>
          </div>
        </section>

        <hr className="border-white/20 mb-6" />

        {/* ── Configuración ───────────────────────────────────────────────────── */}
        <section className="mb-6">
          <h2 className="text-white font-semibold text-sm uppercase tracking-widest mb-3">Configuración</h2>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-indigo-200 text-xs mb-1">
                Máx. cartas <span className="text-indigo-400/60">({MAX_CARDS_MIN}–{MAX_CARDS_MAX})</span>
              </label>
              <input
                id="max-cards-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={maxCardsStr}
                onChange={handleMaxCardsChange}
                onBlur={handleMaxCardsBlur}
                placeholder={String(MAX_CARDS_DEFAULT)}
                className="w-full rounded-lg px-3 py-2 text-center bg-white/20 text-white border border-white/30
                           focus:outline-none focus:ring-2 focus:ring-indigo-400 text-lg font-bold
                           placeholder-white/30"
              />
            </div>
            <div className="flex-1">
              <label className="block text-indigo-200 text-xs mb-1">
                Bonus acierto <span className="text-indigo-400/60">({BONUS_MIN}–{BONUS_MAX})</span>
              </label>
              <input
                id="bonus-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={bonusStr}
                onChange={handleBonusChange}
                onBlur={handleBonusBlur}
                placeholder={String(BONUS_DEFAULT)}
                className="w-full rounded-lg px-3 py-2 text-center bg-white/20 text-white border border-white/30
                           focus:outline-none focus:ring-2 focus:ring-indigo-400 text-lg font-bold
                           placeholder-white/30"
              />
            </div>
          </div>
          <p className="text-indigo-300/70 text-xs mt-2">Rondas: {roundsPreview}</p>
        </section>

        <hr className="border-white/20 mb-6" />

        {/* ── Jugadores ───────────────────────────────────────────────────────── */}
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
                    className="w-9 h-9 rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/40
                               flex items-center justify-center text-lg leading-none transition-colors"
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

        {error && (
          <p className="mt-4 text-red-300 text-sm bg-red-500/20 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          id="start-game-btn"
          onClick={handleStart}
          className="mt-6 w-full py-4 rounded-xl bg-indigo-500 hover:bg-indigo-400 active:bg-indigo-600
                     text-white font-bold text-lg transition-colors shadow-lg"
        >
          ¡Empezar partida!
        </button>
      </div>

      <Footer />
    </div>
  );
}
