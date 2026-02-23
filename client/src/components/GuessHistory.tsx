"use client";

import { GuessEntry } from "@/lib/types";
import { CircleCheck, CircleDot, Circle } from "lucide-react";

interface GuessHistoryProps {
  guesses: GuessEntry[];
}

export function GuessHistory({ guesses }: GuessHistoryProps) {
  if (guesses.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted text-sm">
        No guesses yet. Make your first guess!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[auto_1fr_auto_auto] gap-x-4 px-3 py-2 text-xs text-text-muted font-medium uppercase tracking-wider">
        <span>#</span>
        <span>Guess</span>
        <span className="text-center">Correct</span>
        <span className="text-center">Misplaced</span>
      </div>

      <div className="space-y-1.5">
        {[...guesses].reverse().map((entry, i) => (
          <div
            key={guesses.length - 1 - i}
            className={`grid grid-cols-[auto_1fr_auto_auto] gap-x-4 items-center px-3 py-3 rounded-lg transition-all ${
              i === 0 ? "bg-highlight-hover border border-border" : "bg-highlight"
            }`}
          >
            <span className="text-xs text-text-muted font-mono w-6">
              {entry.round}
            </span>

            <div className="flex gap-2">
              {entry.guess.split("").map((digit, di) => (
                <span
                  key={di}
                  className="w-10 h-10 flex items-center justify-center text-lg font-bold rounded-md bg-digit-bg text-text-primary"
                >
                  {digit}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-1.5 min-w-[60px] justify-center">
              <CircleCheck size={16} className="text-emerald-500" />
              <span className="text-emerald-500 font-bold">{entry.bulls}</span>
            </div>

            <div className="flex items-center gap-1.5 min-w-[60px] justify-center">
              <CircleDot size={16} className="text-amber-500" />
              <span className="text-amber-500 font-bold">{entry.cows}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GuessLegend() {
  return (
    <div className="flex items-center justify-center gap-6 text-xs text-text-secondary">
      <div className="flex items-center gap-1.5">
        <CircleCheck size={14} className="text-emerald-500" />
        <span>Correct position</span>
      </div>
      <div className="flex items-center gap-1.5">
        <CircleDot size={14} className="text-amber-500" />
        <span>Wrong position</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Circle size={14} className="text-text-muted" />
        <span>Not in number</span>
      </div>
    </div>
  );
}
