"use client";

import { GameOverPayload } from "@/lib/types";
import { DynamicIcon } from "./IconPicker";
import { Trophy, Handshake, RotateCcw } from "lucide-react";

interface GameOverModalProps {
  data: GameOverPayload;
  yourId: string;
  onRematch: () => void;
}

export function GameOverModal({ data, yourId, onRematch }: GameOverModalProps) {
  const isWinner = data.winnerId === yourId;
  const isTie = data.isTie;

  return (
    <div className="fixed inset-0 bg-surface-overlay backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface-secondary border border-border rounded-2xl p-8 max-w-md w-full space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="text-center space-y-3">
          {isTie ? (
            <>
              <Handshake size={48} className="text-amber-400 mx-auto" />
              <h2 className="text-3xl font-bold text-text-primary">It&apos;s a Tie!</h2>
              <p className="text-text-secondary">Both players guessed correctly in the same round</p>
            </>
          ) : isWinner ? (
            <>
              <Trophy size={48} className="text-amber-400 mx-auto" />
              <h2 className="text-3xl font-bold text-text-primary">You Win!</h2>
              <p className="text-text-secondary">You cracked the code!</p>
            </>
          ) : (
            <>
              <div className="text-5xl mx-auto">😔</div>
              <h2 className="text-3xl font-bold text-text-primary">You Lose</h2>
              <p className="text-text-secondary">Your opponent cracked your code first</p>
            </>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">
            Secret Numbers
          </h3>
          {Object.entries(data.players).map(([id, player]) => (
            <div
              key={id}
              className={`flex items-center justify-between p-3 rounded-xl ${
                id === yourId ? "bg-violet-500/10 border border-violet-500/20" : "bg-input-bg"
              }`}
            >
              <div className="flex items-center gap-3">
                <DynamicIcon name={player.icon} size={20} className="text-text-secondary" />
                <span className="text-text-primary font-medium">
                  {player.name}
                  {id === yourId && (
                    <span className="text-text-muted text-xs ml-1">(you)</span>
                  )}
                </span>
              </div>
              <div className="flex gap-1.5">
                {player.secretNumber.split("").map((d, i) => (
                  <span
                    key={i}
                    className="w-8 h-8 flex items-center justify-center text-sm font-bold rounded bg-digit-bg text-text-primary"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onRematch}
          className="w-full py-3 px-6 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw size={18} />
          Rematch
        </button>
      </div>
    </div>
  );
}
