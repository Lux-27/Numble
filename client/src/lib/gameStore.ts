"use client";

import { GameStatePayload, GameOverPayload } from "./types";

type Listener = () => void;

interface GameStore {
  gameState: GameStatePayload | null;
  gameOver: GameOverPayload | null;
  error: string | null;
  waitingForOpponent: boolean;
  nudgeFrom: string | null;
}

let store: GameStore = {
  gameState: null,
  gameOver: null,
  error: null,
  waitingForOpponent: false,
  nudgeFrom: null,
};

const listeners = new Set<Listener>();

export function getStore(): GameStore {
  return store;
}

export function updateStore(partial: Partial<GameStore>): void {
  store = { ...store, ...partial };
  listeners.forEach((l) => l());
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function resetStore(): void {
  store = {
    gameState: null,
    gameOver: null,
    error: null,
    waitingForOpponent: false,
    nudgeFrom: null,
  };
  listeners.forEach((l) => l());
}
