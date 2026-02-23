import { GameState, GamePhase, Player, GuessResult, GuessEntry, PublicPlayer, GameStatePayload, GameOverPayload } from "./types";

export class Game {
  public state: GameState;

  constructor(gameId: string) {
    this.state = {
      id: gameId,
      phase: "waiting-for-players",
      players: new Map(),
      round: 1,
      winnerId: null,
      createdAt: Date.now(),
    };
  }

  addPlayer(socketId: string, name: string, icon: string): boolean {
    if (this.state.players.size >= 2) return false;

    this.state.players.set(socketId, {
      id: socketId,
      name,
      icon,
      guesses: [],
      hasWon: false,
    });

    if (this.state.players.size === 2) {
      this.state.phase = "setting-secrets";
    }

    return true;
  }

  removePlayer(socketId: string): boolean {
    return this.state.players.delete(socketId);
  }

  setSecret(socketId: string, number: string): boolean {
    if (this.state.phase !== "setting-secrets") return false;

    const player = this.state.players.get(socketId);
    if (!player) return false;

    if (!/^\d{4}$/.test(number)) return false;

    player.secretNumber = number;

    const allSet = this.allPlayersHaveSecrets();
    if (allSet) {
      this.state.phase = "playing";
      this.state.round = 1;
    }

    return true;
  }

  submitGuess(socketId: string, guess: string): { valid: boolean; allSubmitted: boolean } {
    if (this.state.phase !== "playing") return { valid: false, allSubmitted: false };

    const player = this.state.players.get(socketId);
    if (!player) return { valid: false, allSubmitted: false };

    if (!/^\d{4}$/.test(guess)) return { valid: false, allSubmitted: false };

    if (player.currentGuess) return { valid: false, allSubmitted: false };

    player.currentGuess = guess;

    const allSubmitted = this.allPlayersHaveGuessed();
    return { valid: true, allSubmitted };
  }

  resolveRound(): { results: Map<string, GuessEntry>; gameOver: boolean; winnerId: string | null; isTie: boolean } {
    const results = new Map<string, GuessEntry>();
    const playerIds = Array.from(this.state.players.keys());
    const winners: string[] = [];

    for (const playerId of playerIds) {
      const player = this.state.players.get(playerId)!;
      const opponent = this.getOpponent(playerId)!;

      const result = Game.evaluate(opponent.secretNumber!, player.currentGuess!);
      const entry: GuessEntry = {
        guess: player.currentGuess!,
        bulls: result.bulls,
        cows: result.cows,
        round: this.state.round,
      };

      player.guesses.push(entry);
      results.set(playerId, entry);

      if (result.bulls === 4) {
        player.hasWon = true;
        winners.push(playerId);
      }
    }

    for (const player of this.state.players.values()) {
      player.currentGuess = undefined;
    }

    const isTie = winners.length === 2;
    const gameOver = winners.length > 0;

    if (gameOver) {
      this.state.phase = "game-over";
      this.state.winnerId = isTie ? null : winners[0];
    } else {
      this.state.round++;
    }

    return { results, gameOver, winnerId: this.state.winnerId, isTie };
  }

  resetForRematch(): void {
    this.state.phase = "setting-secrets";
    this.state.round = 1;
    this.state.winnerId = null;

    for (const player of this.state.players.values()) {
      player.secretNumber = undefined;
      player.guesses = [];
      player.currentGuess = undefined;
      player.hasWon = false;
    }
  }

  getOpponent(socketId: string): Player | undefined {
    for (const [id, player] of this.state.players) {
      if (id !== socketId) return player;
    }
    return undefined;
  }

  getPublicPlayer(socketId: string): PublicPlayer | null {
    const player = this.state.players.get(socketId);
    if (!player) return null;

    return {
      id: player.id,
      name: player.name,
      icon: player.icon,
      guessCount: player.guesses.length,
      hasSetSecret: !!player.secretNumber,
      hasGuessedThisRound: !!player.currentGuess,
      hasWon: player.hasWon,
    };
  }

  getGameStateForPlayer(socketId: string): GameStatePayload | null {
    const player = this.state.players.get(socketId);
    if (!player) return null;

    const opponent = this.getOpponent(socketId);

    return {
      gameId: this.state.id,
      phase: this.state.phase,
      round: this.state.round,
      you: {
        id: player.id,
        name: player.name,
        icon: player.icon,
        guesses: player.guesses,
        hasSetSecret: !!player.secretNumber,
        hasGuessedThisRound: !!player.currentGuess,
      },
      opponent: opponent ? this.getPublicPlayer(opponent.id) : null,
      winnerId: this.state.winnerId,
      isTie: this.state.winnerId === null && this.state.phase === "game-over",
    };
  }

  getGameOverPayload(): GameOverPayload {
    const players: GameOverPayload["players"] = {};
    for (const [id, player] of this.state.players) {
      players[id] = {
        name: player.name,
        icon: player.icon,
        secretNumber: player.secretNumber!,
        guesses: player.guesses,
      };
    }

    return {
      winnerId: this.state.winnerId,
      isTie: this.state.winnerId === null,
      players,
    };
  }

  private allPlayersHaveSecrets(): boolean {
    if (this.state.players.size < 2) return false;
    for (const player of this.state.players.values()) {
      if (!player.secretNumber) return false;
    }
    return true;
  }

  private allPlayersHaveGuessed(): boolean {
    for (const player of this.state.players.values()) {
      if (!player.currentGuess) return false;
    }
    return true;
  }

  static evaluate(secret: string, guess: string): GuessResult {
    let bulls = 0;
    const secretCounts = new Array(10).fill(0);
    const guessCounts = new Array(10).fill(0);

    for (let i = 0; i < 4; i++) {
      if (guess[i] === secret[i]) {
        bulls++;
      } else {
        secretCounts[+secret[i]]++;
        guessCounts[+guess[i]]++;
      }
    }

    let cows = 0;
    for (let i = 0; i < 10; i++) {
      cows += Math.min(secretCounts[i], guessCounts[i]);
    }

    return { bulls, cows };
  }
}
