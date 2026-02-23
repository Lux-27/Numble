"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { getSocket } from "./socket";
import { GameStatePayload, GameOverPayload } from "./types";
import { getStore, updateStore, subscribe, resetStore } from "./gameStore";

let initialized = false;

function initSocketListeners(): void {
  if (initialized) return;
  initialized = true;

  const socket = getSocket();

  socket.on("game-state", (state: GameStatePayload) => {
    updateStore({ gameState: state, error: null });
  });

  socket.on("waiting-for-opponent", () => {
    updateStore({ waitingForOpponent: true });
  });

  socket.on("round-result", () => {
    updateStore({ waitingForOpponent: false });
  });

  socket.on("game-over", (data: GameOverPayload) => {
    updateStore({ gameOver: data, waitingForOpponent: false });
  });

  socket.on("rematch-started", () => {
    updateStore({ gameOver: null, waitingForOpponent: false });
  });

  socket.on("nudge", (data: { from: string }) => {
    updateStore({ nudgeFrom: data.from });
    playNudgeSound();
    setTimeout(() => updateStore({ nudgeFrom: null }), 4000);
  });

  socket.on("error", (data: { message: string }) => {
    updateStore({ error: data.message });
    if (getStore().gameState) {
      setTimeout(() => updateStore({ error: null }), 4000);
    }
  });
}

function playNudgeSound(): void {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "square";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
    osc.onended = () => ctx.close();
  } catch {
    // Audio not available
  }
}

export function useGame() {
  const socketRef = useRef(getSocket());

  const store = useSyncExternalStore(subscribe, getStore, getStore);

  useEffect(() => {
    const socket = socketRef.current;
    initSocketListeners();

    if (!socket.connected) {
      socket.connect();
    }
  }, []);

  const connected = useSyncExternalStore(
    (cb) => {
      const socket = socketRef.current;
      socket.on("connect", cb);
      socket.on("disconnect", cb);
      return () => {
        socket.off("connect", cb);
        socket.off("disconnect", cb);
      };
    },
    () => socketRef.current.connected,
    () => false
  );

  const createGame = useCallback((name: string, icon: string, timerSeconds?: number) => {
    return new Promise<string>((resolve) => {
      const socket = socketRef.current;
      socket.once("game-created", (data: { gameId: string }) => {
        resolve(data.gameId);
      });
      socket.emit("create-game", { name, icon, timerSeconds: timerSeconds ?? null });
    });
  }, []);

  const joinGame = useCallback((gameId: string, name: string, icon: string) => {
    socketRef.current.emit("join-game", { gameId, name, icon });
  }, []);

  const setSecret = useCallback((number: string) => {
    socketRef.current.emit("set-secret", { number });
  }, []);

  const submitGuess = useCallback((guess: string) => {
    socketRef.current.emit("submit-guess", { guess });
  }, []);

  const rematch = useCallback(() => {
    socketRef.current.emit("rematch");
  }, []);

  const requestState = useCallback(() => {
    socketRef.current.emit("request-state");
  }, []);

  return {
    gameState: store.gameState,
    gameOver: store.gameOver,
    error: store.error,
    connected,
    waitingForOpponent: store.waitingForOpponent,
    nudgeFrom: store.nudgeFrom,
    createGame,
    joinGame,
    setSecret,
    submitGuess,
    rematch,
    requestState,
  };
}
