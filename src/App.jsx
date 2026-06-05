// ── App.jsx ──────────────────────────────────────────────────────────────────
// Componente raíz. Maneja el estado global de la partida y coordina las vistas.
//
// Estado de la partida (game):
//   players       → [{ id, name }]
//   rounds        → [1, 2, ..., max, ..., 2, 1]  (secuencia de cartas por ronda)
//   config        → { maxCards, bonus }
//   roundHistory  → [{ roundIndex, results: [{ playerId, prediction, won, points }] }]
//   totals        → { [playerId]: puntos acumulados }
//   currentRound  → índice de la ronda actual (0-based)
//   phase         → 'prediction' | 'results' | 'scoreboard' | 'final'
//
// Vistas controladas por screen:
//   'setup'       → GameSetup
//   'playing'     → RoundPrediction / RoundResults / Scoreboard
//   'history'     → RoundHistory
//   'final'       → FinalScreen

import { useState, useEffect, useCallback } from 'react';
import GameSetup from './components/GameSetup';
import RoundPrediction from './components/RoundPrediction';
import RoundResults from './components/RoundResults';
import Scoreboard from './components/Scoreboard';
import RoundHistory from './components/RoundHistory';
import FinalScreen from './components/FinalScreen';
import { generateRounds, recalcTotals } from './helpers/gameLogic';
import { saveGame, loadGame, clearGame } from './helpers/storage';

// ── Estado inicial (sin partida) ─────────────────────────────────────────────
const INITIAL_STATE = {
  screen: 'setup',     // vista actual
  game: null,          // datos de la partida activa
  currentPredictions: null, // pronósticos del paso A (en curso)
  editingRoundIdx: null,    // si se está editando una ronda anterior
};

