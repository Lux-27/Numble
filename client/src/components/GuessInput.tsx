"use client";

import { useRef, useState } from "react";
import { Send } from "lucide-react";
import { TimerBar } from "./TimerBar";

interface GuessInputProps {
  onSubmit: (guess: string) => void;
  disabled?: boolean;
  round: number;
  deadline?: number | null;
  timerSeconds?: number | null;
}

export function GuessInput({ onSubmit, disabled, round, deadline, timerSeconds }: GuessInputProps) {
  const [digits, setDigits] = useState(["", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pasted.length === 4) {
      setDigits(pasted.split(""));
      inputRefs.current[3]?.focus();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const guess = digits.join("");
    if (guess.length === 4) {
      onSubmit(guess);
      setDigits(["", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  }

  const isComplete = digits.every((d) => d !== "");

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {deadline && timerSeconds ? (
        <TimerBar deadline={deadline} duration={timerSeconds} />
      ) : null}

      <div className="text-sm text-text-secondary text-center font-medium">
        Round {round} — Enter your guess
      </div>

      <div className="flex items-center justify-center gap-3" onPaste={handlePaste}>
        <div className="flex gap-2">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={disabled}
              className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold bg-input-bg border-2 border-border rounded-lg text-text-primary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-ring transition-all disabled:opacity-50"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={!isComplete || disabled}
          className="w-12 h-14 sm:w-14 sm:h-16 flex items-center justify-center bg-accent hover:bg-accent-hover disabled:bg-disabled-bg disabled:text-disabled-text text-white rounded-lg transition-all duration-200 disabled:cursor-not-allowed cursor-pointer"
        >
          <Send size={20} />
        </button>
      </div>
    </form>
  );
}
