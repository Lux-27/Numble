"use client";

import * as LucideIcons from "lucide-react";
import { AVAILABLE_ICONS, IconName } from "@/lib/icons";
import { ComponentType } from "react";

interface IconPickerProps {
  selected: IconName | null;
  onSelect: (icon: IconName) => void;
}

export function DynamicIcon({
  name,
  size = 24,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const icons = LucideIcons as unknown as Record<string, ComponentType<{ size?: number; className?: string }>>;
  const Icon = icons[name];
  if (!Icon) return null;
  return <Icon size={size} className={className} />;
}

export function IconPicker({ selected, onSelect }: IconPickerProps) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
      {AVAILABLE_ICONS.map((iconName) => (
        <button
          key={iconName}
          type="button"
          onClick={() => onSelect(iconName)}
          className={`flex items-center justify-center p-3 rounded-xl transition-all duration-200 cursor-pointer ${
            selected === iconName
              ? "bg-accent-surface-active ring-2 ring-accent-fg scale-110"
              : "bg-input-bg hover:bg-surface-tertiary hover:scale-105"
          }`}
        >
          <DynamicIcon
            name={iconName}
            size={24}
            className={
              selected === iconName ? "text-accent-soft" : "text-text-secondary"
            }
          />
        </button>
      ))}
    </div>
  );
}
