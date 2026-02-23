export type GamePhase =
  | "waiting-for-players"
  | "setting-secrets"
  | "playing"
  | "game-over";

export interface Player {
  id: string;
  name: string;
  icon: string;
  secretNumber?: string;
  guesses: GuessEntry[];
  currentGuess?: string;
  hasWon: boolean;
}

export interface GuessEntry {
  guess: string;
  bulls: number;
  cows: number;
  round: number;
}

export interface GuessResult {
  bulls: number;
  cows: number;
}

export interface GameState {
  id: string;
  phase: GamePhase;
  players: Map<string, Player>;
  round: number;
  winnerId: string | null;
  createdAt: number;
}

export interface PublicPlayer {
  id: string;
  name: string;
  icon: string;
  guessCount: number;
  hasSetSecret: boolean;
  hasGuessedThisRound: boolean;
  hasWon: boolean;
}

export interface RoundResultPayload {
  guess: string;
  bulls: number;
  cows: number;
  round: number;
  opponent: PublicPlayer;
}

export interface GameOverPayload {
  winnerId: string | null;
  isTie: boolean;
  players: Record<
    string,
    { name: string; icon: string; secretNumber: string; guesses: GuessEntry[] }
  >;
}

export interface GameStatePayload {
  gameId: string;
  phase: GamePhase;
  round: number;
  you: {
    id: string;
    name: string;
    icon: string;
    guesses: GuessEntry[];
    hasSetSecret: boolean;
    hasGuessedThisRound: boolean;
  };
  opponent: PublicPlayer | null;
  winnerId: string | null;
  isTie: boolean;
}
