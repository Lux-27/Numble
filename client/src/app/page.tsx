"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/lib/useGame";
import { PlayerSetup } from "@/components/PlayerSetup";
import { ThemeToggle } from "@/components/ThemeToggle";
import { IconName } from "@/lib/icons";
import { Hash, Users, ArrowRight, Timer, Heart } from "lucide-react";

type Mode = "home" | "create" | "join";

export default function HomePage() {
  const [mode, setMode] = useState<Mode>("home");
  const [joinCode, setJoinCode] = useState("");
  const [joinStep, setJoinStep] = useState<"code" | "setup">("code");
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(30);
  const router = useRouter();
  const { createGame, joinGame } = useGame();

  async function handleCreate(name: string, icon: IconName) {
    const gameId = await createGame(name, icon, timerEnabled ? timerSeconds : undefined);
    router.push(`/game/${gameId}`);
  }

  function handleJoinCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (joinCode.trim()) {
      setJoinStep("setup");
    }
  }

  function handleJoin(name: string, icon: IconName) {
    joinGame(joinCode.trim(), name, icon);
    router.push(`/game/${joinCode.trim()}`);
  }

  if (mode === "create") {
    return (
      <main className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md space-y-6">
          <button
            onClick={() => setMode("home")}
            className="text-text-secondary hover:text-text-primary transition-colors text-sm cursor-pointer"
          >
            &larr; Back
          </button>
          <PlayerSetup
            title="Create a Game"
            subtitle="Set up your profile and share the link with a friend"
            onSubmit={handleCreate}
            submitLabel="Create Game"
          >
            <div className="space-y-3 p-4 bg-input-bg rounded-xl border border-border">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <Timer size={16} className="text-text-secondary" />
                  <span className="text-sm font-medium text-text-primary">Round Timer</span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={timerEnabled}
                  onClick={() => setTimerEnabled((v) => !v)}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                    timerEnabled ? "bg-accent" : "bg-surface-tertiary"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      timerEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </label>
              {timerEnabled && (
                <div className="space-y-2 pt-1">
                  <span className="text-sm text-text-secondary">Duration</span>
                  <div className="flex items-center justify-between gap-5">
                    <input
                      type="range"
                      min={10}
                      max={120}
                      step={5}
                      value={timerSeconds}
                      onChange={(e) => setTimerSeconds(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-surface-tertiary rounded-full appearance-none cursor-pointer accent-accent"
                    />
                    <span className="text-sm font-medium text-text-primary tabular-nums">{timerSeconds}s</span>
                  </div>
                </div>
              )}
            </div>
          </PlayerSetup>
        </div>
      </main>
    );
  }

  if (mode === "join") {
    return (
      <main className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md space-y-6">
          <button
            onClick={() => {
              if (joinStep === "setup") {
                setJoinStep("code");
              } else {
                setMode("home");
              }
            }}
            className="text-text-secondary hover:text-text-primary transition-colors text-sm cursor-pointer"
          >
            &larr; Back
          </button>

          {joinStep === "code" ? (
            <form onSubmit={handleJoinCodeSubmit} className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-text-primary">Join a Game</h2>
                <p className="text-text-secondary text-sm">
                  Enter the game code shared by your friend
                </p>
              </div>
              <div className="space-y-2">
                <label htmlFor="game-code" className="block text-sm font-medium text-text-secondary">
                  Game Code
                </label>
                <input
                  id="game-code"
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="Enter game code..."
                  className="w-full px-4 py-3 bg-input-bg border border-border rounded-xl text-text-primary placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={!joinCode.trim()}
                className="w-full py-3 px-6 bg-accent hover:bg-accent-hover disabled:bg-disabled-bg disabled:text-disabled-text text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed cursor-pointer"
              >
                Next <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            <PlayerSetup
              title="Join Game"
              subtitle="Set up your profile to join the game"
              onSubmit={handleJoin}
              submitLabel="Join Game"
            />
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-lg text-center space-y-12">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center">
              <Hash size={28} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-text-primary tracking-tight">
            Numble
          </h1>
          <p className="text-text-secondary text-lg max-w-sm mx-auto">
            A multiplayer number guessing game. Pick a 4-digit number, challenge
            your friend, and race to crack theirs first.
          </p>
        </div>

        <div className="flex flex-col gap-4 max-w-xs mx-auto">
          <button
            onClick={() => setMode("create")}
            className="py-4 px-6 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-3 text-lg cursor-pointer"
          >
            <Users size={22} />
            Create Game
          </button>
          <button
            onClick={() => setMode("join")}
            className="py-4 px-6 bg-input-bg hover:bg-surface-tertiary text-text-primary font-semibold rounded-xl border border-border transition-all duration-200 flex items-center justify-center gap-3 text-lg cursor-pointer"
          >
            <ArrowRight size={22} />
            Join Game
          </button>
        </div>

        <div className="text-text-muted text-sm">
          <p>Guess the digits. Beat your opponent.</p>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-text-muted text-xs flex items-center gap-1">
        made with <Heart size={12} className="text-red-400 fill-red-400" /> by luxy & cursor
      </div>
    </main>
  );
}
