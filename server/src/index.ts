import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { nanoid } from "nanoid";
import { Game } from "./game";

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3002"],
    methods: ["GET", "POST"],
  },
});

const games = new Map<string, Game>();
const socketToGame = new Map<string, string>();

function cleanupStaleGames(): void {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  for (const [id, game] of games) {
    if (game.state.createdAt < oneHourAgo && game.state.players.size === 0) {
      games.delete(id);
    }
  }
}

setInterval(cleanupStaleGames, 5 * 60 * 1000);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", games: games.size });
});

io.on("connection", (socket) => {
  console.log(`Player connected: ${socket.id}`);

  socket.on("create-game", ({ name, icon }: { name: string; icon: string }) => {
    const gameId = nanoid(8);
    const game = new Game(gameId);

    if (!game.addPlayer(socket.id, name, icon)) {
      socket.emit("error", { message: "Failed to create game" });
      return;
    }

    games.set(gameId, game);
    socketToGame.set(socket.id, gameId);
    socket.join(gameId);

    socket.emit("game-created", { gameId });
    socket.emit("game-state", game.getGameStateForPlayer(socket.id));
  });

  socket.on("join-game", ({ gameId, name, icon }: { gameId: string; name: string; icon: string }) => {
    const game = games.get(gameId);
    if (!game) {
      socket.emit("error", { message: "Game not found" });
      return;
    }

    if (game.state.players.size >= 2) {
      socket.emit("error", { message: "Game is full" });
      return;
    }

    if (!game.addPlayer(socket.id, name, icon)) {
      socket.emit("error", { message: "Failed to join game" });
      return;
    }

    socketToGame.set(socket.id, gameId);
    socket.join(gameId);

    for (const playerId of game.state.players.keys()) {
      const state = game.getGameStateForPlayer(playerId);
      if (state) {
        io.to(playerId).emit("game-state", state);
      }
    }

    io.to(gameId).emit("player-joined", {
      player: game.getPublicPlayer(socket.id),
    });
  });

  socket.on("set-secret", ({ number }: { number: string }) => {
    const gameId = socketToGame.get(socket.id);
    if (!gameId) return;

    const game = games.get(gameId);
    if (!game) return;

    if (!game.setSecret(socket.id, number)) {
      socket.emit("error", { message: "Invalid secret number. Must be exactly 4 digits." });
      return;
    }

    for (const playerId of game.state.players.keys()) {
      const state = game.getGameStateForPlayer(playerId);
      if (state) {
        io.to(playerId).emit("game-state", state);
      }
    }

    if (game.state.phase === "playing") {
      io.to(gameId).emit("game-start", { round: game.state.round });
    }
  });

  socket.on("submit-guess", ({ guess }: { guess: string }) => {
    const gameId = socketToGame.get(socket.id);
    if (!gameId) return;

    const game = games.get(gameId);
    if (!game) return;

    const { valid, allSubmitted } = game.submitGuess(socket.id, guess);
    if (!valid) {
      socket.emit("error", { message: "Invalid guess. Must be exactly 4 digits." });
      return;
    }

    if (!allSubmitted) {
      socket.emit("waiting-for-opponent", {});

      const opponent = game.getOpponent(socket.id);
      if (opponent) {
        const oppState = game.getGameStateForPlayer(opponent.id);
        if (oppState) {
          io.to(opponent.id).emit("game-state", oppState);
        }
      }
      return;
    }

    const { results, gameOver, winnerId, isTie } = game.resolveRound();

    for (const [playerId, entry] of results) {
      const opponent = game.getOpponent(playerId);
      io.to(playerId).emit("round-result", {
        guess: entry.guess,
        bulls: entry.bulls,
        cows: entry.cows,
        round: entry.round,
        opponent: opponent ? game.getPublicPlayer(opponent.id) : null,
      });
    }

    if (gameOver) {
      io.to(gameId).emit("game-over", game.getGameOverPayload());
    }

    for (const playerId of game.state.players.keys()) {
      const state = game.getGameStateForPlayer(playerId);
      if (state) {
        io.to(playerId).emit("game-state", state);
      }
    }
  });

  socket.on("rematch", () => {
    const gameId = socketToGame.get(socket.id);
    if (!gameId) return;

    const game = games.get(gameId);
    if (!game) return;

    if (game.state.phase !== "game-over") return;

    game.resetForRematch();

    for (const playerId of game.state.players.keys()) {
      const state = game.getGameStateForPlayer(playerId);
      if (state) {
        io.to(playerId).emit("game-state", state);
      }
    }

    io.to(gameId).emit("rematch-started", {});
  });

  socket.on("request-state", () => {
    const gameId = socketToGame.get(socket.id);
    if (!gameId) return;

    const game = games.get(gameId);
    if (!game) return;

    const state = game.getGameStateForPlayer(socket.id);
    if (state) {
      socket.emit("game-state", state);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Player disconnected: ${socket.id}`);
    const gameId = socketToGame.get(socket.id);
    if (!gameId) return;

    const game = games.get(gameId);
    if (game) {
      game.removePlayer(socket.id);
      io.to(gameId).emit("player-left", { playerId: socket.id });

      for (const playerId of game.state.players.keys()) {
        const state = game.getGameStateForPlayer(playerId);
        if (state) {
          io.to(playerId).emit("game-state", state);
        }
      }

      if (game.state.players.size === 0) {
        games.delete(gameId);
      }
    }

    socketToGame.delete(socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
