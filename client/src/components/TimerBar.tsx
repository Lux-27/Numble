"use client";

import { useState, useEffect, useRef } from "react";
import { Timer } from "lucide-react";

interface TimerBarProps {
  deadline: number;
  duration: number;
}

export function TimerBar({ deadline, duration }: TimerBarProps) {
  const [remaining, setRemaining] = useState(duration);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    function tick() {
      const now = Date.now();
      const left = Math.max(0, (deadline - now) / 1000);
      setRemaining(left);
      if (left > 0) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [deadline]);

  const fraction = remaining / duration;
  const seconds = Math.ceil(remaining);

  let barColor = "bg-violet-500";
  let textColor = "text-violet-400";
  if (remaining < 5) {
    barColor = "bg-red-500";
    textColor = "text-red-400";
  } else if (remaining < 10) {
    barColor = "bg-amber-500";
    textColor = "text-amber-400";
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className={`flex items-center gap-1.5 ${textColor}`}>
          <Timer size={12} />
          <span className="font-medium">
            {seconds}s
          </span>
        </div>
      </div>
      <div className="h-1.5 bg-input-bg rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-200 ${barColor} ${remaining < 5 ? "animate-pulse" : ""}`}
          style={{ width: `${fraction * 100}%` }}
        />
      </div>
    </div>
  );
}
