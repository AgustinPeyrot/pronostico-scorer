// ── components/GameSetup.jsx ─────────────────────────────────────────────────
// Pantalla inicial: carga de jugadores y configuración de la partida.
//
// Validaciones de inputs numéricos:
//   maxCards  → mínimo 1, máximo 15, default 7
//   bonus     → mínimo 1, máximo 20, default 5
//   Eliminación de ceros a la izquierda, letras y caracteres especiales.
//   Al perder foco con valor vacío/inválido, se restaura el default.

import { useState } from 'react';
import Footer from './Footer';
import { clampNumber, sanitizeIntegerInput } from '../helpers/inputUtils';

// Constantes de configuración
const MAX_CARDS_MIN = 1;
const MAX_CARDS_MAX = 15;
const MAX_CARDS_DEFAULT = 7;
const BONUS_MIN = 1;
const BONUS_MAX = 20;
const BONUS_DEFAULT = 5;

export default function GameSetup({ onStart }) {
  const [players, setPlayers] = useState(['', '']);

  // Inputs numéricos se manejan como strings internamente para permitir edición fluida
  const [maxCardsStr, setMaxCardsStr] = useState(String(MAX_CARDS_DEFAULT));
  const [bonusStr, setBonusStr] = useState(String(BONUS_DEFAULT));

  const [gameMode, setGameMode] = useState('libre');        // 'libre' | 'obligado'
  const [limitPredictionSum, setLimitPredictionSum] = useState(true);
  const [error, setError] = useState('');

  // Valores numéricos derivados del estado string (para lógica y validaciones)
  const maxCards = sanitizeIntegerInput(maxCardsStr, MAX_CARDS_MIN, MAX_CARDS_MAX, MAX_CARDS_DEFAULT);
  const bonus = sanitizeIntegerInput(bonusStr, BONUS_MIN, BONUS_MAX, BONUS_DEFAULT);

  // ── Handlers para maxCards ────────────────────────────────────────────────
  const handleMaxCardsChange = (e) => {
    const digitsOnly = e.target.value.replace(/[^0-9]/g, ''); // solo dígitos
    if (digitsOnly === '') { setMaxCardsStr(''); return; }
    const num = parseInt(digitsOnly, 10);
    // Clamp al máximo en tiempo real; mínimo se aplica al perder foco
    setMaxCardsStr(String(Math.min(MAX_CARDS_MAX, num)));
  };
  const handleMaxCardsBlur = () => {
    setMaxCardsStr(String(sanitizeIntegerInput(maxCardsStr, MAX_CARDS_MIN, MAX_CARDS_MAX, MAX_CARDS_DEFAULT)));
  };

  // ── Handlers para bonus ───────────────────────────────────────────────────
  const handleBonusChange = (e) => {
    const digitsOnly = e.target.value.replace(/[^0-9]/g, '');
    if (digitsOnly === '') { setBonusStr(''); return; }
    const num = parseInt(digitsOnly, 10);
    setBonusStr(String(Math.min(BONUS_MAX, num)));
  };
  const handleBonusBlur = () => {
    setBonusStr(String(sanitizeIntegerInput(bonusStr, BONUS_MIN, BONUS_MAX, BONUS_DEFAULT)));
  };

  // ── Jugadores ─────────────────────────────────────────────────────────────
  const addPlayer = () => setPlayers((prev) => [...prev, '']);
  const removePlayer = (idx) => setPlayers((prev) => prev.filter((_, i) => i !== idx));
  const updateName = (idx, value) => setPlayers((prev) => prev.map((n, i) => (i === idx ? value : n)));

  // ── Iniciar ───────────────────────────────────────────────────────────────
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
    onStart({ playerNames: cleaned, maxCards, bonus, gameMode, limitPredictionSum });
  };

  // ── Secuencia de rondas preview ───────────────────────────────────────────
  const roundsPreview = Array.from({ length: maxCards }, (_, i) => i + 1)
    .concat(Array.from({ length: maxCards - 1 }, (_, i) => maxCards - 1 - i))
    .join(' · ');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900
                    flex flex-col items-center justify-center p-4">
      {/* Encabezado */}
      <div className="mb-8 text-center">
        <div className="text-5xl mb-3">🃏</div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Pronóstico</h1>
        <p className="text-indigo-300 mt-1 text-sm">Anotador de cartas</p>
      </div>

      <div className="w-full max-w-lg bg-white/10 backdrop-blur rounded-2xl p-6 shadow-2xl border border-white/20">

        {/* ── Modalidad de juego ──────────────────────────────────────────── */}
        <section className="mb-6">
          <h2 className="text-white font-semibold text-sm uppercase tracking-widest mb-3">
            Modalidad de juego
          </h2>
          <div className="grid grid-cols-2 gap-3">
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
                Todos pueden acertar. Sin restricciones para el último pronóstico.
              </p>
              {gameMode === 'libre' && (
                <div className="mt-2 text-indigo-300 text-xs font-semibold">✓ Seleccionado</div>
              )}
            </button>

            <button
              id="mode-obligado-btn"
              onClick={() => setGameMode('obligado')}
              className={`rounded-xl p-4 border text-left transition-all
                ${gameMode === 'obligado'
                  ? 'border-amber-400 bg-amber-500/20 ring-1 ring-amber-400/60'
                  : 'border-white/20 bg-white/5 hover:bg-white/10'}`}
            >
              <div className="text-2xl mb-2">🔒</div>
              <p className="text-white font-semibold text-sm leading-tight">Modo obligado</p>
              <p className="text-amber-300/70 text-xs mt-1 leading-snug">
                El repartidor pronostica último y no puede cerrar la suma exacta.
              </p>
              {gameMode === 'obligado' && (
                <div className="mt-2 text-amber-300 text-xs font-semibold">✓ Seleccionado</div>
              )}
            </button>
          </div>
        </section>

        <hr className="border-white/20 mb-6" />

        {/* ── Configuración numérica ──────────────────────────────────────── */}
        <section className="mb-6">
          <h2 className="text-white font-semibold text-sm uppercase tracking-widest mb-3">Configuración</h2>

          <div className="flex gap-3 mb-4">
            {/* Máx. cartas */}
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

            {/* Bonus por acierto */}
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

          {/* Preview de rondas */}
          <p className="text-indigo-300/70 text-xs mb-4">
            Rondas: {roundsPreview}
          </p>

          {/* Toggle: limitar suma de pronósticos */}
          <div className="flex items-start justify-between gap-3 bg-white/8 rounded-xl px-4 py-3
                          border border-white/15">
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Limitar suma de pronósticos</p>
              <p className="text-indigo-300/70 text-xs mt-0.5 leading-snug">
                {limitPredictionSum
                  ? 'La suma de pronósticos no puede superar la cantidad de cartas de la ronda.'
                  : 'La suma de pronósticos puede superar la cantidad de cartas (modo clásico).'}
              </p>
            </div>
            {/* Toggle switch */}
            <button
              id="limit-prediction-sum-toggle"
              onClick={() => setLimitPredictionSum((v) => !v)}
              className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200
                ${limitPredictionSum ? 'bg-indigo-500' : 'bg-slate-600'}`}
              aria-pressed={limitPredictionSum}
              aria-label="Limitar suma de pronósticos"
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md
                               transition-all duration-200
                               ${limitPredictionSum ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>
        </section>

        <hr className="border-white/20 mb-6" />

        {/* ── Jugadores ───────────────────────────────────────────────────── */}
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
