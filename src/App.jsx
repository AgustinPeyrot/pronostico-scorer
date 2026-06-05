// ── App.jsx ──────────────────────────────────────────────────────────────────
// Componente raíz. Maneja el estado global de la partida y coordina las vistas.
//
// Estado de la partida (game):
//   players       → [{ id, name }]
//   rounds        → [1, 2, ..., max, ..., 2, 1]  (secuencia de cartas por ronda)
//   config        → { maxCards, bonus, gameMode }  ← gameMode: 'libre' | 'obligado'
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
import ConfirmModal from './components/ConfirmModal';
import { generateRounds, recalcTotals } from './helpers/gameLogic';
import { saveGame, loadGame, clearGame } from './helpers/storage';

const INITIAL_STATE = {
  screen: 'setup',
  game: null,
  currentPredictions: null,
  editingRoundIdx: null,
};

export default function App() {
  const [state, setState] = useState(() => {
    const saved = loadGame();
    return saved ?? INITIAL_STATE;
  });

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  useEffect(() => {
    if (state.screen !== 'setup') {
      saveGame(state);
    }
  }, [state]);

  // ── Iniciar partida ─────────────────────────────────────────────────────────
  // Ahora también recibe gameMode desde GameSetup
  const handleStart = useCallback(({ playerNames, maxCards, bonus, gameMode }) => {
    const players = playerNames.map((name, i) => ({
      id: `player-${i}-${Date.now()}`,
      name,
    }));
    const rounds = generateRounds(maxCards);

    const game = {
      players,
      rounds,
      config: { maxCards, bonus, gameMode: gameMode || 'libre' },
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

      const newHistory = [
        ...roundHistory,
        { roundIndex: currentRound, results },
      ];

      const newTotals = recalcTotals(players, newHistory, config.bonus);

      return {
        ...prev,
        currentPredictions: null,
        game: {
          ...game,
          roundHistory: newHistory,
          totals: newTotals,
          phase: 'scoreboard',
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

      const newHistory = roundHistory.map((r, i) =>
        i === editingRoundIdx ? { ...r, results } : r
      );

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

  // ── Modal de reinicio ─────────────────────────────────────────────────────
  const handleOpenResetModal = useCallback(() => setIsResetModalOpen(true), []);
  const handleConfirmReset = useCallback(() => {
    setIsResetModalOpen(false);
    clearGame();
    setState(INITIAL_STATE);
  }, []);
  const handleCancelReset = useCallback(() => setIsResetModalOpen(false), []);

  // ── Ir al historial ──────────────────────────────────────────────────────
  const handleGoHistory = useCallback(() => {
    setState((prev) => ({ ...prev, screen: 'history' }));
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  const { screen, game, currentPredictions, editingRoundIdx } = state;

  if (screen === 'setup') {
    return <GameSetup onStart={handleStart} />;
  }

  if (screen === 'final') {
    return (
      <FinalScreen
        players={game.players}
        totals={game.totals}
        onNewGame={handleNewGame}
      />
    );
  }

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
    const editPredictions = roundData.results.map((r) => ({
      playerId: r.playerId,
      prediction: r.prediction,
      won: r.won,
    }));

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
      <>
        {isResetModalOpen && (
          <ConfirmModal
            onConfirm={handleConfirmReset}
            onCancel={handleCancelReset}
          />
        )}

        {phase === 'prediction' && (
          <RoundPrediction
            game={game}
            roundIndex={currentRound}
            onConfirm={handlePredictionsConfirmed}
            onHistoryClick={handleGoHistory}
            onResetClick={handleOpenResetModal}
          />
        )}

        {phase === 'results' && (
          <RoundResults
            game={game}
            roundIndex={currentRound}
            predictions={currentPredictions}
            onClose={handleRoundClosed}
            onHistoryClick={handleGoHistory}
            onResetClick={handleOpenResetModal}
          />
        )}

        {phase === 'scoreboard' && (
          <Scoreboard
            players={game.players}
            totals={game.totals}
            onNext={handleNext}
            currentRoundIndex={currentRound}
            totalRounds={game.rounds.length}
            onHistoryClick={handleGoHistory}
            onResetClick={handleOpenResetModal}
          />
        )}
      </>
    );
  }

  return null;
}
