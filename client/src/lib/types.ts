export type GamePhase =
  | "waiting-for-players"
  | "setting-secrets"
  | "playing"
  | "game-over";

export interface GuessEntry {
  guess: string;
  bulls: number;
  cows: number;
  round: number;
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
    secretNumber: string | null;
  };
  opponent: PublicPlayer | null;
  winnerId: string | null;
  isTie: boolean;
  timerSeconds: number | null;
  roundDeadline: number | null;
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
