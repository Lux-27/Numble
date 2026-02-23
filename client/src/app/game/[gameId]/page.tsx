"use client";

import { use, useState, useEffect } from "react";
import { useGame } from "@/lib/useGame";
import { PlayerSetup } from "@/components/PlayerSetup";
import { SecretNumberInput } from "@/components/SecretNumberInput";
import { GuessInput } from "@/components/GuessInput";
import { GuessHistory, GuessLegend } from "@/components/GuessHistory";
import { GameOverModal } from "@/components/GameOverModal";
import { DynamicIcon } from "@/components/IconPicker";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Notepad } from "@/components/Notepad";
import { IconName } from "@/lib/icons";
import {
  Copy,
  Check,
  Loader2,
  Users,
  Hash,
  Shield,
  Swords,
  Notebook,
  Timer,
  Lock,
  Bell,
} from "lucide-react";

export default function GamePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = use(params);
  const {
    gameState,
    gameOver,
    error,
    connected,
    waitingForOpponent,
    nudgeFrom,
    joinGame,
    setSecret,
    submitGuess,
    rematch,
    requestState,
  } = useGame();

  const [copied, setCopied] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [notepadOpen, setNotepadOpen] = useState(false);

  useEffect(() => {
    if (connected) {
      requestState();
    }
  }, [connected, requestState]);

  const needsToJoin = connected && !gameState && !hasJoined;

  function handleJoin(name: string, icon: IconName) {
    joinGame(gameId, name, icon);
    setHasJoined(true);
  }

  function handleCopyLink() {
    const url = `${window.location.origin}/game/${gameId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleCopyCode() {
    navigator.clipboard.writeText(gameId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!connected) {
    return (
      <main className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 size={32} className="text-violet-400 animate-spin mx-auto" />
          <p className="text-text-secondary">Connecting to server...</p>
        </div>
      </main>
    );
  }

  if (needsToJoin) {
    return (
      <main className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md">
          <PlayerSetup
            title="Join Game"
            subtitle={`Joining game ${gameId}`}
            onSubmit={handleJoin}
            submitLabel="Join Game"
          />
        </div>
      </main>
    );
  }

  if (!gameState) {
    return (
      <main className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 size={32} className="text-violet-400 animate-spin mx-auto" />
          <p className="text-text-secondary">Loading game...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface overflow-x-hidden">
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg text-sm animate-in fade-in slide-in-from-top duration-300">
          {error}
        </div>
      )}

      {nudgeFrom && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-300 rounded-lg text-sm animate-in fade-in slide-in-from-top duration-300 flex items-center gap-2">
          <Bell size={16} className="animate-bounce" />
          <span><strong>{nudgeFrom}</strong> is waiting for you!</span>
        </div>
      )}

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <header className="flex items-center justify-between py-2 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Hash size={20} className="text-violet-400" />
            <span className="text-text-primary font-bold text-lg">Numble</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
            <button
              onClick={() => setNotepadOpen((v) => !v)}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-input-bg hover:bg-surface-tertiary border border-border transition-all cursor-pointer"
              title="Scratch pad"
            >
              <Notebook size={16} className="text-text-secondary" />
            </button>
            <ThemeToggle />
            {gameState.opponent && (
              <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-input-bg rounded-lg">
                <DynamicIcon
                  name={gameState.opponent.icon}
                  size={16}
                  className="text-text-secondary"
                />
                <span className="text-text-secondary text-sm hidden sm:inline">
                  {gameState.opponent.name}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-lg">
              <DynamicIcon
                name={gameState.you.icon}
                size={16}
                className="text-violet-400"
              />
              <span className="text-violet-300 text-sm hidden sm:inline">
                {gameState.you.name}
              </span>
            </div>
          </div>
        </header>

        {/* Waiting for Players */}
        {gameState.phase === "waiting-for-players" && (
          <div className="flex flex-col items-center justify-center py-16 space-y-8">
            <div className="space-y-3 text-center">
              <Users size={48} className="text-violet-400 mx-auto" />
              <h2 className="text-2xl font-bold text-text-primary">
                Waiting for opponent...
              </h2>
              <p className="text-text-secondary max-w-sm">
                Share the link or game code below with a friend to start playing
              </p>
            </div>

            <div className="w-full max-w-sm space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 px-4 py-3 bg-input-bg border border-border rounded-xl text-text-secondary text-sm font-mono truncate">
                  {gameId}
                </div>
                <button
                  onClick={handleCopyCode}
                  className="px-4 py-3 bg-input-bg hover:bg-surface-tertiary border border-border rounded-xl text-text-secondary transition-all cursor-pointer"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>

              <button
                onClick={handleCopyLink}
                className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check size={16} /> Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} /> Copy Invite Link
                  </>
                )}
              </button>
            </div>

            {gameState.timerSeconds && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-lg text-sm text-violet-400">
                <Timer size={14} />
                <span>{gameState.timerSeconds}s per round</span>
              </div>
            )}

            <Loader2 size={24} className="text-text-muted animate-spin" />
          </div>
        )}

        {/* Setting Secrets */}
        {gameState.phase === "setting-secrets" && (
          <div className="flex flex-col items-center justify-center py-12 space-y-8">
            {!gameState.you.hasSetSecret ? (
              <SecretNumberInput onSubmit={setSecret} />
            ) : (
              <div className="text-center space-y-4">
                <Shield size={48} className="text-emerald-400 mx-auto" />
                <h3 className="text-xl font-bold text-text-primary">
                  Number locked in!
                </h3>
                <p className="text-text-secondary">
                  Waiting for{" "}
                  <span className="text-text-primary font-medium">
                    {gameState.opponent?.name || "opponent"}
                  </span>{" "}
                  to set their number...
                </p>
                <Loader2 size={24} className="text-text-muted animate-spin mx-auto" />
              </div>
            )}
          </div>
        )}

        {/* Playing */}
        {gameState.phase === "playing" && (
          <div className="space-y-6">
            {gameState.you.secretNumber && (
              <div className="flex items-center justify-center gap-3 p-2.5 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                <div className="flex items-center gap-1.5 text-xs text-violet-400">
                  <Lock size={12} />
                  <span className="font-medium">Your number</span>
                </div>
                <div className="flex gap-1">
                  {gameState.you.secretNumber.split("").map((d, i) => (
                    <span
                      key={i}
                      className="w-7 h-7 flex items-center justify-center text-sm font-bold rounded bg-violet-500/20 text-violet-300"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-input-bg rounded-xl border border-border gap-2">
              <div className="flex items-center gap-2">
                <Swords size={16} className="text-violet-400" />
                <span className="text-sm text-text-secondary">Round {gameState.round}</span>
              </div>
              {gameState.opponent && (
                <div className="flex items-center gap-2 text-sm flex-wrap">
                  <DynamicIcon
                    name={gameState.opponent.icon}
                    size={14}
                    className="text-text-secondary"
                  />
                  <span className="text-text-secondary">{gameState.opponent.name}</span>
                  <span className="text-text-muted">·</span>
                  <span className="text-text-muted">
                    {gameState.opponent.guessCount} guesses
                  </span>
                  {gameState.opponent.hasGuessedThisRound && (
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-600 dark:text-amber-300 text-xs rounded-full">
                      submitted
                    </span>
                  )}
                </div>
              )}
            </div>

            {waitingForOpponent || gameState.you.hasGuessedThisRound ? (
              <div className="text-center py-6 space-y-3">
                <Loader2 size={24} className="text-violet-400 animate-spin mx-auto" />
                <p className="text-text-secondary">
                  Waiting for{" "}
                  <span className="text-text-primary font-medium">
                    {gameState.opponent?.name || "opponent"}
                  </span>{" "}
                  to submit their guess...
                </p>
              </div>
            ) : (
              <GuessInput
                onSubmit={submitGuess}
                round={gameState.round}
                deadline={gameState.roundDeadline}
                timerSeconds={gameState.timerSeconds}
              />
            )}

            <GuessLegend />

            <div className="bg-surface-secondary border border-border rounded-xl p-4">
              <h3 className="text-sm font-medium text-text-secondary mb-3 uppercase tracking-wider">
                Your Guesses
              </h3>
              <GuessHistory guesses={gameState.you.guesses} />
            </div>
          </div>
        )}

        {/* Game Over */}
        {gameState.phase === "game-over" && gameOver && (
          <GameOverModal
            data={gameOver}
            yourId={gameState.you.id}
            onRematch={rematch}
          />
        )}
      </div>

      <Notepad gameId={gameId} open={notepadOpen} onClose={() => setNotepadOpen(false)} />
    </main>
  );
}
