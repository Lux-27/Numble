"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  function cycle() {
    if (theme === "system") setTheme("light");
    else if (theme === "light") setTheme("dark");
    else setTheme("system");
  }

  return (
    <button
      onClick={cycle}
      className="w-9 h-9 flex items-center justify-center rounded-lg bg-input-bg hover:bg-surface-tertiary border border-border transition-all cursor-pointer"
      title={`Theme: ${theme}`}
    >
      {theme === "light" ? (
        <Sun size={16} className="text-text-secondary" />
      ) : theme === "dark" ? (
        <Moon size={16} className="text-text-secondary" />
      ) : (
        <Monitor size={16} className="text-text-secondary" />
      )}
    </button>
  );
}
