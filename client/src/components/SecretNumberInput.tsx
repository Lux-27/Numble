"use client";

import { useRef, useState } from "react";
import { Lock } from "lucide-react";

interface SecretNumberInputProps {
  onSubmit: (number: string) => void;
  disabled?: boolean;
}

export function SecretNumberInput({ onSubmit, disabled }: SecretNumberInputProps) {
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
    const number = digits.join("");
    if (number.length === 4) {
      onSubmit(number);
    }
  }

  const isComplete = digits.every((d) => d !== "");

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-center">
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2 text-violet-400">
          <Lock size={20} />
          <h3 className="text-lg font-semibold">Set Your Secret Number</h3>
        </div>
        <p className="text-text-secondary text-sm">
          Choose a 4-digit number for your opponent to guess
        </p>
      </div>

      <div className="flex justify-center gap-3" onPaste={handlePaste}>
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
            className="w-14 h-16 sm:w-16 sm:h-20 text-center text-2xl sm:text-3xl font-bold bg-input-bg border-2 border-border rounded-xl text-text-primary focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 transition-all disabled:opacity-50"
          />
        ))}
      </div>

      <button
        type="submit"
        disabled={!isComplete || disabled}
        className="px-8 py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-disabled-bg disabled:text-disabled-text text-white font-semibold rounded-xl transition-all duration-200 disabled:cursor-not-allowed cursor-pointer"
      >
        Lock In Number
      </button>
    </form>
  );
}
