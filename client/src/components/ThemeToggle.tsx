"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Palette } from "lucide-react";
import { useEffect, useState, useRef, useSyncExternalStore } from "react";

const ACCENT_COLORS = [
  { id: "violet", label: "Violet", swatch: "#8b5cf6" },
  { id: "blue", label: "Blue", swatch: "#3b82f6" },
  { id: "emerald", label: "Emerald", swatch: "#10b981" },
  { id: "amber", label: "Amber", swatch: "#f59e0b" },
  { id: "rose", label: "Rose", swatch: "#f43f5e" },
  { id: "orange", label: "Orange", swatch: "#f97316" },
] as const;

const emptySubscribe = () => () => {};

function getInitialAccent(): string {
  if (typeof window === "undefined") return "violet";
  return localStorage.getItem("numble-accent") || "violet";
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [open, setOpen] = useState(false);
  const [accent, setAccent] = useState(getInitialAccent);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.dataset.accent = accent;
    localStorage.setItem("numble-accent", accent);
  }, [accent]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 flex items-center justify-center rounded-lg bg-input-bg hover:bg-surface-tertiary border border-border transition-all cursor-pointer"
        title="Theme settings"
      >
        <Palette size={16} className="text-text-secondary" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-surface-secondary border border-border rounded-xl shadow-xl p-3 space-y-3 z-50 animate-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Mode</span>
            <div className="flex gap-1 bg-input-bg rounded-lg p-0.5">
              <button
                onClick={() => setTheme("light")}
                className={`flex items-center justify-center w-7 h-7 rounded-md transition-all cursor-pointer ${
                  theme === "light" ? "bg-accent text-white" : "text-text-muted hover:text-text-primary"
                }`}
              >
                <Sun size={14} />
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`flex items-center justify-center w-7 h-7 rounded-md transition-all cursor-pointer ${
                  theme === "dark" ? "bg-accent text-white" : "text-text-muted hover:text-text-primary"
                }`}
              >
                <Moon size={14} />
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Color</span>
            <div className="grid grid-cols-6 gap-1.5">
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setAccent(c.id)}
                  className={`w-6 h-6 rounded-full transition-all cursor-pointer ring-offset-2 ring-offset-surface-secondary ${
                    accent === c.id ? "ring-2 ring-text-primary scale-110" : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: c.swatch }}
                  title={c.label}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
