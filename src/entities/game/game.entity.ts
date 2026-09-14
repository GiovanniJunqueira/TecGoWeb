export type GameType = "CHAMPIONSHIP" | "FRIENDLY";

export type GameCategory = "SUB_9" | "SUB_11" | "SUB_13" | "SUB_15" | "SUB_17";

export interface GamePlayerStats {
  playerId: string | null;
  playerName: string | null;
  goals: number | null;
  starter: boolean | null;
  notes: string | null;
  attended: boolean | null;
}

export interface Game {
  id: string;
  type: GameType;
  category: GameCategory;
  opponent: string;
  date: string;
  homeScore: number | null;
  awayScore: number | null;
  location: string | null;
  players: GamePlayerStats[];
}
