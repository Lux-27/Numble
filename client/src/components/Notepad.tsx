"use client";

import { useState, useEffect, useRef } from "react";
import { X, GripHorizontal } from "lucide-react";

interface NotepadProps {
  gameId: string;
  open: boolean;
  onClose: () => void;
}

export function Notepad({ gameId, open, onClose }: NotepadProps) {
  const storageKey = `numble-notes-${gameId}`;
  const [notes, setNotes] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) setNotes(saved);
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, notes);
  }, [notes, storageKey]);

  useEffect(() => {
    if (open && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [open]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/20 z-40 sm:bg-transparent"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="max-w-2xl mx-auto">
          <div className="bg-surface-secondary border border-border border-b-0 rounded-t-2xl shadow-2xl flex flex-col"
            style={{ height: "min(60vh, 400px)" }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <GripHorizontal size={16} className="text-text-muted" />
                <span className="text-sm font-medium text-text-primary">Scratch Pad</span>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-tertiary text-text-muted transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <textarea
              ref={textareaRef}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Jot down your notes... Track eliminated digits, possible positions, etc."
              className="flex-1 w-full p-4 bg-transparent text-text-primary placeholder-placeholder text-sm resize-none focus:outline-none font-mono leading-relaxed"
              style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
