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

  socket.on("error", (data: { message: string }) => {
    updateStore({ error: data.message });
    setTimeout(() => updateStore({ error: null }), 4000);
  });
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

  const createGame = useCallback((name: string, icon: string) => {
    return new Promise<string>((resolve) => {
      const socket = socketRef.current;
      socket.once("game-created", (data: { gameId: string }) => {
        resolve(data.gameId);
      });
      socket.emit("create-game", { name, icon });
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
    createGame,
    joinGame,
    setSecret,
    submitGuess,
    rematch,
    requestState,
  };
}