export default function App() {
  const [state, setState] = useState(() => {
    // Al iniciar, intentamos restaurar la partida guardada
    const saved = loadGame();
    return saved ?? INITIAL_STATE;
  });

  // Guarda en localStorage cada vez que el estado cambia
  useEffect(() => {
    if (state.screen !== 'setup') {
      saveGame(state);
    }
  }, [state]);

  // ── Iniciar partida ─────────────────────────────────────────────────────────
  const handleStart = useCallback(({ playerNames, maxCards, bonus }) => {
    const players = playerNames.map((name, i) => ({
      id: `player-${i}-${Date.now()}`,
      name,
    }));
    const rounds = generateRounds(maxCards);

    const game = {
      players,
      rounds,
      config: { maxCards, bonus },
      roundHistory: [],
      totals: Object.fromEntries(players.map((p) => [p.id, 0])),
      currentRound: 0,
      phase: 'prediction',
    };

    setState({ screen: 'playing', game, currentPredictions: null, editingRoundIdx: null });
  }, []);

  // ── Paso A completado: el usuario confirmó sus pronósticos ────────────────
  const handlePredictionsConfirmed = useCallback((predictions) => {
    setState((prev) => ({
      ...prev,
      currentPredictions: predictions,
      game: { ...prev.game, phase: 'results' },
    }));
  }, []);

  // ── Paso B completado: se carga el resultado de la ronda ──────────────────
  const handleRoundClosed = useCallback((results) => {
    setState((prev) => {
      const { game } = prev;
      const { roundHistory, players, config, rounds, currentRound } = game;

      // Agrega la ronda al historial
      const newHistory = [
        ...roundHistory,
        { roundIndex: currentRound, results },
      ];

      // Recalcula todos los totales desde cero (garantiza consistencia)
      const newTotals = recalcTotals(players, newHistory, config.bonus);

      const isLastRound = currentRound >= rounds.length - 1;

      return {
        ...prev,
        currentPredictions: null,
        game: {
          ...game,
          roundHistory: newHistory,
          totals: newTotals,
          phase: 'scoreboard',
          currentRound: isLastRound ? currentRound : currentRound, // se avanza en handleNext
        },
      };
    });
  }, []);

  // ── Avanzar desde el scoreboard a la próxima ronda (o finalizar) ──────────
  const handleNext = useCallback(() => {
    setState((prev) => {
      const { game } = prev;
      const { currentRound, rounds } = game;
      const isLastRound = currentRound >= rounds.length - 1;

      if (isLastRound) {
        return { ...prev, screen: 'final', game: { ...game, phase: 'final' } };
      }

      return {
        ...prev,
        game: {
          ...game,
          currentRound: currentRound + 1,
          phase: 'prediction',
        },
      };
    });
  }, []);

  // ── Editar ronda anterior ─────────────────────────────────────────────────
  const handleEditRound = useCallback((roundIdx) => {
    // Guarda el índice de la ronda a editar y muestra el flujo de edición
    setState((prev) => ({
      ...prev,
      screen: 'editing',
      editingRoundIdx: roundIdx,
    }));
  }, []);

  // ── Guardar edición de una ronda anterior ─────────────────────────────────
  const handleSaveEdit = useCallback((results) => {
    setState((prev) => {
      const { game, editingRoundIdx } = prev;
      const { players, roundHistory, config } = game;

      // Reemplaza la ronda editada en el historial
      const newHistory = roundHistory.map((r, i) =>
        i === editingRoundIdx
          ? { ...r, results }
          : r
      );

      // Recalcula todos los totales con el historial actualizado
      const newTotals = recalcTotals(players, newHistory, config.bonus);

      return {
        ...prev,
        screen: 'history',
        editingRoundIdx: null,
        game: {
          ...game,
          roundHistory: newHistory,
          totals: newTotals,
        },
      };
    });
  }, []);

  // ── Nueva partida ─────────────────────────────────────────────────────────
  const handleNewGame = useCallback(() => {
    clearGame();
    setState(INITIAL_STATE);
  }, []);

  // ── Reiniciar (volver al setup sin borrar jugadores) ──────────────────────
  const handleReset = useCallback(() => {
    if (window.confirm('¿Querés reiniciar la partida? Se perderán todos los datos.')) {
      clearGame();
      setState(INITIAL_STATE);
    }
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  const { screen, game, currentPredictions, editingRoundIdx } = state;

  // Pantalla de configuración inicial
  if (screen === 'setup') {
    return <GameSetup onStart={handleStart} />;
  }

  // Pantalla final
  if (screen === 'final') {
    return (
      <FinalScreen
        players={game.players}
        totals={game.totals}
        onNewGame={handleNewGame}
      />
    );
  }

  // Historial de rondas
  if (screen === 'history') {
    return (
      <RoundHistory
        game={game}
        onEditRound={handleEditRound}
        onBack={() => setState((prev) => ({ ...prev, screen: 'playing' }))}
      />
    );
  }

  // Modo edición de una ronda anterior
  if (screen === 'editing' && editingRoundIdx !== null) {
    const roundData = game.roundHistory[editingRoundIdx];
    // Construye el array de predicciones con los datos existentes
    const editPredictions = roundData.results.map((r) => ({
      playerId: r.playerId,
      prediction: r.prediction,
      won: r.won, // pre-carga los valores actuales en RoundResults
    }));

    // Mostramos primero RoundPrediction para editar pronósticos,
    // luego RoundResults para editar resultados.
    // Simplificación: abrimos directamente en RoundResults con edición integrada.
    return (
      <RoundResults
        game={game}
        roundIndex={roundData.roundIndex}
        predictions={editPredictions}
        onClose={handleSaveEdit}
        isEditing={true}
      />
    );
  }

  // Flujo principal de juego
  if (screen === 'playing') {
    const { phase, currentRound } = game;

    return (
      <div className="relative">
        {/* Botones globales flotantes (historial + reset) */}
        <div className="fixed top-3 right-3 z-50 flex gap-2">
          <button
            id="history-btn"
            onClick={() => setState((prev) => ({ ...prev, screen: 'history' }))}
            className="bg-white/15 backdrop-blur text-white text-xs px-3 py-2 rounded-full
                       border border-white/30 hover:bg-white/25 transition-colors"
          >
            📋 Historial
          </button>
          <button
            id="reset-btn"
            onClick={handleReset}
            className="bg-red-500/20 backdrop-blur text-red-300 text-xs px-3 py-2 rounded-full
                       border border-red-500/40 hover:bg-red-500/30 transition-colors"
          >
            ↺ Reset
          </button>
        </div>

        {/* Fase A: pronósticos */}
        {phase === 'prediction' && (
          <RoundPrediction
            game={game}
            roundIndex={currentRound}
            onConfirm={handlePredictionsConfirmed}
          />
        )}

        {/* Fase B: resultados */}
        {phase === 'results' && (
          <RoundResults
            game={game}
            roundIndex={currentRound}
            predictions={currentPredictions}
            onClose={handleRoundClosed}
          />
        )}

        {/* Fase C: ranking */}
        {phase === 'scoreboard' && (
          <Scoreboard
            players={game.players}
            totals={game.totals}
            onNext={handleNext}
            currentRoundIndex={currentRound}
            totalRounds={game.rounds.length}
          />
        )}
      </div>
    );
  }

  return null;
}
