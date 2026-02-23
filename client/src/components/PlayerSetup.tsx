"use client";

import { useState } from "react";
import { IconPicker } from "./IconPicker";
import { IconName } from "@/lib/icons";

interface PlayerSetupProps {
  title: string;
  subtitle: string;
  onSubmit: (name: string, icon: IconName) => void;
  submitLabel: string;
}

export function PlayerSetup({ title, subtitle, onSubmit, submitLabel }: PlayerSetupProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<IconName | null>(null);

  const canSubmit = name.trim().length > 0 && icon !== null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (canSubmit) {
      onSubmit(name.trim(), icon!);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
        <p className="text-text-secondary text-sm">{subtitle}</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="player-name" className="block text-sm font-medium text-text-secondary">
          Your Name
        </label>
        <input
          id="player-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name..."
          maxLength={20}
          className="w-full px-4 py-3 bg-input-bg border border-border rounded-xl text-text-primary placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-text-secondary">
          Choose Your Icon
        </label>
        <IconPicker selected={icon} onSelect={setIcon} />
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full py-3 px-6 bg-violet-600 hover:bg-violet-500 disabled:bg-disabled-bg disabled:text-disabled-text text-white font-semibold rounded-xl transition-all duration-200 disabled:cursor-not-allowed cursor-pointer"
      >
        {submitLabel}
      </button>
    </form>
  );
}
